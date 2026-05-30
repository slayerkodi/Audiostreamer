import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, VolumeX, Volume2, Users, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { STREAM_URL } from '../lib/socket';

interface PlayerAreaProps {
  status: {
    listeners: number;
    nowPlaying: { title: string; artist: string };
    isBroadcasting: boolean;
  };
}

export default function PlayerArea({ status }: PlayerAreaProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!status.isBroadcasting && isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  }, [status.isBroadcasting, isPlaying]);

  const togglePlay = () => {
    if (!status.isBroadcasting) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsBuffering(true);
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }).catch(err => {
          console.error("Playback failed:", err);
          setIsBuffering(false);
          setIsPlaying(false);
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm w-full mx-auto relative z-10 w-full">
      <audio 
        ref={audioRef} 
        src={STREAM_URL} 
        crossOrigin="anonymous"
        onPlaying={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onError={() => { setIsBuffering(false); setIsPlaying(false); }}
      />

      <div className="relative mb-8 md:mb-12">
        <motion.div 
          className="w-48 h-48 md:w-80 md:h-80 rounded-full border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/80 overflow-hidden relative flex items-center justify-center transform-gpu"
          animate={{ rotate: isPlaying && !isBuffering ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-[16px] border-zinc-950 opacity-50"></div>
          <div className="absolute inset-3 rounded-full border border-zinc-800 opacity-20"></div>
          <div className="absolute inset-6 rounded-full border border-zinc-800 opacity-20"></div>
          <div className="absolute inset-10 rounded-full border border-zinc-800 opacity-20"></div>
          <div className="absolute inset-14 rounded-full border border-zinc-800 opacity-20"></div>
          
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/30 to-orange-500/30 mix-blend-overlay"></div>
             <div className="w-4 h-4 md:w-5 md:h-5 bg-zinc-950 rounded-full shadow-inner border border-zinc-800"></div>
          </div>
        </motion.div>
        
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
          {status.isBroadcasting ? (
            <div className="bg-zinc-950 border border-zinc-800 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase mt-0.5">Live</span>
            </div>
          ) : (
             <div className="bg-zinc-950 border border-zinc-800 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
               <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>
               <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase mt-0.5">Offline</span>
             </div>
          )}
        </div>
      </div>

      <div className="text-center mb-10 w-full px-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 truncate font-display">
          {status.isBroadcasting ? status.nowPlaying.title : "Station Offline"}
        </h2>
        <p className="text-zinc-400 font-medium truncate">
          {status.isBroadcasting ? status.nowPlaying.artist : "Will return shortly"}
        </p>
      </div>

      <div className="w-full flex items-center justify-between px-2 mb-8 gap-4">
         <div className="flex items-center gap-2.5 text-zinc-500 group">
           <button onClick={() => setIsMuted(!isMuted)}>
             {isMuted || volume === 0 ? (
               <VolumeX className="w-5 h-5 hover:text-zinc-300 transition-colors" />
             ) : (
               <Volume2 className="w-5 h-5 hover:text-zinc-300 transition-colors" />
             )}
           </button>
           <input 
             type="range" 
             min="0" max="1" step="0.01" 
             value={isMuted ? 0 : volume}
             onChange={(e) => setVolume(parseFloat(e.target.value))}
             className="w-20 md:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:bg-zinc-700 transition-colors"
           />
         </div>

         <button 
           onClick={togglePlay}
           disabled={!status.isBroadcasting || isBuffering}
           className="w-[72px] h-[72px] rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0 shadow-xl shadow-white/5 relative group"
         >
           <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
           {isBuffering ? (
             <Loader2 className="w-8 h-8 animate-spin" />
           ) : isPlaying ? (
             <Pause className="w-8 h-8 fill-current" />
           ) : (
             <Play className="w-8 h-8 fill-current ml-1" />
           )}
         </button>

         <div className="flex items-center gap-2 text-zinc-400 justify-end w-[104px]">
           <Users className="w-4 h-4" />
           <span className="text-sm font-medium font-mono tracking-wider">{status.listeners}</span>
         </div>
      </div>
    </div>
  );
}
