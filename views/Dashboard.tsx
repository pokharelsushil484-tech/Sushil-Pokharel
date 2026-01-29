import React, { useState } from 'react';
import { UserProfile, View, Note } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, Zap, ShieldAlert, AlertTriangle, BadgeCheck, Send, Terminal, Activity, Server, Cpu
} from 'lucide-react';
import { VERIFIED_LABEL, APP_NAME } from '../constants';
import { storageService } from '../services/storageService';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [integrityState, setIntegrityState] = useState<'IDLE' | 'SCANNING' | 'SECURE'>('IDLE');
  const [quickNote, setQuickNote] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  const handleIntegrityCheck = () => {
    setIntegrityState('SCANNING');
    setTimeout(() => setIntegrityState('SECURE'), 2500);
  };

  const handleQuickCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setIsCommitting(true);
    
    const newNote: Note = {
        id: Date.now().toString(),
        title: "Entry: " + quickNote.substring(0, 15) + "...",
        content: quickNote,
        date: new Date().toISOString(),
        tags: ["QUICK_SYNC"],
        status: 'COMPLETED',
        author: 'user'
    };

    const stored = await storageService.getData(`architect_data_${username}`);
    const notes = stored?.notes || [];
    notes.unshift(newNote);
    await storageService.setData(`architect_data_${username}`, { ...stored, notes });

    setTimeout(() => {
        setQuickNote('');
        setIsCommitting(false);
    }, 1000);
  };

  const strikeLevel = user.violationCount || 0;
  const maxStrikes = user.maxViolations || 3;

  return (
    <div className="space-y-12 sm:space-y-20 animate-platinum max-w-full">
      {/* Dynamic Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-5 w-full">
            <div className="stark-badge inline-flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span>NODE_ID: {username.toUpperCase()}</span>
            </div>
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">Management<br/>Center</h1>
        </div>
        
        <div className="master-box p-6 border border-white/5 w-full sm:w-auto min-w-[300px]">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Integrity</p>
                {strikeLevel > 0 ? <ShieldAlert className="text-red-500 animate-pulse" size={16} /> : <ShieldCheck className="text-emerald-500" size={16} />}
            </div>
            <div className="flex gap-2">
                {Array.from({ length: maxStrikes }).map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-700 ${i < strikeLevel ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-white/5'}`}></div>
                ))}
            </div>
        </div>
      </div>

      {/* Primary Command Box */}
      <div className="master-box p-10 sm:p-20 md:p-28 relative group border-glow">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 pointer-events-none">
            <Server size={600} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-12 sm:space-y-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] transform -rotate-3">
                {user.isVerified ? <BadgeCheck size={40} /> : <ShieldAlert size={40} />}
            </div>
            <div>
                <span className="block text-indigo-500 text-xs font-black uppercase tracking-[0.4em] mb-1">Clearance Level 0{user.level}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {user.isVerified ? VERIFIED_LABEL : "PENDING_SECURITY_VALIDATION"}
                </span>
            </div>
          </div>
          
          <div className="space-y-4">
              <h2 className="text-5xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white leading-[0.85]">
                Greeting,<br/>
                <span className="text-indigo-600 italic uppercase drop-shadow-[0_0_20px_rgba(79,70,229,0.2)]">{user.name.split(' ')[0]}</span>
              </h2>
          </div>
          
          <form onSubmit={handleQuickCommit} className="max-w-3xl relative group">
              <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white transition-colors" size={24} />
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] py-7 sm:py-9 pl-16 pr-28 text-sm sm:text-base font-bold text-white outline-none focus:border-white/20 transition-all placeholder:text-slate-800"
                placeholder="INITIALIZE DATA ENTRY..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-slate-200 disabled:opacity-10 transition-all shadow-2xl shadow-white/5"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
          </form>

          <div className="flex flex-wrap gap-5">
             <button onClick={handleIntegrityCheck} className="px-10 py-6 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95">
                <RefreshCw size={18} className="mr-4" /> System Audit
             </button>
             <button onClick={() => onNavigate(View.SUPPORT)} className="px-10 py-6 bg-white/5 text-white border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-md active:scale-95">
                Admin Relay
             </button>
          </div>
        </div>
      </div>

      {/* Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {[
          { icon: Activity, title: "Strategic Nodes", desc: "Operational Benchmarks", view: View.VERIFY_LINK },
          { icon: Database, title: "Secure Archive", desc: "Quantum Data Repository", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view as View)}
            className={`master-box p-12 sm:p-16 group cursor-pointer hover:scale-[1.02] hover:border-white/20 ${!user.isVerified && item.view === View.FILE_HUB ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-start mb-16">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-inner">
                <item.icon size={32} />
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-10 group-hover:translate-x-0">
                <ChevronRight size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tighter italic">{item.title}</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Audit Overlay */}
      {integrityState !== 'IDLE' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
          <div className="w-full max-w-lg bg-[#050505] border border-white/10 rounded-[4rem] p-12 sm:p-20 text-center animate-scale-up shadow-[0_0_100px_rgba(0,0,0,1)]">
             {integrityState === 'SCANNING' ? (
               <div className="space-y-12">
                 <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu size={48} className="text-indigo-500 animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 uppercase italic tracking-tight">Node Audit</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Synchronizing Security Grid...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-12">
                 <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={56} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-4xl font-black text-white uppercase italic">Audit Pass</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Integrity Level 9.2.5 Verified</p>
                 </div>
                 <button onClick={() => setIntegrityState('IDLE')} className="btn-platinum py-6 active:scale-95">Finalize</button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};