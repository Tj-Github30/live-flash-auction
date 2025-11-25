import { User, Package, Calendar, Eye, Hash } from 'lucide-react';

interface ItemDetailsSectionProps {
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
}

export function ItemDetailsSection({
  description,
  category,
  condition,
  year,
  seller,
  auctionId,
  totalBids,
  watchCount,
  startTime,
  endTime,
}: ItemDetailsSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
      <div className="grid grid-cols-2 gap-12">
        {/* Left: Item Details */}
        <div>
          <h3 className="mb-4">Item Details</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-muted-foreground mb-2">Description</h4>
              <p className="text-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm text-muted-foreground">Category</h4>
                </div>
                <p className="text-foreground">{category}</p>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-1">Condition</h4>
                <p className="text-foreground">{condition}</p>
              </div>

              {year && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm text-muted-foreground">Year</h4>
                  </div>
                  <p className="text-foreground">{year}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Auction Metadata */}
        <div>
          <h3 className="mb-4">Auction Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">Seller</h4>
                <p className="text-foreground">{seller}</p>
                <p className="text-xs text-muted-foreground mt-1">Verified Seller</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm text-muted-foreground">Auction ID</h4>
                </div>
                <p className="text-foreground">{auctionId}</p>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-1">Total Bids</h4>
                <p className="text-foreground">{totalBids}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm text-muted-foreground">Watchers</h4>
                </div>
                <p className="text-foreground">{watchCount}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Start Time</span>
                  <span className="text-sm text-foreground">{startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">End Time</span>
                  <span className="text-sm text-foreground">{endTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
