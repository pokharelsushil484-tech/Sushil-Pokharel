
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation as NavIcon, Crosshair, Plus, Trash2, Globe, Cpu, Loader2 } from 'lucide-react';
import { CampusNode } from '../types';
import { storageService } from '../services/storageService';

export const CampusRadar: React.FC<{ username: string }> = ({ username }) => {
  const [nodes, setNodes] = useState<CampusNode[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinName, setPinName] = useState('');

  useEffect(() => {
    loadNodes();
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const loadNodes = async () => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (stored?.campusNodes) setNodes(stored.campusNodes);
  };

  const handlePin = async () => {
    if (!coords || !pinName.trim()) return;
    setLoading(true);
    const newNode: CampusNode = {
      id: Date.now().toString(),
      name: pinName.toUpperCase(),
      lat: coords.lat,
      lng: coords.lng,
      timestamp: Date.now()
    };
    const stored = await storageService.getData(`architect_data_${username}`);
    const updated = [newNode, ...(stored?.campusNodes || [])];
    await storageService.setData(`architect_data_${username}`, { ...stored, campusNodes: updated });
    setNodes(updated);
    setPinName('');
    setLoading(false);
  };

  const deleteNode = async (id: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    const updated = nodes.filter(n => n.id !== id);
    await storageService.setData(`architect_data_${username}`, { ...stored, campusNodes: updated });
    setNodes(updated);
  };

  return (
    <div className="space-y-10 animate-platinum pb-24">
      {/* Radar Visual */}
      <div className="relative h-96 w-full max-w-2xl mx-auto master-box overflow-hidden bg-black/60 border-indigo-500/20 flex items-center justify-center">
        <div className="absolute inset-0 radar-grid opacity-20"></div>
        <div className="absolute w-[300px] h-[300px] border border-indigo-500/30 rounded-full"></div>
        <div className="absolute w-[200px] h-[200px] border border-indigo-500/20 rounded-full"></div>
        <div className="absolute w-[100px] h-[100px] border border-indigo-500/10 rounded-full"></div>
        <div className="radar-sweep"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping mb-4"></div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Node Active</p>
          {coords && (
            <div className="mt-4 text-center space-y-1 font-mono">
              <p className="text-emerald-500 text-xs font-bold">LAT: {coords.lat.toFixed(6)}</p>
              <p className="text-emerald-500 text-xs font-bold">LNG: {coords.lng.toFixed(6)}</p>
              <p className="text-[8px] text-slate-500 uppercase">Precision: ±{coords.acc.toFixed(1)}m</p>
            </div>
          )}
        </div>
      </div>

      {/* Pin Interface */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="master-box p-8 flex items-center gap-6 bg-black/40 border-white/5">
          <div className="flex-1 relative group">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text" 
              value={pinName}
              onChange={e => setPinName(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-black text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
              placeholder="ASSIGN LOCATION NAME (e.g. LAB 4)"
            />
          </div>
          <button 
            onClick={handlePin}
            disabled={loading || !pinName.trim() || !coords}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl hover:bg-slate-200 transition-all disabled:opacity-10"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
          </button>
        </div>

        {/* Node History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes.map(node => (
            <div key={node.id} className="master-box p-6 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-500">
                  <NavIcon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase italic">{node.name}</h4>
                  <p className="text-[8px] text-slate-600 font-mono mt-0.5">{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</p>
                </div>
              </div>
              <button onClick={() => deleteNode(node.id)} className="p-3 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .radar-grid {
          background-image: linear-gradient(to right, #1e1b4b 1px, transparent 1px),
                            linear-gradient(to bottom, #1e1b4b 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .radar-sweep {
          position: absolute;
          width: 300px;
          height: 300px;
          background: conic-gradient(from 0deg, #4f46e5 0%, transparent 40%);
          border-radius: 50%;
          animation: sweep 4s linear infinite;
          opacity: 0.15;
        }
        @keyframes sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
