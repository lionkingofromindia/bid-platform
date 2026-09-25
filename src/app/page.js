import Link from 'next/link';
import { Shield, Users, MonitorPlay } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="glass-panel max-w-3xl w-full p-8 mt-8">
        <h1 className="mb-2">
          <span className="text-accent-primary">Live</span> Auction Platform
        </h1>
        <p className="text-muted mb-8 max-w-xl mx-auto">
          The premium platform for running live player auctions for team-based games. 
          Real-time bidding, seamless squad management, and an unparalleled spectator experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          <div className="glass-panel flex flex-col items-center p-6 hover:border-accent-primary transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-accent-primary mb-4">
              <Shield size={32} />
            </div>
            <h3 className="mb-2">Admin</h3>
            <p className="text-muted text-sm mb-6 flex-grow">Create rooms, configure teams, upload players, and run the live auction.</p>
            <Link href="/create-room" className="btn btn-primary w-full">
              Create Room
            </Link>
            <div className="mt-4 w-full">
              <Link href="/admin-login" className="btn w-full" style={{ background: 'rgba(255,255,255,0.05)'}}>
                Join Existing
              </Link>
            </div>
          </div>

          <div className="glass-panel flex flex-col items-center p-6 hover:border-accent-success transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-accent-success mb-4">
              <Users size={32} />
            </div>
            <h3 className="mb-2">Team Captain</h3>
            <p className="text-muted text-sm mb-6 flex-grow">Join with your team code to bid on players live and manage your roster.</p>
            <Link href="/join-team" className="btn btn-success w-full mt-auto">
              Enter Team Code
            </Link>
          </div>

          <div className="glass-panel flex flex-col items-center p-6 hover:border-accent-warning transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[rgba(245,158,11,0.1)] flex items-center justify-center text-accent-warning mb-4">
              <MonitorPlay size={32} />
            </div>
            <h3 className="mb-2">Spectator</h3>
            <p className="text-muted text-sm mb-6 flex-grow">Watch the live auction unfold in real-time on the big screen.</p>
            <Link href="/spectator" className="btn w-full mt-auto" style={{ backgroundColor: 'var(--accent-warning)', color: 'white'}}>
              Watch Live
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
