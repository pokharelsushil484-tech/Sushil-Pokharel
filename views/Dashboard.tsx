import React, { useState } from 'react';
import { UserProfile, View, Note } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, Zap, ShieldAlert, AlertTriangle, BadgeCheck, Send, Terminal, Activity, Server, Cpu, Layers, Fingerprint
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
    setTimeout(() => setIntegrityState('SECURE'), 2800);
  };

  const handleQuickCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setIsCommitting(true);
    
    const newNote: Note = {
        id: Date.now().toString(),
        title: "Node Entry: " + quickNote.substring(0, 18) + "...",
        content: quickNote,
        date: new Date().toISOString(),
        tags: ["EXECUTIVE_SYNC"],
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
    }, 1200);
  };

  const strikeLevel = user.violationCount || 0;
  const maxStrikes = user.maxViolations || 3;

  return (
    <div className="space-y-16 sm:space-y-24 animate-platinum max-w-full">
      {/* High-Impact Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="space-y-6 w-full">
            <div className="stark-badge inline-flex items-center space-x-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <span>NODE_ID: {username.toUpperCase()}</span>
            </div>
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">Institutional<br/><span className="text-indigo-600 not-italic">Dashboard</span></h1>
        </div>
        
        <div className="master-box p-8 border border-white/5 w-full sm:w-auto min-w-[360px] bg-slate-950/40">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Integrity</p>
                    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Status: {strikeLevel === 0 ? 'NOMINAL' : 'COMPROMISED'}</p>
                </div>
                {strikeLevel > 0 ? <ShieldAlert className="text-red-500 animate-pulse" size={20} /> : <ShieldCheck className="text-emerald-500" size={20} />}
            </div>
            <div className="flex gap-3">
                {Array.from({ length: maxStrikes }).map((_, i) => (
                    <div key={i} className={`flex-1 h-2.5 rounded-full transition-all duration-1000 ${i < strikeLevel ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-white/5 shadow-inner'}`}></div>
                ))}
            </div>
        </div>
      </div>

      {/* Main Command & Intake Block */}
      <div className="master-box p-12 sm:p-24 md:p-32 relative group border-glow">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-[3s] pointer-events-none">
            <Fingerprint size={700} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-16 sm:space-y-28">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-[2rem] flex items-center justify-center text-black shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                {user.isVerified ? <BadgeCheck size={56} /> : <ShieldAlert size={56} />}
            </div>
            <div className="space-y-2">
                <span className="inline-block bg-indigo-500/10 text-indigo-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.4em] border border-indigo-500/20">Clearance Level 0{user.level}</span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    {user.isVerified ? VERIFIED_LABEL : "SECURE_VALIDATION_REQUIRED"}
                </p>
            </div>
          </div>
          
          <div className="space-y-6">
              <h2 className="text-6xl sm:text-9xl font-black tracking-tighter text-white leading-[0.85] uppercase">
                Welcome back,<br/>
                <span className="text-indigo-600 italic drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]">{user.name.split(' ')[0]}</span>
              </h2>
          </div>
          
          <form onSubmit={handleQuickCommit} className="max-w-4xl relative group">
              <Terminal className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={28} />
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-[3rem] py-8 sm:py-10 pl-20 pr-32 text-base sm:text-lg font-bold text-white outline-none focus:border-white/20 transition-all placeholder:text-slate-900 shadow-inner"
                placeholder="INITIALIZE DATA SYNCHRONIZATION..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-black hover:bg-slate-200 disabled:opacity-10 transition-all shadow-2xl active:scale-90"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={28} /> : <Send size={28} />}
              </button>
          </form>

          <div className="flex flex-wrap gap-6">
             <button onClick={handleIntegrityCheck} className="px-14 py-8 bg-white text-black rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95">
                <RefreshCw size={20} className="mr-5" /> System Audit Protocol
             </button>
             <button onClick={() => onNavigate(View.SUPPORT)} className="px-14 py-8 bg-white/5 text-white border border-white/10 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-3xl active:scale-95">
                Admin Relay Channel
             </button>
          </div>
        </div>
      </div>

      {/* Global Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {[
          { icon: Activity, title: "Strategic Nodes", desc: "Operational Performance Metrics", view: View.VERIFY_LINK, color: 'indigo' },
          { icon: Database, title: "Secure Vault", desc: "Institutional Data Preservation", view: View.FILE_HUB, color: 'platinum' }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view as View)}
            className={`master-box p-16 sm:p-20 group cursor-pointer hover:scale-[1.03] hover:border-white/20 relative ${!user.isVerified && item.view === View.FILE_HUB ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
          >
            <div className="absolute bottom-0 right-0 p-10 opacity-[0.02] transform translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000">
                <item.icon size={200} />
            </div>
            <div className="flex justify-between items-start mb-20 relative z-10">
              <div className={`w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-2xl`}>
                <item.icon size={36} />
              </div>
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-10 group-hover:translate-x-0 border border-white/10">
                <ChevronRight size={28} className="text-white" />
              </div>
            </div>
            <div className="relative z-10 space-y-4">
                <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{item.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Audit Modal Overlay */}
      {integrityState !== 'IDLE' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl">
          <div className="w-full max-w-xl bg-[#080808] border border-white/10 rounded-[5rem] p-16 sm:p-28 text-center animate-scale-up shadow-[0_0_150px_rgba(0,0,0,1)]">
             {integrityState === 'SCANNING' ? (
               <div className="space-y-16">
                 <div className="relative mx-auto w-40 h-40">
                    <div className="absolute inset-0 border-6 border-indigo-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-6 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu size={64} className="text-indigo-500 animate-pulse" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight">Infrastructure Audit</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.6em] animate-pulse">Synchronizing Global Security Grid...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-16">
                 <div className="w-28 h-28 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={64} />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter">Audit Verified</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.5em]">Integrity Protocol v13.5 Stable</p>
                 </div>
                 <button onClick={() => setIntegrityState('IDLE')} className="btn-platinum py-7 shadow-2xl active:scale-95">Complete Synchronization</button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};