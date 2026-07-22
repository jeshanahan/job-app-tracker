"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { applicationStatuses } from "@/lib/validations";

export function ApplicationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      const text = String(value).trim();
      if (text) params.set(key, text);
    }
    const query = params.toString();
    router.push(query ? `/applications?${query}` : "/applications");
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        name="company"
        defaultValue={searchParams.get("company") ?? ""}
        placeholder="Company"
        className="rounded border border-gray-500 bg-transparent px-3 py-2"
      />
      <input
        name="role"
        defaultValue={searchParams.get("role") ?? ""}
        placeholder="Role"
        className="rounded border border-gray-500 bg-transparent px-3 py-2"
      />
      <select
        name="status"
        defaultValue={searchParams.get("status") ?? ""}
        className="rounded border border-gray-500 bg-white px-3 py-2 text-black"
      >
        <option value="">All statuses</option>
        {applicationStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="dateFrom"
        defaultValue={searchParams.get("dateFrom") ?? ""}
        className="rounded border border-gray-500 bg-transparent px-3 py-2"
      />
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Filter
      </button>
    </form>
  );
}
