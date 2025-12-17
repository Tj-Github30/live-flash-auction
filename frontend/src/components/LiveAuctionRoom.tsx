import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { VideoStream } from './VideoStream';
import { BiddingPanel } from './BiddingPanel';
import { ItemDetailsSection } from './ItemDetailsSection';
import { Button } from './ui/button';
import { useAuth } from '../auth/AuthProvider';
import { createSocketConnection } from '../utils/websocket';
import { Socket } from 'socket.io-client';
import { formatTimeRemaining } from '../utils/format';
import { bidderAliasForAuction } from '../utils/format';

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
  // legacy/expected
  time_remaining?: string | number;
  // timer-service publishes these
  time_remaining_seconds?: number;
  time_remaining_ms?: number;
  auction_ended?: boolean;
};

export function LiveAuctionRoom({ auction, onBack }: LiveAuctionRoomProps) {
  const { tokens, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [timeRemaining, setTimeRemaining] = useState(auction.timeRemaining);
  const [viewers, setViewers] = useState(auction.viewers);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recentBids, setRecentBids] = useState<Array<{ username: string; amount: number; timestamp: string }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [highBidderId, setHighBidderId] = useState<string | null>(null);

  const currentUserId = user?.sub || null;
  const isHost = !!currentUserId && !!auction.hostUserId && currentUserId === auction.hostUserId;

  useEffect(() => {
    if (!tokens?.idToken) {
      console.error('No authentication token available');
      return;
    }

    // Create and connect socket
    const socket = createSocketConnection(tokens.idToken);
    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
      
      // Join auction room
      socket.emit('join_auction', {
        auction_id: auction.auctionId,
        token: tokens.idToken
      });
    });

    socket.on('connect_error', (err: any) => {
      console.error('WebSocket connect_error:', err);
      setIsConnected(false);
      setConnectionError(err?.message || 'Failed to connect to live updates');
    });

    socket.on('connected', (data: { message: string; user_id: string; username: string }) => {
      console.log('Socket.IO connected:', data);
    });

    socket.on('joined_auction', (data: any) => {
      console.log('Joined auction:', data);
      if (data.current_high_bid) {
        setCurrentBid(data.current_high_bid);
      }
      if (data.time_remaining) {
        setTimeRemaining(data.time_remaining);
      }
      if (typeof data.high_bidder_id === 'string') {
        setHighBidderId(data.high_bidder_id || null);
      } else if (data.high_bidder_id === null) {
        setHighBidderId(null);
      }
      if (data.participant_count) {
        setViewers(data.participant_count);
      }
      if (data.top_bids) {
        setRecentBids(
          data.top_bids.map((bid: any) => ({
            userId: bid.user_id,
            username:
              bid.user_id && bid.user_id === currentUserId
                ? "You"
                : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
            amount: bid.amount || bid.high_bid,
            timestamp: bid.timestamp || "now",
          }))
        );
      }
    });

    // Bid updates
    socket.on('bid_update', (data: BidUpdate) => {
      console.log('Bid update:', data);
      setCurrentBid(data.high_bid);
      setViewers(data.participant_count);
      if (typeof data.high_bidder_id === 'string') {
        setHighBidderId(data.high_bidder_id || null);
      }
      if (data.top_bids) {
        setRecentBids(
          data.top_bids.map((bid) => ({
            userId: bid.user_id,
            username:
              bid.user_id && bid.user_id === currentUserId
                ? "You"
                : bidderAliasForAuction({ auctionId: auction.auctionId, userId: bid.user_id }),
            amount: bid.amount,
            timestamp: bid.timestamp || "now",
          }))
        );
      }
    });

    // Chat messages
    socket.on('chat_message', (data: ChatMessage) => {
      console.log('Chat message:', data);
      setChatMessages(prev => [...prev, {
        ...data,
        username:
          data.user_id && data.user_id === currentUserId
            ? "You"
            : bidderAliasForAuction({ auctionId: auction.auctionId, userId: data.user_id }),
        id: `${data.user_id}-${data.timestamp}`
      }]);
    });

    // Timer updates
    socket.on('timer_update', (data: TimerUpdatePayload) => {
      const seconds =
        data.time_remaining ??
        data.time_remaining_seconds ??
        (typeof data.time_remaining_ms === "number" ? Math.floor(data.time_remaining_ms / 1000) : undefined);

      // Note: allow 0 to flow through so UI can show "Ended".
      if (seconds !== undefined) {
        setTimeRemaining(seconds as any);
      }
    });

    // Auction ended
    socket.on('auction_ended', (data: any) => {
      console.log('Auction ended:', data);
      // Handle auction end
    });

    // User joined/left
    socket.on('user_joined', (data: { username: string; participant_count: number }) => {
      setViewers(data.participant_count);
    });

    socket.on('user_left', (data: { username: string; participant_count: number }) => {
      setViewers(data.participant_count);
    });

    // Error handling
    socket.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error);
      setConnectionError(error?.message || 'WebSocket error');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Connect socket
    socket.connect();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_auction', { auction_id: auction.auctionId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [tokens?.idToken, auction.auctionId]);

  const handleSendChat = (message: string) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('chat_message', {
        auction_id: auction.auctionId,
        message: message.trim()
      });
    }
  };

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

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {connectionError ? `Live updates unavailable: ${connectionError}` : 'Connecting to auction...'}
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Left: Chat Panel */}
          <div className="col-span-3 h-[700px]">
            <ChatPanel 
              messages={chatMessages}
              onSendMessage={handleSendChat}
            />
          </div>

          {/* Center: Video Stream */}
          <div className="col-span-6">
            <VideoStream
              viewers={viewers}
              timeRemaining={formatTimeRemaining(timeRemaining)}
            />
          </div>

          {/* Right: Bidding Panel */}
          <div className="col-span-3 h-[700px]">
            <BiddingPanel
              title={auction.title}
              currentBid={currentBid}
              timeRemaining={formatTimeRemaining(timeRemaining)}
              bidIncrement={auction.bidIncrement}
              auctionId={auction.auctionId}
              recentBids={recentBids}
              currentUserId={currentUserId || undefined}
              highBidderId={highBidderId || undefined}
              isHost={isHost}
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
          watchCount={viewers}
          startTime={auction.startTime}
          endTime={auction.endTime}
        />
      </div>
    </div>
  );
}
