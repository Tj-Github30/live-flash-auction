import { Loader2, Upload, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function NewListing() {

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DEBUGGER: Run this once to see what is actually in storage ---
  useEffect(() => {
    console.log("--- STORAGE DEBUG ---");
    console.log("LocalStorage Keys:", Object.keys(localStorage));
    // If you are using sessionStorage, this will show it:
    console.log("SessionStorage Keys:", Object.keys(sessionStorage));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (images.length >= 10) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // CRITICAL FIX: Reset the input value so you can upload the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    // Debugging: Check if the ref exists
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input ref not found!");
    }
  };

  const convertDurationToSeconds = (durationStr: string): number => {
    const durationMap: { [key: string]: number } = {
      "1h": 3600,
      "3h": 10800,
      "6h": 21600,
      "12h": 43200,
      "24h": 86400
    };
    return durationMap[durationStr] || 3600;
  };

  // --- IMPROVED TOKEN FINDER (DEEP SCAN) ---
  const getAuthToken = () => {
    console.log("Starting Token Search...");

    // Helper to check if a value looks like a JWT (starts with "ey...")
    const isToken = (val: string | null) => val && val.startsWith("ey");

    // 1. Try Direct Keys in LocalStorage & SessionStorage
    const directKeys = ["idToken", "accessToken", "token", "authToken"];
    for (const key of directKeys) {
      if (isToken(localStorage.getItem(key))) return localStorage.getItem(key);
      if (isToken(sessionStorage.getItem(key))) return sessionStorage.getItem(key);
    }

    // 2. Scan ALL LocalStorage Keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key);
      
      // A. Check if the value itself is the token (Cognito style)
      if ((key.includes("idToken") || key.includes("accessToken")) && isToken(val)) {
        console.log(`Found token in direct key: ${key}`);
        return val;
      }

      // B. DEEP SCAN: Check if value is a JSON object containing the token
      // (Common in Redux Persist or Auth Libraries)
      try {
        if (val && val.includes("{")) { // Optimization: only parse if looks like object
          const parsed = JSON.parse(val);
          if (isToken(parsed.idToken)) {
            console.log(`Found token INSIDE JSON object at key: ${key}`);
            return parsed.idToken;
          }
          if (isToken(parsed.accessToken)) {
            console.log(`Found token INSIDE JSON object at key: ${key}`);
            return parsed.accessToken;
          }
          if (isToken(parsed.token)) return parsed.token;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // 3. Scan SessionStorage (just in case)
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      const val = sessionStorage.getItem(key);
      if ((key.includes("idToken") || key.includes("accessToken")) && isToken(val)) {
        return val;
      }
    }

    console.warn("Token search finished: NO TOKEN FOUND.");
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (!title.trim()) {
      setError("Please enter an item title");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!startingBid || parseFloat(startingBid) <= 0) {
      setError("Please enter a valid starting bid");
      return;
    }
    if (!duration) {
      setError("Please select an auction duration");
      return;
    }

    setIsLoading(true);

    try {
      // Get auth token using the new Deep Scan function
      const authToken = getAuthToken();
      
      if (!authToken) {
        // Log the available keys to help debug
        console.error("LocalStorage Keys Available:", Object.keys(localStorage));
        throw new Error("Could not find login credentials. Please refresh the page and login again.");
      }

      // Prepare payload for API
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category,
        starting_bid: parseFloat(startingBid),
        duration: convertDurationToSeconds(duration),
        image_url: images.length > 0 ? images[0] : "", // Main image
        images: images
      };

      // Call your backend API
      const response = await fetch(`${API_BASE_URL}/api/auctions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create auction");
      }

      // Success!
      console.log("Auction created:", data);
      setSuccess(true);
      setError("");
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setStartingBid("");
      setDuration("");
      setImages([]);

      // Redirect to auction page after 2 seconds
      setTimeout(() => {
        if (data.auction_id) {
          window.location.href = `/auctions/${data.auction_id}`;
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create auction");
      console.error("Auction creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }} 
            />
            
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

          {/* Description */}
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
              </SelectContent>
            </Select>
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