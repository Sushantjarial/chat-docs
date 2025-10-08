import { auth } from "@/lib/auth";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-ada-002",
});
const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL!,
  collectionName: "pdf-docs",
});

export async function POST(req: Request) {
  const sessionResult = await auth.api.getSession({ headers: req.headers });
  if (!sessionResult) {
    return new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
    });
  }
  const { user } = sessionResult;
  const body = await req.json();
  const { query, s3Keys } = body;
  console.log("Received s3keys:", s3Keys);
  if (
    !query ||
    typeof query !== "string" ||
    query.trim().length === 0 ||
    !s3Keys ||
    !Array.isArray(s3Keys) ||
    s3Keys.length === 0
  ) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
  try {
// Parallelized similarity search
const similaritySearchResults = (
  await Promise.all(
    s3Keys.map(async (s3Key) => {
      const perFileFilter = {
        must: [
          { key: "metadata.userId", match: { value: user.id } },
          { key: "metadata.s3Key", match: { value: s3Key } },
        ],
        must_not: [],
      };
      const results = await vectorStore.similaritySearch(query, 3, perFileFilter);
      return results;
    })
  )
).flat();

// Limit total results to 15 if needed
const limitedResults = similaritySearchResults.slice(0, 15);

  console.log("Similarity Search Results:", similaritySearchResults, "hi");

  for (const doc of similaritySearchResults) {
    console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
  }
  const response = await model.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that answers queries based on given context.",
      },
      {
        role: "assistant",
        content: similaritySearchResults
          .map((doc) => doc.pageContent)
          .join("\n"),
      },
      { role: "user", content: query },
    ],
  });

  const mockResponse = {
    response: response.choices[0].message.content,
    userId: user.id,
  };
  return new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  } catch (error) {
    console.error("Error processing query:", error);
    return new Response(JSON.stringify({ error: "Failed to process query" }), {
      status: 500,
    });
  }
}
