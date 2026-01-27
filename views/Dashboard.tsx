import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, Activity, Zap, Cpu, Bell, Globe
} from 'lucide-react';
import { APP_VERSION, WATERMARK, BUILD_DATE } from '../constants';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [integrityState, setIntegrityState] = useState<'IDLE' | 'SCANNING' | 'SECURE'>('IDLE');

  const handleIntegrityCheck = () => {
    setIntegrityState('SCANNING');
    setTimeout(() => setIntegrityState('SECURE'), 2000);
  };

  return (
    <div className="space-y-10 animate-platinum pb-32">
      {/* Executive Status Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
            <div className="stark-badge inline-block mb-2">Build Active: Platinum</div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">System Terminal</h1>
        </div>
        
        <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-5 bg-white/5 border border-white/10 p-5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Cpu className="text-emerald-400 animate-pulse" size={24} />
                </div>
                <div className="text-left pr-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Integrity Matrix</p>
                    <div className="bg-emerald-500 text-black text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Operational</div>
                </div>
            </div>
            <div className="flex items-center space-x-5 bg-white/5 border border-white/10 p-5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <Globe className="text-indigo-400" size={24} />
                </div>
                <div className="text-left pr-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Network Node</p>
                    <p className="text-xs font-black text-white uppercase tracking-widest italic">Global Alpha</p>
                </div>
            </div>
        </div>
      </div>

      {/* Hero Management Card */}
      <div className="master-box p-12 md:p-20 relative overflow-hidden group">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={300} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-10 max-w-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl">
                <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Security Clearance Level {user.level}</span>
          </div>
          
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
            Welcome, <br/>
            <span className="text-indigo-500 italic uppercase">{user.name.split(' ')[0]}</span>
          </h2>
          
          <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-lg">
            Personnel environment synchronized. Institutional encryption active for the <span className="text-white">{BUILD_DATE}</span> release cycle.
          </p>
          
          <div className="pt-8 flex flex-wrap gap-6">
             <button 
              onClick={handleIntegrityCheck}
              className="px-10 py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center hover:invert transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
             >
                <RefreshCw size={18} className="mr-3" /> System Integrity
             </button>
             <button 
              onClick={() => onNavigate(View.SETTINGS)}
              className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center hover:bg-white/10 transition-all backdrop-blur-md"
             >
                Node Parameters
             </button>
          </div>
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          { icon: Calendar, title: "Strategic Roadmap", desc: "Institutional Planner & Analytics", view: View.VERIFY_LINK, color: "text-indigo-500" },
          { icon: Database, title: "Quantum Vault", desc: "Secured Institutional Data Hub", view: View.FILE_HUB, color: "text-platinum" }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className="master-box p-12 rounded-[4rem] group cursor-pointer hover:border-white/20 transition-all hover:scale-[1.01]"
          >
            <div className="flex justify-between items-start mb-12">
              <div className="w-16 h-16 bg-white/5 rounded-[1.75rem] flex items-center justify-center text-white border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-inner">
                <item.icon size={28} />
              </div>
              <div className="p-3 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">{item.title}</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-4">{item.desc}</p>
            <div className="w-12 h-1 bg-indigo-600 rounded-full group-hover:w-24 transition-all duration-700"></div>
          </div>
        ))}
      </div>

      {/* Advanced Version Matrix */}
      <div className="pt-24 pb-12 flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-6">
              <div className="w-px h-12 bg-white/10"></div>
              <div className="text-center">
                  <div className="stark-badge mb-3 mx-auto">Version Signature: {APP_VERSION}</div>
                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-[1.2em]">{WATERMARK}</p>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
          </div>
          <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 flex items-center space-x-3">
              <Activity size={12} className="text-indigo-500" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Core Stability: 100% Operational</p>
          </div>
      </div>

      {/* Integrity Modal */}
      {integrityState !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl">
          <div className="w-full max-w-md bg-slate-900/50 border border-white/10 rounded-[3.5rem] p-16 text-center relative animate-platinum shadow-[0_0_100px_rgba(0,0,0,1)]">
             {integrityState === 'SCANNING' ? (
               <div className="space-y-10">
                 <div className="relative w-28 h-28 mx-auto">
                    <Loader2 size={112} className="text-white animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={40} className="text-white animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tighter">Scanning Node</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] leading-relaxed">Cross-referencing Platinum build v9.3.0...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-12">
                 <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-2xl">
                    <CheckCircle2 size={48} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white mb-3 uppercase italic">Node Secure</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-12">System Core is at peak integrity.</p>
                 </div>
                 <button 
                  onClick={() => setIntegrityState('IDLE')}
                  className="btn-platinum w-full py-6"
                 >
                   Return to Hub
                 </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};