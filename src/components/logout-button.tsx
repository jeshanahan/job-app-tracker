"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded border border-gray-500 px-3 py-1.5 text-sm"
    >
      Log out
    </button>
  );
}
