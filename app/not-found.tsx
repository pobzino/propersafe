"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-[#FAF9F6] text-center">
      <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-2">Page not found</h1>
      <p className="text-[#6B6B6B] mb-6">
        Redirecting you back home...
      </p>
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center rounded-full border border-[#E8E6E1] bg-white px-6 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-gray-50 transition-colors"
      >
        Back to home
      </button>
    </div>
  );
}
