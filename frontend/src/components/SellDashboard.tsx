import { useState } from 'react';
import { ActiveListings } from './ActiveListings';
import { SoldItems } from './SoldItems';
import { NewListing } from './NewListing';

import { useAuth } from "../auth/AuthProvider";

export function SellDashboard() {
  const { user } = useAuth();
  // If not authenticated or missing user id, hide seller dashboard content.
  if (!user?.sub) {
    return (
      <div className="pt-[137px] min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          Seller dashboard is available only for signed-in hosts.
        </div>
      </div>
    );
  }
  const [activeView, setActiveView] = useState<'active' | 'sold' | 'new'>('active');

  return (
    <div className="pt-[137px] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-2">Seller Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your listings and track your sales
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveView('active')}
              className={`pb-4 relative transition-colors ${
                activeView === 'active'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active Listings
              {activeView === 'active' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></span>
              )}
            </button>
            <button
              onClick={() => setActiveView('sold')}
              className={`pb-4 relative transition-colors ${
                activeView === 'sold'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sold Items
              {activeView === 'sold' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></span>
              )}
            </button>
            <button
              onClick={() => setActiveView('new')}
              className={`pb-4 relative transition-colors ${
                activeView === 'new'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              + New Listing
              {activeView === 'new' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeView === 'active' && <ActiveListings />}
        {activeView === 'sold' && <SoldItems />}
        {activeView === 'new' && <NewListing />}
      </div>
    </div>
  );
}
