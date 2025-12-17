import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { api, apiJson } from '../utils/api';

export function MyBids() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.sub ? String(user.sub) : undefined;
  const [bids, setBids] = useState<Array<{ bid_id: string; auction_id: string; title?: string; image_url?: string; amount: number; created_at: string; status?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await apiJson<{ bids: any[] }>(resp);
      setBids(data.bids || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your bids');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, [userId]);

  return (
    <div className="pt-[137px] max-w-[1600px] mx-auto px-6 py-16">
      <div className="mb-8">
        <h2 className="mb-2">My Bids</h2>
        <p className="text-muted-foreground">Track all your active and past bids</p>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="col-span-6">Item</div>
          <div className="col-span-3 text-right">Your Bid</div>
          <div className="col-span-3 text-center">Placed</div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading your bids...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">{error}</div>
        ) : bids.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">You haven&apos;t placed any bids yet</div>
        ) : (
          bids.map((bid) => (
            <div
              key={`${bid.bid_id}-${bid.created_at}`}
              onClick={() => navigate(`/auction/${bid.auction_id}`)}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors cursor-pointer"
            >
              <div className="col-span-6 flex items-center gap-3">
                {bid.image_url ? (
                  <img src={bid.image_url} alt={bid.title} className="w-14 h-14 rounded-lg object-cover bg-secondary" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-secondary" />
                )}
                <div>
                  <p className="font-medium">{bid.title || 'Auction'}</p>
                  <p className="text-xs text-muted-foreground">{bid.status || 'Active'}</p>
                </div>
              </div>

              <div className="col-span-3 text-right text-accent">${Number(bid.amount).toLocaleString()}</div>

              <div className="col-span-3 text-center text-sm text-muted-foreground">
                {new Date(bid.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

