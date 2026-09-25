'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Settings, Users, PlusCircle, Play, ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';

import AdminTeams from '@/components/AdminTeams';
import AdminPlayers from '@/components/AdminPlayers';
import AdminAuction from '@/components/AdminAuction';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminDashboard({ params }) {
  const { roomCode } = params;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, error, isLoading, mutate } = useSWR(`/api/rooms/${roomCode}`, fetcher, {
    refreshInterval: 5000 // Poll every 5s for updates
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
      </div>
    );
  }

  if (error || (data && data.error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="glass-panel text-center">
          <h2 className="text-accent-danger mb-4">Error</h2>
          <p>{error?.message || data?.error || 'Failed to load room'}</p>
          <Link href="/" className="btn btn-primary mt-6">Return Home</Link>
        </div>
      </div>
    );
  }

  const { room } = data;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center text-muted hover:text-accent-primary mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Link>
          <h1 className="mb-1">{room.name}</h1>
          <div className="flex items-center gap-3">
            <span className="badge badge-primary">Room Code: {room.roomCode}</span>
            <span className={`badge ${room.status === 'setup' ? 'badge-warning' : 'badge-success'}`}>
              Status: {room.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Link href={`/rooms/${roomCode}/presentation`} target="_blank" className="btn btn-success">
            <Play size={18} /> Open Spectator View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="flex flex-col gap-2">
          <button 
            className={`btn justify-start ${activeTab === 'overview' ? 'btn-primary' : 'bg-transparent border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setActiveTab('overview')}
          >
            <Settings size={18} /> Overview
          </button>
          <button 
            className={`btn justify-start ${activeTab === 'teams' ? 'btn-primary' : 'bg-transparent border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setActiveTab('teams')}
          >
            <Users size={18} /> Manage Teams ({room.teams.length})
          </button>
          <button 
            className={`btn justify-start ${activeTab === 'players' ? 'btn-primary' : 'bg-transparent border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setActiveTab('players')}
          >
            <Upload size={18} /> Manage Players ({room.players.length})
          </button>
          <button 
            className={`btn justify-start ${activeTab === 'auction' ? 'btn-primary' : 'bg-transparent border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => setActiveTab('auction')}
            disabled={room.teams.length === 0 || room.players.length === 0}
          >
            <Play size={18} /> Run Auction
          </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <div className="glass-panel min-h-[500px]">
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <h2 className="mb-6">Room Overview</h2>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-[rgba(0,0,0,0.2)] rounded-lg">
                    <p className="text-muted text-sm mb-1">Total Teams</p>
                    <h3>{room.teams.length}</h3>
                  </div>
                  <div className="p-4 bg-[rgba(0,0,0,0.2)] rounded-lg">
                    <p className="text-muted text-sm mb-1">Total Players Pool</p>
                    <h3>{room.players.length}</h3>
                  </div>
                  <div className="p-4 bg-[rgba(0,0,0,0.2)] rounded-lg">
                    <p className="text-muted text-sm mb-1">Min Squad Size</p>
                    <h3>{room.minTeamSize}</h3>
                  </div>
                  <div className="p-4 bg-[rgba(0,0,0,0.2)] rounded-lg">
                    <p className="text-muted text-sm mb-1">Max Squad Size</p>
                    <h3>{room.maxTeamSize}</h3>
                  </div>
                </div>
                
                <p className="text-muted">
                  To get started, first add some teams. Once teams are configured, 
                  upload your players (via CSV or manually), and then you can proceed 
                  to run the auction.
                </p>
              </div>
            )}

            {activeTab === 'teams' && (
              <AdminTeams room={room} mutateRoom={mutate} />
            )}
            
            {activeTab === 'players' && (
              <AdminPlayers room={room} mutateRoom={mutate} />
            )}

            {activeTab === 'auction' && (
              <AdminAuction room={room} mutateRoom={mutate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
