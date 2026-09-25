'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    minTeamSize: 11,
    maxTeamSize: 15,
    deadlineDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Save room code to local storage for convenience
      localStorage.setItem('adminRoomCode', data.room.roomCode);
      
      // Redirect to admin dashboard
      router.push(`/rooms/${data.room.roomCode}/admin`);
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
          <div className="w-12 h-12 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-accent-primary">
            <ShieldCheck size={24} />
          </div>
          <h2>Create Auction Room</h2>
        </div>

        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-accent-danger text-accent-danger p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Room Name</label>
            <input 
              id="name"
              type="text" 
              className="form-input" 
              placeholder="e.g. Summer Championship 2026"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="minTeamSize">Min Squad Size</label>
              <input 
                id="minTeamSize"
                type="number" 
                className="form-input" 
                min="1"
                required
                value={formData.minTeamSize}
                onChange={(e) => setFormData({...formData, minTeamSize: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="maxTeamSize">Max Squad Size</label>
              <input 
                id="maxTeamSize"
                type="number" 
                className="form-input" 
                min="1"
                required
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({...formData, maxTeamSize: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deadlineDate">Exchange Deadline (Optional)</label>
            <input 
              id="deadlineDate"
              type="datetime-local" 
              className="form-input" 
              value={formData.deadlineDate}
              onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
            />
            <p className="text-muted text-sm mt-1">After this date, the room freezes and no trades can occur.</p>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room & Get Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
