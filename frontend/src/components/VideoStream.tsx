import { Eye, Volume2, VolumeX, Maximize, Clock } from 'lucide-react';
import { useState } from 'react';

interface VideoStreamProps {
  viewers: number;
  timeRemaining: string;
}

export function VideoStream({ viewers, timeRemaining }: VideoStreamProps) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-lg relative aspect-video">
      {/* Video Placeholder */}
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="w-24 h-24 border-4 border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
          <p>Live Stream</p>
        </div>
      </div>

      {/* LIVE Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-sm tracking-wide">LIVE</span>
      </div>

      {/* Viewer Count */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
        <Eye className="w-4 h-4" />
        <span className="text-sm">{viewers} watching</span>
      </div>

      {/* Countdown Timer Overlay */}
      <div className="absolute bottom-16 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <div>
            <p className="text-xs text-white/60 mb-0.5">Time Remaining</p>
            <p className="text-sm">{timeRemaining}</p>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-white rounded-full"></div>
            </div>
          </div>
          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
