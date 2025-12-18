import { Send, Smile, Lock, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import * as Popover from '@radix-ui/react-popover';

interface ChatPanelProps {
  messages?: Array<{
    id?: string;
    username?: string;
    message: string;
    timestamp: number | string;
  }>;
  onSendMessage?: (message: string) => void;
  isEnded?: boolean;
  isHostView?: boolean;
}

export function ChatPanel({ messages = [], onSendMessage, isEnded, isHostView }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && onSendMessage && !isEnded) {
      onSendMessage(message.trim());
      setMessage('');
      setIsPickerOpen(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] rounded-xl border border-border h-full max-h-full flex flex-col shadow-sm overflow-hidden relative font-sans">
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <h4 className="font-bold text-[13px] text-gray-800 flex items-center gap-2 uppercase tracking-tight">
          Live Chat {!isEnded && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
        </h4>
      </div>
      <ScrollArea className="flex-1 w-full overflow-hidden" ref={scrollAreaRef}>
        <div className="flex flex-col gap-3 p-4 min-h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-20">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Welcome to the stream</span>
            </div>
          ) : (
            messages.map((msg, index) => {
              // --- LOGIC FIX ---
              // The parent already sends "Bidder XXXX (You)" as the username string.
              const label = msg.username || 'Guest';
              const isMe = label.includes('(You)');
              const isHost = label === 'Host';

              const date = new Date(typeof msg.timestamp === 'number' ? msg.timestamp : Date.now());
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <div key={msg.id || index} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[10px] font-bold mb-1 px-1 tracking-tight flex items-center gap-1 ${isHost || isMe ? 'text-black' : 'text-gray-500'}`}>
                    {label}
                  </span>

                  <div className="relative group" style={{ display: 'table', maxWidth: '85%' }}>
                    <div className={`px-3 py-1.5 rounded-2xl shadow-sm border ${
                      isHost ? 'bg-black border-transparent' : 'bg-white border-gray-200'
                    } ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span style={{ color: isHost ? '#ffffff' : '#1a1a1a' }} className="text-[13px] leading-snug font-medium break-words">
                          {msg.message}
                        </span>
                        <span style={{ color: isHost ? 'rgba(255, 255, 255, 0.4)' : '#9ca3af' }} className="text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap pt-1">
                          {timeStr}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2 px-3 bg-gray-100 rounded-full h-10 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
          <Popover.Root open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <Popover.Trigger asChild>
              <button disabled={isEnded} className="text-gray-400 hover:text-amber-500 transition-colors shrink-0 outline-none">
                <Smile className="w-5 h-5" />
              </button>
            </Popover.Trigger>
            <Popover.Content side="top" className="z-[110] shadow-2xl border rounded-2xl overflow-hidden mb-2 outline-none">
              <EmojiPicker onEmojiClick={(d) => setMessage(p => p + d.emoji)} theme={Theme.LIGHT} width={300} height={350} previewConfig={{ showPreview: false }} />
            </Popover.Content>
          </Popover.Root>

          <Input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={isEnded ? "Chat ended" : "Type a message..."} 
            className="flex-1 border-none bg-transparent focus-visible:ring-0 text-[13px] h-full shadow-none outline-none text-black placeholder:text-gray-400" 
            disabled={isEnded}
          />

          {isEnded && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center gap-2 text-center px-6">
            <div className="bg-black p-3 rounded-full shadow-xl"><Lock className="w-5 h-5 text-white" /></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-black uppercase tracking-widest">Chat Locked</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Auction Concluded</span>
            </div>
          </div>
        </div>
      )}

      

      
          
          <button onClick={handleSend} disabled={!message.trim() || isEnded} className="text-black disabled:text-gray-300 shrink-0 transition-transform active:scale-90">
            <Send className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}