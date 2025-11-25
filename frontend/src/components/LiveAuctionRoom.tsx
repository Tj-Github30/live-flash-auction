import { ArrowLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { VideoStream } from './VideoStream';
import { BiddingPanel } from './BiddingPanel';
import { ItemDetailsSection } from './ItemDetailsSection';
import { Button } from './ui/button';

export interface AuctionData {
  id: string;
  image: string;
  title: string;
  currentBid: number;
  timeRemaining: string;
  viewers: number;
  description: string;
  category: string;
  condition: string;
  year?: string;
  seller: string;
  auctionId: string;
  totalBids: number;
  watchCount: number;
  startTime: string;
  endTime: string;
  bidIncrement: number;
}

interface LiveAuctionRoomProps {
  auction: AuctionData;
  onBack: () => void;
}

export function LiveAuctionRoom({ auction, onBack }: LiveAuctionRoomProps) {
  return (
    <div className="pt-[73px] min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auctions
        </Button>

        {/* Three Column Layout */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Left: Chat Panel */}
          <div className="col-span-3 h-[700px]">
            <ChatPanel />
          </div>

          {/* Center: Video Stream */}
          <div className="col-span-6">
            <VideoStream
              viewers={auction.viewers}
              timeRemaining={auction.timeRemaining}
            />
          </div>

          {/* Right: Bidding Panel */}
          <div className="col-span-3 h-[700px]">
            <BiddingPanel
              title={auction.title}
              currentBid={auction.currentBid}
              timeRemaining={auction.timeRemaining}
              bidIncrement={auction.bidIncrement}
            />
          </div>
        </div>

        {/* Bottom: Item Details */}
        <ItemDetailsSection
          description={auction.description}
          category={auction.category}
          condition={auction.condition}
          year={auction.year}
          seller={auction.seller}
          auctionId={auction.auctionId}
          totalBids={auction.totalBids}
          watchCount={auction.watchCount}
          startTime={auction.startTime}
          endTime={auction.endTime}
        />
      </div>
    </div>
  );
}
