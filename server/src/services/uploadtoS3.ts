// TODO 

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export const uploadToS3 = async (
//   buffer: Buffer,
//   originalName: string,
//   mimeType: string
// ): Promise<string> => {
//   const key = `${uuidv4()}-${originalName}`;

//   const command = new PutObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET!,
//     Key: key,
//     Body: buffer,
//     ContentType: mimeType,
//   });

//   await s3.send(command);

//   return key;
// };
