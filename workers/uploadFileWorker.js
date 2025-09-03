const { Worker } = require("bullmq");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { Queue } = require("bullmq");

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

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const worker = new Worker(
  "upload",
  async (job) => {
    const { file, userId, s3Key } = job.data;

    const jobId = await dbQueue.add(
      "processFile",
      { file, userId, s3Key },
      {
        attempts: 1,
        backoff: 1000,
      }
    );
    console.log(
      `Enqueued job ${jobId} to process file ${s3Key} for user ${userId}`
    );

    console.log(`Downloading file ${s3Key} for user ${userId}...`);
    console.log("ENV BUCKET NAME:", process.env.BUCKET_NAME);
    // 1. Get file from R2
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
    });
    const response = await getFileWithRetry(command);

    const fileBuffer = await streamToBuffer(response.Body);
    console.log(fileBuffer);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || "",
    },
  }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
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
