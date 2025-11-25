import { Clock, Eye, Heart } from 'lucide-react';
import { useState } from 'react';


interface AuctionCardProps {
  id: string;
  image: string;
  title: string;
  currentBid: number;
  timeRemaining: string;
  viewers: number;
  onClick?: () => void;
}

export function AuctionCard({ image, title, currentBid, timeRemaining, viewers, onClick }: AuctionCardProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* LIVE Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs tracking-wide">LIVE</span>
        </div>

        {/* Watchlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWatchlisted(!isWatchlisted);
          }}
          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${isWatchlisted ? 'fill-accent text-accent' : 'text-foreground'}`}
          />
        </button>

        {/* Viewers */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white">
          <Eye className="w-3.5 h-3.5" />
          <span className="text-xs">{viewers}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2">{title}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Current Bid</p>
            <p className="text-accent tracking-wide">
              ${currentBid.toLocaleString()}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Time Left</p>
            <div className="flex items-center gap-1 text-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
