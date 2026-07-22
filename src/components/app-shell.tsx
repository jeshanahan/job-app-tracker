import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";

export async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AppNav email={session.user.email} />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
