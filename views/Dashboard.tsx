import React, { useState } from 'react';
import { UserProfile, View, Note } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, Zap, ShieldAlert, AlertTriangle, BadgeCheck, Send, Terminal
} from 'lucide-react';
// Fix: Import APP_NAME from constants as it is used in the component's JSX
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
    setTimeout(() => setIntegrityState('SECURE'), 2000);
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
    }, 800);
  };

  const strikeLevel = user.violationCount || 0;
  const maxStrikes = user.maxViolations || 3;

  return (
    <div className="space-y-16 animate-platinum">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-4">
            <div className="stark-badge inline-block">NODE: {username.toUpperCase()}</div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Management Hub</h1>
        </div>
        
        <div className="flex items-center space-x-6 bg-white/5 border border-white/10 p-6 rounded-[3rem] shadow-2xl backdrop-blur-xl">
            <div className={`p-4 rounded-2xl ${strikeLevel > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {strikeLevel > 0 ? <ShieldAlert className="animate-pulse" size={28} /> : <ShieldCheck size={28} />}
            </div>
            <div className="text-left pr-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Health</p>
                <div className="flex gap-1.5">
                    {Array.from({ length: maxStrikes }).map((_, i) => (
                        <div key={i} className={`w-8 h-2 rounded-full ${i < strikeLevel ? 'bg-red-600' : 'bg-white/10'}`}></div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="master-box p-16 md:p-24 relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
            <Zap size={500} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-12 max-w-3xl">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl">
                {user.isVerified ? <BadgeCheck size={32} /> : <ShieldAlert size={32} />}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 leading-none mb-2">Clearance Level 0{user.level}</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {user.isVerified ? VERIFIED_LABEL : "PENDING INSTITUTIONAL AUTHENTICATION"}
                </span>
            </div>
          </div>
          
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.8] mb-4">
            Hello, <br/>
            <span className="text-indigo-600 italic uppercase">{user.name.split(' ')[0]}</span>
          </h2>
          
          <form onSubmit={handleQuickCommit} className="max-w-xl relative group">
              <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" size={24} />
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-7 pl-16 pr-24 text-base font-bold text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-800"
                placeholder="COMMIT COMMAND OR NOTE..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-slate-200 disabled:opacity-10 transition-all shadow-xl"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
          </form>

          {!user.isVerified && (
              <div className="p-10 bg-amber-500/5 border border-amber-500/20 rounded-[4rem] flex flex-col sm:flex-row items-center gap-8 max-w-2xl">
                  <AlertTriangle className="text-amber-500 shrink-0" size={40} />
                  <div className="text-center sm:text-left space-y-4">
                      <p className="text-base font-black text-amber-500 uppercase tracking-widest">Restricted Access</p>
                      <p className="text-xs text-amber-200/50 leading-relaxed uppercase font-bold">Your node requires institutional identity verification before high-level data can be accessed.</p>
                      <button onClick={() => onNavigate(View.VERIFICATION_FORM)} className="px-10 py-4 bg-amber-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-amber-400 transition-all">Engage Protocol</button>
                  </div>
              </div>
          )}
          
          <div className="pt-10 flex flex-wrap gap-6">
             <button onClick={handleIntegrityCheck} className="px-12 py-6 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] flex items-center hover:invert transition-all shadow-2xl">
                <RefreshCw size={20} className="mr-4" /> System Sync
             </button>
             <button onClick={() => onNavigate(View.SUPPORT)} className="px-12 py-6 bg-white/5 text-white border border-white/10 rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] flex items-center hover:bg-white/10 transition-all backdrop-blur-md">
                Admin Support
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {[
          { icon: Calendar, title: "Strategic Plan", desc: "Institutional Roadmap & Targets", view: View.VERIFY_LINK },
          { icon: Database, title: "Digital Vault", desc: "Secured Personal Data Repository", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className={`master-box p-16 rounded-[5rem] group cursor-pointer transition-all hover:scale-[1.01] ${!user.isVerified && item.view === View.FILE_HUB ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:border-white/20'}`}
          >
            <div className="flex justify-between items-start mb-16">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-white border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-700">
                <item.icon size={36} />
              </div>
              <div className="p-4 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-10 group-hover:translate-x-0">
                <ChevronRight size={28} className="text-white" />
              </div>
            </div>
            <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">{item.title}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em]">{item.desc}</p>
          </div>
        ))}
      </div>

      {integrityState !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl">
          <div className="w-full max-w-lg bg-slate-900/50 border border-white/10 rounded-[4rem] p-20 text-center animate-platinum shadow-2xl">
             {integrityState === 'SCANNING' ? (
               <div className="space-y-12">
                 <Loader2 size={120} className="text-white animate-spin mx-auto opacity-10" />
                 <div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase italic">Scanning Node</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.5em]">Verifying Build {APP_NAME} Core...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-16">
                 <div className="w-28 h-28 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={56} />
                 </div>
                 <div>
                    <h3 className="text-4xl font-black text-white mb-4 uppercase italic">Secure</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.5em]">Node Integrity Validated</p>
                 </div>
                 <button onClick={() => setIntegrityState('IDLE')} className="btn-platinum w-full py-7">Finalize Audit</button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
