"use client";

import { useState, useEffect } from "react";

import { Mail, MessageCircle, Plus, X } from "lucide-react";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specialism: "lawyer",
    email: "",
    whatsapp: "",
    notes: "",
  });

  const fetchProfessionals = async () => {
    try {
      const res = await fetch("/api/professionals");
      const data = await res.json();
      if (res.ok) {
        setProfessionals(data || []);
      } else {
        console.error("Failed to fetch professionals:", data.error);
        setProfessionals([]);
      }
    } catch (err) {
      console.error("Error fetching professionals:", err);
      setProfessionals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", specialism: "lawyer", email: "", whatsapp: "", notes: "" });
        setShowForm(false);
        fetchProfessionals();
      } else {
        const data = await res.json();
        console.error("Failed to add professional:", data.error);
        alert("Failed to add professional: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error adding professional:", err);
      alert("Error adding professional");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Professionals</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {professionals.length} professionals
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover"
        >
          <Plus size={16} />
          Add professional
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-md border border-border bg-surface p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">New professional</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-ink-muted hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Specialism *
              </label>
              <select
                required
                value={form.specialism}
                onChange={(e) => setForm((f) => ({ ...f, specialism: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              >
                <option value="lawyer">Lawyer</option>
                <option value="QS">QS</option>
                <option value="surveyor">Surveyor</option>
                <option value="inspector">Inspector</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">
                WhatsApp
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-muted mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              type="submit"
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold-hover"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((p) => (
            <div
              key={p.id}
              className="rounded-md border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-ink">{p.name}</h3>
                  <p className="text-xs text-ink-muted capitalize">
                    {p.specialism}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    p.active
                      ? "bg-green-bg text-green"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-1 mt-3">
                {p.email && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-light">
                    <Mail size={12} className="text-ink-muted" />
                    {p.email}
                  </div>
                )}
                {p.whatsapp && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-light">
                    <MessageCircle size={12} className="text-ink-muted" />
                    {p.whatsapp}
                  </div>
                )}
              </div>
              {p.notes && (
                <p className="text-xs text-ink-muted mt-2 border-t border-border pt-2">
                  {p.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
