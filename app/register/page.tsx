"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Server-side allowlist check + account creation (see /api/auth/register).
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Account exists — sign in to establish the session, then enter the dashboard.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-1">Propersafe</h1>
        <p className="text-[#6B6B6B] mb-8">Create coordinator account</p>

        {success ? (
          <div className="rounded-md bg-[#E8F5E9] px-3 py-2 text-sm text-[#2D6A4F]">
            Account created. Redirecting to dashboard...
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#E8E6E1] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8954F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-[#E8E6E1] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8954F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-[#E8E6E1] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8954F]"
              />
            </div>

            {error && (
              <p className="text-sm text-[#9B2335]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#B8954F] px-4 py-2 text-sm font-medium text-white hover:bg-[#A68343] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-sm text-[#6B6B6B] text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-[#B8954F] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
