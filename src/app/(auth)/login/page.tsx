"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border border-gray-500 rounded px-3 py-2 bg-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full border border-gray-500 rounded px-3 py-2 bg-transparent"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-600" />
        <span className="text-sm text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-600" />
      </div>

      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="w-full rounded border border-gray-500 px-4 py-2"
      >
        Sign in with GitHub
      </button>

      <p className="text-sm text-center mt-4">
        No account?{" "}
        <Link href="/register" className="text-blue-500">
          Create one
        </Link>
      </p>
    </main>
  );
}
