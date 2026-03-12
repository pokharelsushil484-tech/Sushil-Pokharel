import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Activity, Lock, RefreshCw, Cpu, Server, Eye, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

export const SecurityHeartbeat: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [scanning, setScanning] = useState(false);
  const [integrity, setIntegrity] = useState(98.4);

  const isPro = user.subscriptionTier !== 'LIGHT';

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
      <motion.div variants={item} className={`p-12 relative overflow-hidden ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className={isPro ? 'text-amber-500' : 'text-gray-800'} />
        </div>
        
        <div className="flex items-center gap-6 mb-12">
            <div className={`w-16 h-16 flex items-center justify-center ${isPro ? 'bg-amber-950/20 rounded-2xl text-amber-500 border border-amber-500/20 shadow-2xl shadow-amber-500/10' : 'bg-gray-400 rounded-none text-gray-800 border-2 border-gray-500'}`}>
                <Activity size={32} className={`animate-pulse ${isPro ? 'text-amber-400' : 'text-gray-900'}`} />
            </div>
            <div>
                <h1 className={`text-3xl tracking-tight leading-none ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Mesh Heartbeat</h1>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mt-2 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Active Security Monitor</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
                <div className={`p-8 space-y-4 ${isPro ? 'bg-black/40 rounded-3xl border border-amber-500/10' : 'bg-gray-200 border-2 border-gray-500 rounded-none'}`}>
                    <span className={`text-[9px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Mesh Integrity Status</span>
                    <div className="flex items-baseline gap-4">
                        <span className={`text-5xl ${isPro ? 'font-display italic text-emerald-400' : 'font-sans font-bold text-green-700'}`}>{integrity}%</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isPro ? 'text-amber-100/60' : 'text-gray-700'}`}>Optimal Node Sync</span>
                    </div>
                    <div className={`w-full h-1 overflow-hidden ${isPro ? 'bg-amber-950/20 rounded-full' : 'bg-gray-400 rounded-none'}`}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${integrity}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full ${isPro ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-green-600'}`} 
                        />
                    </div>
                </div>
                
                <button 
                    onClick={startScan} 
                    disabled={scanning}
                    className={`w-full py-6 text-xs flex items-center justify-center gap-4 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isPro ? 'bg-amber-500 text-black rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'bg-gray-500 text-white rounded-none hover:bg-gray-600 border-2 border-gray-600'}`}
                >
                    {scanning ? <RefreshCw className="animate-spin" size={20}/> : <Lock size={20}/>}
                    {scanning ? 'Initiating Deep Sync...' : 'Trigger Security Scan'}
                </button>
            </div>

            <div className="space-y-4">
                <div className={`h-full p-8 relative ${isPro ? 'bg-amber-500/5 border border-amber-500/10 rounded-3xl' : 'bg-gray-200 border-2 border-gray-500 rounded-none'}`}>
                    <h3 className={`text-[10px] font-semibold uppercase tracking-widest mb-6 pb-4 border-b ${isPro ? 'text-amber-100 border-amber-500/10' : 'text-gray-800 border-gray-400'}`}>Live Threat Map</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between text-[9px] font-mono">
                                <span className={isPro ? 'text-amber-500/40' : 'text-gray-600'}>AUTH_RELAY_{i}</span>
                                <span className={isPro ? 'text-emerald-400' : 'text-green-700'}>ENCRYPTED</span>
                            </div>
                        ))}
                        <div className="pt-6">
                            <div className={`flex items-center gap-3 animate-pulse ${isPro ? 'text-amber-400' : 'text-gray-800'}`}>
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
          <div className={`p-8 flex flex-col items-center text-center transition-colors ${isPro ? 'glass-card hover:bg-amber-500/5 border-amber-500/10' : 'bg-gray-300 border-4 border-gray-500 rounded-none hover:bg-gray-400'}`}>
              <Cpu size={24} className={`mb-4 ${isPro ? 'text-amber-400' : 'text-gray-700'}`} />
              <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>Neural Logic</h4>
              <p className={`text-[9px] uppercase ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Process Guard</p>
          </div>
          <div className={`p-8 flex flex-col items-center text-center transition-colors ${isPro ? 'glass-card hover:bg-amber-500/5 border-amber-500/10' : 'bg-gray-300 border-4 border-gray-500 rounded-none hover:bg-gray-400'}`}>
              <Server size={24} className={`mb-4 ${isPro ? 'text-amber-400' : 'text-gray-700'}`} />
              <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>Data Sovereignty</h4>
              <p className={`text-[9px] uppercase ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Archive Shield</p>
          </div>
          <div className={`p-8 flex flex-col items-center text-center transition-colors ${isPro ? 'glass-card hover:bg-amber-500/5 border-amber-500/10' : 'bg-gray-300 border-4 border-gray-500 rounded-none hover:bg-gray-400'}`}>
              <Eye size={24} className={`mb-4 ${isPro ? 'text-amber-400' : 'text-gray-700'}`} />
              <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>Stealth Mesh</h4>
              <p className={`text-[9px] uppercase ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Privacy Mask</p>
          </div>
      </motion.div>
    </motion.div>
  );
};
