import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  const [total, byStatus, thisWeek, thisMonth, upcomingFollowUps, recent] =
    await Promise.all([
      prisma.jobApplication.count({ where: { userId } }),
      prisma.jobApplication.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.jobApplication.count({
        where: { userId, createdAt: { gte: weekAgo } },
      }),
      prisma.jobApplication.count({
        where: { userId, createdAt: { gte: monthAgo } },
      }),
      prisma.followUp.findMany({
        where: {
          completed: false,
          dueDate: { gte: now, lte: weekAhead },
          application: { userId },
        },
        include: {
          application: { select: { id: true, company: true, role: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.jobApplication.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          company: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

  return NextResponse.json({
    total,
    byStatus: byStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
    thisWeek,
    thisMonth,
    upcomingFollowUps,
    recent,
  });
}
