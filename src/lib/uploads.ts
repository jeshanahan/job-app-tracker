import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";

const LOCAL_DIR = path.join(process.cwd(), "storage", "uploads");

function useBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function saveUpload(file: File, userId: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${userId}/${Date.now()}-${safeName}`;

  if (useBlob()) {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return {
      storagePath: blob.url,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    };
  }

  await mkdir(path.join(LOCAL_DIR, userId), { recursive: true });
  const fullPath = path.join(LOCAL_DIR, key);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return {
    storagePath: `local:${key}`,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function deleteUpload(storagePath: string) {
  if (storagePath.startsWith("local:")) {
    const key = storagePath.slice("local:".length);
    await unlink(path.join(LOCAL_DIR, key)).catch(() => undefined);
    return;
  }

  if (useBlob()) {
    await del(storagePath).catch(() => undefined);
  }
}

export function resolveLocalPath(storagePath: string) {
  if (!storagePath.startsWith("local:")) return null;
  return path.join(LOCAL_DIR, storagePath.slice("local:".length));
}
