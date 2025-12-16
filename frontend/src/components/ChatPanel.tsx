import { Send, Smile } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

interface ChatPanelProps {
  messages?: Array<{
    id?: string;
    type?: string;
    username?: string;
    message: string;
    timestamp: number | string;
  }>;
  onSendMessage?: (message: string) => void;
}

export function ChatPanel({ messages = [], onSendMessage }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Format messages for display
  const formattedMessages: Message[] = messages.map((msg, index) => {
    const date = new Date(typeof msg.timestamp === 'number' ? msg.timestamp : Date.now());
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    return {
      id: msg.id || `msg-${index}`,
      type: (msg.type as 'user' | 'system' | 'auctioneer') || 'user',
      username: msg.username,
      message: msg.message,
      timestamp: timeStr,
    };
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
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
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {formattedMessages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            formattedMessages.map((msg) => (
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
            ))
          )}
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
