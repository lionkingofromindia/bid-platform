'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Loader2, Coins, Users, Lock, ChevronUp } from 'lucide-react';

export default function TeamDashboard({ params }) {
  const { roomCode } = params;
  const [secretCode, setSecretCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState('');

  // Try to load secret from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`team_secret_${roomCode}`);
    if (saved) {
      setSecretCode(saved);
      setIsAuthenticated(true);
    }
  }, [roomCode]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (secretCode.trim()) {
      localStorage.setItem(`team_secret_${roomCode}`, secretCode.trim().toUpperCase());
      setSecretCode(secretCode.trim().toUpperCase());
      setIsAuthenticated(true);
    }
  };

  const fetcher = (url) => fetch(url).then(async res => {
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem(`team_secret_${roomCode}`);
        setIsAuthenticated(false);
      }
      throw new Error('Failed to fetch');
    }
    return res.json();
  });

  const { data, error, mutate } = useSWR(
    isAuthenticated ? `/api/rooms/${roomCode}/team-dashboard?secretCode=${secretCode}` : null,
    fetcher,
    { refreshInterval: 1000 }
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <form onSubmit={handleLogin} className="glass-panel p-8 max-w-md w-full text-center">
          <div className="bg-accent-primary/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
            <Lock size={32} className="text-accent-primary" />
          </div>
          <h2 className="mb-2">Team Access</h2>
          <p className="text-muted mb-8">Enter your team's secret code to access the bidding dashboard.</p>
          
          <input 
            type="text" 
            placeholder="e.g. A1B2C3D4"
            className="input w-full text-center text-xl uppercase tracking-widest mb-4"
            value={secretCode}
            onChange={e => setSecretCode(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-full py-3 text-lg">
            Enter Dashboard
          </button>
        </form>
      </div>
    );
  }

  if (!data && !error) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-primary" size={48} /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h3 className="text-accent-danger">Connection Error</h3>
        <p className="text-muted mt-2">Trying to reconnect...</p>
      </div>
    );
  }

  const { team, liveAuction, room } = data;
  const { currentPlayer, highestBid } = liveAuction;

  const currentHighestAmount = highestBid ? highestBid.amount : 0;
  const minimumBid = currentPlayer ? Math.max(currentPlayer.basePrice, currentHighestAmount + 100) : 0; // Using a fixed increment of 100 for prototype

  const submitBid = async (amount) => {
    setIsBidding(true);
    setBidError('');
    try {
      const res = await fetch(`/api/rooms/${roomCode}/auction/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          playerId: currentPlayer.id,
          amount,
          secretCode
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      setBidAmount('');
      mutate();
    } catch (err) {
      setBidError(err.message);
    } finally {
      setIsBidding(false);
    }
  };

  const handleManualBid = (e) => {
    e.preventDefault();
    const amount = parseInt(bidAmount);
    if (!amount || amount < minimumBid) {
      setBidError(`Minimum bid is $${minimumBid}`);
      return;
    }
    submitBid(amount);
  };

  return (
    <div className="py-6 max-w-4xl mx-auto px-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 flex flex-col justify-center border border-accent-primary/50">
          <p className="text-muted text-sm mb-1 uppercase tracking-wider">Your Team</p>
          <h3 className="truncate">{team.name}</h3>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center">
          <p className="text-muted text-sm mb-1 uppercase tracking-wider flex items-center gap-1">
            <Coins size={14} /> Available Pool
          </p>
          <h3 className="text-accent-success font-mono">${team.availablePool}</h3>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center">
          <p className="text-muted text-sm mb-1 uppercase tracking-wider flex items-center gap-1">
            <Users size={14} /> Roster Size
          </p>
          <h3>{team.roster.length} / {room.maxTeamSize}</h3>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center">
          <p className="text-muted text-sm mb-1 uppercase tracking-wider">Total Spent</p>
          <h3 className="text-accent-danger font-mono">${team.totalSpent}</h3>
        </div>
      </div>

      {/* Live Auction Area */}
      {room.status !== 'live' ? (
        <div className="glass-panel text-center py-20 border border-[rgba(255,255,255,0.1)]">
          <h2 className="text-muted mb-2">Auction is not currently live</h2>
          <p>Please wait for the admin to start the bidding rounds.</p>
        </div>
      ) : !currentPlayer ? (
        <div className="glass-panel text-center py-20 border border-[rgba(255,255,255,0.1)]">
          <h2 className="text-muted mb-2">Waiting for next player...</h2>
          <Loader2 className="animate-spin mx-auto mt-6 text-accent-primary opacity-50" size={32} />
        </div>
      ) : (
        <div className="glass-panel p-6 md:p-10 border border-accent-primary shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.1)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="text-center md:text-left">
              <span className="badge badge-primary mb-2 inline-block">ON THE BLOCK</span>
              <h1 className="text-4xl md:text-5xl mb-2">{currentPlayer.name}</h1>
              <p className="text-xl text-muted">{currentPlayer.category}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted uppercase tracking-widest text-sm mb-1">Base Price</p>
              <div className="text-3xl font-mono">${currentPlayer.basePrice}</div>
            </div>
          </div>

          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-8 text-center mb-8">
            <p className="text-muted uppercase tracking-widest text-sm mb-2">Current Highest Bid</p>
            {highestBid ? (
              <>
                <div className="text-6xl font-bold font-mono text-accent-success mb-2">${highestBid.amount}</div>
                <p className="text-xl">
                  {highestBid.teamId === team.id ? (
                    <span className="text-accent-success font-bold flex items-center justify-center gap-2">
                      <ChevronUp /> YOU ARE THE HIGHEST BIDDER
                    </span>
                  ) : (
                    <>Bid by: <span className="font-bold text-accent-primary">{highestBid.teamName}</span></>
                  )}
                </p>
              </>
            ) : (
              <div className="text-4xl font-mono text-muted py-4">No Bids Yet</div>
            )}
          </div>

          <div className="max-w-md mx-auto">
            {bidError && <div className="text-accent-danger text-center mb-4">{bidError}</div>}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button 
                onClick={() => submitBid(minimumBid)}
                disabled={isBidding || minimumBid > team.availablePool}
                className="btn btn-primary py-4 text-xl flex-col gap-1"
              >
                <span>Bid ${minimumBid}</span>
                <span className="text-xs opacity-70 font-normal">Min Increment</span>
              </button>
              
              <button 
                onClick={() => submitBid(minimumBid + 400)}
                disabled={isBidding || (minimumBid + 400) > team.availablePool}
                className="btn btn-success py-4 text-xl flex-col gap-1"
              >
                <span>Bid ${minimumBid + 400}</span>
                <span className="text-xs opacity-70 font-normal">+500 Jump</span>
              </button>
            </div>

            <form onSubmit={handleManualBid} className="flex gap-2">
              <input 
                type="number" 
                className="input flex-1 text-xl font-mono" 
                placeholder={`Min: $${minimumBid}`}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                min={minimumBid}
                step={100}
              />
              <button 
                type="submit" 
                disabled={isBidding || !bidAmount}
                className="btn bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] px-8"
              >
                Custom Bid
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
