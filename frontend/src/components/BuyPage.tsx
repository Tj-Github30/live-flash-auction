import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiltersBar } from './FiltersBar';
import { AuctionCard } from './AuctionCard';
import { api, apiJson } from '../utils/api';
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
  participant_count?: number;
  bid_count?: number;
  time_remaining_seconds?: number;
  winner_username?: string;
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
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    timeRange: 'all',
  });

  // 1. Optimized Fetch: Added 'showLoader' param to prevent flickering
  const fetchAuctions = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const liveParams = new URLSearchParams({ status: 'live', limit: '50', offset: '0' });
      const closedParams = new URLSearchParams({ status: 'closed', limit: '50', offset: '0' });
      
      if (filters.category && filters.category !== 'all') {
        liveParams.append('category', filters.category);
        closedParams.append('category', filters.category);
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
  }, [filters.category]);

  // 2. Initial load and Category changes
  useEffect(() => {
    fetchAuctions(true);
  }, [fetchAuctions]);

  // Background refresh to keep counts/timers fresh (viewers + new items)
  useEffect(() => {
    const id = window.setInterval(() => fetchAuctions(false), 5000);
    return () => window.clearInterval(id);
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

  // Listen for local room view events to adjust viewer counts optimistically
  useEffect(() => {
    const handleViewed = (e: Event) => {
      const auctionId = (e as CustomEvent)?.detail?.auctionId;
      if (!auctionId) return;
      setLiveAuctions((prev) =>
        prev.map((a) =>
          a.auction_id === auctionId
            ? { ...a, participant_count: (a.participant_count || 0) + 1 }
            : a
        )
      );
    };

    const handleLeft = (e: Event) => {
      const auctionId = (e as CustomEvent)?.detail?.auctionId;
      if (!auctionId) return;
      setLiveAuctions((prev) =>
        prev.map((a) =>
          a.auction_id === auctionId
            ? { ...a, participant_count: Math.max(0, (a.participant_count || 0) - 1) }
            : a
        )
      );
    };

    window.addEventListener("auction:viewed", handleViewed as EventListener);
    window.addEventListener("auction:left", handleLeft as EventListener);
    return () => {
      window.removeEventListener("auction:viewed", handleViewed as EventListener);
      window.removeEventListener("auction:left", handleLeft as EventListener);
    };
  }, []);

  const handleFilterChange = (nextFilters: typeof filters) => {
    setFilters(nextFilters);
  };

  const handleClearFilters = () => {
    const reset = {
      category: 'all',
      priceRange: 'all',
      timeRange: 'all',
    };
    setFilters(reset);
    fetchAuctions(true);
  };

  const applyFiltersAndSort = useCallback((list: Auction[], isLive: boolean) => {
    let result = [...list];

    if (filters.category !== 'all') {
      result = result.filter((a) => (a.category || 'all').toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.priceRange !== 'all') {
      const [min, max] = (() => {
        switch (filters.priceRange) {
          case '0-1000': return [0, 1000];
          case '1000-5000': return [1000, 5000];
          case '5000-10000': return [5000, 10000];
          case '10000+': return [10000, Infinity];
          default: return [0, Infinity];
        }
      })();

      result = result.filter((a) => {
        const price = a.current_high_bid ?? a.starting_bid ?? 0;
        return price >= min && price <= max;
      });
    }

    if (isLive && filters.timeRange !== 'all') {
      result = result.filter((a) => {
        const secs = a.time_remaining_seconds ?? null;
        if (secs === null || secs === undefined) return false;
        switch (filters.timeRange) {
          case 'ending-soon': return secs <= 3600;
          case '1h': return secs <= 3600;
          case '6h': return secs <= 21600;
          case '24h': return secs <= 86400;
          default: return true;
        }
      });
    }

    // Keep server order when no explicit sort

    return result;
  }, [filters]);

  const filteredLive = useMemo(() => applyFiltersAndSort(liveAuctions, true), [applyFiltersAndSort, liveAuctions]);
  const filteredEnded = useMemo(() => applyFiltersAndSort(endedAuctions, false), [applyFiltersAndSort, endedAuctions]);

  const formatAuctionForCard = (auction: Auction) => {
    const isClosed = auction.status === "closed" || (auction.time_remaining_seconds ?? 0) <= 0;
    const timeRemaining = isClosed
        ? "Ended"
        : formatTimeRemaining(auction.time_remaining_seconds ?? null);

    const winnerName = auction.winner_username || auction.high_bidder_username;
    const showWinnerLine = isClosed && !!winnerName;

    return {
      id: auction.auction_id,
      image: auction.image_url || 'https://via.placeholder.com/400x300?text=No+Image',
      title: auction.title,
      currentBid: auction.current_high_bid || auction.starting_bid,
      timeRemaining: timeRemaining,
      viewers: auction.participant_count || 0,
    };
  };

  return (
    <div className="pt-[137px]">
      <FiltersBar filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
      
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-foreground mb-1">Live Auctions</h2>
          <p className="text-muted-foreground text-sm">
            {loading ? 'Refreshing...' : `${filteredLive.length} items currently live`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {loading && filteredLive.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading auctions...</p>
          </div>
        ) : filteredLive.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-muted-foreground font-medium">No live auctions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLive.map((auction) => (
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

        {filteredEnded.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <p className="text-muted-foreground text-sm">No recently ended auctions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEnded.map((auction) => (
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