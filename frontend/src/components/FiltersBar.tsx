import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Filters {
  category: string;
  priceRange: string;
  timeRange: string;
}

interface FiltersBarProps {
  filters: Filters;
  onFilterChange?: (filters: Filters) => void;
  onClear?: () => void;
}

export function FiltersBar({ filters, onFilterChange, onClear }: FiltersBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange?.({ ...filters, [key]: value });
  };

  return (
    <div className="bg-secondary/30 border-b border-border py-4">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Category */}
          <Select value={filters.category} onValueChange={(val) => handleChange("category", val)}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="watches">Watches</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
              <SelectItem value="collectibles">Collectibles</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={filters.priceRange} onValueChange={(val) => handleChange("priceRange", val)}>
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
          <Select value={filters.timeRange} onValueChange={(val) => handleChange("timeRange", val)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Time Remaining" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Auctions</SelectItem>
              <SelectItem value="1h">Within 1 Hour</SelectItem>
              <SelectItem value="6h">Within 6 Hours</SelectItem>
              <SelectItem value="24h">Within 24 Hours</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1"></div>

          {/* Clear All */}
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}