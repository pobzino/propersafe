"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-1">Propersafe</h1>
        <p className="text-[#6B6B6B] mb-8">Access your case portal</p>

        {sent ? (
          <div className="rounded-md border border-[#E8E6E1] bg-white p-4">
            <p className="text-sm text-[#1A1A1A]">
              Magic link sent to <strong>{email}</strong>.
            </p>
            <p className="text-sm text-[#6B6B6B] mt-2">
              Check your inbox and click the link to access your case.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-[#E8E6E1] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8954F]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#B8954F] px-4 py-2 text-sm font-medium text-white hover:bg-[#A68343] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
