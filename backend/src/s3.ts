import { CopyObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import "dotenv/config"
import fs from "fs"
import path from "path";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});


export const BUCKET = "bourai-bucket";

export async function listProject(prefix: string, localDir:string) {
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix, 
    })
  );

    if (res.Contents) {

  for (const obj of res.Contents) {
    if (!obj.Key) continue;

    const relativePath = obj.Key.replace(prefix, "");
    const localFilePath = path.join(localDir, relativePath);

    // Create folder if not exists
    fs.mkdirSync(path.dirname(localFilePath), { recursive: true });

    // Download file
    const file = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: obj.Key
      })
    );

    const bytes = await file.Body?.transformToByteArray();
    fs.writeFileSync(localFilePath, bytes!);
  }}
  return res.Contents;
}


export async function saveFile(key: string, content: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: content,
      ContentType: "text/plain",
    })
  );
}

export async function getFile(key: string) {
  const file = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  return await file.Body?.transformToString();
}

export async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function deleteFolder(prefix: string) {
  const listed = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
    })
  );

  if (!listed.Contents?.length) return;

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: listed.Contents.map((f) => ({ Key: f.Key! })),
      },
    })
  );
}
export async function CopyS3(source:string,destination:string) {
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: source, 
    })
  );
    
      if (!res.Contents) return;

  for (const obj of res.Contents) {
    if (!obj.Key) continue;

    const newKey = obj.Key.replace(source, destination);

    await s3.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${obj.Key}`,
        Key: newKey
      })
    );

    // console.log(`Copied ${obj.Key} → ${newKey}`);
    
  }
  return  (res.Contents)
}
