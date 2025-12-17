import { Send, Smile, Info, Lock, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import * as Popover from '@radix-ui/react-popover';

interface Message {
  id: string;
  type: 'user' | 'system' | 'auctioneer';
  username?: string;
  message: string;
  timestamp: string;
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
  sellerName?: string;
  isEnded?: boolean;
}

export function ChatPanel({ messages = [], onSendMessage, sellerName, isEnded }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const formattedMessages: Message[] = messages.map((msg, index) => {
    const date = new Date(typeof msg.timestamp === 'number' ? msg.timestamp : Date.now());
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    let messageType = (msg.type as 'user' | 'system' | 'auctioneer') || 'user';
    if (sellerName && msg.username === sellerName) messageType = 'auctioneer';

    return {
      id: msg.id || `msg-${index}`,
      type: messageType,
      username: msg.username,
      message: msg.message,
      timestamp: timeStr,
    };
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSend = () => {
    if (message.trim() && onSendMessage && !isEnded) {
      onSendMessage(message.trim());
      setMessage('');
      setIsPickerOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border h-full flex flex-col shadow-sm overflow-hidden relative">
      
      {/* 1. CENTERED DISABLED OVERLAY */}
      {isEnded && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center transition-all animate-in fade-in duration-300">
          {/* Stronger Blur Background */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
          
          <div className="relative flex flex-col items-center gap-4 text-center px-6">
            <div className="bg-gray-900 p-4 rounded-full shadow-2xl ring-4 ring-white">
              <Lock className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-gray-900 uppercase tracking-[0.25em]">
                Chat Disabled
              </span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Auction has concluded
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Header */}
      <div className="px-4 py-3 border-b border-border bg-gray-50/50">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          Live Chat
          {!isEnded && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
        </h4>
      </div>

      {/* 3. Messages List */}
      <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
        <div className="space-y-4 pt-2">
          {formattedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 opacity-40">
              <Info className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Welcome! Say something...</p>
            </div>
          ) : (
            formattedMessages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'auctioneer' ? (
                  <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-blue-700">{msg.username}</span>
                      <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Host</span>
                      <span className="text-[10px] text-blue-400 ml-auto">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-blue-900 leading-snug">{msg.message}</p>
                  </div>
                ) : (
                  <div className="flex flex-col px-1 group">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{msg.username}</span>
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{msg.timestamp}</span>
                    </div>
                    <p className="text-[13px] text-gray-700 leading-snug">{msg.message}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* 4. Input Area */}
      <div className="p-4 border-t border-border bg-white relative">
        <div className="relative flex items-center gap-2 p-1.5 bg-secondary/30 rounded-lg border border-border focus-within:ring-1 focus-within:ring-accent/50 transition-all">
          
          <Popover.Root open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <Popover.Trigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className={`w-8 h-8 rounded-md shrink-0 ${isPickerOpen ? 'bg-secondary text-accent' : 'text-muted-foreground'}`}
                disabled={isEnded}
              >
                <Smile className="w-5 h-5" />
              </Button>
            </Popover.Trigger>
            
            {/* Popover without Portal to stay fixed to the chat panel */}
            <Popover.Content 
              side="top" 
              align="start" 
              sideOffset={8} 
              className="z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="rounded-xl border border-border bg-white shadow-2xl overflow-hidden w-[280px]">
                
                {/* Emoji Picker Header with Visible Cross Close button */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-border">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emojis</span>
                   <button 
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-600 hover:text-black"
                   >
                     <X className="w-4 h-4" strokeWidth={2.5} />
                   </button>
                </div>

                <EmojiPicker 
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  theme={Theme.LIGHT}
                  width="100%" 
                  height={300} 
                  previewConfig={{ showPreview: false }}
                  searchPlaceholder="Search..."
                  skinTonesDisabled
                />
              </div>
            </Popover.Content>
          </Popover.Root>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEnded ? "Bidding ended" : "Type a message..."}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 h-8 text-sm placeholder:text-muted-foreground/60"
            disabled={isEnded}
          />
          
          <Button 
            onClick={handleSend}
            size="sm"
            disabled={!message.trim() || isEnded}
            className="h-8 w-8 p-0 bg-accent hover:bg-accent/90 shrink-0 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}