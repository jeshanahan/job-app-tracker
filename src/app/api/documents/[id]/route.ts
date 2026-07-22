import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveLocalPath } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!document.storagePath.startsWith("local:")) {
    return NextResponse.redirect(document.storagePath);
  }

  const localPath = resolveLocalPath(document.storagePath);
  if (!localPath) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const buffer = await readFile(localPath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.filename}"`,
    },
  });
}
