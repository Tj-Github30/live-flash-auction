import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { api, apiJson } from '../utils/api';
import { AuctionCard } from './AuctionCard';
import { formatTimeRemaining } from '../utils/format';

interface Bid {
  bid_id: string;
  auction_id: string;
  title?: string;
  image_url?: string;
  gallery_images?: string[];
  amount: number;
  created_at: string;
  status?: string;
  current_high_bid?: number;
  starting_bid?: number;
  time_remaining_seconds?: number | null;
  participant_count?: number;
}

export function MyBids() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.sub ? String(user.sub) : undefined;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local live countdown for timers
  useEffect(() => {
    if (bids.length === 0) return;
    const id = window.setInterval(() => {
      setBids((prev) =>
        prev.map((bid) => {
          if (bid.time_remaining_seconds === null || bid.time_remaining_seconds === undefined) return bid;
          return {
            ...bid,
            time_remaining_seconds: Math.max(0, bid.time_remaining_seconds - 1),
          };
        })
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [bids.length]);

  const loadBids = async () => {
    if (!userId) {
      setBids([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get('/api/bids');
      if (!resp.ok) {
        throw new Error(`Failed to load bids: ${resp.status}`);
      }
      const data = await apiJson<{ bids: Bid[] }>(resp);
      const list = data.bids || [];
      // Deduplicate by auction_id, keep the newest bid per auction
      const deduped: Record<string, Bid> = {};
      list.forEach((bid) => {
        const existing = deduped[bid.auction_id];
        if (!existing) {
          deduped[bid.auction_id] = bid;
          return;
        }
        const existingTime = new Date(existing.created_at || 0).getTime();
        const currentTime = new Date(bid.created_at || 0).getTime();
        if (currentTime >= existingTime) {
          deduped[bid.auction_id] = bid;
        }
      });
      setBids(Object.values(deduped));
    } catch (err: any) {
      console.error('Error loading bids:', err);
      setError(err?.message || 'Failed to load your bids');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, [userId]);

  // Refresh on visibility/focus to keep viewers/timers closer to real-time
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadBids();
    };
    const handleFocus = () => loadBids();
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId]);

  const formatBidForCard = (bid: Bid) => {
    const isClosed = bid.status === "closed" || (bid.time_remaining_seconds !== null && bid.time_remaining_seconds !== undefined && bid.time_remaining_seconds <= 0);
    const timeRemaining = isClosed
      ? "Ended"
      : formatTimeRemaining(bid.time_remaining_seconds ?? null);
    const imageSrc =
      bid.image_url && bid.image_url.trim() !== ""
        ? bid.image_url
        : (bid.gallery_images && bid.gallery_images.length > 0 && bid.gallery_images[0]) || 'https://via.placeholder.com/400x300?text=No+Image';

    return {
      id: bid.auction_id,
      image: imageSrc,
      title: bid.title || 'Auction',
      currentBid: bid.current_high_bid || bid.starting_bid || bid.amount,
      timeRemaining: timeRemaining,
      viewers: bid.participant_count || 0,
    };
  };

  return (
    <div className="pt-[137px] max-w-[1600px] mx-auto px-6 py-16">
      <div className="mb-8">
        <h2 className="mb-2">My Bids</h2>
        <p className="text-muted-foreground">Track all your active and past bids</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bids...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm max-w-md mx-auto">
            {error}
          </div>
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-muted-foreground font-medium">You haven&apos;t placed any bids yet</p>
          <p className="text-sm text-muted-foreground mt-2">Start bidding on auctions to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bids.map((bid) => (
            <AuctionCard
              key={bid.bid_id}
              {...formatBidForCard(bid)}
              onClick={() => navigate(`/auction/${bid.auction_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

