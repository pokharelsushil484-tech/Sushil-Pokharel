
import React, { useState } from 'react';
import { UserProfile, View, Note } from '../types';
import { 
  ShieldCheck, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, BadgeCheck, Send, Terminal, Activity, Cpu, Fingerprint
} from 'lucide-react';
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
        title: "System Entry: " + quickNote.substring(0, 18) + "...",
        content: quickNote,
        date: new Date().toISOString(),
        tags: ["MASTER_SYNC"],
        status: 'COMPLETED',
        author: 'admin'
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

  return (
    <div className="space-y-12 sm:space-y-20 animate-platinum max-w-full">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-6 w-full">
            <div className="stark-badge inline-flex items-center space-x-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <span>ADMIN_NODE: {username.toUpperCase()}</span>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">StudentPocket<br/><span className="text-indigo-600 not-italic">Infrastructure</span></h1>
        </div>
      </div>

      {/* Primary Intake Node */}
      <div className="master-box p-10 sm:p-20 relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Fingerprint size={500} className="text-white" />
        </div>
        
        <div className="relative z-10 space-y-12 sm:space-y-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl">
                <BadgeCheck size={48} />
            </div>
            <div className="space-y-1">
                <span className="inline-block bg-indigo-500/10 text-indigo-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.4em] border border-indigo-500/20">Clearance Level 03</span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">AUTHORIZED_ACCESS_GRANTED</p>
            </div>
          </div>
          
          <div className="space-y-4">
              <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-[0.85] uppercase">
                System Active,<br/>
                <span className="text-indigo-600 italic">{user.name.split(' ')[0]}</span>
              </h2>
          </div>
          
          <form onSubmit={handleQuickCommit} className="max-w-3xl relative group">
              <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={24} />
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 pl-16 pr-24 text-base font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                placeholder="EXECUTE DATA COMMAND..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-xl flex items-center justify-center text-black hover:bg-slate-200 disabled:opacity-10 transition-all shadow-xl"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
          </form>

          <div className="flex flex-wrap gap-4">
             <button onClick={handleIntegrityCheck} className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center hover:scale-105 transition-all shadow-xl">
                <RefreshCw size={16} className="mr-4" /> Run System Audit
             </button>
             <button onClick={() => onNavigate(View.SUPPORT)} className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center hover:bg-white/10 transition-all">
                Access Support Node
             </button>
          </div>
        </div>
      </div>

      {/* Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {[
          { icon: Activity, title: "Strategic Roadmap", desc: "Global Milestones", view: View.VERIFY_LINK },
          { icon: Database, title: "Secure Data Vault", desc: "Platinum Preservation", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view as View)}
            className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40"
          >
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                <item.icon size={28} />
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <ChevronRight size={20} className="text-white" />
              </div>
            </div>
            <div className="relative z-10 space-y-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{item.title}</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.5em]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Modal */}
      {integrityState !== 'IDLE' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[4rem] p-12 sm:p-20 text-center animate-scale-up shadow-2xl">
             {integrityState === 'SCANNING' ? (
               <div className="space-y-12">
                 <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu size={36} className="text-indigo-500 animate-pulse" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white uppercase italic">Infrastructure Scan</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em] animate-pulse">Syncing Security Grid...</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-12">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={40} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Verified</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">System Node v13.5 Stable</p>
                 </div>
                 <button onClick={() => setIntegrityState('IDLE')} className="btn-platinum py-5 shadow-xl">Dismiss</button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
