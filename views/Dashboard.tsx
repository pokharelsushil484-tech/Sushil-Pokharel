
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, View, Note, Expense, GradeRecord } from '../types';
import { 
  ChevronRight, RefreshCw,
  Loader2, Send, Wallet, ArrowUpRight, TrendingDown, Globe, Activity, Database, ShieldCheck, Fingerprint, BadgeCheck, AlertCircle, Radio, QrCode, TrendingUp, Trophy, Lock,
  BookOpen,
  ShieldAlert,
  Zap,
  Terminal
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { APP_NAME, SYSTEM_DOMAIN, APP_VERSION } from '../constants';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [quickNote, setQuickNote] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [rawExpenses, setRawExpenses] = useState<Expense[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [broadcast, setBroadcast] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancials = async () => {
        const stored = await storageService.getData(`architect_data_${username}`);
        if (stored?.expenses) setRawExpenses(stored.expenses);
        if (stored?.grades) setGrades(stored.grades);
    };
    fetchFinancials();
    const activeBroadcast = localStorage.getItem('sp_global_broadcast');
    if (activeBroadcast) setBroadcast(activeBroadcast);
  }, [username]);

  const financials = useMemo(() => {
    const income = rawExpenses.filter(e => e.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
    const expense = rawExpenses.filter(e => e.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
    return { balance: income - expense, income, expense };
  }, [rawExpenses]);

  const avgPercentage = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + (g.score / g.total), 0) / grades.length) * 100 
    : 0;

  const handleQuickCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setIsCommitting(true);
    
    const isTerminated = await storageService.scanAndProtect(username, quickNote);
    if (isTerminated) {
        window.location.reload();
        return;
    }

    const newNote: Note = {
        id: Date.now().toString(),
        title: "MESH_COMMIT: " + quickNote.substring(0, 18).toUpperCase(),
        content: quickNote.toUpperCase(),
        date: new Date().toISOString(),
        tags: ["SUPREME_SYNC"],
        status: 'PENDING',
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

  return (
    <div className="space-y-12 animate-platinum max-w-full pb-24 uppercase">
      {/* Global Broadcast Ticker */}
      {broadcast && (
        <div className="bg-indigo-600/10 border-y border-indigo-500/20 py-4 -mx-8 sm:-mx-12 overflow-hidden flex items-center">
            <div className="flex items-center gap-3 px-8 bg-black z-10 border-r border-white/10 shrink-0">
                <Radio size={14} className="text-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Protocol Sync</span>
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-10">{broadcast}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-10">{broadcast}</span>
            </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="stark-badge inline-flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>NODE ACTIVE: {username.toUpperCase()}</span>
                </div>
                <div className={`px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${user.integrityScore < 50 ? 'text-red-500' : 'text-indigo-400'}`}>
                    <Zap size={10}/> Integrity: {user.integrityScore || 100}%
                </div>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                Platinum<br/><span className="text-indigo-600 not-italic">Supreme Hub</span>
              </h1>
              <div className="flex items-center gap-4 text-slate-600 font-black text-[10px] uppercase tracking-[0.4em]">
                  <Terminal size={14} className="text-indigo-500" />
                  <span>Architecture Build: {APP_VERSION}</span>
              </div>
          </div>

          {/* Identity Matrix Badge */}
          <div className="w-full md:w-96 group perspective-1000">
             <div className="relative bg-gradient-to-br from-slate-900 via-black to-black p-10 rounded-[3.5rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] overflow-hidden transition-all duration-700 hover:scale-105">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-white/10 mb-8 bg-slate-950 shadow-2xl relative">
                        <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Identity" />
                        {!user.isVerified && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center">
                                <span className="text-[7px] font-black text-red-500 tracking-widest leading-tight">UNVERIFIED IDENTITY</span>
                            </div>
                        )}
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight italic">{user.name}</h3>
                        <div className="bg-white/5 py-2 px-4 rounded-xl border border-white/5 inline-block">
                             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.5em]">{user.studentId || 'IDENTITY PENDING'}</p>
                        </div>
                    </div>
                    
                    <div className="mt-10 w-full pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="block text-[8px] font-black text-slate-500 uppercase">Mesh Status</span>
                            <span className={`text-xs font-black uppercase tracking-widest ${user.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {user.isVerified ? 'AUTHORIZED' : 'AUDIT REQUIRED'}
                            </span>
                        </div>
                        {!user.isVerified && (
                             <button onClick={() => onNavigate(View.VERIFICATION_FORM)} className="bg-white text-black px-4 py-2 rounded-lg text-[8px] font-black tracking-widest">Verify Now</button>
                        )}
                    </div>
                 </div>
             </div>
          </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="master-box p-10 bg-indigo-600 text-white border-none shadow-2xl group transition-all hover:translate-y-[-8px]">
              <div className="flex justify-between items-start mb-8">
                  <Wallet size={28} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Node Capital</span>
              </div>
              <h3 className="text-5xl font-black italic tracking-tighter">NPR {financials.balance.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-3 opacity-80">Total Operational Mesh Balance</p>
          </div>
          <div className="master-box p-10 bg-white/5 border-emerald-500/20">
              <div className="flex justify-between items-start mb-8">
                  <ArrowUpRight size={28} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Inflow</span>
              </div>
              <h3 className="text-5xl font-black text-white italic tracking-tighter">+{financials.income.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-3 text-emerald-500">Resource Accumulation</p>
          </div>
          <div className="master-box p-10 bg-white/5 border-indigo-500/20">
              <div className="flex justify-between items-start mb-8">
                  <TrendingUp size={28} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Index</span>
              </div>
              <h3 className="text-5xl font-black text-white italic tracking-tighter">{avgPercentage.toFixed(1)}%</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-3 text-indigo-400">Supreme Knowledge Growth</p>
          </div>
          <div className="master-box p-10 bg-white/5 border-red-500/20">
              <div className="flex justify-between items-start mb-8">
                  <TrendingDown size={28} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Outflow</span>
              </div>
              <h3 className="text-5xl font-black text-white italic tracking-tighter">-{financials.expense.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-3 text-red-500">Mesh Power consumption</p>
          </div>
      </div>

      {/* Logic Entry Node */}
      <div className="master-box p-12 sm:p-20 relative overflow-hidden bg-indigo-950/10 border-indigo-500/10">
        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
              <h2 className="text-5xl sm:text-6xl font-black tracking-tighter text-white uppercase leading-none italic">
                Node Logic<br/>
                <span className="text-indigo-600 not-italic">Identity Commit</span>
              </h2>
          </div>
          
          <form onSubmit={handleQuickCommit} className="max-w-3xl relative group">
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value.toUpperCase())}
                className="w-full bg-black/60 border border-white/10 rounded-[2.5rem] py-8 px-12 text-sm font-black text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 shadow-3xl uppercase tracking-widest"
                placeholder="COMMIT DATA TO CENTRAL MESH..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-black hover:bg-slate-200 transition-all shadow-2xl"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
          </form>
        </div>
      </div>

      {/* Strategic Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div onClick={() => onNavigate(View.ACADEMIC_LEDGER)} className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-12">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Trophy size={28} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Precision Ledger</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em] mt-2">Formal Academic Registry</p>
        </div>
        <div onClick={() => onNavigate(View.CAMPUS_RADAR)} className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-12">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Globe size={28} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Radar</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em] mt-2">Campus Proximity Mapping</p>
        </div>
        <div onClick={() => onNavigate(View.FILE_HUB)} className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-12">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Database size={28} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Data Fortress</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em] mt-2">Institutional Asset Vault</p>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            display: inline-flex;
            animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
