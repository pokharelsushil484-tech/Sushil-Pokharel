import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  Award, GraduationCap, CheckCircle2, Loader2, Activity, Zap, Cpu
} from 'lucide-react';
import { APP_VERSION, WATERMARK } from '../constants';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [updateState, setUpdateState] = useState<'IDLE' | 'CHECKING' | 'RESULT'>('IDLE');

  const handleCheckUpdates = () => {
    setUpdateState('CHECKING');
    setTimeout(() => {
      setUpdateState('RESULT');
    }, 2500);
  };

  return (
    <div className="space-y-16 animate-fade-in pb-32">
      {/* Executive Status Matrix */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Management Node</h2>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Executive Command</h1>
        </div>
        <div className="flex items-center space-x-6 bg-slate-900/60 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
            <div className="relative">
                <Cpu className="text-indigo-500 animate-pulse" size={28} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="text-left">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Node Status</p>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Active / {APP_VERSION.split(' ')[0]}</p>
            </div>
        </div>
      </div>

      {/* High-End Hero Interface */}
      <div className="relative overflow-hidden glass-card p-12 md:p-24 rounded-[5rem] bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent border-white/10 group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={300} className="text-white transform rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-2xl">
          <div className="inline-flex items-center space-x-4 bg-indigo-600/10 px-5 py-2.5 rounded-full border border-indigo-500/20">
            <ShieldCheck size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">Level {user.level} Security Authorized</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
            Welcome, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-600 italic">{user.name.split(' ')[0]}</span>
          </h1>
          
          <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-lg">
            Institutional environment synchronized. Cryptographic protocols enforced for the 2024–2026 academic cycle.
          </p>
          
          <div className="pt-10 flex flex-wrap gap-6">
             <button 
              onClick={handleCheckUpdates}
              className="px-10 py-5 bg-white text-slate-950 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center hover:scale-105 transition-all shadow-2xl"
             >
                <RefreshCw size={18} className="mr-4" /> Integrity Scan
             </button>
             <button 
              onClick={() => onNavigate(View.SETTINGS)}
              className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center hover:bg-white/10 transition-all"
             >
                Node Configuration
             </button>
          </div>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          { icon: Calendar, title: "Strategic Planner", desc: "Enterprise Deadlines & Roadmap", view: View.VERIFY_LINK },
          { icon: Database, title: "Quantum Vault", desc: "End-to-End Encrypted Storage", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className="glass-card p-12 rounded-[4rem] group cursor-pointer hover:border-indigo-500/50 transition-all hover:-translate-y-2 border-white/5"
          >
            <div className="flex justify-between items-start mb-12">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 border border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <item.icon size={36} />
              </div>
              <ChevronRight size={28} className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">{item.title}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] leading-loose">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Professional Watermark */}
      <div className="pt-32 pb-16 text-center opacity-30">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[1.5em]">{WATERMARK}</p>
      </div>

      {/* System Probe Modal */}
      {updateState !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-3xl">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[4rem] p-16 text-center relative animate-scale-up shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]">
             {updateState === 'CHECKING' ? (
               <div className="space-y-10">
                 <div className="relative w-32 h-32 mx-auto">
                    <Loader2 size={128} className="text-indigo-500 animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={48} className="text-indigo-400 animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tight">System Probe</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed">Analyzing node signatures for 2026 cycle...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-10">
                 <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-2xl shadow-emerald-500/20 animate-bounce">
                    <CheckCircle2 size={56} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white mb-3 uppercase italic">System Integrity Verified</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mb-12">{APP_VERSION} Locked.</p>
                 </div>
                 <button 
                  onClick={() => setUpdateState('IDLE')}
                  className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-slate-100 transition-all shadow-2xl"
                 >
                   Return to Control
                 </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};