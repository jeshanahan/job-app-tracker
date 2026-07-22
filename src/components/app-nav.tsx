import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/calendar", label: "Calendar" },
  { href: "/documents", label: "Documents" },
];

export function AppNav({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-gray-700 px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            Job Tracker
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-gray-300">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {email && <span className="text-sm text-gray-400">{email}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
