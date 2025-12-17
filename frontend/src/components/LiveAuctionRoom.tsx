import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { ChatPanel } from './ChatPanel';
import { BiddingPanel } from './BiddingPanel';
import { ItemDetailsSection } from './ItemDetailsSection';
import { Button } from './ui/button';
import { useAuth } from '../auth/AuthProvider';
import { api } from '../utils/api'; 
import { createSocketConnection } from '../utils/websocket';
import { Socket } from 'socket.io-client';
import { formatTimeRemaining, bidderAliasForAuction } from '../utils/format';

export interface AuctionData {
  id: string;
  image: string;
  galleryImages: string[];
  title: string;
  currentBid: number;
  timeRemaining: string;
  timeRemainingSeconds?: number | null;
  viewers: number;
  description: string;
  category: string;
  condition: string;
  year?: string;
  seller: string;
  hostUserId?: string;
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

interface BidUpdate {
  type: string;
  auction_id: string;
  high_bid: number;
  high_bidder_id?: string;
  high_bidder_username: string;
  top_bids: Array<{ user_id?: string; username: string; amount: number; timestamp?: string }>;
  bid_count: number;
  participant_count: number;
}

interface ChatMessage {
  type: string;
  auction_id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: number;
}

type TimerUpdatePayload = {
  time_remaining?: string | number;
  time_remaining_seconds?: number;
  time_remaining_ms?: number;
  auction_ended?: boolean;
};

export function LiveAuctionRoom({ auction, onBack }: LiveAuctionRoomProps) {
  const { tokens, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  
  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [timeRemaining, setTimeRemaining] = useState(auction.timeRemaining);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null | undefined>(auction.timeRemainingSeconds);
  const [viewers, setViewers] = useState(auction.viewers);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recentBids, setRecentBids] = useState<Array<{ username: string; amount: number; timestamp: string }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [highBidderId, setHighBidderId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // LOGIC: Determine if the current user is the host
  const currentUserId = user?.sub || null;
  const isHost = useMemo(() => {
    if (!currentUserId || !auction.hostUserId) return false;
    return String(currentUserId) === String(auction.hostUserId);
  }, [currentUserId, auction.hostUserId]);

  // DEBUG: Check this in your browser console if the button is missing
  useEffect(() => {
    console.log("Room Auth Check:", { 
      currentUserId, 
      hostUserId: auction.hostUserId, 
      isHost 
    });
  }, [currentUserId, auction.hostUserId, isHost]);

  const galleryImages = useMemo(() => {
    const all = Array.from(new Set([auction.image, ...(auction.galleryImages || [])])).filter(Boolean);
    return all.map(img => ({
      original: img,
      thumbnail: img,
    }));
  }, [auction.image, auction.galleryImages]);

  const handleCloseAuction = async () => {
    if (!window.confirm("Are you sure you want to close this auction manually?")) return;

    setIsClosing(true);
    try {
      const response = await api.post(`/api/auctions/${auction.auctionId}/close`);
      if (!response.ok) throw new Error("Failed to close auction");
      
      window.dispatchEvent(new CustomEvent("auction:ended"));
      alert("Auction closed successfully.");
      onBack();
    } catch (err) {
      console.error(err);
      alert("Error closing auction. Check console for details.");
    } finally {
      setIsClosing(false);
    }
  };

  useEffect(() => {
    if (!tokens?.idToken) return;

    const socket = createSocketConnection(tokens.idToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      socket.emit('join_auction', { auction_id: auction.auctionId, token: tokens.idToken });
    });

    socket.on('connect_error', (err: any) => {
      setIsConnected(false);
      setConnectionError(err?.message || 'Failed to connect');
    });

    socket.on('bid_update', (data: BidUpdate) => {
      setCurrentBid(data.high_bid);
      setViewers(data.participant_count);
      if (typeof data.high_bidder_id === 'string') setHighBidderId(data.high_bidder_id);
      
      if (data.top_bids) {
        setRecentBids(data.top_bids.map((bid) => ({
            userId: bid.user_id,
            username: bid.user_id === currentUserId ? "You" : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
            amount: bid.amount,
            timestamp: bid.timestamp || "now",
        })));
      }
    });

    socket.on('chat_message', (data: ChatMessage) => {
        setChatMessages(prev => [...prev, {
            ...data,
            username: data.user_id === currentUserId ? "You" : bidderAliasForAuction({ auctionId: auction.auctionId, userId: data.user_id }),
            id: `${data.user_id}-${data.timestamp}`
        }]);
    });

    socket.on('timer_update', (data: TimerUpdatePayload) => {
        const seconds = data.time_remaining_seconds ?? (typeof data.time_remaining_ms === "number" ? Math.floor(data.time_remaining_ms / 1000) : undefined);
        if (seconds !== undefined) {
            setTimeRemainingSeconds(seconds);
        }
    });

    socket.connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_auction', { auction_id: auction.auctionId });
        socketRef.current.disconnect();
      }
    };
  }, [tokens?.idToken, auction.auctionId, currentUserId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev === null || prev === undefined) return prev;
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleSendChat = (message: string) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('chat_message', { auction_id: auction.auctionId, message: message.trim() });
    }
  };

  return (
    <div className="pt-[73px] min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auctions
        </Button>

        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-3 h-[700px]">
            <ChatPanel messages={chatMessages} onSendMessage={handleSendChat} />
          </div>

          <div className="col-span-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[700px] flex flex-col">
            <div className="relative flex-grow">
              <ImageGallery
                items={galleryImages}
                showPlayButton={false}
                thumbnailPosition="left"
                showIndex={true}
                additionalClass="h-full"
              />
               <div className="absolute top-4 left-16 z-10 bg-black/60 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                 LIVE | {viewers} Viewers
               </div>
               <div className="absolute top-4 right-4 z-10 bg-black/60 px-3 py-1 rounded-full text-white text-sm font-mono">
                 {formatTimeRemaining(timeRemainingSeconds ?? timeRemaining)}
               </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-3 h-[700px] flex flex-col gap-4 overflow-y-auto">
            {/* Host Controls: Styled to match your BiddingPanel look */}
            {isHost && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-900">Host Controls</span>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full h-12 font-bold"
                  onClick={handleCloseAuction}
                  disabled={isClosing}
                >
                  {isClosing ? "Closing..." : "Close Auction"}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
                  Ends bidding immediately and processes the current winner.
                </p>
              </div>
            )}

            <BiddingPanel
              title={auction.title}
              currentBid={currentBid}
              timeRemaining={formatTimeRemaining(timeRemainingSeconds ?? timeRemaining)}
              bidIncrement={auction.bidIncrement}
              auctionId={auction.auctionId}
              recentBids={recentBids}
              currentUserId={currentUserId || undefined}
              highBidderId={highBidderId || undefined}
              isHost={isHost}
            />
          </div>
        </div>

        <ItemDetailsSection
          description={auction.description}
          category={auction.category}
          condition={auction.condition} 
          year={auction.year}
          seller={auction.seller} 
          auctionId={auction.auctionId}
          totalBids={auction.totalBids}
          watchCount={viewers}
          startTime={auction.startTime} 
          endTime={auction.endTime}
        />
      </div>
    </div>
  );
}