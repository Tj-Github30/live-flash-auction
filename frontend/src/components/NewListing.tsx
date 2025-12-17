import { Loader2, Upload, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { api, apiJson } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function NewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [duration, setDuration] = useState('1h');
  const [customDurationValue, setCustomDurationValue] = useState('');
  const [customDurationUnit, setCustomDurationUnit] = useState<'minutes' | 'hours'>('hours');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const computeDurationSeconds = () => {
    switch (duration) {
      case '1h': return 3600;
      case '3h': return 3 * 3600;
      case '6h': return 6 * 3600;
      case '12h': return 12 * 3600;
      case '24h': return 24 * 3600;
      case 'custom': {
        const val = parseInt(customDurationValue || '0', 10);
        if (!val || val <= 0) return 0;
        return customDurationUnit === 'minutes' ? val * 60 : val * 3600;
      }
      default: return 0;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      if (!title.trim()) throw new Error('Title is required');
      if (!category) throw new Error('Category is required');
      if (!startingBid) throw new Error('Starting bid is required');
      const durationSeconds = computeDurationSeconds();
      if (!durationSeconds) throw new Error('Duration must be greater than 0');

      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        starting_bid: parseFloat(startingBid),
        duration: durationSeconds,
        condition: condition.trim() || undefined,
        image_url: images[0] || undefined,
        images: images,
      };

      const sellerName = user?.email || user?.name || user?.username;
      if (sellerName) {
        payload.seller_name = sellerName;
      }

      const resp = await api.post('/api/auctions', payload);
      const created = await apiJson<{ auction_id: string }>(resp);

      window.dispatchEvent(new CustomEvent("auction:created"));
      setSuccess(true);
      // Navigate host directly to the auction room
      if (created?.auction_id) {
        navigate(`/auction/${created.auction_id}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
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
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                try {
                  const dataUrls = await Promise.all(files.map(fileToDataUrl));
                  setImages((prev) => [...prev, ...dataUrls].slice(0, 10));
                } catch (err) {
                  setError('Failed to read one or more files. Please try again.');
                }
              }}
            />

            <div className="grid grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
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
                  onClick={triggerFileUpload}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Seller Name */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the item's condition, provenance, and any relevant details..."
            className="mt-2 min-h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue  placeholder="Select a category"  />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="watches">Watches</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="collectibles">Collectibles</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="books">Books & Manuscripts</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="home-kitchen">Home &amp; Kitchen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. New Condition Field */}
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Input
              id="condition"
              type="text"
              placeholder="e.g., Brand New, Like New, Used - Good Condition"
              className="mt-2"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
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
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
              />
            </div>
          </div>

          {/* Auction Duration */}
          <div>
            <Label>Auction Duration</Label>
            <Select value={duration} onValueChange={setDuration}> 
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="3h">3 Hours</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="12h">12 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {duration === "custom" && (
              <div className="mt-3 flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor="custom-duration" className="text-xs text-muted-foreground">
                    Custom duration
                  </Label>
                  <Input
                    id="custom-duration"
                    type="number"
                    min="1"
                    step="1"
                    placeholder={customDurationUnit === "hours" ? "e.g., 2" : "e.g., 30"}
                    className="mt-2"
                    value={customDurationValue}
                    onChange={(e) => setCustomDurationValue(e.target.value)}
                  />
                </div>

                <div className="w-40">
                  <Label className="text-xs text-muted-foreground">Unit</Label>
                  <Select
                    value={customDurationUnit}
                    onValueChange={(v) => setCustomDurationUnit(v as "minutes" | "hours")}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border">
            {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4">
                  Auction created successfully! Redirecting...
                </div>
              )}
             <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Auction...
                </>
              ) : (
                "Launch Auction"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}