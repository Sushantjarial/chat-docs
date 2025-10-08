import { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCommandObject, r2Client } from "@/lib/uploadClient";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const sessionResult = await auth.api.getSession({ headers: req.headers });
  if (!sessionResult) {
    return new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
    });
  }
  const { user } = sessionResult;
  console.log("Auth session:", user);

  const { files } = await req.json();

  console.log("Files received in request:", files);
  if (files.length <= 0) {
    return new Response(JSON.stringify({ error: "No files provided" }), {
      status: 400,
    });
  }
  if (files.length > 5) {
    return new Response(JSON.stringify({ error: "Too many files provided" }), {
      status: 400,
    });
  }
  if (files.some((f: any) => !f.fileName || !f.type)) {
    return new Response(JSON.stringify({ error: "Invalid file metadata" }), {
      status: 400,
    });
  }
  if (files.some((f: any) => (f.size > 20 * 1024 * 1024 ? true : false)))
    return new Response(JSON.stringify({ error: "File size exceeds limit" }), {
      status: 400,
    });

  try {
    const links = await Promise.all(
      files.map(async (file: any) => {
        let { fileName, type, id } = file;
        const s3Key = `uploads/${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}-${fileName}`;

        return {
          url: await getSignedUrl(r2Client, getCommandObject(s3Key, type), {
            expiresIn: 3600,
          }),
          id,
          s3Key,
        };
      })
    );

    return new Response(JSON.stringify({ links }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to upload file" }), {
      status: 500,
    });
  }
}
