import { ChevronDown, X, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FiltersBarProps {
  onFilterChange?: (category: string | null) => void;
}

export function FiltersBar({ onFilterChange }: FiltersBarProps) {
  const handleCategoryChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange(value === 'all' ? null : value);
    }
  };

  return (
    <div className="bg-secondary/30 border-b border-border py-4">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Category */}
          <Select defaultValue="all" onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="watches">Watches</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
              <SelectItem value="collectibles">Collectibles</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-1000">Under $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="10000+">$10,000+</SelectItem>
            </SelectContent>
          </Select>

          {/* Time Remaining */}
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Time Remaining" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Auctions</SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="1h">Within 1 Hour</SelectItem>
              <SelectItem value="6h">Within 6 Hours</SelectItem>
              <SelectItem value="24h">Within 24 Hours</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select defaultValue="ending-soon">
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1"></div>

          {/* Search */}
          <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          {/* Clear All */}
          <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}