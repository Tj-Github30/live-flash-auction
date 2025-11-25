import { CheckCircle2, User } from 'lucide-react';

const mockSoldItems = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1481980235850-66e47651e431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWFtb25kJTIwamV3ZWxyeXxlbnwxfHx8fDE3NjI5OTgxOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Vintage Diamond Bracelet - Art Deco Style',
    finalPrice: 15800,
    soldDate: '2 days ago',
    buyer: 'User_7854',
    bids: 34,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1601924928357-22d3b3abfcfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWd8ZW58MXx8fHwxNzYyOTk4MTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Louis Vuitton Speedy 30 - Monogram Canvas',
    finalPrice: 1250,
    soldDate: '5 days ago',
    buyer: 'Collector_42',
    bids: 18,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1544691560-fc2053d97726?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwZnVybml0dXJlfGVufDF8fHx8MTc2Mjk5ODE5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Chippendale Mahogany Chair - Circa 1780',
    finalPrice: 8400,
    soldDate: '1 week ago',
    buyer: 'Antiques_Pro',
    bids: 27,
  },
];

export function SoldItems() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Final Price</div>
          <div className="col-span-2 text-center">Sold Date</div>
          <div className="col-span-3">Buyer</div>
        </div>

        {/* Table Rows */}
        {mockSoldItems.map((item) => (
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
                    <CheckCircle2 className="w-3 h-3" />
                    Sold
                  </span>
                  <span className="text-xs text-muted-foreground">{item.bids} bids</span>
                </div>
              </div>
            </div>

            {/* Final Price */}
            <div className="col-span-2 flex items-center justify-end">
              <div className="text-right">
                <p className="text-accent">${item.finalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Sold Date */}
            <div className="col-span-2 flex items-center justify-center">
              <p className="text-muted-foreground">{item.soldDate}</p>
            </div>

            {/* Buyer */}
            <div className="col-span-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-foreground">{item.buyer}</span>
            </div>
          </div>
        ))}
      </div>

      {mockSoldItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No sold items yet</p>
        </div>
      )}
    </div>
  );
}
