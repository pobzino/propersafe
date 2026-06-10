import type { SupabaseClient } from "@supabase/supabase-js";

let lastRefNumber = 0;
let lastRefYear = 0;

export function generateCaseRef(): string {
  const now = new Date();
  const year = now.getFullYear();

  if (year !== lastRefYear) {
    lastRefYear = year;
    lastRefNumber = 0;
  }

  lastRefNumber += 1;
  const padded = String(lastRefNumber).padStart(4, "0");
  return `PS-${year}-${padded}`;
}

export function generateCaseRefFromCount(year: number, count: number): string {
  const padded = String(count).padStart(4, "0");
  return `PS-${year}-${padded}`;
}

export async function nextCaseRef(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const { data: latestCases } = await supabase
    .from("cases")
    .select("case_ref")
    .like("case_ref", `PS-${year}-%`)
    .order("case_ref", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (latestCases && latestCases.length > 0) {
    const match = latestCases[0].case_ref.match(/-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return generateCaseRefFromCount(year, nextNum);
}
