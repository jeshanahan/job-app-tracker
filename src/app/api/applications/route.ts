import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { appliedDate: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(". ") },
      { status: 400 }
    );
  }

  const { appliedDate, jobUrl, ...rest } = parsed.data;

  const application = await prisma.jobApplication.create({
    data: {
      ...rest,
      jobUrl: jobUrl || null,
      appliedDate: appliedDate ? new Date(appliedDate) : undefined,
      userId: session.user.id,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
