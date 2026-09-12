// start where I paste
// Line 1
'use client';
import { useState, useEffect } from 'react';

export default function LiveAdmin() {
  const [title, setTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentStreamId, setCurrentStreamId] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Check if you are currently live when the panel loads
  useEffect(() => {
    fetch('http://localhost:4000/api/live')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setCurrentStreamId(data.id);
          setIsLive(data.is_live);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setStatusMessage('Uploading image to Supabase...');

    try {
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setThumbnailUrl(data.url);
        setStatusMessage('Image uploaded successfully!');
      } else {
        setStatusMessage('Error: ' + data.error);
      }
    } catch (err) {
      setStatusMessage('Error connecting to upload server.');
    } finally {
      setUploading(false);
    }
  };

  const handleGoLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Starting stream...');
    
    try {
      const res = await fetch('http://localhost:4000/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, embed_url: embedUrl, thumbnail_url: thumbnailUrl, is_live: true })
      });
      const data = await res.json();
      
      if (data.success) {
        setStatusMessage('SUCCESS: You are LIVE!');
        setCurrentStreamId(data.stream.id);
        setIsLive(true);
        setTitle('');
        setEmbedUrl('');
        setThumbnailUrl('');
      }
    } catch (err) {
      setStatusMessage('Error: Could not connect to backend.');
    }
  };

  const handleEndStream = async () => {
    if (!currentStreamId) return;
    setStatusMessage('Ending broadcast...');
    
    try {
      const res = await fetch(`http://localhost:4000/api/live/${currentStreamId}/end`, {
        method: 'PATCH'
      });
      const data = await res.json();
      
      if (data.success) {
        setStatusMessage('Broadcast ended successfully. Site is offline.');
        setIsLive(false);
      }
    } catch (err) {
      setStatusMessage('Error ending stream.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-zinc-950 border border-red-900/50 rounded-2xl shadow-2xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-red-500 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        Live Stream Control
      </h2>
      
      <form onSubmit={handleGoLive} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Stream Title</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
            placeholder="e.g., In the Studio"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">YouTube Embed URL</label>
          <input 
            type="url" 
            required
            value={embedUrl}
            onChange={e => setEmbedUrl(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
            placeholder="https://www.youtube.com/embed/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Stream Thumbnail / Cover Art</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
          />
          {uploading && <p className="text-xs text-yellow-500 mt-2">Uploading...</p>}
          {thumbnailUrl && (
            <p className="text-xs text-green-500 mt-2 truncate">Uploaded: {thumbnailUrl}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLive || uploading}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all ${
            isLive ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isLive ? 'STREAM IS ACTIVE' : 'GO LIVE NOW'}
        </button>
      </form>

      {isLive && (
        <button 
          onClick={handleEndStream}
          className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 px-4 rounded-lg border border-zinc-700 transition-all"
        >
          End Current Broadcast
        </button>
      )}

      {statusMessage && (
        <div className="mt-6 p-3 rounded bg-zinc-900 border border-zinc-800 text-center text-sm font-medium text-zinc-300">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
//end where I end the copy and paste