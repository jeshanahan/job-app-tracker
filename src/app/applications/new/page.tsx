"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewApplicationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: formData.get("company"),
        role: formData.get("role"),
        notes: formData.get("notes") || undefined,
      }),
    });

    if (!res.ok) {
      setError("Failed to create application");
      setLoading(false);
      return;
    }

    router.push("/applications");
  }

  return (
    <main className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add Application</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Company</label>
          <input
            name="company"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Role</label>
          <input
            name="role"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            name="notes"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </main>
  );
}