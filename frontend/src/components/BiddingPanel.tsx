import { Clock, TrendingUp, Award } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { api } from '../utils/api';
import { formatCurrency, formatTimeRemaining, bidderAliasForAuction } from '../utils/format';

interface BiddingPanelProps {
  title: string;
  currentBid: number;
  timeRemaining: string;
  bidIncrement: number;
  auctionId: string;
  recentBids?: Array<{ userId?: string; username?: string; amount: number; timestamp: string }>;
  currentUserId?: string;
  highBidderId?: string;
  isHost?: boolean;
  isClosed?: boolean;
}

interface Bid {
  id: string;
  username: string;
  amount: number;
  timestamp: string;
  isYou?: boolean;
}

export function BiddingPanel({ 
  title, 
  currentBid, 
  timeRemaining, 
  bidIncrement,
  auctionId,
  recentBids = [],
  currentUserId,
  highBidderId,
  isHost = false,
  isClosed = false
}: BiddingPanelProps) {
  const [customBid, setCustomBid] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const nextMinBid = currentBid + bidIncrement;
  const normalizeBidError = (msg?: string) => {
    if (!msg) return 'Failed to place bid';
    const lower = msg.toLowerCase();
    if (lower.includes('auction is closed')) return 'Auction is closed.';
    return msg;
  };
  
  // Format recent bids
  const formattedBids: Bid[] = recentBids.map((bid, index) => ({
    id: `bid-${index}`,
    username:
      bid.userId && bid.userId === currentUserId
        ? "You"
        : bid.username ||
          bidderAliasForAuction({ auctionId, userId: bid.userId }),
    amount: bid.amount,
    timestamp: bid.timestamp || 'now',
    isYou: !!currentUserId && !!bid.userId && bid.userId === currentUserId
  }));
  
  const isWinning = !!currentUserId && !!highBidderId && highBidderId === currentUserId;
  const isOutbid = !!currentUserId && !!highBidderId && highBidderId !== currentUserId;
  const showNeutral = !highBidderId && formattedBids.length === 0;

  const handleQuickBid = async (amount: number) => {
    await placeBid(amount);
  };

  const handleCustomBid = async () => {
    const amount = parseFloat(customBid);
    if (amount >= nextMinBid) {
      await placeBid(amount);
      setCustomBid('');
    }
  };

  const placeBid = async (amount: number) => {
    if (isHost) {
      alert("Hosts cannot place bids on their own auctions.");
      return;
    }
    if (isClosed || isPlacingBid || amount < nextMinBid) return;
    
    setIsPlacingBid(true);
    try {
      const response = await api.post('/api/bids', {
        auction_id: auctionId,
        amount
      });
      
      if (response.ok) {
        // Real-time winner/outbid status is driven by websocket updates (highBidderUsername).
        await response.json().catch(() => null);
      } else {
        const error = await response.json();
        alert(normalizeBidError(error?.error));
      }
    } catch (error: any) {
      console.error('Error placing bid:', error);
      alert(normalizeBidError(error?.message || 'Failed to place bid. Please try again.'));
    } finally {
      setIsPlacingBid(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h4 className="mb-1 line-clamp-2">{title}</h4>
        
        {/* Status Badge */}
        {isClosed ? (
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-sm font-bold text-red-700">Auction closed</span>
          </div>
        ) : !isHost && showNeutral ? (
          <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">Ready to bid</span>
          </div>
        ) : !isHost && isWinning ? (
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full mt-2">
            <Award className="w-3.5 h-3.5" />
            <span className="text-xs">You're winning!</span>
          </div>
        ) : !isHost && isOutbid ? (
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">Outbid</span>
          </div>
        ) : null}
      </div>

      {/* Current Bid */}
      <div className="px-4 py-5 border-b border-border bg-secondary/30">
        <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
        <p className="text-accent mb-3">
          ${currentBid.toLocaleString()}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{isClosed ? 'Ended' : `${formatTimeRemaining(timeRemaining)} remaining`}</span>
        </div>
      </div>

      {/* Bidding Controls */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-3">
          Next minimum bid: ${nextMinBid.toLocaleString()}
        </p>

        {isHost && (
          <div className="mb-3 text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
            You are the host. Hosts cannot place bids on their own auctions.
          </div>
        )}

        {/* Quick Bid Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant="outline"
            onClick={() => handleQuickBid(currentBid + bidIncrement)}
            disabled={isClosed || isPlacingBid || isHost}
            className="h-10"
          >
            +${formatCurrency(bidIncrement)}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickBid(currentBid + bidIncrement * 2)}
            disabled={isClosed || isPlacingBid || isHost}
            className="h-10"
          >
            +${formatCurrency(bidIncrement * 2)}
          </Button>
        </div>

        {/* Custom Bid */}
        <div className="mb-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              placeholder="Custom amount"
              className="pl-7"
              disabled={isHost || isClosed}
            />
          </div>
        </div>

        {/* Place Bid Button */}
        <Button
          onClick={handleCustomBid}
          disabled={isHost || isClosed || isPlacingBid || !customBid || parseFloat(customBid) < nextMinBid}
          className="w-full bg-accent hover:bg-accent/90 h-11"
        >
          {isClosed ? 'Auction closed' : isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
        </Button>
      </div>

      {/* Recent Bids */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-sm">Recent Bids</h4>
        </div>
        <ScrollArea className="flex-1 px-4 py-2 max-h-72">
          <div className="space-y-2">
            {formattedBids.length === 0 ? (
              isHost ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No bids yet.
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No bids yet. Be the first to bid!
                </div>
              )
            ) : (
              formattedBids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                  bid.isYou ? 'bg-accent/10 border border-accent/20' : 'hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  <div>
                    <p className="text-sm">
                      {bid.isYou ? (
                        <span className="text-accent">You</span>
                      ) : (
                        bid.username
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{bid.timestamp}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground">
                  ${bid.amount.toLocaleString()}
                </p>
              </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
