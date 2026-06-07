"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_LABELS } from "@/lib/utils/checks";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_whatsapp: "",
    client_location: "",
    service_type: "validity_check",
    property_location: "",
    property_type: "",
    deadline: "",
    intake_notes: "",
    client_concern: "",
    internal_notes: "",
    payment_amount: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        payment_amount: form.payment_amount ? Number(form.payment_amount) : null,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Something went wrong");
      return;
    }

    router.push(`/cases/${json.data.id}`);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cases" className="text-ink-muted hover:text-ink">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold text-ink">Create case</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-bg px-3 py-2 text-sm text-red">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Client</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Name *
              </label>
              <input
                required
                value={form.client_name}
                onChange={(e) => update("client_name", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={form.client_email}
                onChange={(e) => update("client_email", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                WhatsApp
              </label>
              <input
                value={form.client_whatsapp}
                onChange={(e) => update("client_whatsapp", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Client location
              </label>
              <input
                value={form.client_location}
                onChange={(e) => update("client_location", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Property & service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Service type *
              </label>
              <select
                required
                value={form.service_type}
                onChange={(e) => update("service_type", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              >
                {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Property type
              </label>
              <select
                value={form.property_type}
                onChange={(e) => update("property_type", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              >
                <option value="">Select...</option>
                <option value="land">Land</option>
                <option value="flat">Flat</option>
                <option value="duplex">Duplex</option>
                <option value="built_property">Built Property</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Property location
              </label>
              <input
                value={form.property_location}
                onChange={(e) => update("property_location", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Case details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Payment amount (₦)
              </label>
              <input
                type="number"
                value={form.payment_amount}
                onChange={(e) => update("payment_amount", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Intake notes
              </label>
              <textarea
                value={form.intake_notes}
                onChange={(e) => update("intake_notes", e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Client concern
              </label>
              <textarea
                value={form.client_concern}
                onChange={(e) => update("client_concern", e.target.value)}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Internal notes
              </label>
              <textarea
                value={form.internal_notes}
                onChange={(e) => update("internal_notes", e.target.value)}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create case
          </button>
          <Link
            href="/cases"
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-ink-light hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
