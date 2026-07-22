import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getOwnedApplication } from "@/lib/ownership";
import { followUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = followUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(". ") },
      { status: 400 }
    );
  }

  const owned = await getOwnedApplication(
    parsed.data.applicationId,
    session.user.id
  );
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const followUp = await prisma.followUp.create({
    data: {
      applicationId: parsed.data.applicationId,
      dueDate: new Date(parsed.data.dueDate),
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      completed: parsed.data.completed ?? false,
    },
  });

  return NextResponse.json(followUp, { status: 201 });
}
