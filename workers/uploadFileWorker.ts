import { Worker } from "bullmq";

const worker = new Worker("upload",async(job)=>{
const {file , userId , status }= job.data;
console.log(`Uploading file for user ${userId} with status ${status}`);


},{
    connection: {
        host: "localhost",
        port: 6379, 
    }
})