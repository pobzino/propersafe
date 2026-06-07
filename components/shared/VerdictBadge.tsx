"use client";

const verdictColors: Record<string, string> = {
  proceed: "bg-green-bg/50 text-green border-green/20",
  pause: "bg-amber-bg/40 text-amber border-amber/20",
  avoid: "bg-red-bg/40 text-red border-red/20",
  release: "bg-green-bg/50 text-green border-green/20",
  partial_release: "bg-amber-bg/40 text-amber border-amber/20",
  hold: "bg-red-bg/40 text-red border-red/20",
};

const verdictLabels: Record<string, string> = {
  proceed: "Proceed",
  pause: "Pause",
  avoid: "Avoid",
  release: "Release",
  partial_release: "Partial Release",
  hold: "Hold",
};

interface VerdictBadgeProps {
  verdict: string;
}

export default function VerdictBadge({ verdict }: VerdictBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        verdictColors[verdict] || "bg-gray-50 text-ink-muted border-gray-200"
      }`}
    >
      {verdictLabels[verdict] || verdict}
    </span>
  );
}
