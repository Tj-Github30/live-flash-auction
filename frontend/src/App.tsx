import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { SecondaryNav } from "./components/SecondaryNav";
import { BuyPage } from "./components/BuyPage";
import { SellDashboard } from "./components/SellDashboard";
import { LiveAuctionRoom, AuctionData } from "./components/LiveAuctionRoom";
import { AuthPage } from "./components/AuthPage";
import { RequireAuth } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthProvider";
import { api, apiJson } from "./utils/api";

const ProtectedAppShell: React.FC = () => {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "my-bids">("buy");
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [loadingAuction, setLoadingAuction] = useState(false);
  const [auctionError, setAuctionError] = useState<string | null>(null);

  const handleAuctionClick = async (auctionId: string) => {
    setSelectedAuctionId(auctionId);
    setLoadingAuction(true);
    setAuctionError(null);

    try {
      // Fetch auction details
      const response = await api.get(`/api/auctions/${auctionId}`);
      const auction = await apiJson<any>(response);

      // Fetch auction state for real-time data
      let state = null;
      try {
        const stateResponse = await api.get(`/api/auctions/${auctionId}/state`);
        state = await apiJson<any>(stateResponse);
      } catch (err) {
        console.warn('Could not fetch auction state:', err);
      }

      // Format auction data for LiveAuctionRoom
      const formattedAuction: AuctionData = {
        id: auction.auction_id,
        auctionId: auction.auction_id,
        image: auction.image_url || 'https://via.placeholder.com/400x300?text=No+Image',
        title: auction.title,
        currentBid: state?.current_high_bid || auction.current_high_bid || auction.starting_bid,
        timeRemaining: state?.time_remaining || calculateTimeRemaining(auction.end_time),
        viewers: state?.participant_count || 0,
        description: auction.description || '',
        category: auction.category || '',
        condition: auction.condition || '',
        year: auction.year,
        seller: auction.host_username || 'Unknown',
        totalBids: state?.bid_count || auction.bid_count || 0,
        watchCount: state?.participant_count || 0,
        startTime: formatDate(auction.created_at),
        endTime: formatDate(auction.end_time),
        bidIncrement: auction.bid_increment || 100,
      };

      setAuctionData(formattedAuction);
    } catch (err) {
      console.error('Error fetching auction:', err);
      setAuctionError(err instanceof Error ? err.message : 'Failed to load auction');
    } finally {
      setLoadingAuction(false);
    }
  };

  const handleBackToAuctions = () => {
    setSelectedAuctionId(null);
    setAuctionData(null);
    setAuctionError(null);
  };

  const calculateTimeRemaining = (endTime?: string): string => {
    if (!endTime) return 'N/A';
    const end = new Date(endTime);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (selectedAuctionId) {
    if (loadingAuction) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading auction...</p>
          </div>
        </div>
      );
    }

    if (auctionError || !auctionData) {
      return (
        <div className="min-h-screen bg-background">
          <Header onLogout={logout} />
          <div className="pt-[137px] flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-600 mb-4">{auctionError || 'Auction not found'}</p>
              <button
                onClick={handleBackToAuctions}
                className="text-accent hover:underline"
              >
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
        <LiveAuctionRoom
          auction={auctionData}
          onBack={handleBackToAuctions}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} />
      <SecondaryNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "buy" && <BuyPage onAuctionClick={handleAuctionClick} />}
      {activeTab === "sell" && <SellDashboard />}
      {activeTab === "my-bids" && (
        <div className="pt-[137px] max-w-[1600px] mx-auto px-6 py-16">
          <div className="text-center">
            <h2 className="mb-2">My Bids</h2>
            <p className="text-muted-foreground">
              Track all your active and past bids
            </p>
            <div className="mt-8 p-12 bg-white rounded-lg border border-border">
              <p className="text-muted-foreground">
                You haven&apos;t placed any bids yet
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border mt-16">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              © 2025 Luxe Auction. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleAuthenticated = () => {
    navigate("/", { replace: true });
  };
  
  return <AuthPage onAuthenticated={handleAuthenticated} />;
};

const LoginCallbackPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Finishing login…</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/callback" element={<LoginCallbackPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <ProtectedAppShell />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
