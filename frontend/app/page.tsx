// start where I paste
// Line 1: Replace your entire app/page.tsx file with this version

// ==========================================
// WAYPOINT: IMPORTS & FONTS
// ==========================================
'use client';
import LivePlayer from '../components/LivePlayer';
import { useState, useRef, useEffect } from 'react';
import { Great_Vibes } from 'next/font/google';
import Link from 'next/link';
import { API_BASE_URL } from '../lib/api';

type Archive = {
  id: number;
  title: string;
  thumbnail_url: string | null;
  createdat: string;
};

// Load the elegant cursive font
const greatVibes = Great_Vibes({ 
  weight: '400',
  subsets: ['latin'],
});


// ==========================================
// WAYPOINT: MAIN COMPONENT & STATE HOOKS
// ==========================================
export default function LandingPage() {

  // VOD Offline Archives State & Fetch Hook
  const [archives, setArchives] = useState<Archive[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/archives`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArchives(data);
        }
      })
      .catch(err => console.error('Error fetching archives:', err));
  }, []);

  // Navigation States ('home' | 'pg' | 'video' | 'live' | 'login' | 'signup')
  const [currentView, setCurrentView] = useState<'home' | 'pg' | 'video' | 'live' | 'login' | 'signup'>('home');
  const [isFlashing, setIsFlashing] = useState(false);

  // Live Stream Mock State
  const [isLive, setIsLive] = useState(false);

  // Generic form states for the UI
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Video Player states & refs for the remote
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);


  // ==========================================
  // WAYPOINT: EVENT HANDLERS & LOGIC
  // ==========================================

  // Generic Mock Submit (works for waitlist, login, and signup)
  const handleMockSubmit = (event: React.FormEvent, successMessage: string) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('Processing...');
    setIsSuccess(false);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setStatus(successMessage);
    }, 1500);
  };

  // Handle switching views and triggering CRT TV static effects
  const handleViewChange = (view: 'home' | 'pg' | 'video' | 'live' | 'login' | 'signup') => {
    setStatus(''); // Clear any previous form status messages
    
    if (view === 'video' && currentView !== 'video') {
      const staticAudio = new Audio('https://actions.google.com/sounds/v1/science_fiction/tv_white_noise.ogg');
      staticAudio.volume = 0.3;
      staticAudio.play().catch(e => console.log('Audio playback requires user interaction first', e));

      setIsFlashing(true);
      setCurrentView(view);
      
      setTimeout(() => {
        setIsFlashing(false);
        staticAudio.pause();
      }, 800);
      
    } else {
      setCurrentView(view);
    }
  };

  // TV Remote: Play/Pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // TV Remote: Skip forward/backward
  const skipVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };


  // ==========================================
  // WAYPOINT: COMPONENT RENDER
  // ==========================================
  return (
    <div className="min-h-screen relative flex overflow-hidden text-white bg-neutral-950">
      
      {/* CSS Animations & Stylesheet */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawSignature {
          0% { max-width: 0; opacity: 0; }
          1% { opacity: 1; }
          100% { max-width: 1000px; opacity: 1; }
        }
        @keyframes fadeOutPen {
          0%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes crtFlash {
          0% { opacity: 0; filter: brightness(1); }
          10% { opacity: 1; filter: brightness(10) contrast(2); background: white; }
          30% { opacity: 0.9; background: #fff; }
          100% { opacity: 0; filter: brightness(1); }
        }
        @keyframes delayedReveal {
          0% { opacity: 0; transform: translateY(24px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-delayed-reveal {
          opacity: 0;
          animation: delayedReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2s forwards;
        }
        .signature-container {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: drawSignature 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          position: relative;
          padding-right: 2rem; 
        }
        .signature-container::after {
          content: '🖋️';
          position: absolute;
          right: 10px;
          bottom: 10px;
          font-size: 1.2rem;
          animation: fadeOutPen 3.1s forwards;
        }
        .animate-crtFlash {
          animation: crtFlash 0.8s ease-out forwards;
        }
      `}} />

      {isFlashing && (
        <div className="fixed inset-0 z-[9999] pointer-events-none mix-blend-screen animate-crtFlash bg-white"></div>
      )}


      {/* ========================================== */}
      {/* SECTION: GLOBAL BACKGROUND VIDEO & BLUR    */}
      {/* ========================================== */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-105"
        >
          <source src="/webtiff.mp4" type="video/mp4" />
        </video>
        {/* Lightened from /70 down to /25 so the video is vivid and clear */}
        <div className="absolute inset-0 bg-neutral-950/25"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-pink-600/20 blur-[120px] rounded-full pointer-events-none" />
      </div>


      {/* ========================================== */}
      {/* SECTION: LEFT SIDEBAR NAVIGATION MENU      */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-950/60 backdrop-blur-xl border-r border-neutral-800/60 z-40 relative shadow-2xl">
        <div className="p-8 text-xs font-black text-neutral-500 tracking-[0.2em] uppercase">
          Navigation
        </div>
        
        <nav className="flex flex-col gap-4 px-6">
          <button 
            onClick={() => handleViewChange('pg')}
            className={`text-left px-4 py-3.5 rounded-xl transition-all font-semibold text-sm border shadow-inner ${
              currentView === 'pg' ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-white border-white/5'
            }`}
          >
            PG Rated Photos
          </button>

          <div className="relative group cursor-not-allowed">
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <button className="w-full text-left px-4 py-3.5 bg-neutral-900/50 text-neutral-600 rounded-xl font-semibold text-sm pointer-events-none blur-[1px]">
              UnCensor Photos
            </button>
            <div className="absolute left-[105%] top-1/2 -translate-y-1/2 px-4 py-2 bg-neutral-900/95 backdrop-blur-md border border-red-500/50 text-red-400 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Membership Required
            </div>
          </div>

          <button 
            onClick={() => handleViewChange('video')}
            className={`text-left px-4 py-3.5 rounded-xl transition-all font-semibold text-sm border shadow-inner ${
              currentView === 'video' ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-white border-white/5'
            }`}
          >
            Teaser Video
          </button>

          <button 
            onClick={() => handleViewChange('live')}
            className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-semibold text-sm border shadow-inner ${
              currentView === 'live' ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/5 hover:bg-white/10 text-white border-white/5'
            }`}
          >
            <span>Live Shows</span>
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/50 text-[9px] uppercase tracking-wider text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-500/20 border border-neutral-500/50 text-[9px] uppercase tracking-wider text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                Offline
              </span>
            )}
          </button>

          <div className="h-12 border border-dashed border-neutral-700/40 rounded-xl flex items-center px-4 bg-neutral-900/20"></div>
        </nav>
      </aside>


      {/* ========================================== */}
      {/* SECTION: MAIN CONTENT AREA                 */}
      {/* ========================================== */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-6 z-10 overflow-y-auto min-h-screen">
        
        <div className="w-full flex flex-col items-center justify-start flex-grow">
          
          {/* LOGIN / SIGN UP BUTTON HEADER */}
          <div className="absolute top-6 right-8 md:right-12 z-50 flex items-center gap-3 bg-neutral-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800/50 shadow-lg">
            <button onClick={() => handleViewChange('login')} className={`text-sm font-semibold transition-colors px-2 ${currentView === 'login' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>
              Login
            </button>
            <span className="text-neutral-700 text-xs">|</span>
            <button onClick={() => handleViewChange('signup')} className={`text-sm font-bold transition-colors px-2 drop-shadow-md ${currentView === 'signup' ? 'text-pink-300' : 'text-pink-500 hover:text-pink-400'}`}>
              Sign Up
            </button>
          </div>

          {/* SIGNATURE LOGO HEADER */}
          <div className="mt-8 mb-6 flex justify-center w-full z-20 cursor-pointer overflow-visible" onClick={() => handleViewChange('home')}>
            <div className={`signature-container ${greatVibes.className} text-5xl md:text-7xl py-2 flex items-center justify-center`}>
              <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-lg">
                Little Miss
              </span>
              <span className="inline-block mx-3 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse text-4xl md:text-5xl font-sans">
                ❤️
              </span>
              <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-lg pr-4">
                Tiffany.com
              </span>
            </div>
          </div>


          {/* ========================================== */}
          {/* VIEW CONTROLLER: DYNAMIC CONTENT CONTAINER */}
          {/* ========================================== */}
          <div className={`w-full max-w-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-700/50 rounded-3xl p-8 md:p-12 shadow-2xl relative transition-all duration-500 animate-delayed-reveal ${currentView === 'video' || currentView === 'live' ? 'max-w-4xl border-none bg-transparent backdrop-blur-none shadow-none p-0' : ''}`}>
            
            {/* VIEW: HOME LANDING */}
            {currentView === 'home' && (
              <div className="text-center space-y-8 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-950/80 border border-pink-500/30 text-pink-400 text-xs font-bold tracking-widest uppercase shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                  VIP Access Pass
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4">
                  Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-lg">Content</span>
                </h1>
                <p className="text-base text-neutral-300 leading-relaxed px-4">
                  Join the inner circle. Get a free unreleased teaser video instantly when you sign up, plus direct priority access to all new drops.
                </p>

                <form onSubmit={(e) => handleMockSubmit(e, '🎉 You’re in! Check your inbox shortly.')} className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <input
                      type="email"
                      placeholder="Enter your email..."
                      className="px-5 py-3.5 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 text-white placeholder-neutral-400 w-full sm:w-64 text-sm transition-all"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-600 transition-all rounded-xl font-bold text-white text-sm whitespace-nowrap disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? 'Unlocking...' : 'Get Free Teaser'}
                    </button>
                  </div>
                </form>

                {status && (
                  <div className={`p-3 rounded-xl text-sm font-semibold border backdrop-blur-md ${
                    isSuccess ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-pink-500/20 border-pink-500/30 text-pink-300'
                  }`}>
                    {status}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: LOG IN */}
            {currentView === 'login' && (
              <div className="max-w-sm mx-auto animate-fadeIn">
                <div className="text-center space-y-3 mb-8">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                  <p className="text-neutral-400 text-sm">Enter your credentials to access your account.</p>
                </div>

                <form onSubmit={(e) => handleMockSubmit(e, '✅ Login Successful! Redirecting...')} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Username / Email</label>
                    <input type="text" required disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Password</label>
                      <button type="button" className="text-[10px] text-pink-400 hover:text-pink-300">Forgot?</button>
                    </div>
                    <input type="password" required disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none text-sm transition-all" />
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-600 transition-all rounded-xl font-bold text-white text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)] disabled:opacity-50">
                    {isSubmitting ? 'Authenticating...' : 'Log In Securely'}
                  </button>

                  {status && (
                    <div className={`mt-4 p-3 rounded-xl text-center text-sm font-semibold border backdrop-blur-md ${isSuccess ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-pink-500/20 border-pink-500/30 text-pink-300'}`}>
                      {status}
                    </div>
                  )}
                </form>

                <p className="text-center text-xs text-neutral-500 mt-8">
                  Don&apos;t have an account? <button onClick={() => handleViewChange('signup')} className="text-cyan-400 font-bold hover:underline">Sign Up</button>
                </p>
              </div>
            )}

            {/* VIEW: SIGN UP */}
            {currentView === 'signup' && (
              <div className="max-w-md mx-auto animate-fadeIn">
                <div className="text-center space-y-3 mb-6">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-tight">Create VIP Account</h2>
                  <p className="text-neutral-400 text-sm">Join the exclusive inner circle.</p>
                </div>

                <form onSubmit={(e) => handleMockSubmit(e, '🎉 Account Created! Welcome to the club.')} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Username</label>
                      <input type="text" required disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Email</label>
                      <input type="email" required disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" required disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">What are you looking for?</label>
                    <select required disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl bg-neutral-950/70 border border-neutral-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all text-neutral-300 appearance-none">
                      <option value="">Select an option...</option>
                      <option value="videos">Exclusive Videos</option>
                      <option value="photos">Uncensored Photosets</option>
                      <option value="chat">1-on-1 Chat Access</option>
                      <option value="everything">Everything</option>
                    </select>
                  </div>

                  <div className="flex items-start gap-3 mt-2 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800">
                    <input type="checkbox" required disabled={isSubmitting} className="mt-1 w-4 h-4 rounded border-neutral-700 text-pink-500 focus:ring-pink-500 bg-neutral-900" />
                    <label className="text-[11px] text-neutral-400 leading-relaxed">
                      I certify that I am at least 18 years of age and agree to the <Link href="#" className="text-pink-400 hover:underline">Terms of Service</Link> and <Link href="#" className="text-pink-400 hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 transition-all rounded-xl font-bold text-white text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50">
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>

                  {status && (
                    <div className={`mt-4 p-3 rounded-xl text-center text-sm font-semibold border backdrop-blur-md ${isSuccess ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-pink-500/20 border-pink-500/30 text-pink-300'}`}>
                      {status}
                    </div>
                  )}
                </form>

                <p className="text-center text-xs text-neutral-500 mt-6">
                  Already have an account? <button onClick={() => handleViewChange('login')} className="text-pink-400 font-bold hover:underline">Log In</button>
                </p>
              </div>
            )}

            {/* VIEW: PG PHOTOS GALLERY */}
            {currentView === 'pg' && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-700/50 pb-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">PG Rated Gallery</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="aspect-square bg-neutral-950/60 rounded-xl border border-neutral-700/50 flex flex-col items-center justify-center group overflow-hidden relative hover:border-pink-500/50 transition-colors cursor-pointer">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-70 transition-opacity grayscale group-hover:grayscale-0"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: LIVE SHOWS & PAST ARCHIVES VOD GALLERY */}
            {currentView === 'live' && (
              <div className="space-y-10 w-full animate-fadeIn">
                <LivePlayer onLiveChange={setIsLive} />

                {/* Past Broadcasts & VOD Gallery Section */}
                <div className="border-t border-neutral-800/80 pt-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    Past Broadcasts & Archives
                  </h3>
                  
                  {archives.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No archived broadcasts found yet. End a live stream from the admin panel to archive it here!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {archives.map((stream) => (
                        <div key={stream.id} className="bg-neutral-950/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-pink-500/50 transition-all">
                          {stream.thumbnail_url ? (
                            <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-40 object-cover" />
                          ) : (
                            <div className="w-full h-40 bg-neutral-900 flex items-center justify-center text-neutral-600 text-xs">No Thumbnail</div>
                          )}
                          <div className="p-4">
                            <h4 className="font-bold text-white text-base truncate">{stream.title}</h4>
                            <p className="text-xs text-neutral-500 mt-1">Aired: {new Date(stream.createdat).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: 90s CRT TV TEASER */}
            {currentView === 'video' && (
              <div className="animate-fadeIn flex flex-col md:flex-row items-center justify-center gap-8 w-full py-8">
                <div className="relative w-[320px] h-[260px] md:w-[480px] md:h-[360px] bg-neutral-800 border-t-8 border-t-neutral-600 border-l-8 border-l-neutral-700 border-r-8 border-r-neutral-900 border-b-8 border-b-neutral-950 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4 md:p-6 flex items-center justify-center flex-shrink-0">
                  <div className="absolute bottom-2 left-6 right-6 h-2 flex justify-between px-4 opacity-30">
                    <div className="w-16 h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                    <div className="w-16 h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                  </div>
                  
                  <div className="w-full h-full bg-black rounded-[2.5rem] md:rounded-[3rem] border-[12px] border-neutral-900 shadow-inner relative overflow-hidden flex items-center justify-center">
                    {isFlashing && (
                      <div className="absolute inset-0 z-40 bg-[url('https://media.giphy.com/media/Yy2ZewqBPa7W0H9T07/giphy.gif')] bg-cover opacity-60 mix-blend-screen pointer-events-none"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[1.5rem] z-30"></div>
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0)_100%)] bg-[length:100%_4px] z-20" />
                    <video ref={videoRef} className="w-full h-full object-cover grayscale brightness-90 contrast-125" loop>
                      <source src="/background.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>

                <div className="w-20 md:w-24 bg-neutral-900 border-t-2 border-t-neutral-700 border-l-2 border-l-neutral-700 border-r border-r-black border-b border-b-black rounded-full shadow-[5px_10px_20px_rgba(0,0,0,0.9)] flex flex-col items-center py-8 gap-6 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] ${isPlaying ? 'bg-red-500' : 'bg-red-900'}`}></div>
                  <div className="flex flex-col gap-4 mt-2">
                    <button onClick={() => skipVideo(-5)} className="w-12 h-10 bg-neutral-800 border-t border-t-neutral-600 rounded-lg shadow-md flex items-center justify-center active:translate-y-1 active:shadow-none transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                      </svg>
                    </button>
                    <button onClick={togglePlay} className="w-12 h-12 bg-pink-900/50 border-t border-t-pink-500/50 rounded-full shadow-md flex items-center justify-center active:translate-y-1 active:shadow-none transition-all text-pink-400">
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button onClick={() => skipVideo(5)} className="w-12 h-10 bg-neutral-800 border-t border-t-neutral-600 rounded-lg shadow-md flex items-center justify-center active:translate-y-1 active:shadow-none transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11.555 14.832A1 1 0 0110 14v-2.798l-5.445 3.63A1 1 0 013 14V6a1 1 0 011.555-.832L10 8.798V6a1 1 0 011.555-.832l6 4a1 1 0 010 1.664l-6 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* ========================================== */}
        {/* SECTION: LEGAL FOOTER                      */}
        {/* ========================================== */}
        <footer className="w-full mt-12 pt-6 border-t border-neutral-800 text-center space-y-3 pb-4 z-20">
          <p className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-widest font-semibold">
            © {new Date().getFullYear()} Little Miss Tiffany.com. All rights reserved. 
            <span className="text-red-500/80 ml-2 border border-red-500/30 px-1.5 py-0.5 rounded">18+ Only</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-neutral-600">
            <a href="#" className="hover:text-pink-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-pink-400 transition-colors">DMCA Policy</a>
            <a href="#" className="hover:text-pink-400 transition-colors">2257 Compliance</a>
          </div>
          <p className="text-[9px] text-neutral-700 max-w-3xl mx-auto px-4 mt-2">
            This website contains adult material and is only suitable for those 18 years or older. Click Enter only if you are at least 18 years of age. All models appearing on this website were 18 years or older at the time of photography.
          </p>
        </footer>
      </main>
    </div>
  );
}
// end where I end the copy and paste