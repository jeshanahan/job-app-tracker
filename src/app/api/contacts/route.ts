import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getOwnedApplication } from "@/lib/ownership";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
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

  const contact = await prisma.contact.create({
    data: {
      applicationId: parsed.data.applicationId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      role: parsed.data.role || null,
      notes: parsed.data.notes || null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
