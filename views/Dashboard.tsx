
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, View, Note, Expense, GradeRecord } from '../types';
import { 
  ChevronRight, RefreshCw,
  Loader2, Send, Wallet, ArrowUpRight, TrendingDown, Globe, Activity, Database, ShieldCheck, Fingerprint, BadgeCheck, AlertCircle, Radio, QrCode, TrendingUp, Trophy, Lock,
  BookOpen,
  ShieldAlert,
  Zap
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
    
    // SECURITY SCAN: PROHIBITED TERM DETECTION
    const isTerminated = await storageService.scanAndProtect(username, quickNote);
    if (isTerminated) {
        window.location.reload(); // Immediate lockdown to termination screen
        return;
    }

    const newNote: Note = {
        id: Date.now().toString(),
        title: "DASH_ENTRY: " + quickNote.substring(0, 18),
        content: quickNote,
        date: new Date().toISOString(),
        tags: ["GLOBAL_SYNC"],
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
    <div className="space-y-10 animate-platinum max-w-full pb-20">
      {/* Global Broadcast Ticker */}
      {broadcast && (
        <div className="bg-indigo-600/10 border-y border-indigo-500/20 py-3 -mx-8 sm:-mx-12 overflow-hidden flex items-center">
            <div className="flex items-center gap-3 px-8 bg-black z-10 border-r border-white/10 shrink-0">
                <Radio size={14} className="text-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Broadcast</span>
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-10">{broadcast}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-10">{broadcast}</span>
            </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="stark-badge inline-flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Operational Node: {username.toUpperCase()}</span>
                </div>
                <div className={`px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${user.integrityScore < 50 ? 'text-red-500' : 'text-indigo-400'}`}>
                    <Zap size={10}/> Integrity: {user.integrityScore || 100}%
                </div>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                StudentPocket<br/><span className="text-indigo-600 not-italic">Mesh Center</span>
              </h1>
              <div className="flex items-center gap-3 text-slate-600 font-black text-[9px] uppercase tracking-[0.4em]">
                  <RefreshCw size={12} className="animate-spin-slow" />
                  <span>Build Cycle: {APP_VERSION}</span>
              </div>
          </div>

          {/* Institutional Mesh Badge */}
          <div className="w-full md:w-80 group perspective-1000">
             <div className="relative bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-700 hover:rotate-y-12 hover:scale-105">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 mb-6 bg-slate-900 shadow-xl relative group">
                        <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover group-hover:opacity-10 transition-opacity" alt="Node Avatar" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <QrCode size={40} className="text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{user.name}</h3>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.4em]">{user.studentId || 'NO-ID-ASSIGNED'}</p>
                    </div>
                    
                    <div className="mt-8 w-full pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="block text-[8px] font-black text-slate-500 uppercase">Clearance</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${user.isVerified ? 'text-emerald-500' : 'text-red-500'}`}>
                                {user.isVerified ? 'Verified' : 'Awaiting'}
                            </span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl text-slate-600">
                            <Fingerprint size={18} />
                        </div>
                    </div>
                 </div>
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/5 uppercase tracking-[1em] whitespace-nowrap">
                    {SYSTEM_DOMAIN}
                 </div>
             </div>
          </div>
      </div>

      {/* Primary Analytics Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="master-box p-8 bg-indigo-600 text-white border-none shadow-xl group cursor-help transition-all hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-6">
                  <Wallet size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Mesh Liquidity</span>
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter">NPR {financials.balance.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Total Multi-Device Balance</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-emerald-500/20">
              <div className="flex justify-between items-start mb-6">
                  <ArrowUpRight size={24} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inflow Trend</span>
              </div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">+{financials.income.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-emerald-500">Node Accumulation</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-indigo-500/20">
              <div className="flex justify-between items-start mb-6">
                  <TrendingUp size={24} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Index</span>
              </div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{avgPercentage.toFixed(1)}%</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-indigo-400">Knowledge Progress</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-red-500/20">
              <div className="flex justify-between items-start mb-6">
                  <TrendingDown size={24} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Outflow Trend</span>
              </div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">-{financials.expense.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-red-500">Resource Burn Rate</p>
          </div>
      </div>

      {/* Primary Global Entry */}
      <div className="master-box p-10 sm:p-16 relative overflow-hidden bg-indigo-950/10 border-indigo-500/10">
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                Global Node<br/>
                <span className="text-indigo-600 italic">Identity Commit</span>
              </h2>
          </div>
          
          <form onSubmit={handleQuickCommit} className="max-w-2xl relative group">
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-7 px-10 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 shadow-2xl"
                placeholder="COMMIT A NOTE TO ALL DEVICES..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-slate-200 transition-all shadow-xl"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
          </form>
        </div>
      </div>

      {/* Navigation Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div onClick={() => onNavigate(View.GROWTH_JOURNAL)} className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <BookOpen size={24} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Growth Journal</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Reflective Memory Node</p>
        </div>
        <div onClick={() => onNavigate(View.SECURITY_HEARTBEAT)} className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Activity size={24} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">System Pulse</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Integrity Monitor</p>
        </div>
        <div onClick={() => onNavigate(View.FILE_HUB)} className="master-box p-12 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Database size={24} />
              </div>
              <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Secure Data Mesh</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Storage Node</p>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            display: inline-flex;
            animation: marquee 30s linear infinite;
        }
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
