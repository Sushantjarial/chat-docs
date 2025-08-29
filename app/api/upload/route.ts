import { NextRequest } from "next/server"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCommandObject, r2Client } from "@/lib/uploadClient";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

    export async function POST(req:NextRequest)  {
        try{    
                        const session = await getSessionCookie(req);
                        console.log(session)

                           const sessionn = await auth.api.getSession({ headers: req.headers });
                           console.log("Auth session:", sessionn);
                    const {files} = await req.json();
                    console.log("Files received in request:", files);
                    if (files.length <= 0) {
                        return new Response(JSON.stringify({ error: "No files provided" }), { status: 400 });
                    }
                    if(files.length > 5){
                        return new Response(JSON.stringify({ error: "Too many files provided" }), { status: 400 });
                    }
                    if (files.some((f:any) => !f.name || !f.type)) {
                        return new Response(JSON.stringify({ error: "Invalid file metadata" }), { status: 400 });
                    }
                    if(files.some((f:any)=>
                     ( f.size > 20 * 1024 * 1024)? true:false 
                    )) return new Response(JSON.stringify({ error: "File size exceeds limit" }), { status: 400 });


            const links = await Promise.all(files.map(async (file:any) => {
                const { name, type ,id } = file;
                return {url: await getSignedUrl(r2Client, getCommandObject(name, type), { expiresIn: 3600 }),
                id
            };
            }));

        return new Response(JSON.stringify({links}), {status: 200})
        }catch(error){
            console.error(error);
            return new Response(JSON.stringify({error: "Failed to upload file"}), {status: 500})
        }


    
}