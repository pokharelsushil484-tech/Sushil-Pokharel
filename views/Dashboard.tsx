
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, View, Note, Expense } from '../types';
import { 
  ChevronRight, RefreshCw,
  Loader2, Send, Wallet, ArrowUpRight, TrendingDown, Globe, Activity, Database
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [quickNote, setQuickNote] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [rawExpenses, setRawExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchFinancials = async () => {
        const stored = await storageService.getData(`architect_data_${username}`);
        if (stored?.expenses) {
            setRawExpenses(stored.expenses);
        }
    };
    fetchFinancials();
  }, [username]);

  // Performance Fix: Memoize financial calculations to resolve "heavy load"
  const financials = useMemo(() => {
    const income = rawExpenses.filter(e => e.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
    const expense = rawExpenses.filter(e => e.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
    return { balance: income - expense, income, expense };
  }, [rawExpenses]);

  const handleQuickCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setIsCommitting(true);
    
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
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4">
              <div className="stark-badge inline-flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Master Node: {username.toUpperCase()}</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter uppercase italic">
                StudentPocket<br/><span className="text-indigo-600 not-italic">Mesh Center</span>
              </h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center space-x-4">
              <Globe size={20} className="text-indigo-500" />
              <div>
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Mesh Status</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                      <RefreshCw size={10} className="mr-1.5 animate-spin-slow" /> Active & Syncing
                  </span>
              </div>
          </div>
      </div>

      {/* Financial Indicators - Professional Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="master-box p-8 bg-indigo-600 text-white border-none shadow-xl group cursor-help">
              <div className="flex justify-between items-start mb-6">
                  <Wallet size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Mesh Liquidity</span>
              </div>
              <h3 className="text-3xl font-black italic">NPR {financials.balance.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Total Multi-Device Balance</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-emerald-500/20">
              <div className="flex justify-between items-start mb-6">
                  <ArrowUpRight size={24} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inflow Trend</span>
              </div>
              <h3 className="text-3xl font-black text-white italic">+{financials.income.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-emerald-500">Node Accumulation</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-red-500/20">
              <div className="flex justify-between items-start mb-6">
                  <TrendingDown size={24} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Outflow Trend</span>
              </div>
              <h3 className="text-3xl font-black text-white italic">-{financials.expense.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-red-500">Resource Burn Rate</p>
          </div>
      </div>

      {/* Primary Global Entry */}
      <div className="master-box p-10 sm:p-16 relative overflow-hidden bg-indigo-950/10">
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
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                placeholder="COMMIT A NOTE TO ALL DEVICES..."
                disabled={isCommitting}
              />
              <button 
                type="submit" 
                disabled={isCommitting || !quickNote.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black hover:bg-slate-200 transition-all shadow-xl"
              >
                {isCommitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
          </form>
        </div>
      </div>

      {/* Navigation Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div onClick={() => onNavigate(View.VERIFY_LINK)} className="master-box p-10 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-8">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Activity size={22} />
              </div>
              <ChevronRight size={20} className="text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Strategic Planner</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Multi-Device Task Sync</p>
        </div>
        <div onClick={() => onNavigate(View.FILE_HUB)} className="master-box p-10 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-8">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <Database size={22} />
              </div>
              <ChevronRight size={20} className="text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Secure Data Mesh</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Access Files Anywhere</p>
        </div>
      </div>
    </div>
  );
};
