import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { SecondaryNav } from "./components/SecondaryNav";
import { BuyPage } from "./components/BuyPage";
import { SellDashboard } from "./components/SellDashboard";
import { AuthPage } from "./components/AuthPage";
import { RequireAuth } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthProvider";
import { AuctionRoomPage } from "./pages/AuctionRoomPage";
import { MyBids } from "./components/MyBids";

const ProtectedAppShell: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "my-bids">("buy");

  const handleLogoClick = () => {
    setActiveTab("buy");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} onLogoClick={handleLogoClick} />
      <SecondaryNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "buy" && (
        <BuyPage onAuctionClick={(id) => navigate(`/auction/${id}`)} />
      )}
      {activeTab === "sell" && <SellDashboard />}
      {activeTab === "my-bids" && <MyBids />}

      <footer className="border-t border-border mt-16">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              © 2025 Luxe Auction. All rights reserved.
            </p>
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

      <Route
        path="/auction/:auctionId"
        element={
          <RequireAuth>
            <AuctionRoomPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
