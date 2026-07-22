import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const interview = await prisma.interview.findFirst({
    where: { id, application: { userId: session.user.id } },
  });
  if (!interview) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.interview.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
