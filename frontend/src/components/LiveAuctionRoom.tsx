import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Lock, ImageOff } from 'lucide-react'; 
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
  status?: string; 
  timeRemainingSeconds?: number;
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
  status?: string;
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
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null | undefined>(auction.timeRemainingSeconds);
  const [viewers, setViewers] = useState(auction.viewers);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recentBids, setRecentBids] = useState<Array<{ username: string; amount: number; timestamp: string }>>([]);
  const [highBidderId, setHighBidderId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [status, setStatus] = useState(auction.status || 'live');

  const currentUserId = user?.sub || null;
  const isHost = useMemo(() => {
    if (!currentUserId || !auction.hostUserId) return false;
    return String(currentUserId) === String(auction.hostUserId);
  }, [currentUserId, auction.hostUserId]);

  const isEnded = useMemo(() => {
    return status === 'closed' || (timeRemainingSeconds !== null && timeRemainingSeconds !== undefined && timeRemainingSeconds <= 0);
  }, [status, timeRemainingSeconds]);

  const galleryImages = useMemo(() => {
    const all = Array.from(new Set([auction.image, ...(auction.galleryImages || [])])).filter(Boolean);
    if (all.length === 0) return [];
    return all.map(img => ({ original: img, thumbnail: img }));
  }, [auction.image, auction.galleryImages]);

  const isAuctionClosed = isEnded;

  const displayTimeRemaining = useMemo(() => {
    if (isEnded) return "Ended";
    return formatTimeRemaining(timeRemainingSeconds ?? auction.timeRemaining);
  }, [isEnded, timeRemainingSeconds, auction.timeRemaining]);

  const handleCloseAuction = async () => {
    if (!window.confirm("Are you sure you want to close this auction manually?")) return;

    setIsClosing(true);
    try {
      const response = await api.post(`/api/auctions/${auction.auctionId}/close`);
      if (!response.ok) throw new Error("Failed to close auction");
      
      setStatus('closed');
      setTimeRemainingSeconds(0);
      
      window.dispatchEvent(new CustomEvent("auction:ended"));
      alert("Auction closed successfully.");
    } catch (err) {
      console.error(err);
      alert("Error closing auction.");
    } finally {
      setIsClosing(false);
    }
  };

  useEffect(() => {
    if (!tokens?.idToken) return;
    const socket = createSocketConnection(tokens.idToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_auction', { auction_id: auction.auctionId, token: tokens.idToken });
    });

    socket.on('bid_update', (data: BidUpdate) => {
      setCurrentBid(data.high_bid);
      setViewers(data.participant_count);
      if (data.status) setStatus(data.status);
      if (typeof data.high_bidder_id === 'string') setHighBidderId(data.high_bidder_id);
    });

    socket.on('timer_update', (data: TimerUpdatePayload) => {
        const seconds = data.time_remaining_seconds ?? (typeof data.time_remaining_ms === "number" ? Math.floor(data.time_remaining_ms / 1000) : undefined);
        if (seconds !== undefined) {
            setTimeRemainingSeconds(seconds);
            if (seconds <= 0) setStatus('closed');
        }
    });

    socket.connect();
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [tokens?.idToken, auction.auctionId]);

  useEffect(() => {
    if (isEnded) return;
    const id = window.setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev === null || prev === undefined || prev <= 0) {
            if (prev === 0) setStatus('closed');
            return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isEnded]);

  const handleSendChat = (message: string) => {
    if (socketRef.current && message.trim() && !isEnded) {
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

          <div className="col-span-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[700px] flex flex-col relative overflow-hidden">
            <div className="relative flex-grow h-full bg-gray-50 rounded-lg flex items-center justify-center">
              {galleryImages.length > 0 ? (
                <ImageGallery
                  items={galleryImages}
                  showPlayButton={false}
                  thumbnailPosition="left"
                  showIndex={true}
                  showFullscreenButton={false}
                  additionalClass="live-auction-gallery h-full w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageOff className="w-16 h-16 mb-2 opacity-20" />
                  <span className="text-sm font-medium opacity-50 uppercase tracking-widest">No images available</span>
                </div>
              )}

               {/* ENDED BACKDROP BLUR AND LOCK ICON */}
               {isEnded && (
                 <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px] transition-opacity duration-500">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl flex flex-col items-center">
                        <Lock className="w-12 h-12 text-white mb-4 opacity-90" />
                        <h2 className="text-white text-6xl font-black tracking-tighter uppercase italic drop-shadow-2xl">
                          Ended
                        </h2>
                        <p className="text-white/70 mt-2 font-medium tracking-widest uppercase text-xs">Bidding is now closed</p>
                    </div>
                 </div>
               )}

               {/* STATUS BADGE */}
               <div className="absolute top-4 left-4 z-30 bg-black/60 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                 {isEnded ? (
                   <>
                     <span className="w-2 h-2 bg-red-500 rounded-full" />
                     ENDED
                   </>
                 ) : (
                   <>
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                     LIVE | {viewers} Viewers
                   </>
                 )}
               </div>

               {/* TIMER BADGE */}
               <div className="absolute top-4 right-4 z-30 bg-black/60 px-4 py-1.5 rounded-full text-white text-sm font-mono shadow-xl border border-white/5">
                 {isEnded ? "00:00:00" : formatTimeRemaining(timeRemainingSeconds ?? auction.timeRemaining)}
               </div>
            </div>
          </div>

          <div className="col-span-3 h-[700px] flex flex-col gap-4 overflow-y-auto">
            {isHost && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className={`w-4 h-4 ${isEnded ? 'text-gray-300' : 'text-orange-500'}`} />
                  <span className="text-sm font-semibold text-gray-900">Host Controls</span>
                </div>
                
                {/* HOST INFORMATIONAL TEXT FROM SCREENSHOT */}
                {!isEnded && (
                  <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
                    Ending this auction will stop all bidding immediately. The current high bidder will be declared the winner.
                  </p>
                )}

                <Button 
                  variant={isEnded ? "outline" : "destructive"} 
                  className="w-full h-12 font-bold uppercase tracking-wide"
                  onClick={handleCloseAuction}
                  disabled={isClosing || isEnded}
                >
                  {isClosing ? "Closing..." : isEnded ? "Auction Closed" : "Close Auction"}
                </Button>
              </div>
            )}

            <BiddingPanel
              title={auction.title}
              currentBid={currentBid}
              timeRemaining={formatTimeRemaining(timeRemainingSeconds ?? auction.timeRemaining)}
              bidIncrement={auction.bidIncrement}
              auctionId={auction.auctionId}
              recentBids={recentBids}
              currentUserId={currentUserId || undefined}
              highBidderId={highBidderId || undefined}
              isHost={isHost}
              isClosed={isAuctionClosed}
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