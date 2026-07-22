import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const { success, data, error } = registerSchema.safeParse(body);
  if (!success) {
    return NextResponse.json(
      { error: error.issues.map((i) => i.message).join(". ") },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (user) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name ?? null,
      passwordHash: hashedPassword,
    },
  });
  return NextResponse.json({ id: newUser.id, email: data.email, name: data.name }, { status: 201 });
}