"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { applicationStatuses, interviewTypes } from "@/lib/validations";
import { formatDate, formatDateTime } from "@/lib/format";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  notes: string | null;
};

type Interview = {
  id: string;
  scheduledAt: string;
  type: string;
  notes: string | null;
};

type FollowUp = {
  id: string;
  dueDate: string;
  title: string;
  notes: string | null;
  completed: boolean;
};

type LinkedDocument = {
  document: {
    id: string;
    filename: string;
    type: string;
  };
};

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  notes: string | null;
  jobUrl: string | null;
  location: string | null;
  contacts: Contact[];
  interviews: Interview[];
  followUps: FollowUp[];
  documents: LinkedDocument[];
};

export function ApplicationDetail({
  application,
  allDocuments,
}: {
  application: Application;
  allDocuments: { id: string; filename: string; type: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: formData.get("company"),
        role: formData.get("role"),
        status: formData.get("status"),
        notes: formData.get("notes") || undefined,
        jobUrl: formData.get("jobUrl") || "",
        location: formData.get("location") || undefined,
        appliedDate: formData.get("appliedDate") || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Update failed");
      setSaving(false);
      return;
    }
    setSaving(false);
    router.refresh();
  }

  async function deleteApplication() {
    if (!confirm("Delete this application and all related data?")) return;
    const res = await fetch(`/api/applications/${application.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/applications");
      router.refresh();
    }
  }

  async function addContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: application.id,
        name: formData.get("name"),
        email: formData.get("email") || "",
        role: formData.get("role") || "",
        notes: formData.get("notes") || "",
      }),
    });
    e.currentTarget.reset();
    router.refresh();
  }

  async function addInterview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: application.id,
        scheduledAt: formData.get("scheduledAt"),
        type: formData.get("type") || "VIDEO",
        notes: formData.get("notes") || "",
      }),
    });
    e.currentTarget.reset();
    router.refresh();
  }

  async function addFollowUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: application.id,
        dueDate: formData.get("dueDate"),
        title: formData.get("title"),
        notes: formData.get("notes") || "",
      }),
    });
    e.currentTarget.reset();
    router.refresh();
  }

  async function toggleFollowUp(id: string, completed: boolean) {
    await fetch(`/api/follow-ups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    router.refresh();
  }

  async function linkDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch(`/api/applications/${application.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: application.id,
        documentId: formData.get("documentId"),
      }),
    });
    router.refresh();
  }

  const appliedDateValue = application.appliedDate.slice(0, 10);
  const linkedIds = new Set(application.documents.map((d) => d.document.id));

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">
            {application.company} — {application.role}
          </h1>
          <button
            type="button"
            onClick={deleteApplication}
            className="rounded border border-red-500 px-3 py-1.5 text-sm text-red-400"
          >
            Delete
          </button>
        </div>

        <form onSubmit={saveApplication} className="grid gap-4 md:grid-cols-2">
          <Field label="Company" name="company" defaultValue={application.company} required />
          <Field label="Role" name="role" defaultValue={application.role} required />
          <Field label="Location" name="location" defaultValue={application.location ?? ""} />
          <Field label="Job URL" name="jobUrl" defaultValue={application.jobUrl ?? ""} />
          <Field
            label="Applied date"
            name="appliedDate"
            type="date"
            defaultValue={appliedDateValue}
          />
          <div>
            <label className="mb-1 block text-sm">Status</label>
            <select
              name="status"
              defaultValue={application.status}
              className={selectClass}
            >
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm">Notes</label>
            <textarea
              name="notes"
              defaultValue={application.notes ?? ""}
              className="w-full rounded border border-gray-500 bg-transparent px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 md:col-span-2 md:w-fit"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      <Section title="Contacts">
        <ul className="mb-4 space-y-2">
          {application.contacts.map((contact) => (
            <li key={contact.id} className="flex justify-between rounded border border-gray-700 p-3">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-400">
                  {[contact.role, contact.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-red-400"
                onClick={async () => {
                  await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
                  router.refresh();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addContact} className="grid gap-2 md:grid-cols-4">
          <input name="name" required placeholder="Name" className={inputClass} />
          <input name="role" placeholder="Role" className={inputClass} />
          <input name="email" type="email" placeholder="Email" className={inputClass} />
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">
            Add contact
          </button>
        </form>
      </Section>

      <Section title="Interviews">
        <ul className="mb-4 space-y-2">
          {application.interviews.map((interview) => (
            <li key={interview.id} className="flex justify-between rounded border border-gray-700 p-3">
              <div>
                <p className="font-medium">{interview.type}</p>
                <p className="text-sm text-gray-400">
                  {formatDateTime(interview.scheduledAt)}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-red-400"
                onClick={async () => {
                  await fetch(`/api/interviews/${interview.id}`, { method: "DELETE" });
                  router.refresh();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addInterview} className="grid gap-2 md:grid-cols-4">
          <input name="scheduledAt" type="datetime-local" required className={inputClass} />
          <select name="type" defaultValue="VIDEO" className={selectClass}>
            {interviewTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notes" className={inputClass} />
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">
            Add interview
          </button>
        </form>
      </Section>

      <Section title="Follow-ups">
        <ul className="mb-4 space-y-2">
          {application.followUps.map((item) => (
            <li key={item.id} className="flex justify-between rounded border border-gray-700 p-3">
              <div>
                <p className={`font-medium ${item.completed ? "line-through text-gray-500" : ""}`}>
                  {item.title}
                </p>
                <p className="text-sm text-gray-400">Due {formatDate(item.dueDate)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="text-sm text-blue-400"
                  onClick={() => toggleFollowUp(item.id, item.completed)}
                >
                  {item.completed ? "Undo" : "Complete"}
                </button>
                <button
                  type="button"
                  className="text-sm text-red-400"
                  onClick={async () => {
                    await fetch(`/api/follow-ups/${item.id}`, { method: "DELETE" });
                    router.refresh();
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={addFollowUp} className="grid gap-2 md:grid-cols-4">
          <input name="title" required placeholder="Title" className={inputClass} />
          <input name="dueDate" type="date" required className={inputClass} />
          <input name="notes" placeholder="Notes" className={inputClass} />
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">
            Add follow-up
          </button>
        </form>
      </Section>

      <Section title="Documents">
        <ul className="mb-4 space-y-2">
          {application.documents.map(({ document }) => (
            <li key={document.id} className="rounded border border-gray-700 p-3">
              <a
                href={`/api/documents/${document.id}`}
                className="font-medium hover:underline"
              >
                {document.filename}
              </a>
              <span className="ml-2 text-sm text-gray-400">{document.type}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={linkDocument} className="flex flex-wrap gap-2">
          <select name="documentId" required className={selectClass}>
            <option value="">Link a document…</option>
            {allDocuments
              .filter((doc) => !linkedIds.has(doc.id))
              .map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} ({doc.type})
                </option>
              ))}
          </select>
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">
            Link
          </button>
        </form>
      </Section>
    </div>
  );
}

const inputClass =
  "rounded border border-gray-500 bg-transparent px-3 py-2";

const selectClass =
  "rounded border border-gray-500 bg-white px-3 py-2 text-black";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className={inputClass}
      />
    </div>
  );
}
