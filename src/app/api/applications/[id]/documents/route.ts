import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getOwnedApplication } from "@/lib/ownership";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const applicationId = String(body.applicationId || "");
  const documentId = String(body.documentId || "");

  if (!applicationId || !documentId) {
    return NextResponse.json({ error: "Missing ids" }, { status: 400 });
  }

  const [application, document] = await Promise.all([
    getOwnedApplication(applicationId, session.user.id),
    prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
    }),
  ]);

  if (!application || !document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = await prisma.applicationDocument.upsert({
    where: {
      applicationId_documentId: { applicationId, documentId },
    },
    create: { applicationId, documentId },
    update: {},
  });

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const applicationId = String(body.applicationId || "");
  const documentId = String(body.documentId || "");

  const owned = await getOwnedApplication(applicationId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.applicationDocument.deleteMany({
    where: { applicationId, documentId },
  });

  return NextResponse.json({ ok: true });
}
