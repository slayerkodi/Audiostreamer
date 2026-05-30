/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { socket } from './lib/socket';
import { Radio } from 'lucide-react';

import PlayerArea from './components/PlayerArea';
import ChatArea from './components/ChatArea';
import EmojiCanvas from './components/EmojiCanvas';

export default function App() {
  const [status, setStatus] = useState({
    listeners: 0,
    nowPlaying: { title: "Connecting...", artist: "Station" },
    isBroadcasting: false
  });

  useEffect(() => {
    socket.connect();

    socket.on("status", (data) => {
      setStatus(data);
    });

    return () => {
      socket.off("status");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-50 flex flex-col md:flex-row overflow-hidden font-sans relative selection:bg-rose-500/30">
      <EmojiCanvas />
      
      {/* Player Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 basis-full md:basis-auto h-full overflow-y-auto">
         <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2.5 text-zinc-400 font-medium tracking-widest text-xs uppercase">
           <Radio className="w-4 h-4 text-rose-500" />
           <span>Live Network</span>
         </div>
         
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 -z-10 pointer-events-none"></div>

         <PlayerArea status={status} />
      </main>

      {/* Chat Section */}
      <aside className="w-full md:w-80 lg:w-96 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-900/50 flex flex-col relative z-20 h-[50vh] md:h-screen shadow-2xl shrink-0">
        <ChatArea />
      </aside>
    </div>
  );
}
