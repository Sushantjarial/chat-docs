import { auth } from "@/lib/auth";
import prisma from "@/prisma/prismaClient";

export async function GET(req: Request) {
  const sessionResult = await auth.api.getSession({ headers: req.headers });
  if (!sessionResult) {
    return new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
      });
    }
    const docs = await prisma.file.findMany({
      where: {
        userId: sessionResult.user.id,
      },
    });

    const { user } = sessionResult;
    console.log("User in myDocs GET:", user);
    return new Response(JSON.stringify({
        docs, userId: user.id
    }), {
      status: 200,
        headers: { "Content-Type": "application/json" },
    });
  }
  