import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { SecondaryNav } from "./components/SecondaryNav";
import { BuyPage, mockAuctions } from "./components/BuyPage";
import { SellDashboard } from "./components/SellDashboard";
import { LiveAuctionRoom, AuctionData } from "./components/LiveAuctionRoom";
import { AuthPage } from "./components/AuthPage";
import { RequireAuth } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthProvider";

const auctionDetailsMap: Record<string, AuctionData> = {
  "1": {
    id: "1",
    image: mockAuctions[0].image,
    title: mockAuctions[0].title,
    currentBid: mockAuctions[0].currentBid,
    timeRemaining: mockAuctions[0].timeRemaining,
    viewers: mockAuctions[0].viewers,
    description:
      "An exceptional example of the legendary Patek Philippe Nautilus 5711 in stainless steel. This reference has become one of the most sought-after luxury sports watches in the world. The watch is in excellent condition with original box and papers, featuring the iconic octagonal bezel and integrated bracelet design that has defined luxury sports watches since 1976.",
    category: "Luxury Watches",
    condition: "Excellent",
    year: "2021",
    seller: "WatchMaster_Pro",
    auctionId: "AUC-2025-001",
    totalBids: 23,
    watchCount: 156,
    startTime: "Nov 13, 2025 12:00 PM EST",
    endTime: "Nov 13, 2025 4:15 PM EST",
    bidIncrement: 500,
  },
  "2": {
    id: "2",
    image: mockAuctions[1].image,
    title: mockAuctions[1].title,
    currentBid: mockAuctions[1].currentBid,
    timeRemaining: mockAuctions[1].timeRemaining,
    viewers: mockAuctions[1].viewers,
    description:
      'A stunning contemporary abstract oil painting by an emerging artist. This piece showcases vibrant colors and dynamic brushwork, measuring 48" x 36". The artwork has been featured in several gallery exhibitions and comes with a certificate of authenticity.',
    category: "Contemporary Art",
    condition: "New",
    year: "2024",
    seller: "ArtGallery_NYC",
    auctionId: "AUC-2025-002",
    totalBids: 12,
    watchCount: 45,
    startTime: "Nov 13, 2025 1:30 PM EST",
    endTime: "Nov 13, 2025 2:45 PM EST",
    bidIncrement: 100,
  },
  "3": {
    id: "3",
    image: mockAuctions[2].image,
    title: mockAuctions[2].title,
    currentBid: mockAuctions[2].currentBid,
    timeRemaining: mockAuctions[2].timeRemaining,
    viewers: mockAuctions[2].viewers,
    description:
      "An exquisite 3.5 carat round brilliant diamond solitaire ring. The diamond is graded VVS1 clarity with excellent cut, D color grade. Set in platinum with a classic six-prong setting. Comes with GIA certification and original purchase documentation.",
    category: "Fine Jewelry",
    condition: "Excellent",
    year: "2023",
    seller: "DiamondDirect",
    auctionId: "AUC-2025-003",
    totalBids: 18,
    watchCount: 89,
    startTime: "Nov 13, 2025 12:45 PM EST",
    endTime: "Nov 13, 2025 3:00 PM EST",
    bidIncrement: 1000,
  },
  "4": {
    id: "4",
    image: mockAuctions[3].image,
    title: mockAuctions[3].title,
    currentBid: mockAuctions[3].currentBid,
    timeRemaining: mockAuctions[3].timeRemaining,
    viewers: mockAuctions[3].viewers,
    description:
      "A pristine Leica M3 rangefinder camera from 1954 in mint condition. This camera revolutionized 35mm photography and remains one of the most collectible cameras ever made. Includes original leather case, lens cap, and manual. Fully functional with smooth film advance and accurate rangefinder.",
    category: "Vintage Cameras",
    condition: "Mint",
    year: "1954",
    seller: "VintageOptics",
    auctionId: "AUC-2025-004",
    totalBids: 8,
    watchCount: 34,
    startTime: "Nov 13, 2025 11:00 AM EST",
    endTime: "Nov 13, 2025 4:20 PM EST",
    bidIncrement: 200,
  },
  "5": {
    id: "5",
    image: mockAuctions[4].image,
    title: mockAuctions[4].title,
    currentBid: mockAuctions[4].currentBid,
    timeRemaining: mockAuctions[4].timeRemaining,
    viewers: mockAuctions[4].viewers,
    description:
      "An authentic Hermès Birkin 35 in Togo leather, one of the most coveted handbags in the world. This piece features palladium hardware and comes in the sought-after Étoupe color. Includes original dust bag, box, lock, keys, and clochette. Purchased from Hermès boutique with receipt.",
    category: "Luxury Fashion",
    condition: "New",
    year: "2024",
    seller: "LuxuryCloset",
    auctionId: "AUC-2025-005",
    totalBids: 27,
    watchCount: 178,
    startTime: "Nov 13, 2025 10:00 AM EST",
    endTime: "Nov 13, 2025 6:10 PM EST",
    bidIncrement: 500,
  },
  "6": {
    id: "6",
    image: mockAuctions[5].image,
    title: mockAuctions[5].title,
    currentBid: mockAuctions[5].currentBid,
    timeRemaining: mockAuctions[5].timeRemaining,
    viewers: mockAuctions[5].viewers,
    description:
      "A magnificent Louis XVI period gilt bronze console table from the 18th century. Features exquisite neoclassical detailing with original marble top. Professionally restored while maintaining historical integrity. Provenance documentation included.",
    category: "Antique Furniture",
    condition: "Restored",
    year: "1780",
    seller: "AntiquesEstate",
    auctionId: "AUC-2025-006",
    totalBids: 15,
    watchCount: 52,
    startTime: "Nov 13, 2025 11:30 AM EST",
    endTime: "Nov 13, 2025 5:45 PM EST",
    bidIncrement: 500,
  },
  "7": {
    id: "7",
    image: mockAuctions[6].image,
    title: mockAuctions[6].title,
    currentBid: mockAuctions[6].currentBid,
    timeRemaining: mockAuctions[6].timeRemaining,
    viewers: mockAuctions[6].viewers,
    description:
      "A contemporary bronze sculpture from a limited edition series of only 25 pieces. This is number 5/25. The sculpture stands 24 inches tall and showcases exceptional craftsmanship. Signed and numbered by the artist with certificate of authenticity.",
    category: "Sculpture",
    condition: "New",
    year: "2024",
    seller: "ModernSculpture",
    auctionId: "AUC-2025-007",
    totalBids: 11,
    watchCount: 38,
    startTime: "Nov 13, 2025 1:00 PM EST",
    endTime: "Nov 13, 2025 3:55 PM EST",
    bidIncrement: 250,
  },
  "8": {
    id: "8",
    image: mockAuctions[7].image,
    title: mockAuctions[7].title,
    currentBid: mockAuctions[7].currentBid,
    timeRemaining: mockAuctions[7].timeRemaining,
    viewers: mockAuctions[7].viewers,
    description:
      'A first edition of F. Scott Fitzgerald\'s "The Great Gatsby" from 1925 in near fine condition. This is one of the most collectible books of American literature. Original dust jacket with minimal wear, housed in custom archival box. Authentication documents included.',
    category: "Rare Books",
    condition: "Near Fine",
    year: "1925",
    seller: "RareBooks_Dealer",
    auctionId: "AUC-2025-008",
    totalBids: 19,
    watchCount: 67,
    startTime: "Nov 13, 2025 9:30 AM EST",
    endTime: "Nov 13, 2025 7:30 PM EST",
    bidIncrement: 500,
  },
};

const ProtectedAppShell: React.FC = () => {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "my-bids">("buy");
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

  const handleAuctionClick = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
  };

  const handleBackToAuctions = () => {
    setSelectedAuctionId(null);
  };

  if (selectedAuctionId && auctionDetailsMap[selectedAuctionId]) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={logout} />
        <LiveAuctionRoom
          auction={auctionDetailsMap[selectedAuctionId]}
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
