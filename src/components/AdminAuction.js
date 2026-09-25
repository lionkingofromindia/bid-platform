'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Play, Check, X, SkipForward, Gavel, Loader2 } from 'lucide-react';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function AdminAuction({ room, mutateRoom }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateRounds = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/rooms/${room.roomCode}/rounds/generate`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate rounds');
      }
      mutateRoom();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // If no rounds generated yet
  if (room.auctionRounds.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="bg-[rgba(255,255,255,0.05)] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Gavel size={48} className="text-accent-primary" />
        </div>
        <h2 className="mb-4">Ready to Start?</h2>
        <p className="text-muted max-w-md mx-auto mb-8">
          Once all teams and players are added, you can generate the auction rounds. 
          Players will be grouped by category and randomized within each round.
        </p>
        
        {error && <div className="text-accent-danger mb-4 text-sm">{error}</div>}
        
        <button 
          onClick={handleGenerateRounds}
          disabled={isGenerating}
          className="btn btn-primary text-lg px-8 py-3"
        >
          {isGenerating ? <Loader2 size={24} className="animate-spin mr-2" /> : <Play size={24} className="mr-2" />}
          Generate Rounds & Go Live
        </button>
      </div>
    );
  }

  // Active or Pending Rounds View
  const activeRound = room.auctionRounds.find(r => r.status === 'active');
  const pendingRounds = room.auctionRounds.filter(r => r.status === 'pending');
  const completedRounds = room.auctionRounds.filter(r => r.status === 'completed');

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2>Live Auction Control</h2>
      </div>

      {!activeRound && pendingRounds.length > 0 && (
        <div className="glass-panel p-6 mb-8 border border-accent-primary">
          <h3 className="mb-4">Next Round: {pendingRounds[0].category}</h3>
          <p className="text-muted mb-4">Players in this category: {pendingRounds[0].playerOrder.length}</p>
          <button 
            className="btn btn-primary"
            onClick={async () => {
              await fetch(`/api/rooms/${room.roomCode}/rounds/${pendingRounds[0].id}/start`, { method: 'POST' });
              mutateRoom();
            }}
          >
            <Play size={18} /> Start Round
          </button>
        </div>
      )}

      {activeRound && (
        <ActiveAuctionPanel room={room} activeRound={activeRound} mutateRoom={mutateRoom} />
      )}

      <div className="mt-8">
        <h3 className="mb-4">All Rounds Status</h3>
        <div className="grid gap-3">
          {room.auctionRounds.map(round => (
            <div key={round.id} className={`p-4 rounded-lg flex items-center justify-between ${round.status === 'active' ? 'bg-accent-primary/20 border border-accent-primary' : 'bg-[rgba(0,0,0,0.2)]'}`}>
              <div>
                <strong className="block">{round.category}</strong>
                <span className="text-sm text-muted">{round.playerOrder.length} players</span>
              </div>
              <span className={`badge ${round.status === 'completed' ? 'badge-success' : round.status === 'active' ? 'bg-accent-primary text-background' : 'badge-warning'}`}>
                {round.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActiveAuctionPanel({ room, activeRound, mutateRoom }) {
  // Poll for active player and bids
  const { data, error, mutate } = useSWR(`/api/rooms/${room.roomCode}/auction/live`, fetcher, { refreshInterval: 1000 });

  if (!data) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading live state...</div>;

  const { currentPlayer, highestBid, teams } = data;

  const handleSell = async () => {
    await fetch(`/api/rooms/${room.roomCode}/auction/sell`, { method: 'POST', body: JSON.stringify({ playerId: currentPlayer.id, teamId: highestBid.teamId, price: highestBid.amount }) });
    mutate();
    mutateRoom();
  };

  const handleUnsold = async () => {
    await fetch(`/api/rooms/${room.roomCode}/auction/unsold`, { method: 'POST', body: JSON.stringify({ playerId: currentPlayer.id }) });
    mutate();
    mutateRoom();
  };

  if (!currentPlayer) {
    return (
      <div className="glass-panel p-6 mb-8 text-center">
        <h3 className="mb-4 text-accent-success">Round {activeRound.category} Complete!</h3>
        <button 
          className="btn btn-primary mx-auto"
          onClick={async () => {
            await fetch(`/api/rooms/${room.roomCode}/rounds/${activeRound.id}/complete`, { method: 'POST' });
            mutateRoom();
          }}
        >
          <Check size={18} /> Mark Round Completed
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 border border-accent-primary mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Gavel size={120} />
      </div>
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <span className="badge badge-primary mb-2">NOW ON THE BLOCK</span>
          <h2 className="text-4xl mb-1">{currentPlayer.name}</h2>
          <div className="text-muted flex gap-4 mt-2">
            <span>ID: {currentPlayer.playerId}</span>
            <span>Category: {currentPlayer.category}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted text-sm uppercase tracking-wider mb-1">Base Price</p>
          <div className="text-3xl font-bold font-mono">${currentPlayer.basePrice}</div>
        </div>
      </div>

      <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-8 mb-8 text-center relative z-10">
        {highestBid ? (
          <div>
            <p className="text-muted uppercase tracking-widest text-sm mb-2">Current Highest Bid</p>
            <div className="text-6xl font-bold font-mono text-accent-success mb-2">${highestBid.amount}</div>
            <p className="text-xl">
              Bid by: <span className="font-bold text-accent-primary">{teams.find(t => t.id === highestBid.teamId)?.name}</span>
            </p>
          </div>
        ) : (
          <div className="py-8">
            <p className="text-xl text-muted">Waiting for bids...</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 relative z-10">
        <button 
          className="btn flex-1 bg-accent-success text-background hover:bg-green-600 disabled:opacity-50 text-lg py-3"
          disabled={!highestBid}
          onClick={handleSell}
        >
          <Check size={20} /> SELL TO HIGHEST BIDDER
        </button>
        <button 
          className="btn flex-1 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-lg py-3"
          onClick={handleUnsold}
        >
          <X size={20} /> MARK UNSOLD
        </button>
      </div>
    </div>
  );
}
