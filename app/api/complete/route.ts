import { auth } from "@/lib/auth";
import { Queue } from "bullmq";
import { NextRequest } from "next/server";
const uploadQueue = new Queue("upload", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});
export async function POST(req: NextRequest) {
  const sessionResult = await auth.api.getSession({ headers: req.headers });
  if (!sessionResult) {
    return new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
    });
  }
  const { user } = sessionResult;
  console.log("Auth session:", user);

  const { file, s3Key } = await req.json();

  uploadQueue.add(
    "processUpload",
    { file, userId: user.id, status: "pending", s3Key },
    {
      attempts: 3,

      backoff: { type: "exponential", delay: 5000 },
    }
  );
  return new Response(JSON.stringify({ message: "File upload initiated" }));
}
