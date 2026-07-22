import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { ApplicationDetail } from "@/components/application-detail";

type Params = { params: Promise<{ id: string }> };

export default async function ApplicationDetailPage({ params }: Params) {
  const session = await auth();
  const { id } = await params;

  const [application, allDocuments] = await Promise.all([
    prisma.jobApplication.findFirst({
      where: { id, userId: session!.user!.id },
      include: {
        contacts: { orderBy: { createdAt: "desc" } },
        interviews: { orderBy: { scheduledAt: "asc" } },
        followUps: { orderBy: { dueDate: "asc" } },
        documents: { include: { document: true } },
      },
    }),
    prisma.document.findMany({
      where: { userId: session!.user!.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, filename: true, type: true },
    }),
  ]);

  if (!application) notFound();

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/applications" className="text-sm text-blue-400">
          ← Back to applications
        </Link>
      </div>
      <ApplicationDetail
        application={{
          ...application,
          appliedDate: application.appliedDate.toISOString(),
          interviews: application.interviews.map((item) => ({
            ...item,
            scheduledAt: item.scheduledAt.toISOString(),
          })),
          followUps: application.followUps.map((item) => ({
            ...item,
            dueDate: item.dueDate.toISOString(),
          })),
        }}
        allDocuments={allDocuments}
      />
    </AppShell>
  );
}
