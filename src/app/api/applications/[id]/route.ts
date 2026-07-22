import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateApplicationSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await prisma.jobApplication.findFirst({
    where: { id, userId: session.user.id },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      interviews: { orderBy: { scheduledAt: "asc" } },
      followUps: { orderBy: { dueDate: "asc" } },
      documents: { include: { document: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(". ") },
      { status: 400 }
    );
  }

  const { appliedDate, jobUrl, ...rest } = parsed.data;
  const application = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...rest,
      ...(jobUrl !== undefined ? { jobUrl: jobUrl || null } : {}),
      ...(appliedDate !== undefined
        ? { appliedDate: appliedDate ? new Date(appliedDate) : existing.appliedDate }
        : {}),
    },
  });

  return NextResponse.json(application);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jobApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
