
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Lock, RefreshCw, Cpu, Server, Eye, AlertCircle } from 'lucide-react';

export const SecurityHeartbeat: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [integrity, setIntegrity] = useState(98.4);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
        setScanning(false);
        setIntegrity(99.9);
    }, 3000);
  };

  return (
    <div className="space-y-10 animate-platinum pb-24 max-w-4xl mx-auto">
      <div className="master-box p-12 bg-black/40 border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} />
        </div>
        
        <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl">
                <Activity size={32} className="animate-pulse" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Mesh Heartbeat</h1>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.5em] mt-2">Active Security Monitor</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
                <div className="bg-black p-8 rounded-3xl border border-white/5 space-y-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mesh Integrity Status</span>
                    <div className="flex items-baseline gap-4">
                        <span className="text-5xl font-black text-emerald-500 italic">{integrity}%</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Optimal Node Sync</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full animate-pulse" style={{ width: `${integrity}%` }}></div>
                    </div>
                </div>
                
                <button 
                    onClick={startScan} 
                    disabled={scanning}
                    className="w-full py-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-4"
                >
                    {scanning ? <RefreshCw className="animate-spin" size={20}/> : <Lock size={20}/>}
                    {scanning ? 'Initiating Deep Sync...' : 'Trigger Security Scan'}
                </button>
            </div>

            <div className="space-y-4">
                <div className="h-full bg-indigo-950/10 border border-indigo-500/10 rounded-3xl p-8 relative">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Live Threat Map</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between text-[9px] font-mono">
                                <span className="text-slate-500">AUTH_RELAY_{i}</span>
                                <span className="text-emerald-500">ENCRYPTED</span>
                            </div>
                        ))}
                        <div className="pt-6">
                            <div className="flex items-center gap-3 text-amber-500 animate-pulse">
                                <AlertCircle size={14}/>
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Check Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="master-box p-8 bg-white/5 border-white/5 flex flex-col items-center text-center">
              <Cpu size={24} className="text-indigo-400 mb-4" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Neural Logic</h4>
              <p className="text-[9px] text-slate-500 uppercase">Process Guard</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-white/5 flex flex-col items-center text-center">
              <Server size={24} className="text-indigo-400 mb-4" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Data Sovereignty</h4>
              <p className="text-[9px] text-slate-500 uppercase">Archive Shield</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-white/5 flex flex-col items-center text-center">
              <Eye size={24} className="text-indigo-400 mb-4" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Stealth Mesh</h4>
              <p className="text-[9px] text-slate-500 uppercase">Privacy Mask</p>
          </div>
      </div>
    </div>
  );
};
