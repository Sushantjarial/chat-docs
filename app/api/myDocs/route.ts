import { auth } from "@/lib/auth";

export async function GET( req: Request) {
    const sessionResult = await auth.api.getSession({ headers: req.headers });
    if (!sessionResult) {
      return new Response(JSON.stringify({ error: "No session found" }), {
        status: 401,
      });
    }
    const { user } = sessionResult;
    console.log("User in myDocs GET:", user);
    return new Response("Hello, This is myDocs endpoint");
  }
  