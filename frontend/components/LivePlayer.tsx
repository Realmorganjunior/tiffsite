'use client';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';

export type LiveStream = {
  id: number;
  title: string;
  embed_url: string;
  thumbnail_url: string | null;
  is_live: boolean;
  createdat: string;
};

function getEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.hostname === 'youtu.be'
      ? parsedUrl.pathname.slice(1)
      : parsedUrl.pathname.startsWith('/shorts/')
        ? parsedUrl.pathname.split('/')[2]
        : parsedUrl.searchParams.get('v');

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return url;
  }
}

export default function LivePlayer({ onLiveChange }: { onLiveChange?: (isLive: boolean) => void }) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkLiveStatus = async () => {
      let nextStream: LiveStream | null = null;
      let nextIsLive = false;

      try {
        const res = await fetch(`${API_BASE_URL}/api/live`);
        if (!res.ok) throw new Error('Live status request failed');
        nextStream = await res.json();
        nextIsLive = Boolean(nextStream?.is_live);
      } catch (error) {
        console.error('Failed to fetch live status:', error);
      }

      if (!cancelled) {
        setStream(nextStream);
        onLiveChange?.(nextIsLive);
        setLoading(false);
      }
    };

    void checkLiveStatus();
    const interval = setInterval(() => void checkLiveStatus(), 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onLiveChange]);

  if (loading) return <div className="text-zinc-400">Loading broadcast...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
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

      {stream?.is_live && stream?.embed_url ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
          <iframe
            src={getEmbedUrl(stream.embed_url)}
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