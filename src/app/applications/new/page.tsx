import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { NewApplicationForm } from "@/components/new-application-form";

export default function NewApplicationPage() {
  return (
    <AppShell>
      <main>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add Application</h1>
          <Link href="/applications" className="text-sm text-blue-400">
            Back
          </Link>
        </div>
        <NewApplicationForm />
      </main>
    </AppShell>
  );
}
