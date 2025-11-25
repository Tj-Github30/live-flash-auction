import { FiltersBar } from './FiltersBar';
import { AuctionCard } from './AuctionCard';

export const mockAuctions = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjI5NjM0OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Patek Philippe Nautilus 5711 - Rare Steel Edition',
    currentBid: 145000,
    timeRemaining: '2h 15m',
    viewers: 234,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1706811833540-2a1054cddafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjI4ODcwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Contemporary Abstract Oil Painting by Emerging Artist',
    currentBid: 3200,
    timeRemaining: '45m',
    viewers: 89,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1481980235850-66e47651e431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWFtb25kJTIwamV3ZWxyeXxlbnwxfHx8fDE3NjI5OTgxOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: '3.5 Carat Diamond Solitaire Ring - VVS1 Clarity',
    currentBid: 28500,
    timeRemaining: '1h 30m',
    viewers: 156,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2Mjk0NDI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Leica M3 Vintage Camera - Mint Condition (1954)',
    currentBid: 4800,
    timeRemaining: '3h 20m',
    viewers: 67,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1601924928357-22d3b3abfcfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWd8ZW58MXx8fHwxNzYyOTk4MTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Hermès Birkin 35 - Togo Leather in Étoupe',
    currentBid: 18900,
    timeRemaining: '5h 10m',
    viewers: 312,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1544691560-fc2053d97726?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwZnVybml0dXJlfGVufDF8fHx8MTc2Mjk5ODE5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Louis XVI Gilt Bronze Console Table - 18th Century',
    currentBid: 12400,
    timeRemaining: '4h 45m',
    viewers: 45,
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1720303429758-92e2123800cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3VscHR1cmUlMjBhcnR8ZW58MXx8fHwxNzYyOTM4NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Contemporary Bronze Sculpture - Limited Edition 5/25',
    currentBid: 7200,
    timeRemaining: '2h 55m',
    viewers: 78,
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1533511105234-0029ad9ac542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXJlJTIwYm9va3N8ZW58MXx8fHwxNzYyOTk4MjAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'First Edition "The Great Gatsby" - Near Fine Condition',
    currentBid: 9600,
    timeRemaining: '6h 30m',
    viewers: 92,
  },
];

interface BuyPageProps {
  onAuctionClick: (auctionId: string) => void;
}

export function BuyPage({ onAuctionClick }: BuyPageProps) {
  return (
    <div className="pt-[137px]">
      <FiltersBar />
      
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-foreground mb-1">Live Auctions</h2>
          <p className="text-muted-foreground">
            {mockAuctions.length} items currently live
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockAuctions.map((auction) => (
            <AuctionCard 
              key={auction.id} 
              {...auction} 
              onClick={() => onAuctionClick(auction.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
