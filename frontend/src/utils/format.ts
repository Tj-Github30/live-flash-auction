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

export function formatUsernameForDisplay(username: string | null | undefined): string {
  const value = (username || "").trim();
  if (!value) return "Unknown";

  // If it looks like a UUID (Cognito often uses UUID-like usernames), shorten it.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return `${value.slice(0, 8)}…${value.slice(-4)}`;
  }

  // Otherwise, just cap length to keep the UI tidy.
  if (value.length > 18) return `${value.slice(0, 16)}…`;
  return value;
}

function fnv1a32(input: string): number {
  // FNV-1a 32-bit hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function bidderAliasForAuction(opts: {
  auctionId: string;
  userId: string | null | undefined;
}): string {
  const userId = (opts.userId || "").trim();
  if (!userId) return "Bidder";
  // Stable per auction, not linkable across auctions (auctionId is part of the input).
  const h = fnv1a32(`${opts.auctionId}:${userId}`);
  const code = h.toString(36).toUpperCase().padStart(4, "0").slice(0, 4);
  return `Bidder ${code}`;
}


