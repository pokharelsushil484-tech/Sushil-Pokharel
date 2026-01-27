import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, Activity, Zap, Cpu
} from 'lucide-react';
import { APP_VERSION, WATERMARK, BUILD_DATE } from '../constants';

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
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-32 overflow-y-visible">
      {/* System Status - High Contrast Version Labels */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
            <div className="stark-label inline-block text-[8px] mb-2">Build Active</div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Control Terminal</h1>
        </div>
        <div className="flex items-center space-x-6 bg-[#0a0a0a] border border-white/10 p-5 rounded-[2rem] shadow-2xl">
            <Cpu className="text-white animate-pulse" size={24} />
            <div className="text-left">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Integrity</p>
                <div className="bg-emerald-500 text-black text-[9px] px-2 py-0.5 rounded font-black">ENCRYPTED</div>
            </div>
        </div>
      </div>

      {/* Main Container - Scrollable internal area for many widgets */}
      <div className="master-box p-10 md:p-16 rounded-[4rem] group overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Zap size={250} className="text-indigo-500" />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-2xl">
          <div className="inline-flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck size={14} className="text-white" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Lvl {user.level} Secure Connection</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
            Node: <span className="text-indigo-500 italic uppercase">{user.name.split(' ')[0]}</span>
          </h1>
          
          <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-lg">
            System core initialized. Environment parameters synchronized for the {BUILD_DATE}.
          </p>
          
          <div className="pt-6 flex flex-wrap gap-5">
             <button 
              onClick={handleCheckUpdates}
              className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center hover:invert transition-all shadow-xl"
             >
                <RefreshCw size={16} className="mr-3" /> Integrity Check
             </button>
             <button 
              onClick={() => onNavigate(View.SETTINGS)}
              className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center hover:bg-white/10 transition-all"
             >
                Configure
             </button>
          </div>
        </div>
      </div>

      {/* Widget Grid - Fixes "Many Boxes" visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-box">
        {[
          { icon: Calendar, title: "Strategic Roadmap", desc: "Planner & Milestones", view: View.VERIFY_LINK },
          { icon: Database, title: "Quantum Vault", desc: "Encrypted Data Matrix", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className="master-box p-10 rounded-[3.5rem] group cursor-pointer hover:border-indigo-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/5 group-hover:bg-white group-hover:text-black transition-all">
                <item.icon size={24} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-all" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">{item.title}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Version Display - Stark Contrast (Black on White) */}
      <div className="pt-24 pb-12 flex flex-col items-center space-y-6">
          <div className="stark-label text-[10px] py-2 px-6">
              {APP_VERSION}
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-[1em]">{WATERMARK}</p>
            <p className="text-[8px] font-bold text-slate-800 uppercase tracking-widest italic">{BUILD_DATE}</p>
          </div>
      </div>

      {/* System Probe Modal */}
      {updateState !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 text-center relative animate-scale-in">
             {updateState === 'CHECKING' ? (
               <div className="space-y-8">
                 <div className="relative w-20 h-20 mx-auto">
                    <Loader2 size={80} className="text-white animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={32} className="text-white animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Scanning Node</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Cross-referencing elite build v9.2.6...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-10">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-2xl">
                    <CheckCircle2 size={40} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Integrity Secure</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-10">System is optimized.</p>
                 </div>
                 <button 
                  onClick={() => setUpdateState('IDLE')}
                  className="w-full py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-200 transition-all shadow-xl"
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