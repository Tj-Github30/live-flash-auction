import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { LiveAuctionRoom, AuctionData } from "../components/LiveAuctionRoom";
import { useAuth } from "../auth/AuthProvider";
import { api, apiJson } from "../utils/api";
import { formatTimeRemaining } from "../utils/format";

export const AuctionRoomPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { auctionId } = useParams<{ auctionId: string }>();

  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [loadingAuction, setLoadingAuction] = useState(true);
  const [auctionError, setAuctionError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!auctionId) {
        setAuctionError("Missing auction id");
        setLoadingAuction(false);
        return;
      }

      setLoadingAuction(true);
      setAuctionError(null);

      try {
        const response = await api.get(`/api/auctions/${auctionId}`);
        const auction = await apiJson<any>(response);

        let state: any = null;
        try {
          const stateResponse = await api.get(`/api/auctions/${auctionId}/state`);
          state = await apiJson<any>(stateResponse);
        } catch (err) {
          console.warn("Could not fetch auction state:", err);
        }

        const formattedAuction: AuctionData = {
          id: auction.auction_id,
          auctionId: auction.auction_id,
          image: auction.image_url || "https://via.placeholder.com/400x300?text=No+Image",
          title: auction.title,
          currentBid: state?.current_high_bid || auction.current_high_bid || auction.starting_bid,
          timeRemaining: formatTimeRemaining(state?.time_remaining || calculateTimeRemaining(auction.end_time)),
          viewers: state?.participant_count || 0,
          description: auction.description || "",
          category: auction.category || "",
          condition: auction.condition || "",
          year: auction.year,
          seller: auction.host_username || "Unknown",
          hostUserId: auction.host_user_id,
          totalBids: state?.bid_count || auction.bid_count || 0,
          watchCount: state?.participant_count || 0,
          startTime: formatDate(auction.created_at),
          endTime: formatDate(auction.end_time),
          bidIncrement: auction.bid_increment || 1,
        };

        setAuctionData(formattedAuction);
      } catch (err) {
        console.error("Error fetching auction:", err);
        setAuctionError(err instanceof Error ? err.message : "Failed to load auction");
      } finally {
        setLoadingAuction(false);
      }
    };

    run();
  }, [auctionId]);

  const handleBackToAuctions = () => {
    navigate("/", { replace: true });
  };

  if (loadingAuction) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={logout} />
        <div className="pt-[137px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (auctionError || !auctionData) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={logout} />
        <div className="pt-[137px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{auctionError || "Auction not found"}</p>
            <button onClick={handleBackToAuctions} className="text-accent hover:underline">
              Back to Auctions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} />
      <LiveAuctionRoom auction={auctionData} onBack={handleBackToAuctions} />
    </div>
  );
};

function calculateTimeRemaining(endTime?: string): string {
  if (!endTime) return "N/A";
  const end = new Date(endTime);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return "Ended";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}


