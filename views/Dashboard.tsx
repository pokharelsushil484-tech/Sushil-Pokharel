
import React, { useState, useEffect } from 'react';
import { UserProfile, View, Note, Expense } from '../types';
import { 
  ShieldCheck, Database, 
  ChevronRight, RefreshCw,
  CheckCircle2, Loader2, BadgeCheck, Send, Terminal, Activity, Wallet, ArrowUpRight, ArrowDownRight, TrendingDown
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
  const [financials, setFinancials] = useState({ balance: 0, income: 0, expense: 0 });

  useEffect(() => {
    const fetchFinancials = async () => {
        const stored = await storageService.getData(`architect_data_${username}`);
        if (stored?.expenses) {
            const exp: Expense[] = stored.expenses;
            const income = exp.filter(e => e.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
            const expense = exp.filter(e => e.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
            setFinancials({ balance: income - expense, income, expense });
        }
    };
    fetchFinancials();
  }, [username]);

  const handleQuickCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setIsCommitting(true);
    
    const newNote: Note = {
        id: Date.now().toString(),
        title: "Manual Entry: " + quickNote.substring(0, 18),
        content: quickNote,
        date: new Date().toISOString(),
        tags: ["DASH_SYNC"],
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
    }, 600);
  };

  return (
    <div className="space-y-10 animate-platinum max-w-full pb-20">
      {/* Welcome Header */}
      <div className="space-y-4">
          <div className="stark-badge inline-flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Session: {username.toUpperCase()}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter uppercase italic">
            StudentPocket<br/><span className="text-indigo-600 not-italic">Dashboard</span>
          </h1>
      </div>

      {/* Financial Indicators - Professional Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="master-box p-8 bg-indigo-600 text-white border-none shadow-xl">
              <div className="flex justify-between items-start mb-6">
                  <Wallet size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Liquidity</span>
              </div>
              <h3 className="text-3xl font-black italic">NPR {financials.balance.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Total Available Funds</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-emerald-500/20">
              <div className="flex justify-between items-start mb-6">
                  <ArrowUpRight size={24} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inflow</span>
              </div>
              <h3 className="text-3xl font-black text-white italic">+{financials.income.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-emerald-500">Positive Delta</p>
          </div>
          <div className="master-box p-8 bg-white/5 border-red-500/20">
              <div className="flex justify-between items-start mb-6">
                  <TrendingDown size={24} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Outflow</span>
              </div>
              <h3 className="text-3xl font-black text-white italic">-{financials.expense.toLocaleString()}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-red-500">Expense Trend</p>
          </div>
      </div>

      {/* Primary Intake */}
      <div className="master-box p-10 sm:p-16 relative overflow-hidden">
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                Commit New<br/>
                <span className="text-indigo-600 italic">Academic Entry</span>
              </h2>
          </div>
          
          <form onSubmit={handleQuickCommit} className="max-w-2xl relative group">
              <input 
                type="text" 
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                placeholder="TYPE A QUICK NOTE OR TASK..."
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

          <div className="flex flex-wrap gap-4">
             <button onClick={() => onNavigate(View.VERIFY_LINK)} className="px-8 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-slate-200 transition-all">
                Plan My Day
             </button>
             <button onClick={() => onNavigate(View.FILE_HUB)} className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-white/10 transition-all">
                Access Vault
             </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: Activity, title: "Study Planner", desc: "Track Assignments", view: View.VERIFY_LINK },
          { icon: Database, title: "Data Fortress", desc: "Secure Files", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view as View)}
            className="master-box p-10 group cursor-pointer hover:border-indigo-500/30 transition-all border border-white/5 bg-black/40"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <item.icon size={22} />
              </div>
              <ChevronRight size={20} className="text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{item.title}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
