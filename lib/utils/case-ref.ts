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
