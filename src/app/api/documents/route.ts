import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { documentTypes } from "@/lib/validations";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const typeRaw = String(formData.get("type") || "RESUME");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be 5MB or less" }, { status: 400 });
  }
  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF and Word documents are allowed" },
      { status: 400 }
    );
  }
  if (!documentTypes.includes(typeRaw as (typeof documentTypes)[number])) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const saved = await saveUpload(file, session.user.id);
  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      type: typeRaw as (typeof documentTypes)[number],
      filename: saved.filename,
      storagePath: saved.storagePath,
      mimeType: saved.mimeType,
      size: saved.size,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteUpload(document.storagePath);
  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
