import Link from "next/link";
import { Suspense } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { ApplicationFilters } from "@/components/application-filters";
import { STATUS_COLORS, formatDate } from "@/lib/format";
import { applicationStatuses } from "@/lib/validations";

type SearchParams = Promise<{
  company?: string;
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const userId = session!.user!.id;
  const params = await searchParams;

  const where: Prisma.JobApplicationWhereInput = {
    userId,
    AND: [
      params.company
        ? { company: { contains: params.company, mode: "insensitive" } }
        : {},
      params.role
        ? { role: { contains: params.role, mode: "insensitive" } }
        : {},
      params.status &&
      applicationStatuses.includes(
        params.status as (typeof applicationStatuses)[number]
      )
        ? { status: params.status as (typeof applicationStatuses)[number] }
        : {},
      params.dateFrom ? { appliedDate: { gte: new Date(params.dateFrom) } } : {},
      params.dateTo ? { appliedDate: { lte: new Date(params.dateTo) } } : {},
    ],
  };

  const applications = await prisma.jobApplication.findMany({
    where,
    orderBy: { appliedDate: "desc" },
  });

  return (
    <AppShell>
      <main>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Applications</h1>
          <Link
            href="/applications/new"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Add Application
          </Link>
        </div>

        <Suspense fallback={null}>
          <ApplicationFilters />
        </Suspense>

        {applications.length === 0 ? (
          <p className="text-gray-500">No applications match your filters.</p>
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between rounded border border-gray-700 p-4 hover:border-gray-500"
                >
                  <div>
                    <p className="font-semibold">
                      {app.company} — {app.role}
                    </p>
                    <p className="text-sm text-gray-400">
                      Applied {formatDate(app.appliedDate)}
                      {app.location ? ` · ${app.location}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs ${STATUS_COLORS[app.status]}`}
                  >
                    {app.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
