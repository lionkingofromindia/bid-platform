'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JoinTeam() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secretCode, setSecretCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic verification by attempting to fetch the team
      const res = await fetch(`/api/teams/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid code');
      }
      
      // Store code locally
      localStorage.setItem('teamSecretCode', secretCode);

      // Redirect to team dashboard
      router.push(`/teams/${secretCode}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="glass-panel max-w-lg w-full">
        <Link href="/" className="inline-flex items-center text-muted hover:text-accent-primary mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-accent-success">
            <Users size={24} />
          </div>
          <h2>Join Team</h2>
        </div>

        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-accent-danger text-accent-danger p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <p className="text-muted mb-6">
          Enter the secret team code provided by your Room Admin to access your team dashboard and participate in the live auction.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="secretCode">Team Secret Code</label>
            <input 
              id="secretCode"
              type="text" 
              className="form-input text-center text-xl tracking-[0.2em] font-mono uppercase" 
              placeholder="XXXXXXXX"
              required
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value.toUpperCase().trim())}
            />
          </div>

          <button type="submit" className="btn btn-success w-full mt-4" disabled={loading || !secretCode}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
