import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiJson } from "../utils/api";
import { AuctionCard } from "./AuctionCard";
import { NO_IMAGE_DATA_URI } from "../utils/images";
import { formatTimeRemaining } from "../utils/format";

type MyBidsResponse = {
  auction_ids: string[];
  by_auction: Record<
    string,
    { bid_count: number; max_bid: number; last_bid: number; last_timestamp: number }
  >;
};

type Auction = {
  auction_id: string;
  title: string;
  image_url?: string;
  starting_bid: number;
  current_high_bid?: number;
  status: string;
  participant_count?: number;
  time_remaining_seconds?: number;
};

export function MyBidsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctionIds, setAuctionIds] = useState<string[]>([]);
  const [byAuction, setByAuction] = useState<MyBidsResponse["by_auction"]>({});
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await api.get("/api/bids/my");
        const data = await apiJson<MyBidsResponse>(resp);

        setAuctionIds(data.auction_ids || []);
        setByAuction(data.by_auction || {});

        if (!data.auction_ids || data.auction_ids.length === 0) {
          setAuctions([]);
          return;
        }

        const auctionsResp = await api.post("/api/auctions/batch", {
          auction_ids: data.auction_ids,
        });
        const auctionsData = await apiJson<{ auctions: Auction[] }>(auctionsResp);
        setAuctions(auctionsData.auctions || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load My Bids");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const cards = useMemo(() => {
    return auctions.map((a) => {
      const stats = byAuction[a.auction_id];
      const timeRemaining =
        a.status === "closed" ? "Ended" : formatTimeRemaining(a.time_remaining_seconds ?? null);
      return {
        id: a.auction_id,
        image: a.image_url || NO_IMAGE_DATA_URI,
        title: a.title,
        currentBid: a.current_high_bid ?? a.starting_bid,
        timeRemaining,
        viewers: a.participant_count ?? 0,
        yourLastBid: stats?.last_bid,
        yourBidCount: stats?.bid_count,
      };
    });
  }, [auctions, byAuction]);

  return (
    <div className="pt-[137px] max-w-[1600px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="mb-2">My Bids</h2>
        <p className="text-muted-foreground">Auctions where you have placed bids</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading your bids...</p>
        </div>
      ) : auctionIds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-border">
          <p className="text-muted-foreground">You haven&apos;t placed any bids yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((c) => (
              <div key={c.id} className="relative">
                <AuctionCard
                  id={c.id}
                  image={c.image}
                  title={c.title}
                  currentBid={c.currentBid}
                  timeRemaining={c.timeRemaining}
                  viewers={c.viewers}
                  onClick={() => navigate(`/auction/${c.id}`)}
                />
                {(c.yourLastBid !== undefined || c.yourBidCount !== undefined) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {c.yourLastBid !== undefined && (
                      <span className="mr-3">Your last bid: ${Number(c.yourLastBid).toLocaleString()}</span>
                    )}
                    {c.yourBidCount !== undefined && <span>Bids: {c.yourBidCount}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


