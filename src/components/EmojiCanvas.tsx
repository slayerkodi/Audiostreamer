import React, { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number; // 0 to 1
  targetX: number;
  rotation: number;
}

export default function EmojiCanvas() {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    const handleNewEmoji = (data: { emoji: string; x: number }) => {
      const targetX = data.x * 100 + (Math.random() * 20 - 10);
      const rotation = Math.random() * 60 - 30;
      const newRef = { 
        id: Math.random().toString(36).substring(7), 
        ...data,
        targetX,
        rotation
      };
      
      setEmojis(prev => [...prev.slice(-30), newRef]); // keep latest 30
      
      setTimeout(() => {
        setEmojis(prev => prev.filter(e => e.id !== newRef.id));
      }, 3000);
    };

    socket.on("new-emoji", handleNewEmoji);
    return () => {
      socket.off("new-emoji", handleNewEmoji);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {emojis.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: '100vh', left: `${e.x * 100}%`, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: '-20vh', 
              left: `${e.targetX}%`,
              scale: [0.5, 1.5, 1],
              rotate: e.rotation 
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute bottom-0 text-4xl md:text-5xl drop-shadow-lg will-change-transform"
            style={{ transformOrigin: 'center' }}
          >
            {e.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
