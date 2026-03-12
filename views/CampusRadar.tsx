import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation as NavIcon, Crosshair, Plus, Trash2, Globe, Cpu, Loader2, Radar } from 'lucide-react';
import { CampusNode, UserProfile } from '../types';
import { storageService } from '../services/storageService';

export const CampusRadar: React.FC<{ username: string, user: UserProfile }> = ({ username, user }) => {
  const [nodes, setNodes] = useState<CampusNode[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinName, setPinName] = useState('');

  const isPro = user.subscriptionTier !== 'LIGHT';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-24"
    >
      {/* Radar Visual */}
      <motion.div variants={item} className={`relative h-96 w-full max-w-2xl mx-auto overflow-hidden flex items-center justify-center ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
        <div className={`absolute inset-0 radar-grid opacity-20 ${!isPro && 'grayscale'}`}></div>
        <div className={`absolute w-[300px] h-[300px] border rounded-full ${isPro ? 'border-amber-500/30' : 'border-gray-500'}`}></div>
        <div className={`absolute w-[200px] h-[200px] border rounded-full ${isPro ? 'border-amber-500/20' : 'border-gray-400'}`}></div>
        <div className={`absolute w-[100px] h-[100px] border rounded-full ${isPro ? 'border-amber-500/10' : 'border-gray-400'}`}></div>
        <div className={`radar-sweep ${!isPro && 'grayscale opacity-5'}`}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full animate-ping mb-4 ${isPro ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-gray-600'}`}></div>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.4em] ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>Node Active</p>
          {coords && (
            <div className="mt-4 text-center space-y-1 font-mono">
              <p className={`text-xs font-medium ${isPro ? 'text-emerald-400' : 'text-green-700'}`}>LAT: {coords.lat.toFixed(6)}</p>
              <p className={`text-xs font-medium ${isPro ? 'text-emerald-400' : 'text-green-700'}`}>LNG: {coords.lng.toFixed(6)}</p>
              <p className={`text-[8px] uppercase ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Precision: ±{coords.acc.toFixed(1)}m</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pin Interface */}
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={item} className={`p-8 flex items-center gap-6 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
          <div className="flex-1 relative group">
            <MapPin className={`absolute left-6 top-1/2 -translate-y-1/2 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`} size={18} />
            <input 
              type="text" 
              value={pinName}
              onChange={e => setPinName(e.target.value)}
              className={`w-full py-5 pl-16 pr-6 font-medium text-xs outline-none transition-all ${isPro ? 'bg-amber-950/20 border border-amber-500/20 rounded-2xl text-amber-100 focus:border-amber-500/40 placeholder:text-amber-500/20' : 'bg-gray-200 border-2 border-gray-500 rounded-none text-gray-900 focus:border-gray-700 placeholder:text-gray-500'}`}
              placeholder="Assign location name (e.g. Lab 4)"
            />
          </div>
          <button 
            onClick={handlePin}
            disabled={loading || !pinName.trim() || !coords}
            className={`w-16 h-16 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isPro ? 'bg-amber-500 rounded-2xl text-black shadow-xl hover:bg-amber-400 shadow-amber-500/20' : 'bg-gray-500 rounded-none text-white hover:bg-gray-600 border-2 border-gray-600'}`}
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
          </button>
        </motion.div>

        {/* Node History */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {nodes.map(node => (
              <motion.div 
                key={node.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 flex items-center justify-between group transition-all ${isPro ? 'glass-card hover:border-amber-500/30 border-amber-500/10' : 'bg-gray-300 border-4 border-gray-500 rounded-none hover:bg-gray-400'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 border ${isPro ? 'bg-amber-950/20 rounded-xl text-amber-400 border-amber-500/10' : 'bg-gray-400 rounded-none text-gray-800 border-gray-500'}`}>
                    <NavIcon size={16} />
                  </div>
                  <div>
                    <h4 className={`text-xs uppercase tracking-wide ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{node.name}</h4>
                    <p className={`text-[8px] font-mono mt-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</p>
                  </div>
                </div>
                <button onClick={() => deleteNode(node.id)} className={`p-3 opacity-0 group-hover:opacity-100 transition-all ${isPro ? 'text-amber-500/20 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}>
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .radar-grid {
          background-image: linear-gradient(to right, rgba(245,158,11,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(245,158,11,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .radar-sweep {
          position: absolute;
          width: 300px;
          height: 300px;
          background: conic-gradient(from 0deg, rgba(245,158,11,0.5) 0%, transparent 40%);
          border-radius: 50%;
          animation: sweep 4s linear infinite;
          opacity: 0.15;
        }
        @keyframes sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};
