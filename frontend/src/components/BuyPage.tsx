import { useState, useEffect, useCallback } from 'react';
import { FiltersBar } from './FiltersBar';
import { AuctionCard } from './AuctionCard';
import { api, apiJson } from '../utils/api';
import { NO_IMAGE_DATA_URI } from '../utils/images';
import { formatTimeRemaining } from '../utils/format';

interface Auction {
  auction_id: string;
  title: string;
  description?: string;
  image_url?: string;
  current_high_bid?: number;
  starting_bid: number;
  status: string;
  category?: string;
  created_at: string;
  end_time?: string;
  time_remaining_seconds?: number;
  participant_count?: number;
  bid_count?: number;
  winner_username?: string;
  winning_bid?: number;
  high_bidder_username?: string;
}

interface BuyPageProps {
  onAuctionClick: (auctionId: string) => void;
}

export function BuyPage({ onAuctionClick }: BuyPageProps) {
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [endedAuctions, setEndedAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 1. Optimized Fetch: Added 'showLoader' param to prevent flickering
  const fetchAuctions = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const liveParams = new URLSearchParams({ status: 'live', limit: '50', offset: '0' });
      const closedParams = new URLSearchParams({ status: 'closed', limit: '50', offset: '0' });
      
      if (selectedCategory) {
        liveParams.append('category', selectedCategory);
        closedParams.append('category', selectedCategory);
      }

      const [liveResp, closedResp] = await Promise.all([
        api.get(`/api/auctions?${liveParams.toString()}`),
        api.get(`/api/auctions?${closedParams.toString()}`),
      ]);
      
      const liveData = await apiJson<{ auctions: Auction[] }>(liveResp);
      const closedData = await apiJson<{ auctions: Auction[] }>(closedResp);

      const live = liveData.auctions || [];
      const closed = closedData.auctions || [];

      const stillLive = live.filter((a) => (a.time_remaining_seconds ?? 1) > 0);
      const endedFromLive = live.filter((a) => (a.time_remaining_seconds ?? 1) <= 0);

      setLiveAuctions(stillLive);
      setEndedAuctions([...endedFromLive, ...closed]);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // 2. Initial load and Category changes
  useEffect(() => {
    fetchAuctions(true);
  }, [fetchAuctions]);

  // 3. Listen for NEW auctions (No interval needed!)
  useEffect(() => {
    const handler = () => fetchAuctions(false); // Fetch silently in background
    window.addEventListener("auction:created", handler as EventListener);
    
    return () => {
      window.removeEventListener("auction:created", handler as EventListener);
    };
  }, [fetchAuctions]);

  // 4. Local Timer Tick: Keeps UI moving every second without network hits
  useEffect(() => {
    const tick = window.setInterval(() => {
      let newlyEnded: Auction[] = [];
      setLiveAuctions((prev) => {
        const nextLive: Auction[] = [];
        for (const a of prev) {
          const hasTimer = typeof a.time_remaining_seconds === "number";
          const nextSeconds = hasTimer ? Math.max(0, (a.time_remaining_seconds as number) - 1) : undefined;
          
          if (hasTimer && nextSeconds === 0) {
            newlyEnded.push({ ...a, time_remaining_seconds: 0, status: "closed" });
          } else {
            nextLive.push({
              ...a,
              time_remaining_seconds: nextSeconds === undefined ? a.time_remaining_seconds : nextSeconds,
            });
          }
        }
        return nextLive;
      });

      if (newlyEnded.length > 0) {
        setEndedAuctions((prev) => [...newlyEnded, ...prev]);
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, []);

  const handleFilterChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const formatAuctionForCard = (auction: Auction) => {
    const isClosed = auction.status === "closed" || (auction.time_remaining_seconds ?? 0) <= 0;
    const timeRemaining = isClosed
        ? "Ended"
        : formatTimeRemaining(auction.time_remaining_seconds ?? null);

    const winnerName = auction.winner_username || auction.high_bidder_username;
    const showWinnerLine = isClosed && !!winnerName;

    return {
      id: auction.auction_id,
      image: auction.image_url || NO_IMAGE_DATA_URI,
      topLine: showWinnerLine ? `Winner: ${winnerName}` : undefined,
      title: auction.title,
      currentBid: auction.current_high_bid || auction.starting_bid,
      timeRemaining: timeRemaining,
      viewers: auction.participant_count || 0,
    };
  };

  return (
    <div className="pt-[137px]">
      <FiltersBar onFilterChange={handleFilterChange} />
      
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-foreground mb-1">Live Auctions</h2>
          <p className="text-muted-foreground text-sm">
            {loading ? 'Refreshing...' : `${liveAuctions.length} items currently live`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {loading && liveAuctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading auctions...</p>
          </div>
        ) : liveAuctions.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-muted-foreground font-medium">No live auctions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveAuctions.map((auction) => (
              <AuctionCard 
                key={auction.auction_id} 
                {...formatAuctionForCard(auction)} 
                onClick={() => onAuctionClick(auction.auction_id)}
              />
            ))}
          </div>
        )}

        <div className="mt-16 mb-6">
          <h2 className="text-foreground mb-1">Ended Auctions</h2>
          <p className="text-muted-foreground text-sm">
            Recent completions
          </p>
        </div>

        {endedAuctions.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <p className="text-muted-foreground text-sm">No recently ended auctions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {endedAuctions.map((auction) => (
              <AuctionCard
                key={`ended-${auction.auction_id}`}
                {...formatAuctionForCard({ ...auction, status: "closed" })}
                onClick={() => onAuctionClick(auction.auction_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}