
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, View, Note, Expense, GradeRecord } from '../types';
import { 
  ChevronRight, RefreshCw,
  Loader2, Send, Wallet, ArrowUpRight, TrendingDown, Globe, Activity, Database, ShieldCheck, Fingerprint, BadgeCheck, AlertCircle, Radio, QrCode, TrendingUp, Trophy, Lock,
  BookOpen,
  ShieldAlert,
  Zap,
  Terminal,
  Cpu,
  LogOut
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { APP_NAME, SYSTEM_DOMAIN, APP_VERSION, PROFESSIONAL_TIER } from '../constants';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate, onLogout }) => {
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

  return (
    <div className="space-y-16 animate-platinum max-w-full pb-32 uppercase">
      {/* Global Quantum Broadcast */}
      {broadcast && (
        <div className="bg-indigo-600/20 border-y border-indigo-500/30 py-6 -mx-8 sm:-mx-16 overflow-hidden flex items-center shadow-[0_0_30px_rgba(79,70,229,0.1)]">
            <div className="flex items-center gap-4 px-10 bg-black z-10 border-r border-white/10 shrink-0">
                <Cpu size={18} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.6em]">Quantum Link</span>
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest px-12">{broadcast}</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest px-12">{broadcast}</span>
            </div>
        </div>
      )}

      {/* Quantum Welcome Matrix */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-16">
          <div className="space-y-8 flex-1">
              <div className="flex items-center gap-6">
                <div className="stark-badge inline-flex items-center space-x-4 bg-indigo-600/10 border-indigo-500/30 px-6 py-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-indigo-400">QUANTUM NODE: {username.toUpperCase()}</span>
                </div>
                <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-400">
                    <Activity size={14} className="text-indigo-500" />
                    Mesh Integrity: {user.integrityScore || 100}%
                </div>
              </div>
              <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                Quantum<br/><span className="text-indigo-600 not-italic">Executive Hub</span>
              </h1>
              <div className="flex items-center gap-6 text-slate-600 font-black text-xs uppercase tracking-[0.5em]">
                  <Terminal size={18} className="text-indigo-500" />
                  <span>V22 Platinum Architecture Build</span>
              </div>
          </div>

          {/* Identity Card with Logout Node */}
          <div className="w-full xl:w-[450px] group">
             <div className="relative bg-gradient-to-br from-slate-900 via-black to-black p-12 rounded-[4rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:border-indigo-500/40">
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]"></div>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 mb-10 bg-slate-950 shadow-2xl relative">
                        <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Identity" />
                        {!user.isVerified && (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                                <ShieldAlert size={24} className="text-red-500 mb-2" />
                                <span className="text-[8px] font-black text-white tracking-widest uppercase">Unauthorized</span>
                            </div>
                        )}
                    </div>
                    <div className="text-center space-y-4">
                        <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{user.name}</h3>
                        <div className="bg-indigo-600/10 py-3 px-6 rounded-2xl border border-indigo-500/20 inline-block">
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{user.studentId || 'ID_NODE_PENDING'}</p>
                        </div>
                    </div>
                    
                    <div className="mt-12 w-full pt-10 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Level</span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {user.isVerified ? PROFESSIONAL_TIER : 'Audit Pending'}
                            </span>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-2xl transition-all"
                        >
                            <LogOut size={16} />
                            <span className="text-[9px] font-black tracking-widest">TERMINATE</span>
                        </button>
                    </div>
                 </div>
             </div>
          </div>
      </div>

      {/* Quantum Analytics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="master-box p-10 bg-indigo-600 text-white border-none shadow-[0_30px_60px_rgba(79,70,229,0.2)] group transition-all hover:-translate-y-3">
              <div className="flex justify-between items-start mb-10">
                  <Wallet size={32} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60 italic">Node Capital</span>
              </div>
              <h3 className="text-5xl font-black italic tracking-tighter">NPR {financials.balance.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 opacity-80">Net Mesh Operational Liquidity</p>
          </div>
          <div className="master-box p-10 bg-black/40 border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-10">
                  <ArrowUpRight size={32} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Accumulation</span>
              </div>
              <h3 className="text-5xl font-black text-white italic tracking-tighter">+{financials.income.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-emerald-500">Node Resource Inflow</p>
          </div>
          <div className="master-box p-10 bg-black/40 border-white/5 hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start mb-10">
                  <TrendingUp size={32} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Academic Index</span>
              </div>
              <h3 className="text-5xl font-black text-white italic tracking-tighter">{avgPercentage.toFixed(1)}%</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-indigo-400">Knowledge Acquisition Rate</p>
          </div>
          <div className="master-box p-10 bg-black/40 border-white/5 hover:border-red-500/30 transition-all">
              <div className="flex justify-between items-start mb-10">
                  <TrendingDown size={32} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Dissipation</span>
              </div>
              <h3 className="text-5xl font-black text-white italic tracking-tighter">-{financials.expense.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-red-500">Resource Consumption Node</p>
          </div>
      </div>

      {/* Strategic Command Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div onClick={() => onNavigate(View.ACADEMIC_LEDGER)} className="master-box p-14 group cursor-pointer hover:bg-white/[0.02] hover:border-white/20 transition-all border border-white/5 bg-black/40 shadow-2xl">
            <div className="flex justify-between items-center mb-16">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all transform group-hover:-rotate-12">
                <Trophy size={36} />
              </div>
              <ChevronRight size={28} className="text-slate-800 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Quantum Ledger</h3>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.6em] mt-3">Formal Registry Access</p>
        </div>
        <div onClick={() => onNavigate(View.CAMPUS_RADAR)} className="master-box p-14 group cursor-pointer hover:bg-white/[0.02] hover:border-white/20 transition-all border border-white/5 bg-black/40 shadow-2xl">
            <div className="flex justify-between items-center mb-16">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all transform group-hover:rotate-12">
                <Globe size={36} />
              </div>
              <ChevronRight size={28} className="text-slate-800 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Neural Radar</h3>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.6em] mt-3">Geospatial Awareness Node</p>
        </div>
        <div onClick={() => onNavigate(View.FILE_HUB)} className="master-box p-14 group cursor-pointer hover:bg-white/[0.02] hover:border-white/20 transition-all border border-white/5 bg-black/40 shadow-2xl">
            <div className="flex justify-between items-center mb-16">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all transform group-hover:scale-110">
                <Database size={36} />
              </div>
              <ChevronRight size={28} className="text-slate-800 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Quantum Vault</h3>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.6em] mt-3">Asset Preservation Matrix</p>
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
      `}</style>
    </div>
  );
};
