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
  highBidderId?: string | null;
  seller: string;
  bidIncrement: number;
  description: string;
  category: string;
  condition: string;
  year: number;
  totalBids: number;
  startTime: string;
  endTime: string;
  timeRemaining: string;
}

interface LiveAuctionRoomProps {
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
  const [highBidderId, setHighBidderId] = useState<string | null>(auction.highBidderId || null);
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

  // Persist recent bids per auction so they survive refresh
  const bidsStorageKey = useMemo(() => `recent-bids:${auction.auctionId}`, [auction.auctionId]);

  const mapRecentBids = (list: any[]) =>
    (list || []).slice(0, 20).map((bid: any) => ({
      username: bid.user_id === currentUserId ? "You" : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
      amount: bid.amount,
      timestamp: bid.timestamp || bid.created_at || "now",
    }));

  const persistRecentBids = (bids: Array<{ username: string; amount: number; timestamp: string }>) => {
    try {
      sessionStorage.setItem(bidsStorageKey, JSON.stringify(bids));
    } catch {
      /* ignore */
    }
  };

  const hydrateRecentBids = () => {
    try {
      const stored = sessionStorage.getItem(bidsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentBids(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  };

  // UNIFIED HELPER: Ensures Host is never a "Bidder"
  const getDisplayName = (msgUserId: any) => {
    if (!msgUserId) return "Guest";
    const senderId = String(msgUserId);
    const hostId = String(auction.hostUserId || "");
    const meId = String(currentUserId || "");

    if (senderId === meId) return "You";
    if (senderId === hostId) return "Host";
    
    return bidderAliasForAuction({ 
      auctionId: auction.auctionId, 
      userId: senderId 
    });
  };

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

  // Notify outer pages to adjust viewer counts optimistically
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("auction:viewed", { detail: { auctionId: auction.auctionId } }));
    return () => {
      window.dispatchEvent(new CustomEvent("auction:left", { detail: { auctionId: auction.auctionId } }));
    };
  }, [auction.auctionId]);

  // Initial fetch of recent bids (best-effort) on mount + hydrate from storage
  useEffect(() => {
    hydrateRecentBids();
    let active = true;
    const fetchInitialState = async () => {
      try {
        const resp = await api.get(`/api/auctions/${auction.auctionId}/state`);
        if (!resp.ok) return;
        const data = await apiJson<any>(resp);
        if (!active) return;

        if (Array.isArray(data?.recent_bids)) {
          const mapped = mapRecentBids(data.recent_bids);
          setRecentBids(mapped);
          persistRecentBids(mapped);
          
          // Fallback: If high_bidder_id is not provided but we have recent bids, derive it from the highest bid
          if (!data?.high_bidder_id && data.recent_bids.length > 0) {
            // Find the bid with the highest amount (top_bids are sorted descending)
            const topBid = data.recent_bids[0];
            if (topBid?.user_id) {
              setHighBidderId(String(topBid.user_id));
            }
          }
        }

        if (typeof data?.current_high_bid === "number") {
          setCurrentBid(data.current_high_bid);
        }

        // Always set high_bidder_id if provided (even if null/empty string to clear previous state)
        if (data?.high_bidder_id !== undefined && data?.high_bidder_id !== null && data?.high_bidder_id !== "") {
          setHighBidderId(String(data.high_bidder_id));
        } else if (data?.high_bidder_id === null || data?.high_bidder_id === "") {
          // Explicitly clear if null or empty string
          setHighBidderId(null);
        }

        if (data?.status) {
          setStatus(data.status);
        }

        if (Array.isArray(data?.chat_messages)) {
          setChatMessages(data.chat_messages.map((msg: any) => ({
            ...msg,
            username: getDisplayName(msg.user_id)
          })));
        }
      } catch (err) { console.error("Error fetching state:", err); }
    };
    fetchInitialState();
    return () => { active = false; };
  }, [auction.auctionId, currentUserId, auction.hostUserId]);

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
      setViewers(data.participant_count || viewers);
      if (data.status) setStatus(data.status);
      
      if (data.top_bids) {
        const mapped = data.top_bids.map((bid: { user_id?: string; amount: number; timestamp?: string }) => ({
          username: getDisplayName(bid.user_id),
          amount: bid.amount,
          timestamp: bid.timestamp || "now",
        }));
        setRecentBids(mapped);
        persistRecentBids(mapped);
      }
    });

    socket.on('chat_message', (msg: any) => {
      setChatMessages(prev => [...prev, {
        ...msg,
        username: getDisplayName(msg.user_id)
      }]);
    });

    socket.connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_auction', { auction_id: auction.auctionId });
        socketRef.current.disconnect();
      }
      // Optimistically remove the current viewer
      setViewers((prev) => Math.max(0, (prev ?? 1) - 1));
    };
  }, [tokens?.idToken, auction.auctionId]);

  // Fetch server state on visibility/focus to avoid constant polling
  useEffect(() => {
    let active = true;
    let lastFetch = 0;
    const minIntervalMs = 2000;

    const mapBids = (
      list: Array<{ user_id?: string; amount: number; timestamp?: string; created_at?: string }>
    ): Array<{ username: string; amount: number; timestamp: string }> => {
      return (list || [])
        .slice(0, 20)
        .map((bid: { user_id?: string; amount: number; timestamp?: string; created_at?: string }) => ({
          username: bid.user_id === currentUserId ? "You" : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
          amount: bid.amount,
          timestamp: bid.timestamp || bid.created_at || "now",
        }));
    };

    const fetchState = async () => {
      const now = Date.now();
      if (now - lastFetch < minIntervalMs) return;
      lastFetch = now;
      try {
        const resp = await api.get(`/api/auctions/${auction.auctionId}/state`);
        if (!resp.ok) return;
        const data = await apiJson<any>(resp);
        if (!active) return;
        if (typeof data?.participant_count === "number") {
          setViewers(data.participant_count);
        } else if (typeof data?.viewers === "number") {
          setViewers(data.viewers);
        }
        if (Array.isArray(data?.recent_bids)) {
          const mapped = mapBids(data.recent_bids);
          setRecentBids(mapped);
          persistRecentBids(mapped);
        }

        if (typeof data?.current_high_bid === "number") {
          setCurrentBid(data.current_high_bid);
        }

        // Always set high_bidder_id, even if null (to clear previous state)
        if (data?.high_bidder_id !== undefined) {
          setHighBidderId(data.high_bidder_id ? String(data.high_bidder_id) : null);
        }

        if (data?.status) {
          setStatus(data.status);
        }
      } catch {
        // best-effort; ignore errors
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchState();
      }
    };
    const handleFocus = () => fetchState();

    // Initial fetch on mount if visible
    if (document.visibilityState === "visible") fetchState();
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [auction.auctionId]);

  // Timer logic
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

  const handleCloseAuction = async () => {
    if (!window.confirm("Close this auction manually?")) return;
    setIsClosing(true);
    try {
      const response = await api.post(`/api/auctions/${auction.auctionId}/close`);
      if (response.ok) { 
        setStatus('closed'); 
        setTimeRemainingSeconds(0); 
      }
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
            <ChatPanel 
              messages={chatMessages} 
              onSendMessage={handleSendChat} 
              sellerName={auction.seller} 
              isEnded={isEnded}
              isHostView={isHost}
            />
          </div>

          {/* Gallery Column with Blur and Overlay */}
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

              {/* LIVE / ENDED BADGE */}
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

              {/* TOP RIGHT TIMER */}
              <div className="absolute top-4 right-4 z-30 bg-black/60 px-4 py-1.5 rounded-full text-white text-sm font-mono shadow-xl border border-white/5">
                {isEnded ? "00:00:00" : formatTimeRemaining(timeRemainingSeconds ?? auction.timeRemaining)}
              </div>
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