import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function NewListing() {
  const [images, setImages] = useState<string[]>([]);

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg border border-border p-8">
        <h3 className="mb-6">Create New Listing</h3>

        <form className="space-y-6">
          {/* Images */}
          <div>
            <Label>Item Images</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload high-quality images of your item (up to 10 images)
            </p>
            
            <div className="grid grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 10 && (
                <button
                  type="button"
                  className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-secondary/30 transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Item Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Vintage Rolex Submariner - 1960s"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the item's condition, provenance, and any relevant details..."
              className="mt-2 min-h-32"
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="watches">Watches</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="collectibles">Collectibles</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="books">Books & Manuscripts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pricing */}
          <div>
            <Label htmlFor="starting-bid">Starting Bid</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="starting-bid"
                type="number"
                placeholder="1000"
                className="pl-7"
              />
            </div>
          </div>

          {/* Auction Duration */}
          <div>
            <Label>Auction Duration</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="3h">3 Hours</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="12h">12 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Launch Auction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}