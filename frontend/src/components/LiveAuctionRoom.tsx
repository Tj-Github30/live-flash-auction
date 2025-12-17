import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, Lock, ImageOff } from 'lucide-react'; 
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { ChatPanel } from './ChatPanel';
import { BiddingPanel } from './BiddingPanel';
import { ItemDetailsSection } from './ItemDetailsSection';
import { Button } from './ui/button';
import { useAuth } from '../auth/AuthProvider';
import { api, apiJson } from '../utils/api'; 
import { createSocketConnection } from '../utils/websocket';
import { Socket } from 'socket.io-client';
import { bidderAliasForAuction, formatTimeRemaining } from '../utils/format';

export interface AuctionData {
  auctionId: string;
  title: string;
  image: string;
  galleryImages?: string[];
  currentBid: number;
  timeRemainingSeconds: number | null | undefined;
  viewers: number;
  status?: string;
  hostUserId?: string;
  seller: string;
  bidIncrement: number;
  description: string;
  category: string;
  condition: string;
  year: number;
  totalBids: number;
  startTime: string;
  endTime: string;
  timeRemaining: number;
}

export interface LiveAuctionRoomProps {
  auction: AuctionData;
  onBack: () => void;
}

export function LiveAuctionRoom({ auction, onBack }: LiveAuctionRoomProps) {
  const { tokens, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  
  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null | undefined>(auction.timeRemainingSeconds);
  const [viewers, setViewers] = useState(auction.viewers);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [recentBids, setRecentBids] = useState<any[]>([]); 
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

  // 1. Fetch Initial State (The 8 existing bids)
  useEffect(() => {
    let active = true;
    const fetchInitialState = async () => {
      try {
        const resp = await api.get(`/api/auctions/${auction.auctionId}/state`);
        if (!resp.ok) return;
        const data = await apiJson<any>(resp);
        if (!active) return;

        if (Array.isArray(data?.recent_bids)) {
          setRecentBids(data.recent_bids.map((bid: any) => ({
            username: bid.user_id === currentUserId ? "You" : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
            amount: bid.amount,
            timestamp: bid.timestamp || "Just now",
          })));
        }
      } catch (err) { console.error("Error fetching state:", err); }
    };
    fetchInitialState();
    return () => { active = false; };
  }, [auction.auctionId, currentUserId]);

  // 2. WebSocket Connection
  useEffect(() => {
    if (!tokens?.idToken) return;
    const socket = createSocketConnection(tokens.idToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_auction', { auction_id: auction.auctionId, token: tokens.idToken });
    });

    socket.on('bid_update', (data: any) => {
      setCurrentBid(data.high_bid);
      setHighBidderId(data.high_bidder_id);
      if (data.top_bids) {
        setRecentBids(data.top_bids.map((bid: any) => ({
          username: bid.user_id === currentUserId ? "You" : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
          amount: bid.amount,
          timestamp: bid.timestamp || "Just now",
        })));
      }
    });

    socket.on('chat_message', (msg: any) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.connect();
    return () => { socket.disconnect(); };
  }, [tokens?.idToken, auction.auctionId, currentUserId]);

  // Timer logic
  useEffect(() => {
    if (isEnded) return;
    const id = window.setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isEnded]);

  const handleSendChat = (message: string) => {
    if (socketRef.current && message.trim() && !isEnded) {
      socketRef.current.emit('chat_message', { auction_id: auction.auctionId, message: message.trim() });
    }
  };

  const handleCloseAuction = async () => {
    if (!window.confirm("Close this auction manually?")) return;
    setIsClosing(true);
    try {
      const response = await api.post(`/api/auctions/${auction.auctionId}/close`);
      if (response.ok) { setStatus('closed'); setTimeRemainingSeconds(0); }
    } catch (err) { console.error(err); } finally { setIsClosing(false); }
  };

  return (
    <div className="pt-[73px] min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Auctions
        </Button>

        <div className="grid grid-cols-12 gap-6 mb-12">
          {/* Chat Column */}
          <div className="col-span-3 h-[700px]">
            <ChatPanel messages={chatMessages} onSendMessage={handleSendChat} sellerName={auction.seller} isEnded={isEnded} />
          </div>

          {/* Gallery Column */}
          <div className="col-span-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[700px] flex flex-col relative overflow-hidden">
             <div className="relative flex-grow h-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
              {galleryImages.length > 0 ? (
                <ImageGallery items={galleryImages} showPlayButton={false} thumbnailPosition="left" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageOff className="w-16 h-16 mb-2 opacity-20" />
                  <span className="uppercase tracking-widest text-xs">No images</span>
                </div>
              )}
            </div>
          </div>

          {/* Bidding Column */}
          <div className="col-span-3 h-[700px] flex flex-col gap-4">
            {isHost && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className={`w-4 h-4 ${isEnded ? 'text-gray-300' : 'text-orange-500'}`} />
                  <span className="text-sm font-semibold text-gray-900">Host Controls</span>
                </div>
                <Button variant={isEnded ? "outline" : "destructive"} className="w-full h-12 font-bold uppercase" onClick={handleCloseAuction} disabled={isClosing || isEnded}>
                  {isClosing ? "Closing..." : isEnded ? "Auction Closed" : "Close Auction"}
                </Button>
              </div>
            )}

            {/* Container for Bidding Panel to prevent overlap */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-white shadow-sm">
              <BiddingPanel
                title={auction.title}
                currentBid={currentBid}
                timeRemaining={isEnded ? "Ended" : formatTimeRemaining(timeRemainingSeconds ?? auction.timeRemaining)}
                bidIncrement={auction.bidIncrement}
                auctionId={auction.auctionId}
                currentUserId={currentUserId || undefined}
                highBidderId={highBidderId || undefined}
                isHost={isHost}
                isClosed={isEnded}
                recentBids={recentBids} 
              />
            </div>
          </div>
        </div>

        {/* Item Details - Year conversion fixed with guard */}
        <ItemDetailsSection
          description={auction.description}
          category={auction.category}
          condition={auction.condition} 
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