"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { documentTypes } from "@/lib/validations";

type DocumentItem = {
  id: string;
  filename: string;
  type: string;
  size: number;
  createdAt: string;
};

export function DocumentsManager({
  documents,
}: {
  documents: DocumentItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Upload failed");
      setLoading(false);
      return;
    }
    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onUpload} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm">File (PDF/DOCX, max 5MB)</label>
          <input
            type="file"
            name="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="block text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Type</label>
          <select
            name="type"
            defaultValue="RESUME"
            className="rounded border border-gray-500 bg-white px-3 py-2 text-black"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded border border-gray-700 p-3"
            >
              <div>
                <a
                  href={`/api/documents/${doc.id}`}
                  className="font-medium hover:underline"
                >
                  {doc.filename}
                </a>
                <p className="text-sm text-gray-400">
                  {doc.type} · {(doc.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(doc.id)}
                className="text-sm text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
