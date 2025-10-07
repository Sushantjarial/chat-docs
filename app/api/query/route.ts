import { auth } from "@/lib/auth";
import { OpenAIEmbeddings } from "@langchain/openai";
import {QdrantVectorStore} from "@langchain/qdrant"
import { OpenAI } from "openai";

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-ada-002"
})
const model = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  
})

const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,{
        url: process.env.QDRANT_URL!,
        collectionName: "pdf-docs"
    }
)

export async function POST( req: Request) {
  const sessionResult = await auth.api.getSession({ headers: req.headers });
  if (!sessionResult) {
    return new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
    });
  }
  const { user } = sessionResult;
  const body = await req.json();
    const { query,s3Key } = body;
    console.log("Received query:", query);
//     const filter = {
//   must: [{ key: "metadata.s3Key", match: { value: s3Key } },
//     { key: "metadata.userId", match: { value: user.id } }],
// };
const similaritySearchResults = await vectorStore.similaritySearch(
  query,
  2
  
);
console.log("Similarity Search Results:", similaritySearchResults,"hii");

for (const doc of similaritySearchResults) {
  console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);

}
const response = await model.chat.completions.create({
model: "gpt-3.5-turbo",
messages:[
    {role:"system",content:"You are a helpful assistant that helps people find information based on given context "  + similaritySearchResults.map((doc)=>doc.pageContent).join("\n")},
    {role:"user",content:query},
]
})
    const mockResponse = {
      response: response.choices[0].message.content,
      userId: user.id,
    };
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },

    });
  }
