export type MyBidEntry = {
  userId: string;
  auctionId: string;
  title: string;
  amount: number;
  timestamp: number;
  status?: string;
  image?: string;
};

const STORAGE_KEY = "my-bids";
const MAX_ENTRIES = 50;

export const getMyBids = (userId?: string): MyBidEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: MyBidEntry[] = JSON.parse(raw) || [];
    return userId ? parsed.filter((b) => b.userId === userId) : parsed;
  } catch {
    return [];
  }
};

export const addMyBid = (entry: MyBidEntry) => {
  try {
    const existing = getMyBids();
    const next = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("mybids:updated"));
  } catch {
    /* ignore */
  }
};


