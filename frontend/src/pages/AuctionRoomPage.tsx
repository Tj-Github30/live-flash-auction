import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { LiveAuctionRoom, AuctionData } from "../components/LiveAuctionRoom";
import { useAuth } from "../auth/AuthProvider";
import { api, apiJson } from "../utils/api";
import { formatTimeRemaining } from "../utils/format";

const NO_IMAGE_DATA_URI = 'https://via.placeholder.com/600x400?text=No+Image';

export const AuctionRoomPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { auctionId } = useParams<{ auctionId: string }>();

  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [loadingAuction, setLoadingAuction] = useState(true);
  const [auctionError, setAuctionError] = useState<string | null>(null);

  // This Ref is the "Shield" that stops the annoying constant loading
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Guard against unnecessary re-runs
    if (!auctionId || auctionId === fetchedIdRef.current) return;

    const run = async () => {
      setLoadingAuction(true);
      setAuctionError(null);

      try {
        // 2. Fetch Base Auction Data
        const response = await api.get(`/api/auctions/${auctionId}`);
        if (!response.ok) throw new Error("Auction not found");
        const auction = await apiJson<any>(response);

        // 3. Fetch Live State (Isolated try/catch to ignore 500 errors)
        let state: any = null;
        try {
          const stateResponse = await api.get(`/api/auctions/${auctionId}/state`);
          if (stateResponse.ok) {
            state = await apiJson<any>(stateResponse);
          }
        } catch (err) {
          // If the server has a 500 error for state, we just log it and move on
          console.warn("Could not fetch auction state, using base data instead.");
        }

        // --- Data Processing ---
        const endTimeVal = state?.end_time || auction.end_time || auction.ended_at;
        const endDateObj = parseDate(endTimeVal);
        const durationSec = auction.duration || 300;
        const startDateObj = new Date(endDateObj.getTime() - (durationSec * 1000));
        const gallery = parseGalleryImages(auction.gallery_images);

        const initialTimeRemaining =
          state?.time_remaining_seconds ??
          state?.time_remaining ??
          auction.time_remaining_seconds ??
          (endDateObj.getTime() - Date.now()) / 1000;

        const formattedAuction: AuctionData = {
          id: auction.auction_id,
          auctionId: auction.auction_id,
          // 4. Image Fallback: If URL is missing, use the default placeholder
          image: auction.image_url || gallery[0] || NO_IMAGE_DATA_URI,
          galleryImages: gallery,
          title: auction.title,
          currentBid: state?.current_high_bid || auction.current_high_bid || auction.starting_bid,
          timeRemaining: formatTimeRemaining(initialTimeRemaining),
          timeRemainingSeconds: typeof initialTimeRemaining === "number" ? initialTimeRemaining : 0,
          viewers: state?.participant_count || 0,
          description: auction.description || "",
          category: auction.category || "General",
          condition: auction.condition || "Pre-owned",
          year: auction.year,
          seller: auction.seller_name || auction.host_username || "Unknown Seller",
          hostUserId: auction.host_user_id,
          totalBids: state?.bid_count || auction.bid_count || 0,
          watchCount: state?.participant_count || 0,
          startTime: formatDateSpecific(startDateObj), 
          endTime: formatDateSpecific(endDateObj),
          bidIncrement: auction.bid_increment || 1,
        };

        setAuctionData(formattedAuction);
        
        // 5. SUCCESS: Lock this ID so we never fetch it again for this mount
        fetchedIdRef.current = auctionId;

      } catch (err) {
        console.error("Critical Load Error:", err);
        setAuctionError("Unable to load this auction. It may have been removed.");
        
        // Even on error, we lock the ID to stop the "Annoying Loop"
        fetchedIdRef.current = auctionId;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading Auction...</p>
        </div>
      </div>
    );
  }

  if (auctionError || !auctionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{auctionError}</p>
          <button 
            onClick={handleBackToAuctions}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} onLogoClick={handleBackToAuctions} />
      <LiveAuctionRoom auction={auctionData} onBack={handleBackToAuctions} />
    </div>
  );
};

// --- Helpers (Same as before) ---
function parseDate(input: any): Date {
  if (!input) return new Date();
  if (typeof input === 'number') return new Date(input);
  if (/^\d+$/.test(input)) return new Date(parseInt(input));
  return new Date(input);
}

function formatDateSpecific(date: Date): string {
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true
  });
}

function parseGalleryImages(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('[')) { try { return JSON.parse(trimmed); } catch (e) {} }
    if (trimmed.startsWith('{')) { return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, '')); }
    if (trimmed.startsWith('http')) return [trimmed];
  }
  return [];
}