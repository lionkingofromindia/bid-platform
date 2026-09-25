'use client';

import { useState } from 'react';
import { Upload, Plus, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function AdminPlayers({ room, mutateRoom }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [manualPlayer, setManualPlayer] = useState({
    playerId: '',
    name: '',
    category: '',
    basePrice: ''
  });

  const uploadPlayers = async (playersData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/rooms/${room.roomCode}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersData })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload players');
      }

      setSuccess(`Successfully added ${data.count} players!`);
      mutateRoom();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the format.');
          console.error(results.errors);
          return;
        }
        
        uploadPlayers(results.data);
      }
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    uploadPlayers([manualPlayer]);
    setManualPlayer({ playerId: '', name: '', category: '', basePrice: '' });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Manage Players</h2>

      {error && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-accent-danger text-accent-danger p-3 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-[rgba(16,185,129,0.1)] border border-accent-success text-accent-success p-3 rounded-md mb-6">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* CSV Upload */}
        <div className="bg-[rgba(0,0,0,0.2)] p-6 rounded-lg border border-[rgba(255,255,255,0.05)] text-center flex flex-col items-center justify-center">
          <h3 className="mb-2">Bulk Upload (CSV)</h3>
          <p className="text-sm text-muted mb-6 max-w-sm">
            Upload a CSV file with headers: <code className="text-accent-primary">playerId, name, category, basePrice</code>
          </p>
          
          <label className="btn btn-primary cursor-pointer relative overflow-hidden">
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
              disabled={loading}
            />
            <Upload size={18} /> {loading ? 'Uploading...' : 'Choose CSV File'}
          </label>
        </div>

        {/* Manual Add */}
        <div className="bg-[rgba(0,0,0,0.2)] p-6 rounded-lg border border-[rgba(255,255,255,0.05)]">
          <h3 className="mb-4">Add Single Player</h3>
          
          <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Player ID</label>
              <input 
                type="text" 
                className="form-input text-sm" 
                required 
                value={manualPlayer.playerId}
                onChange={e => setManualPlayer({...manualPlayer, playerId: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Name</label>
              <input 
                type="text" 
                className="form-input text-sm" 
                required 
                value={manualPlayer.name}
                onChange={e => setManualPlayer({...manualPlayer, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Category / Role</label>
              <input 
                type="text" 
                className="form-input text-sm" 
                required 
                value={manualPlayer.category}
                onChange={e => setManualPlayer({...manualPlayer, category: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Base Price</label>
              <input 
                type="number" 
                className="form-input text-sm" 
                required 
                min="0"
                value={manualPlayer.basePrice}
                onChange={e => setManualPlayer({...manualPlayer, basePrice: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary col-span-2 mt-2" disabled={loading}>
              <Plus size={16} /> Add Player
            </button>
          </form>
        </div>
      </div>

      {/* Players List */}
      <div>
        <h3 className="mb-4">Player Pool ({room.players.length})</h3>
        {room.players.length === 0 ? (
          <p className="text-muted">No players added yet.</p>
        ) : (
          <div className="table-container max-h-[400px] overflow-y-auto">
            <table>
              <thead className="sticky top-0 bg-var(--bg-dark)">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {room.players.map(player => (
                  <tr key={player.id}>
                    <td>{player.playerId}</td>
                    <td className="font-medium">{player.name}</td>
                    <td><span className="badge badge-primary">{player.category}</span></td>
                    <td>{player.basePrice}</td>
                    <td>
                      <span className={`badge ${player.status === 'unsold' ? 'bg-gray-600/30' : 'badge-success'}`}>
                        {player.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
