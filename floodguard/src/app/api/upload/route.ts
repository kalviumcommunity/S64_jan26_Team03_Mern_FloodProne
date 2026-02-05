import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(req: Request) {
  try {
    const { filename, fileType, fileSize } = await req.json();

    // 1️⃣ Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file type" },
        { status: 400 }
      );
    }

    // 2️⃣ Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size exceeds limit" },
        { status: 400 }
      );
    }

    // 3️⃣ Create unique object key
    const key = `uploads/${Date.now()}-${filename}`;

    // 4️⃣ Create S3 command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    // 5️⃣ Generate signed URL (60 seconds)
    const uploadURL = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    return NextResponse.json({
      success: true,
      uploadURL,
      fileKey: key,
      fileURL: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
