'use client';

import useSWR from 'swr';
import { Loader2 } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PresentationView({ params }) {
  const { roomCode } = params;

  // We can reuse the live auction endpoint from the admin view since it's read-only
  const { data, error } = useSWR(`/api/rooms/${roomCode}/auction/live`, fetcher, {
    refreshInterval: 1000
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-accent-primary" size={64} />
      </div>
    );
  }

  const { currentPlayer, highestBid, teams } = data;

  return (
    <div className="min-h-screen bg-background flex flex-col p-8 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-success/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <h1 className="text-5xl font-black tracking-tight">LIVE AUCTION</h1>
        <div className="badge badge-primary text-xl px-6 py-2">Room: {roomCode}</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-8 relative z-10">
        
        {/* Left: Player Card */}
        <div className="flex-1 flex flex-col">
          {!currentPlayer ? (
            <div className="glass-panel flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[rgba(255,255,255,0.1)]">
              <h2 className="text-4xl text-muted mb-4">Waiting for next player...</h2>
              <div className="w-24 h-24 rounded-full border-4 border-t-accent-primary border-[rgba(255,255,255,0.1)] animate-spin"></div>
            </div>
          ) : (
            <div className="glass-panel flex-1 flex flex-col border border-accent-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent-primary text-background font-bold px-6 py-2 rounded-bl-xl text-xl">
                CURRENT PLAYER
              </div>
              
              <div className="p-12 flex-1 flex flex-col justify-center items-center text-center">
                <div className="text-2xl text-muted tracking-widest uppercase mb-4">{currentPlayer.category}</div>
                <h2 className="text-7xl font-black mb-8">{currentPlayer.name}</h2>
                <div className="text-3xl text-muted mb-12">ID: {currentPlayer.playerId}</div>
                
                <div className="w-full bg-[rgba(0,0,0,0.3)] rounded-2xl p-8 mt-auto">
                  <div className="text-xl text-muted uppercase tracking-widest mb-2">Base Price</div>
                  <div className="text-6xl font-mono font-bold">${currentPlayer.basePrice}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Bid Status & Teams */}
        <div className="w-[450px] flex flex-col gap-8">
          
          {/* Current Bid Box */}
          <div className="glass-panel p-8 text-center border-2 border-accent-success/30 flex-shrink-0">
            <div className="text-xl text-muted uppercase tracking-widest mb-4">Current Bid</div>
            {highestBid ? (
              <>
                <div className="text-7xl font-mono font-bold text-accent-success mb-4">${highestBid.amount}</div>
                <div className="text-2xl">
                  Team: <span className="font-bold text-accent-primary">
                    {teams.find(t => t.id === highestBid.teamId)?.name || 'Unknown'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-4xl font-mono text-muted py-8">No Bids Yet</div>
            )}
          </div>

          {/* Teams Leaderboard (Simplified) */}
          <div className="glass-panel flex-1 flex flex-col overflow-hidden">
            <h3 className="p-6 border-b border-[rgba(255,255,255,0.1)] text-center text-muted uppercase tracking-widest">
              Team Pools
            </h3>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {teams.map(team => (
                <div key={team.id} className="flex justify-between items-center p-4 bg-[rgba(0,0,0,0.2)] rounded-lg">
                  <span className="font-bold text-lg truncate max-w-[200px]">{team.name}</span>
                  <span className="font-mono text-xl text-accent-success">${team.poolLimit}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
