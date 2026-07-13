import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApplicationSchema } from "@/lib/validations";

const TEMP_USER_ID = "testId";

export async function GET() {
  const applications = await prisma.jobApplication.findMany({
    where: { userId: TEMP_USER_ID },
    orderBy: { appliedDate: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {

  const body = await request.json();
  const parsed = createApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const application = await prisma.jobApplication.create({
    data: {
      ...parsed.data,
      userId: TEMP_USER_ID,
    },
  });

  return NextResponse.json(application, { status: 201 });
}