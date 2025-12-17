import { useState, useEffect, useMemo } from 'react';
import { Clock, Eye } from 'lucide-react';
import { api, apiJson } from '../utils/api';
import { useAuth } from '../auth/AuthProvider';
import { formatTimeRemaining } from '../utils/format';
import { useNavigate } from 'react-router-dom';

interface Listing {
  auction_id: string;
  title: string;
  image_url?: string;
  current_high_bid?: number;
  starting_bid: number;
  end_time?: string;
  participant_count?: number;
  bid_count?: number;
  host_user_id?: string;
  time_remaining_seconds?: number;
}

export function ActiveListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = useMemo(() => user?.sub ? String(user.sub) : null, [user?.sub]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => fetchActiveListings();
    window.addEventListener("auction:created", handler as EventListener);
    return () => {
      window.removeEventListener("auction:created", handler as EventListener);
    };
  }, []);

  // Fetch on focus/visibility (no interval)
  useEffect(() => {
    let lastFetch = 0;
    const minIntervalMs = 2000;
    const maybeFetch = () => {
      const now = Date.now();
      if (now - lastFetch < minIntervalMs) return;
      lastFetch = now;
      fetchActiveListings(false);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") maybeFetch();
    };
    const handleFocus = () => maybeFetch();

    if (document.visibilityState === "visible") maybeFetch();
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchActiveListings = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      const response = await api.get('/api/auctions?status=live&limit=50&offset=0');
      const data = await apiJson<{ auctions: Listing[] }>(response);

      const filtered = (data.auctions || []).filter((a) => {
        if (!currentUserId) return true;
        return String(a.host_user_id || '') === currentUserId;
      });
      setListings(filtered);
    } catch (err) {
      console.error('Error fetching active listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const timeLeftLabel = (item: Listing): string => {
    if (typeof item.time_remaining_seconds === "number") {
      return formatTimeRemaining(item.time_remaining_seconds);
    }
    if (item.end_time) {
      const end = new Date(item.end_time).getTime();
      const now = Date.now();
      const secs = Math.max(0, Math.floor((end - now) / 1000));
      return formatTimeRemaining(secs);
    }
    return 'N/A';
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
              onClick={() => navigate(`/auction/${item.auction_id}`)}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors cursor-pointer"
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
                  <span>{timeLeftLabel(item)}</span>
                </div>
              </div>

              {/* Activity */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{item.participant_count || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
