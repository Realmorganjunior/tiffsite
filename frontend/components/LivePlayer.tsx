'use client';
import { useState, useEffect } from 'react';

export default function LivePlayer() {
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Function to check your backend live status
  const checkLiveStatus = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/live');
      const data = await res.json();
      setStream(data);
    } catch (err) {
      console.error('Failed to fetch live status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check immediately when page loads
    checkLiveStatus();

    // Poll every 10 seconds to catch when you go live automatically
    const interval = setInterval(checkLiveStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-zinc-400">Loading broadcast...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
      {/* Stream Header & Live Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {stream?.is_live ? stream.title : 'Broadcast Offline'}
        </h2>
        {stream?.is_live ? (
          <span className="flex items-center space-x-2 px-3 py-1 bg-red-600/20 border border-red-500/50 text-red-500 text-xs font-semibold rounded-full animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>LIVE NOW</span>
          </span>
        ) : (
          <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-full">
            OFFLINE
          </span>
        )}
      </div>

      {/* Video Player or Offline Card */}
      {stream?.is_live && stream?.embed_url ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
          {/* If your embed_url is an iframe (like YouTube/Twitch/custom player) */}
          <iframe
            src={stream.embed_url}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="w-full aspect-video rounded-xl bg-zinc-950 border border-zinc-800/60 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 text-xl">
            🎥
          </div>
          <p className="text-zinc-300 font-medium">No live broadcast right now</p>
          <p className="text-zinc-500 text-sm max-w-sm">
            Check back later or sign up for the waitlist to get notified the second we go live.
          </p>
        </div>
      )}
    </div>
  );
}