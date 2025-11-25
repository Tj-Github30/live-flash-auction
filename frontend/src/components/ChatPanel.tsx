import { Send, Smile } from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'system' | 'auctioneer';
  username?: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'system',
    message: 'Auction started',
    timestamp: '2:45 PM',
  },
  {
    id: '2',
    type: 'user',
    username: 'ArtCollector99',
    message: 'Beautiful piece!',
    timestamp: '2:46 PM',
  },
  {
    id: '3',
    type: 'system',
    message: 'User_7854 placed a bid of $145,500',
    timestamp: '2:47 PM',
  },
  {
    id: '4',
    type: 'auctioneer',
    username: 'Auctioneer',
    message: 'We have $145,500. Do I hear $146,000?',
    timestamp: '2:47 PM',
  },
  {
    id: '5',
    type: 'user',
    username: 'LuxuryWatch',
    message: 'Incredible condition 🔥',
    timestamp: '2:48 PM',
  },
  {
    id: '6',
    type: 'user',
    username: 'Collector_42',
    message: 'How many pieces were made?',
    timestamp: '2:49 PM',
  },
  {
    id: '7',
    type: 'auctioneer',
    username: 'Auctioneer',
    message: 'This is a limited production run. Very rare.',
    timestamp: '2:49 PM',
  },
  {
    id: '8',
    type: 'system',
    message: 'WatchEnthusiast placed a bid of $146,000',
    timestamp: '2:50 PM',
  },
];

export function ChatPanel() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h4>Live Chat</h4>
        <p className="text-xs text-muted-foreground">Join the conversation</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {mockMessages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'system' && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full inline-block">
                    {msg.message}
                  </p>
                </div>
              )}

              {msg.type === 'auctioneer' && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-accent">
                          {msg.username}
                        </p>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground break-words">{msg.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'user' && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {msg.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-foreground">
                        {msg.username}
                      </p>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground break-words">{msg.message}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button variant="ghost" size="sm" className="p-2">
            <Smile className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button 
            onClick={handleSend}
            size="sm"
            className="bg-accent hover:bg-accent/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
