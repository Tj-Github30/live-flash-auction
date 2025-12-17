import { useState, useEffect } from 'react';
import { FiltersBar } from './FiltersBar';
import { AuctionCard } from './AuctionCard';
import { api, apiJson } from '../utils/api';

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
}

interface BuyPageProps {
  onAuctionClick: (auctionId: string) => void;
}

export function BuyPage({ onAuctionClick }: BuyPageProps) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
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
    const id = window.setInterval(fetchAuctions, 10_000);
    return () => {
      window.removeEventListener("auction:created", handler as EventListener);
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        status: 'live',
        limit: '50',
        offset: '0'
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/api/auctions?${params.toString()}`);
      const data = await apiJson<{ auctions: Auction[] }>(response);
      
      setAuctions(data.auctions || []);
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
    // Calculate time remaining if end_time is available
    let timeRemaining = 'N/A';
    if (auction.end_time) {
      const endTime = new Date(auction.end_time);
      const now = new Date();
      const diffMs = endTime.getTime() - now.getTime();
      
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      } else {
        timeRemaining = 'Ended';
      }
    }

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
      <FiltersBar onFilterChange={handleFilterChange} />
      
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-foreground mb-1">Live Auctions</h2>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${auctions.length} items currently live`}
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
        ) : auctions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No live auctions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => {
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
      </div>
    </div>
  );
}
