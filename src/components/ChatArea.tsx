import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Radio } from 'lucide-react';
import { socket } from '../lib/socket';
import { motion } from 'motion/react';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export default function ChatArea() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nickname, setNickname] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("chat-history", (history: ChatMessage[]) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.off("chat-history");
      socket.off("chat-message");
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setIsJoined(true);
      scrollToBottom();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isJoined) return;

    socket.emit("send-chat", { user: nickname, text: inputValue });
    setInputValue("");
  };

  const EMOTES = ['🔥', '❤️', '👏', '🎉', '🎶'];
  
  const sendEmoji = (emoji: string) => {
    socket.emit("send-emoji", { emoji, x: Math.random() });
  };

  if (!isJoined) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 relative z-20">
        <form onSubmit={handleJoin} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-zinc-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white text-center mb-2">Join the Chat</h3>
          <p className="text-zinc-400 text-sm text-center mb-6">Pick a nickname to mingle with other listeners.</p>
          
          <input 
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 mb-4 transition-all"
            maxLength={15}
            required
          />
          <button 
            type="submit"
            className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-zinc-200 transition-colors active:scale-[0.98]"
          >
            Enter Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 relative z-20">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur shrink-0 flex items-center justify-between shadow-sm">
         <h3 className="font-semibold text-white">Live Chat</h3>
         <div className="text-xs text-zinc-400 font-medium bg-zinc-800 px-2.5 py-1 rounded-md">
           {nickname}
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
             <div className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center bg-zinc-900/50">
               <Radio className="w-4 h-4 text-zinc-600 opacity-50" />
             </div>
             <p className="text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user === nickname;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || i} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
              >
                 <span className="text-[10px] text-zinc-500 mb-1 mx-1 font-medium tracking-wide">
                   {isMe ? 'You' : msg.user}
                 </span>
                 <div className={`px-3.5 py-2 rounded-2xl ${
                   isMe ? 'bg-zinc-100 text-zinc-900 rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                 } break-words w-full shadow-sm`}>
                   <p className="text-[13px] leading-relaxed">{msg.text}</p>
                 </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-1.5 mb-3 justify-center">
            {EMOTES.map(emote => (
              <button 
                key={emote}
                onClick={() => sendEmoji(emote)}
                className="w-10 h-10 hover:bg-zinc-800 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-125 active:scale-95 cursor-pointer"
              >
                {emote}
              </button>
            ))}
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
