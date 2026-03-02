import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      className="space-y-10 pb-24 max-w-4xl mx-auto"
    >
      <motion.div variants={item} className="glass-card p-12 relative overflow-hidden border-amber-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className="text-amber-500" />
        </div>
        
        <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <Activity size={32} className="animate-pulse text-amber-400" />
            </div>
            <div>
                <h1 className="text-3xl font-display italic tracking-tight text-amber-100 leading-none">Mesh Heartbeat</h1>
                <p className="text-[10px] text-amber-500/60 font-semibold uppercase tracking-widest mt-2">Active Security Monitor</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
                <div className="bg-black/40 p-8 rounded-3xl border border-amber-500/10 space-y-4">
                    <span className="text-[9px] font-semibold text-amber-500/40 uppercase tracking-widest">Mesh Integrity Status</span>
                    <div className="flex items-baseline gap-4">
                        <span className="text-5xl font-display italic text-emerald-400">{integrity}%</span>
                        <span className="text-[10px] font-bold text-amber-100/60 uppercase tracking-widest">Optimal Node Sync</span>
                    </div>
                    <div className="w-full bg-amber-950/20 h-1 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${integrity}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                        />
                    </div>
                </div>
                
                <button 
                    onClick={startScan} 
                    disabled={scanning}
                    className="w-full py-6 text-xs flex items-center justify-center gap-4 bg-amber-500 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {scanning ? <RefreshCw className="animate-spin" size={20}/> : <Lock size={20}/>}
                    {scanning ? 'Initiating Deep Sync...' : 'Trigger Security Scan'}
                </button>
            </div>

            <div className="space-y-4">
                <div className="h-full bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 relative">
                    <h3 className="text-[10px] font-semibold text-amber-100 uppercase tracking-widest mb-6 border-b border-amber-500/10 pb-4">Live Threat Map</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between text-[9px] font-mono">
                                <span className="text-amber-500/40">AUTH_RELAY_{i}</span>
                                <span className="text-emerald-400">ENCRYPTED</span>
                            </div>
                        ))}
                        <div className="pt-6">
                            <div className="flex items-center gap-3 text-amber-400 animate-pulse">
                                <AlertCircle size={14}/>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Check Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 flex flex-col items-center text-center hover:bg-amber-500/5 transition-colors border-amber-500/10">
              <Cpu size={24} className="text-amber-400 mb-4" />
              <h4 className="text-[10px] font-bold text-amber-100 uppercase tracking-widest mb-2">Neural Logic</h4>
              <p className="text-[9px] text-amber-500/40 uppercase">Process Guard</p>
          </div>
          <div className="glass-card p-8 flex flex-col items-center text-center hover:bg-amber-500/5 transition-colors border-amber-500/10">
              <Server size={24} className="text-amber-400 mb-4" />
              <h4 className="text-[10px] font-bold text-amber-100 uppercase tracking-widest mb-2">Data Sovereignty</h4>
              <p className="text-[9px] text-amber-500/40 uppercase">Archive Shield</p>
          </div>
          <div className="glass-card p-8 flex flex-col items-center text-center hover:bg-amber-500/5 transition-colors border-amber-500/10">
              <Eye size={24} className="text-amber-400 mb-4" />
              <h4 className="text-[10px] font-bold text-amber-100 uppercase tracking-widest mb-2">Stealth Mesh</h4>
              <p className="text-[9px] text-amber-500/40 uppercase">Privacy Mask</p>
          </div>
      </motion.div>
    </motion.div>
  );
};
