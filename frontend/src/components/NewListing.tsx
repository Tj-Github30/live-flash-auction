import { Loader2, Upload, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function NewListing() {
  const navigate = useNavigate();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [sellerName, setSellerName] = useState(""); 
  // 1. New State for Condition
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [duration, setDuration] = useState("");
  const [customDurationValue, setCustomDurationValue] = useState<string>("");
  const [customDurationUnit, setCustomDurationUnit] = useState<"minutes" | "hours">("minutes");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("--- STORAGE DEBUG ---");
    console.log("LocalStorage Keys:", Object.keys(localStorage));
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
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

  const getDurationSeconds = (): number | null => {
    if (!duration) return null;

    if (duration !== "custom") {
      return convertDurationToSeconds(duration);
    }

    const n = Number(customDurationValue);
    if (!Number.isFinite(n) || n <= 0) return null;

    const seconds = customDurationUnit === "hours" ? Math.round(n * 3600) : Math.round(n * 60);
    return seconds > 0 ? seconds : null;
  };

  const getAuthToken = () => {
    console.log("Starting Token Search...");
    const isToken = (val: string | null) => val && val.startsWith("ey");

    const directKeys = ["idToken", "accessToken", "token", "authToken"];
    for (const key of directKeys) {
      if (isToken(localStorage.getItem(key))) return localStorage.getItem(key);
      if (isToken(sessionStorage.getItem(key))) return sessionStorage.getItem(key);
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key);
      
      if ((key.includes("idToken") || key.includes("accessToken")) && isToken(val)) {
        return val;
      }

      try {
        if (val && val.includes("{")) {
          const parsed = JSON.parse(val);
          if (isToken(parsed.idToken)) return parsed.idToken;
          if (isToken(parsed.accessToken)) return parsed.accessToken;
          if (isToken(parsed.token)) return parsed.token;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

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
    if (!sellerName.trim()) {
      setError("Please enter a seller name");
      return;
    }
    // 2. Validate Condition
    if (!condition.trim()) {
      setError("Please enter the item condition");
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
    const durationSeconds = getDurationSeconds();
    if (!durationSeconds) {
      setError(duration === "custom"
        ? "Please enter a valid custom duration"
        : "Please select an auction duration");
      return;
    }

    setIsLoading(true);

    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.error("LocalStorage Keys Available:", Object.keys(localStorage));
        throw new Error("Could not find login credentials. Please refresh the page and login again.");
      }

      // 3. Add Condition to payload
      const payload = {
        title: title.trim(),
        seller_name: sellerName.trim(), 
        description: description.trim() || undefined,
        category: category,
        condition: condition.trim(), // <--- Sending condition
        starting_bid: parseFloat(startingBid),
        duration: durationSeconds,
        image_url: images.length > 0 ? images[0] : "",
        images: images.length > 1 ? images.slice(1) : []
      };

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

      console.log("Auction created:", data);
      setSuccess(true);
      setError("");

      try {
        window.dispatchEvent(new CustomEvent("auction:created", { detail: data }));
      } catch {
        // ignore
      }
      
      // Reset form
      setTitle("");
      setSellerName(""); 
      setCondition(""); // Reset condition
      setDescription("");
      setCategory("");
      setStartingBid("");
      setDuration("");
      setCustomDurationValue("");
      setCustomDurationUnit("minutes");
      setImages([]);

      setTimeout(() => {
        if (data.auction_id) {
          navigate(`/auction/${data.auction_id}`, { replace: true });
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
            <Label htmlFor="sellerName">Seller Name</Label>
            <Input
              id="sellerName"
              type="text"
              placeholder="e.g., John Doe"
              className="mt-2"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
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