import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { STATUS_COLORS, formatDate, formatDateTime } from "@/lib/format";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

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
        take: 8,
      }),
      prisma.jobApplication.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

  return (
    <AppShell>
      <main className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Your job search at a glance</p>
          </div>
          <Link
            href="/applications/new"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Add Application
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total applications" value={total} />
          <StatCard label="This week" value={thisWeek} />
          <StatCard label="This month" value={thisMonth} />
          <StatCard
            label="Upcoming follow-ups"
            value={upcomingFollowUps.length}
          />
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">By status</h2>
          <div className="flex flex-wrap gap-2">
            {byStatus.length === 0 ? (
              <p className="text-gray-500">No applications yet.</p>
            ) : (
              byStatus.map((row) => (
                <span
                  key={row.status}
                  className={`rounded px-3 py-1 text-sm ${STATUS_COLORS[row.status] ?? ""}`}
                >
                  {row.status}: {row._count._all}
                </span>
              ))
            )}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Upcoming follow-ups</h2>
            {upcomingFollowUps.length === 0 ? (
              <p className="text-gray-500">Nothing due in the next 7 days.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingFollowUps.map((item) => (
                  <li
                    key={item.id}
                    className="rounded border border-gray-700 p-3"
                  >
                    <Link
                      href={`/applications/${item.application.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-400">
                      {item.application.company} · {formatDate(item.dueDate)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Recently updated</h2>
            {recent.length === 0 ? (
              <p className="text-gray-500">No applications yet.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((app) => (
                  <li
                    key={app.id}
                    className="rounded border border-gray-700 p-3"
                  >
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-medium hover:underline"
                    >
                      {app.company} — {app.role}
                    </Link>
                    <p className="text-sm text-gray-400">
                      <span
                        className={`mr-2 rounded px-2 py-0.5 text-xs ${STATUS_COLORS[app.status]}`}
                      >
                        {app.status}
                      </span>
                      {formatDateTime(app.updatedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-gray-700 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
