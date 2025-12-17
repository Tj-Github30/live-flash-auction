export function formatTimeRemaining(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";

  let seconds: number | null = null;
  if (typeof value === "number" && Number.isFinite(value)) {
    seconds = Math.max(0, Math.floor(value));
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    // If backend sends seconds as a string ("752"), format it; otherwise assume it's already a nice label ("12m").
    if (/^\d+$/.test(trimmed)) {
      seconds = Math.max(0, parseInt(trimmed, 10));
    } else {
      return trimmed || "N/A";
    }
  }

  if (seconds === null) return "N/A";
  if (seconds <= 0) return "Ended";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function formatCurrency(amount: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? 0;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}


