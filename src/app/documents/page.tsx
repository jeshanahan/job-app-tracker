import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { DocumentsManager } from "@/components/documents-manager";

export default async function DocumentsPage() {
  const session = await auth();
  const documents = await prisma.document.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <main className="space-y-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-gray-400">
          Upload resumes and cover letters, then link them on an application.
        </p>
        <DocumentsManager
          documents={documents.map((doc) => ({
            ...doc,
            createdAt: doc.createdAt.toISOString(),
          }))}
        />
      </main>
    </AppShell>
  );
}
