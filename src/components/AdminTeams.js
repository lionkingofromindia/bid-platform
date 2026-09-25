'use client';

import { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { mutate } from 'swr';

export default function AdminTeams({ room, mutateRoom }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    poolLimit: '',
    captainName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${room.roomCode}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add team');
      }

      setFormData({ name: '', poolLimit: '', captainName: '' });
      mutateRoom(); // Refresh the room data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Manage Teams</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {room.teams.length === 0 ? (
            <div className="text-center p-8 bg-[rgba(0,0,0,0.2)] rounded-lg border border-dashed border-[rgba(255,255,255,0.1)]">
              <p className="text-muted">No teams configured yet. Add some to get started.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Pool Limit</th>
                    <th>Secret Code</th>
                    <th>Captain</th>
                  </tr>
                </thead>
                <tbody>
                  {room.teams.map(team => (
                    <tr key={team.id}>
                      <td className="font-medium">{team.name}</td>
                      <td>{team.poolLimit}</td>
                      <td>
                        <code className="bg-black/30 p-1 rounded text-accent-primary select-all">
                          {team.secretCode}
                        </code>
                      </td>
                      <td>{team.captainName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-muted mt-4">
                Share the <strong>Secret Code</strong> with team captains so they can join their dashboard.
              </p>
            </div>
          )}
        </div>

        <div className="bg-[rgba(0,0,0,0.2)] p-6 rounded-lg border border-[rgba(255,255,255,0.05)] h-fit">
          <h3 className="text-lg mb-4">Add New Team</h3>
          {error && <div className="text-accent-danger text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Team Name</label>
              <input 
                type="text" 
                className="form-input text-sm" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Pool Limit (Budget)</label>
              <input 
                type="number" 
                className="form-input text-sm" 
                required 
                min="0"
                value={formData.poolLimit}
                onChange={e => setFormData({...formData, poolLimit: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Captain Name (Optional)</label>
              <input 
                type="text" 
                className="form-input text-sm" 
                value={formData.captainName}
                onChange={e => setFormData({...formData, captainName: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
              <PlusCircle size={16} /> {loading ? 'Adding...' : 'Add Team'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
