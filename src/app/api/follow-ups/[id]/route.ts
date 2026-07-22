import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateFollowUpSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.followUp.findFirst({
    where: { id, application: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateFollowUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(". ") },
      { status: 400 }
    );
  }

  const { dueDate, applicationId: _ignore, ...rest } = parsed.data;
  const followUp = await prisma.followUp.update({
    where: { id },
    data: {
      ...rest,
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    },
  });

  return NextResponse.json(followUp);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.followUp.findFirst({
    where: { id, application: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.followUp.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
