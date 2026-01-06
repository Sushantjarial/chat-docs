import { Worker } from "bullmq";
import 'dotenv/config';
import { PrismaClient } from "../lib/generated/prisma/index.js";
const prisma = new PrismaClient();
console.log(process.env.DATABASE_URL);
const worker = new Worker(
  "dbQueue",
  async (job) => {
    try {
      console.log(job.data); 
      const file = await prisma.file.create({
        data: {
          id: job.data.file.id,
          userId: job.data.userId,
          s3Key: job.data.s3Key,
          fileName: job.data.file.fileName,
          size: job.data.file.size,
        },
      });
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || "",
    },
  }
);
worker.on("error", (err) => {
  console.error("Worker error:", err);
});
