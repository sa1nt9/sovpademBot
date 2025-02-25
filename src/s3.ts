import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

const s3 = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
    },
});

export async function uploadFileToS3(buffer: Buffer, fileName: string, mimeType: string) {
    const fileKey = `uploads/${randomUUID()}-${fileName}`;  // Уникальное имя файла

    const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: mimeType,
        ACL: ObjectCannedACL.public_read,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
}
