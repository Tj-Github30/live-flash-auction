import { useState, useEffect } from 'react';
import { CheckCircle2, User } from 'lucide-react';
import { api, apiJson } from '../utils/api';
import { NO_IMAGE_DATA_URI } from '../utils/images';

interface SoldItem {
  auction_id: string;
  title: string;
  image_url?: string;
  current_high_bid?: number;
  starting_bid: number;
  status: string;
  end_time?: string;
  winner_username?: string;
  high_bidder_username?: string;
  winning_bid?: number;
  bid_count?: number;
  closed_at?: string;
}

export function SoldItems() {
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSoldItems();
  }, []);

  useEffect(() => {
    const handler = () => fetchSoldItems();
    window.addEventListener("auction:ended", handler as EventListener);
    const id = window.setInterval(fetchSoldItems, 15_000);
    return () => {
      window.removeEventListener("auction:ended", handler as EventListener);
      window.clearInterval(id);
    };
  }, []);

  const fetchSoldItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/auctions?status=closed&limit=50&offset=0');
      const data = await apiJson<{ auctions: SoldItem[] }>(response);
      
      // Filter to only show auctions created by current user
      // Note: Backend should ideally support filtering by host_user_id
      setSoldItems(data.auctions || []);
    } catch (err) {
      console.error('Error fetching sold items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sold items');
    } finally {
      setLoading(false);
    }
  };

  const formatSoldDate = (closedAt?: string): string => {
    if (!closedAt) return 'N/A';
    
    const closed = new Date(closedAt);
    const now = new Date();
    const diffMs = now.getTime() - closed.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };
  return (
    <div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Final Price</div>
          <div className="col-span-2 text-center">Sold Date</div>
          <div className="col-span-3">Buyer</div>
        </div>

        {/* Table Rows */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading sold items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        ) : soldItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No sold items yet</p>
          </div>
        ) : (
          soldItems.map((item) => (
            <div
              key={item.auction_id}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
            >
              {/* Item Info */}
              <div className="col-span-5 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={item.image_url || NO_IMAGE_DATA_URI}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="line-clamp-2 mb-1">{item.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Sold
                    </span>
                    <span className="text-xs text-muted-foreground">{item.bid_count || 0} bids</span>
                  </div>
                </div>
              </div>

              {/* Final Price */}
              <div className="col-span-2 flex items-center justify-end">
                <div className="text-right">
                  <p className="text-accent">${(item.current_high_bid || item.starting_bid).toLocaleString()}</p>
                </div>
              </div>

              {/* Sold Date */}
              <div className="col-span-2 flex items-center justify-center">
                <p className="text-muted-foreground">{formatSoldDate(item.closed_at || item.end_time)}</p>
              </div>

              {/* Buyer */}
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">
                  {(item.winner_username || item.high_bidder_username)
                    ? (item.winner_username || item.high_bidder_username)!.length > 18
                      ? `${(item.winner_username || item.high_bidder_username)!.slice(0, 16)}…`
                      : (item.winner_username || item.high_bidder_username)
                    : 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
