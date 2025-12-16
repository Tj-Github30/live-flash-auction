import { useState, useEffect } from 'react';
import { Clock, Eye, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { api, apiJson } from '../utils/api';

interface Listing {
  auction_id: string;
  title: string;
  image_url?: string;
  current_high_bid?: number;
  starting_bid: number;
  end_time?: string;
  participant_count?: number;
  bid_count?: number;
}

export function ActiveListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveListings();
  }, []);

  const fetchActiveListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/auctions?status=live&limit=50&offset=0');
      const data = await apiJson<{ auctions: Listing[] }>(response);
      
      // Filter to only show auctions created by current user
      // Note: Backend should ideally support filtering by host_user_id
      setListings(data.auctions || []);
    } catch (err) {
      console.error('Error fetching active listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endTime?: string): string => {
    if (!endTime) return 'N/A';
    
    const end = new Date(endTime);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ended';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  return (
    <div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Current Bid</div>
          <div className="col-span-2 text-center">Time Left</div>
          <div className="col-span-2 text-center">Activity</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Rows */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No active listings</p>
          </div>
        ) : (
          listings.map((item) => (
            <div
              key={item.auction_id}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
            >
              {/* Item Info */}
              <div className="col-span-5 flex items-center gap-4">
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
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      LIVE
                    </span>
                    <span className="text-xs text-muted-foreground">{item.bid_count || 0} bids</span>
                  </div>
                </div>
              </div>

              {/* Current Bid */}
              <div className="col-span-2 flex items-center justify-end">
                <div className="text-right">
                  <p className="text-accent">${(item.current_high_bid || item.starting_bid).toLocaleString()}</p>
                </div>
              </div>

              {/* Time Left */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeRemaining(item.end_time)}</span>
                </div>
              </div>

              {/* Activity */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{item.participant_count || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
