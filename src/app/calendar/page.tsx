import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { formatDate } from "@/lib/format";

type SearchParams = Promise<{ month?: string }>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;

  const base = params.month ? new Date(`${params.month}-01T00:00:00`) : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  const label = start.toLocaleString(undefined, { month: "long", year: "numeric" });

  const followUps = await prisma.followUp.findMany({
    where: {
      dueDate: { gte: start, lte: end },
      application: { userId: session!.user!.id },
    },
    include: {
      application: { select: { id: true, company: true, role: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const byDay = new Map<number, typeof followUps>();
  for (const item of followUps) {
    const day = item.dueDate.getDate();
    const list = byDay.get(day) ?? [];
    list.push(item);
    byDay.set(day, list);
  }

  const firstWeekday = start.getDay();
  const daysInMonth = end.getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <AppShell>
      <main className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Follow-up calendar</h1>
          <div className="flex gap-2 text-sm">
            <Link href={`/calendar?month=${prevKey}`} className="rounded border border-gray-600 px-3 py-1">
              Previous
            </Link>
            <span className="px-2 py-1">{label}</span>
            <Link href={`/calendar?month=${nextKey}`} className="rounded border border-gray-600 px-3 py-1">
              Next
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="min-h-24 rounded border border-gray-800 p-2 text-left"
            >
              {day && (
                <>
                  <p className="mb-1 text-sm font-medium">{day}</p>
                  <ul className="space-y-1">
                    {(byDay.get(day) ?? []).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/applications/${item.application.id}`}
                          className={`block truncate rounded px-1 py-0.5 text-xs ${
                            item.completed
                              ? "bg-gray-700 text-gray-400 line-through"
                              : "bg-amber-500/20 text-amber-200"
                          }`}
                          title={`${item.title} · ${item.application.company}`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">This month</h2>
          {followUps.length === 0 ? (
            <p className="text-gray-500">No follow-ups scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {followUps.map((item) => (
                <li key={item.id} className="rounded border border-gray-700 p-3">
                  <Link
                    href={`/applications/${item.application.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-400">
                    {item.application.company} · {formatDate(item.dueDate)}
                    {item.completed ? " · completed" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </AppShell>
  );
}
