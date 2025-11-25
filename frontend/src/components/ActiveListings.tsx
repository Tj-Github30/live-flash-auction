import { Clock, Eye, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';

const mockActiveListings = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjI5NjM0OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Vintage Rolex Submariner - 1970s',
    currentBid: 24500,
    timeLeft: '3h 45m',
    viewers: 187,
    bids: 23,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1706811833540-2a1054cddafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjI4ODcwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Original Abstract Painting - Acrylic on Canvas',
    currentBid: 1800,
    timeLeft: '1h 20m',
    viewers: 54,
    bids: 12,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2Mjk0NDI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Hasselblad 500C/M Medium Format Camera',
    currentBid: 2200,
    timeLeft: '5h 15m',
    viewers: 42,
    bids: 8,
  },
];

export function ActiveListings() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Current Bid</div>
          <div className="col-span-2 text-center">Time Left</div>
          <div className="col-span-2 text-center">Activity</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Rows */}
        {mockActiveListings.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
          >
            {/* Item Info */}
            <div className="col-span-5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="line-clamp-2 mb-1">{item.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    LIVE
                  </span>
                  <span className="text-xs text-muted-foreground">{item.bids} bids</span>
                </div>
              </div>
            </div>

            {/* Current Bid */}
            <div className="col-span-2 flex items-center justify-end">
              <div className="text-right">
                <p className="text-accent">${item.currentBid.toLocaleString()}</p>
              </div>
            </div>

            {/* Time Left */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-foreground">
                <Clock className="w-4 h-4" />
                <span>{item.timeLeft}</span>
              </div>
            </div>

            {/* Activity */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{item.viewers}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {mockActiveListings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No active listings</p>
        </div>
      )}
    </div>
  );
}
