import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  const due = await prisma.followUp.findMany({
    where: {
      completed: false,
      reminderSent: false,
      dueDate: { gte: start, lte: end },
    },
    include: {
      application: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  // MVP: mark as reminded. Wire Resend later with RESEND_API_KEY.
  if (due.length > 0) {
    await prisma.followUp.updateMany({
      where: { id: { in: due.map((item) => item.id) } },
      data: { reminderSent: true },
    });
  }

  return NextResponse.json({
    processed: due.length,
    reminders: due.map((item) => ({
      id: item.id,
      title: item.title,
      email: item.application.user.email,
      company: item.application.company,
    })),
  });
}
