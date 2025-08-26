import { IncomingForm } from "formidable";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {





    console.log(req);
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), "uploads"),
      keepExtensions: true,
    });

    const data: { files: any } = await new Promise((resolve, reject) => {
      console.log("Parsing form...");
      form.parse(req as any, (err: any, fields: any, files: any) => {
        console.log("Form parsed successfully.");
        if (err) reject(err);
        resolve({ files });
      });
    });

    Object.keys(data.files).forEach((key) => {
      console.log(`Received file ${key}:`, data.files[key]);
    });

    return NextResponse.json({ message: "Successfully received file(s)" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
