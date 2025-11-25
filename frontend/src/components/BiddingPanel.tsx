import { Clock, TrendingUp, Award } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface BiddingPanelProps {
  title: string;
  currentBid: number;
  timeRemaining: string;
  bidIncrement: number;
}

interface Bid {
  id: string;
  username: string;
  amount: number;
  timestamp: string;
  isYou?: boolean;
}

const mockRecentBids: Bid[] = [
  { id: '1', username: 'WatchEnthusiast', amount: 146000, timestamp: '1m ago' },
  { id: '2', username: 'You', amount: 145500, timestamp: '3m ago', isYou: true },
  { id: '3', username: 'User_7854', amount: 145000, timestamp: '5m ago' },
  { id: '4', username: 'Collector_42', amount: 144500, timestamp: '8m ago' },
  { id: '5', username: 'LuxuryBids', amount: 144000, timestamp: '10m ago' },
];

export function BiddingPanel({ title, currentBid, timeRemaining, bidIncrement }: BiddingPanelProps) {
  const [customBid, setCustomBid] = useState('');
  const nextMinBid = currentBid + bidIncrement;
  const isWinning = mockRecentBids[0]?.isYou;

  const handleQuickBid = (amount: number) => {
    console.log('Placing bid:', amount);
  };

  const handleCustomBid = () => {
    const amount = parseFloat(customBid);
    if (amount >= nextMinBid) {
      console.log('Placing custom bid:', amount);
      setCustomBid('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h4 className="mb-1 line-clamp-2">{title}</h4>
        
        {/* Status Badge */}
        {isWinning ? (
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full mt-2">
            <Award className="w-3.5 h-3.5" />
            <span className="text-xs">You're winning!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">Outbid</span>
          </div>
        )}
      </div>

      {/* Current Bid */}
      <div className="px-4 py-5 border-b border-border bg-secondary/30">
        <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
        <p className="text-accent mb-3">
          ${currentBid.toLocaleString()}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeRemaining} remaining</span>
        </div>
      </div>

      {/* Bidding Controls */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-3">
          Next minimum bid: ${nextMinBid.toLocaleString()}
        </p>

        {/* Quick Bid Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant="outline"
            onClick={() => handleQuickBid(currentBid + bidIncrement)}
            className="h-10"
          >
            +${(bidIncrement / 1000)}k
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickBid(currentBid + bidIncrement * 2)}
            className="h-10"
          >
            +${(bidIncrement * 2 / 1000)}k
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
            />
          </div>
        </div>

        {/* Place Bid Button */}
        <Button
          onClick={handleCustomBid}
          className="w-full bg-accent hover:bg-accent/90 h-11"
        >
          Place Bid
        </Button>
      </div>

      {/* Recent Bids */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-sm">Recent Bids</h4>
        </div>
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-2">
            {mockRecentBids.map((bid, index) => (
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
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
