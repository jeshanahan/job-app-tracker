"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applicationStatuses } from "@/lib/validations";

export function NewApplicationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: formData.get("company"),
        role: formData.get("role"),
        status: formData.get("status") || "APPLIED",
        notes: formData.get("notes") || undefined,
        jobUrl: formData.get("jobUrl") || undefined,
        location: formData.get("location") || undefined,
        appliedDate: formData.get("appliedDate") || undefined,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed");
      setLoading(false);
      return;
    }

    router.push(`/applications/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Field label="Company" name="company" required />
      <Field label="Role" name="role" required />
      <Field label="Location" name="location" />
      <Field label="Job URL" name="jobUrl" type="url" />
      <Field label="Applied date" name="appliedDate" type="date" />
      <div>
        <label className="mb-1 block text-sm">Status</label>
        <select
          name="status"
          defaultValue="APPLIED"
          className="w-full rounded border border-gray-500 bg-white px-3 py-2 text-black"
        >
          {applicationStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm">Notes</label>
        <textarea
          name="notes"
          className="w-full rounded border border-gray-500 bg-transparent px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded border border-gray-500 bg-transparent px-3 py-2"
      />
    </div>
  );
}
