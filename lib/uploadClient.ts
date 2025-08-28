import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";



export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});


export const getCommandObject = (key:string, filetype:string)=>{
 return  new PutObjectCommand({ Bucket: process.env.BUCKET_NAME as string, Key: key , ContentType: filetype })

}

 