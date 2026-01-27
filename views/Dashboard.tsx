import React, { useState } from 'react';
import { UserProfile, View, Note } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, Activity, Zap, ShieldAlert, AlertTriangle, BadgeCheck, Send, Terminal
} from 'lucide-react';
import { APP_VERSION, WATERMARK, BUILD_DATE, VERIFIED_LABEL } from '../constants';
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
    setTimeout(() => setIntegrityState('SECURE'), 2000);
  };

  const handleQuickCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setIsCommitting(true);
    
    // Simulate complex logic - Direct commitment to storage
    const newNote: Note = {
        id: Date.now().toString(),
        title: "Insight: " + quickNote.substring(0, 20) + "...",
        content: quickNote,
        date: new Date().toISOString(),
        tags: ["DASHBOARD_ENTRY"],
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
    }, 800);
  };

  const strikeLevel = user.violationCount || 0;
  const maxStrikes = user.maxViolations || 3;

  return (
    <div className="space-y-10 animate-platinum pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
            <div className="stark-badge inline-block mb-2">Node Active: {username.toUpperCase()}</div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">System Terminal</h1>
        </div>
        
        <div className="flex flex-wrap gap-4">
            <div className={`flex items-center space-x-5 bg-white/5 border ${strikeLevel > 0 ? 'border-red-500/30' : 'border-white/10'} p-5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl transition-colors`}>
                <div className={`p-3 ${strikeLevel > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {strikeLevel > 0 ? <ShieldAlert className="animate-pulse" size={24} /> : <ShieldCheck size={24} />}
                </div>
                <div className="text-left pr-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Node Health</p>
                    <div className={`flex gap-1`}>
                        {Array.from({ length: maxStrikes }).map((_, i) => (
                            <div key={i} className={`w-6 h-1.5 rounded-full ${i < strikeLevel ? 'bg-red-600' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="master-box p-12 md:p-20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={300} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-10 max-w-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl">
                {user.isVerified ? <BadgeCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 leading-none mb-1">Clearance Level {user.level}</span>
                {user.isVerified ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">{VERIFIED_LABEL}</span>
                ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">UNVERIFIED NODE</span>
                )}
            </div>
          </div>
          
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
            Welcome, <br/>
            <span className="text-indigo-500 italic uppercase">{user.name.split(' ')[0]}</span>
            {user.isVerified && <span className="inline-block ml-4 text-indigo-400"><BadgeCheck size={48} className="md:w-20 md:h-20" /></span>}
          </h2>
          
          {/* Quick Command Insight Box */}
          <form onSubmit={handleQuickCommit} className="max-w-xl relative group">
              <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-20 text-sm font-bold text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-700"
                placeholder="COMMIT ANSWER OR NOTE..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black hover:bg-slate-200 disabled:opacity-20 transition-all"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
          </form>

          {!user.isVerified && (
              <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] flex flex-col sm:flex-row items-center sm:items-start gap-6 max-w-xl animate-pulse">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={32} />
                  <div className="text-center sm:text-left">
                      <p className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2">Restricted Protocol</p>
                      <p className="text-[10px] text-amber-200/60 leading-relaxed uppercase font-bold mb-6">Critical data layers are locked. Institutional identity intake required.</p>
                      <button onClick={() => onNavigate(View.VERIFICATION_FORM)} className="px-6 py-3 bg-amber-500 text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-400 transition-colors">Start Protocol</button>
                  </div>
              </div>
          )}
          
          <div className="pt-8 flex flex-wrap gap-6">
             <button onClick={handleIntegrityCheck} className="px-10 py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center hover:invert transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]">
                <RefreshCw size={18} className="mr-3" /> System Integrity
             </button>
             <button onClick={() => onNavigate(View.SUPPORT)} className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center hover:bg-white/10 transition-all backdrop-blur-md">
                Contact Admin
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          { icon: Calendar, title: "Strategic Roadmap", desc: "Institutional Planner & Analytics", view: View.VERIFY_LINK, color: "text-indigo-500" },
          { icon: Database, title: "Quantum Vault", desc: "Secured Institutional Data Hub", view: View.FILE_HUB, color: "text-platinum" }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className={`master-box p-12 rounded-[4rem] group cursor-pointer transition-all hover:scale-[1.01] ${!user.isVerified && item.view === View.FILE_HUB ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-white/20'}`}
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
          </div>
        ))}
      </div>

      {integrityState !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl">
          <div className="w-full max-w-md bg-slate-900/50 border border-white/10 rounded-[3.5rem] p-16 text-center animate-platinum">
             {integrityState === 'SCANNING' ? (
               <div className="space-y-10">
                 <Loader2 size={112} className="text-white animate-spin mx-auto opacity-20" />
                 <div>
                    <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tighter">Scanning Node</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Cross-referencing Build v11.0.0...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-12">
                 <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-2xl">
                    <CheckCircle2 size={48} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white mb-3 uppercase italic">Node Secure</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">System Core Integrity: 100%</p>
                 </div>
                 <button onClick={() => setIntegrityState('IDLE')} className="btn-platinum w-full py-6">Return to Hub</button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};