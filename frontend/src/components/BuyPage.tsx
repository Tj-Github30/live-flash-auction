import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchAuctions();
  }, [selectedCategory]);

  useEffect(() => {
    const handler = () => fetchAuctions();
    window.addEventListener("auction:created", handler as EventListener);
    // Keep lists fresh (time remaining + auto-drop ended auctions from "live" view)
    const id = window.setInterval(fetchAuctions, 5_000);
    return () => {
      window.removeEventListener("auction:created", handler as EventListener);
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Local 1s tick so timers/countdowns stay live between network refreshes.
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

  const fetchAuctions = async () => {
    try {
      setLoading(true);
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

      // Some auctions may still be marked "live" in DB but have 0 seconds left in Redis.
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
  };

  const handleFilterChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Format auction data for AuctionCard component
  const formatAuctionForCard = (auction: Auction) => {
    const timeRemaining =
      auction.status === "closed"
        ? "Ended"
        : formatTimeRemaining(auction.time_remaining_seconds ?? null);

    const winnerName = auction.winner_username || auction.high_bidder_username;
    const showWinnerLine = timeRemaining === "Ended" && !!winnerName;

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
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${liveAuctions.length} items currently live`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading auctions...</p>
          </div>
        ) : liveAuctions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No live auctions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveAuctions.map((auction) => {
              const cardData = formatAuctionForCard(auction);
              return (
                <AuctionCard 
                  key={auction.auction_id} 
                  {...cardData} 
                  onClick={() => onAuctionClick(auction.auction_id)}
                />
              );
            })}
          </div>
        )}

        {/* Ended Auctions */}
        <div className="mt-12 mb-6">
          <h2 className="text-foreground mb-1">Ended Auctions</h2>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${endedAuctions.length} items ended`}
          </p>
        </div>

        {loading ? null : endedAuctions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No ended auctions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {endedAuctions.map((auction) => {
              const cardData = formatAuctionForCard({ ...auction, status: "closed" });
              return (
                <AuctionCard
                  key={`ended-${auction.auction_id}`}
                  {...cardData}
                  onClick={() => onAuctionClick(auction.auction_id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
