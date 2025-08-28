import { NextRequest } from "next/server"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCommandObject, r2Client } from "@/lib/uploadClient";

    export async function GET(req:NextRequest)  {
        try{    
        const fileName = req.nextUrl.searchParams.get("fileName") as string  ;
        const filetype = req.nextUrl.searchParams.get("filetype") as string  ;
            const url = await getSignedUrl(r2Client,getCommandObject(fileName, filetype),{expiresIn:3600}
            );


        return new Response(JSON.stringify({url}), {status: 200})
        }catch(error){
            console.error(error);
            return new Response(JSON.stringify({error: "Failed to upload file"}), {status: 500})
        }


    
}