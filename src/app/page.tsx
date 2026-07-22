import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-8">
      <h1 className="text-3xl font-bold">Job Application Tracker</h1>
      <p className="mt-3 text-gray-400">
        Track applications, interviews, contacts, follow-ups, and resumes in one
        place.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded border border-gray-500 px-4 py-2"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
