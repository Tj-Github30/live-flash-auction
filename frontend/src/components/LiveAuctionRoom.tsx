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

interface BidUpdate {
  type: string;
  auction_id: string;
  high_bid: number;
  high_bidder_username: string;
  top_bids: Array<{ username: string; amount: number; timestamp: string }>;
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
  const [highBidderUsername, setHighBidderUsername] = useState<string | null>(null);

  const currentUsername =
    user?.["cognito:username"] || user?.username || user?.sub || null;

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
      if (typeof data.high_bidder_username === 'string') {
        setHighBidderUsername(data.high_bidder_username || null);
      }
      if (data.participant_count) {
        setViewers(data.participant_count);
      }
      if (data.top_bids) {
        setRecentBids(data.top_bids.map((bid: any) => ({
          username: bid.username || bid.high_bidder_username,
          amount: bid.amount || bid.high_bid,
          timestamp: bid.timestamp || 'now'
        })));
      }
    });

    // Bid updates
    socket.on('bid_update', (data: BidUpdate) => {
      console.log('Bid update:', data);
      setCurrentBid(data.high_bid);
      setViewers(data.participant_count);
      if (typeof data.high_bidder_username === 'string') {
        setHighBidderUsername(data.high_bidder_username || null);
      }
      if (data.top_bids) {
        setRecentBids(data.top_bids.map(bid => ({
          username: bid.username,
          amount: bid.amount,
          timestamp: bid.timestamp
        })));
      }
    });

    // Chat messages
    socket.on('chat_message', (data: ChatMessage) => {
      console.log('Chat message:', data);
      setChatMessages(prev => [...prev, {
        ...data,
        id: `${data.user_id}-${data.timestamp}`
      }]);
    });

    // Timer updates
    socket.on('timer_update', (data: { time_remaining: string }) => {
      if (data.time_remaining) {
        setTimeRemaining(data.time_remaining);
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
              currentUsername={currentUsername || undefined}
              highBidderUsername={highBidderUsername || undefined}
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
