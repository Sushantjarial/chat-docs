import { fileTypeFromBuffer } from "file-type";
import { Worker, Queue } from "bullmq";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { encoding_for_model } from "tiktoken";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { X } from "lucide-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

dotenv.config({ path: path.resolve(__dirname, "../.env") });
// const textSplitter = new CharacterTextSplitter({
//   chunkSize: 100, // or 2000 for embeddings
//   chunkOverlap: 0,
//   separators: ["\n", " ", ""], // fallback to splitting anywhere
// });

const enc = encoding_for_model("text-embedding-3-small");

function countTokens(text) {
  return enc.encode(text).length;
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // max tokens per chunk
  chunkOverlap: 200, // tokens to overlap between chunks
  lengthFunction: countTokens, // use real token counts
});

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: "http://localhost:6333",
  collectionName: "pdf-docs",
});

const dbQueue = new Queue("dbQueue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || "",
  },
});

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const worker = new Worker(
  "upload",
  async (job) => {
    const { file, userId, s3Key } = job.data;

    try {
      console.log(`Processing file ${s3Key} for user ${userId}...`);

      console.log(`Downloading file ${s3Key}...`);
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: s3Key,
      });
      const response = await getFileWithRetry(command);

      const fileBuffer = await streamToBuffer(response.Body);
      console.log(`Downloaded ${fileBuffer.length} bytes`);

      const result = await processFileAndStore(fileBuffer, userId, s3Key);

      const jobId = await dbQueue.add(
        "processFile",
        {
          file,
          userId,
          s3Key,
          processingResult: result,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );

      console.log(
        `Enqueued job ${jobId.id} with processing results for ${s3Key}`
      );

      return result;
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || "",
    },
    concurrency: 5,
  }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

worker.on("completed", (job, returnvalue) => {
  console.log(`Job ${job.id} completed successfully:`, returnvalue);
});

async function getFileWithRetry(command, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await r2Client.send(command);
    } catch (err) {
      if (err.Code === "NoSuchKey" && i < retries - 1) {
        console.warn(`Retrying... attempt ${i + 2}`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

console.log("Worker started and waiting for jobs...");

async function processFileAndStore(fileBuffer, userId, s3Key) {
  try {
    const type = await fileTypeFromBuffer(fileBuffer);

    let fileTypeDesc = "";
    if (type) {
      fileTypeDesc = type.mime;
    }

    let ext = null;
    if (type && type.ext) {
      ext = type.ext.toLowerCase();
    } else if (type && type.mime) {
      if (type.mime === "application/pdf") ext = "pdf";
      else if (
        type.mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
        ext = "docx";
      else if (type.mime === "text/plain") ext = "txt";
      else if (type.mime === "text/markdown") ext = "md";
      else if (type.mime === "text/csv") ext = "csv";
      else if (type.mime === "text/html") ext = "html";
    }
    if (!ext) {
      const match = s3Key.match(/\.([a-zA-Z0-9]+)$/);
      if (match) {
        ext = match[1].toLowerCase();
      }
    }

    let docs = [];
    switch (ext) {
      case "pdf": {
        const { PDFLoader } = await import(
          "@langchain/community/document_loaders/fs/pdf"
        );
        const loader = new PDFLoader(new Blob([fileBuffer]), {
          splitPages: false,
        });
        docs = await loader.load();
        break;
      }
      case "docx": {
        const { DocxLoader } = await import(
          "@langchain/community/document_loaders/fs/docx"
        );
        const loader = new DocxLoader(new Blob([fileBuffer]), {
          splitPages: false,
        });
        docs = await loader.load();
        break;
      }

      case "txt": {
        const { TextLoader } = await import(
          "langchain/document_loaders/fs/text"
        );
        const loader = new TextLoader(new Blob([fileBuffer]));
        docs = await loader.load();
        break;
      }
      case "csv": {
        const { CSVLoader } = await import(
          "@langchain/community/document_loaders/fs/csv"
        );
        const loader = new CSVLoader(new Blob([fileBuffer]));
        docs = await loader.load();
        break;
      }
      case "html":
      case "htm": {
        const { HTMLLoader } = await import(
          "@langchain/community/document_loaders/fs/html"
        );
        const loader = new HTMLLoader(new Blob([fileBuffer]));
        docs = await loader.load();
        break;
      }
      default: {
        throw new Error(
          `Unsupported file type: ${type ? type.mime : ext || "unknown"}`
        );
      }
    }
    docs.forEach((doc) => {
      doc.metadata = {
        ...doc.metadata,
        userId: userId,
        s3Key: s3Key,
        source: s3Key,
        uploadDate: new Date().toISOString(),
        fileType: fileTypeDesc,
      };
    });

    console.log(docs.map((d) => d.pageContent.length));
    const chunks = await textSplitter.splitDocuments(docs);

    let batch = [];
    let tokenCount = 0;
    for (const chunk of chunks) {
      const len = chunk.pageContent.length; // rough token estimate
      if (tokenCount + len > 4000) {
        await vectorStore.addDocuments(batch);
        batch = [];
        tokenCount = 0;
      }
      batch.push(chunk);
      tokenCount += len;
    }
    if (batch.length > 0) await vectorStore.addDocuments(batch);

    const textLength = docs.reduce(
      (acc, d) => acc + (d.pageContent?.length || 0),
      0
    );
    return {
      success: true,
      chunksCount: chunks.length,
      textLength,
    };
  } catch (error) {
    throw error;
  }
}
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
