import Link from "next/link";
import { prisma } from "@/lib/db";

const TEMP_USER_ID = "testId";

export default async function ApplicationsPage() {
  const applications = await prisma.jobApplication.findMany({
    where: { userId: TEMP_USER_ID },
    orderBy: { appliedDate: "desc" },
  });

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Link
          href="/applications/new"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Add Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <p className="text-gray-500">No applications yet.</p>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li
              key={app.id}
              className="rounded border p-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">{app.company}</p>
                <p className="text-gray-600">{app.role}</p>
              </div>
              <span className="text-sm text-gray-500">{app.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}