import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api, apiJson } from '../utils/api';
import { useAuth } from '../auth/AuthProvider';

interface SoldItem {
  auction_id: string;
  title: string;
  image_url?: string;
  current_high_bid?: number;
  starting_bid: number;
  status: string;
  end_time?: string;
  high_bidder_username?: string;
  bid_count?: number;
  closed_at?: string;
  host_user_id?: string;
}

export function SoldItems() {
  const { user } = useAuth();
  const currentUserId = useMemo(() => user?.sub ? String(user.sub) : null, [user?.sub]);
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSoldItems();
  }, []);

  useEffect(() => {
    const handler = () => fetchSoldItems();
    // Listen for the custom event when an auction finishes
    window.addEventListener("auction:ended", handler as EventListener);
    
    // Initial fetch
    fetchSoldItems();

    return () => {
      window.removeEventListener("auction:ended", handler as EventListener);
      // Interval removed to prevent unnecessary background fetches
    };
  }, []);
  const fetchSoldItems = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);
      
      // We fetch closed auctions. 
      // Note: Ensure your ActiveListings.tsx is fetching status=live to prevent duplicates.
      const response = await api.get('/api/auctions?status=closed&limit=50&offset=0');
      const data = await apiJson<{ auctions: SoldItem[] }>(response);
      
      const filtered = (data.auctions || []).filter((a) => {
        if (!currentUserId) return true;
        return String(a.host_user_id || '') === currentUserId;
      });
      setSoldItems(filtered);
    } catch (err) {
      console.error('Error fetching sold items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sold items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="col-span-6">Item</div>
          <div className="col-span-3 text-right">Final Price</div>
          <div className="col-span-3 text-center">Bids</div>
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
              <div className="col-span-6 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}
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
              <div className="col-span-3 flex items-center justify-end">
                <div className="text-right">
                  <p className="text-accent">${(item.current_high_bid || item.starting_bid).toLocaleString()}</p>
                </div>
              </div>

              {/* Bids */}
              <div className="col-span-3 flex items-center justify-center">
                <span className="text-muted-foreground">{item.bid_count || 0} bids</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
