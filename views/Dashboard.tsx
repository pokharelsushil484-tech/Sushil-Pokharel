
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { UserProfile, View, Expense, GradeRecord } from '../types';
import { 
  ChevronRight, 
  Wallet, 
  ArrowUpRight, 
  TrendingDown, 
  Globe, 
  Activity, 
  Database, 
  Trophy, 
  Cpu,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  Calendar,
  BookOpen,
  MapPin,
  Target,
  Crown,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { APP_NAME, VERSION_BETA, VERSION_PRO } from '../constants';
import { SubscriptionTier } from '../types';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [rawExpenses, setRawExpenses] = useState<Expense[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [broadcast, setBroadcast] = useState<string | null>(null);

  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;
  const versionString = isPro ? VERSION_PRO : VERSION_BETA;

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20"
    >
      {/* Global Broadcast */}
      {broadcast && (
        <motion.div 
          variants={item}
          className="bg-white/5 border border-white/10 py-4 rounded-2xl overflow-hidden flex items-center"
        >
            <div className="flex items-center gap-3 px-6 bg-obsidian z-10 border-r border-white/10 shrink-0">
                <Cpu size={16} className="text-white animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">System Broadcast</span>
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center">
                <span className="text-sm font-medium text-white/60 px-12">{broadcast}</span>
                <span className="text-sm font-medium text-white/60 px-12">{broadcast}</span>
            </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <motion.div variants={item} className="space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <div className={`bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 ${isPro ? 'border-amber-500/20 bg-amber-500/5' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${isPro ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500'}`}></div>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-400' : 'text-white/60'}`}>
                      {versionString} Active
                    </span>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Activity size={12} className="text-white/40" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Integrity: {user.integrityScore || 100}%</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-display italic tracking-tight leading-none">
                Welcome to the<br/>
                <span className="text-white/40 not-italic">Elite Executive Hub</span>
              </h1>
              <p className="text-white/40 max-w-lg font-medium">
                Your centralized command center for academic excellence, financial oversight, and strategic growth.
              </p>
          </motion.div>

          {/* Identity Card */}
          <motion.div 
            variants={item}
            className="w-full lg:w-96 glass-card p-8 relative overflow-hidden group"
          >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-colors ${isPro ? 'bg-amber-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-24 h-24 rounded-2xl overflow-hidden border mb-6 shadow-2xl ${isPro ? 'border-amber-500/50 shadow-amber-500/20' : 'border-white/10'}`}>
                      <img 
                        src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                        className="w-full h-full object-cover" 
                        alt="Identity" 
                      />
                  </div>
                  <h3 className="text-2xl font-display italic mb-1">{user.name}</h3>
                  <div className="bg-white/5 px-4 py-1 rounded-full border border-white/10 mb-8">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{user.studentId || 'ID Pending'}</span>
                  </div>
                  
                  <div className="w-full pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="text-left">
                          <span className="block text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1">Status</span>
                          <span className={`text-xs font-medium ${user.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {user.isVerified ? 'Verified Elite' : 'Audit Pending'}
                          </span>
                      </div>
                      <div className="text-right">
                          <span className="block text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1">Tier</span>
                          <span className={`text-xs font-medium ${isPro ? 'text-amber-400' : 'text-white'}`}>
                            {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME ? 'Quantum Elite' : 
                             user.subscriptionTier === SubscriptionTier.PRO_TRIAL ? 'Pro Trial' : 'Standard Beta'}
                          </span>
                      </div>
                  </div>
              </div>
          </motion.div>
      </div>

      {/* Pro Status Section */}
      <motion.div variants={item} className="glass-card p-8 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 ${isPro ? 'bg-amber-500/10' : 'bg-white/5'}`}></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown size={24} className={isPro ? "text-amber-400" : "text-white/40"} />
                <h2 className="text-2xl font-display italic">
                  {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME ? 'Quantum Elite Status' : 'Upgrade Status'}
                </h2>
              </div>
              <p className="text-white/60 text-sm max-w-xl">
                {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME 
                  ? "System fully operational. All elite modules active and synchronized."
                  : user.subscriptionTier === SubscriptionTier.PRO_TRIAL 
                    ? "Trial Active. Complete tasks to secure permanent access." 
                    : "Running in Beta Mode. Upgrade to unlock full Quantum Elite capabilities."}
              </p>
            </div>
            
            {user.subscriptionTier === SubscriptionTier.PRO_TRIAL && user.trialStartDate && (
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Trial Expires In</span>
                <span className="text-2xl font-mono font-bold text-white">
                  {Math.max(0, Math.ceil((15 * 24 * 60 * 60 * 1000 - (Date.now() - user.trialStartDate)) / (1000 * 60 * 60 * 24)))} Days
                </span>
              </div>
            )}
            
            {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME && (
               <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Status</span>
                <span className="text-xl font-display italic text-white">Lifetime Active</span>
              </div>
            )}
          </div>

          {user.subscriptionTier !== SubscriptionTier.PRO_LIFETIME && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {user.upgradeTasks.map(task => (
                <div key={task.id} className={`p-4 rounded-xl border ${task.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-start mb-3">
                    {task.completed ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Lock size={18} className="text-white/20" />}
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{task.currentCount}/{task.targetCount}</span>
                  </div>
                  <p className="text-xs font-medium text-white/80 mb-2">{task.description}</p>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${task.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${(task.currentCount / task.targetCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item} className="glass-card p-8 bg-white text-black border-none group hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start mb-8">
                  <Wallet size={24} />
                  <Sparkles size={16} className="opacity-20" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 opacity-60">Net Balance</p>
              <h3 className="text-3xl font-display italic tracking-tight">NPR {financials.balance.toLocaleString()}</h3>
          </motion.div>

          <motion.div variants={item} className="glass-card p-8 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-8">
                  <ArrowUpRight size={24} className="text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Income</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-white/40">Total Inflow</p>
              <h3 className="text-3xl font-display italic tracking-tight">+{financials.income.toLocaleString()}</h3>
          </motion.div>

          <motion.div variants={item} className="glass-card p-8 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-8">
                  <TrendingUp size={24} className="text-white" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Academic</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-white/40">Performance</p>
              <h3 className="text-3xl font-display italic tracking-tight">{avgPercentage.toFixed(1)}%</h3>
          </motion.div>

          <motion.div variants={item} className="glass-card p-8 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-8">
                  <TrendingDown size={24} className="text-red-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Expenses</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-white/40">Total Outflow</p>
              <h3 className="text-3xl font-display italic tracking-tight">-{financials.expense.toLocaleString()}</h3>
          </motion.div>
      </div>

      {/* Quick Access Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { view: View.MISSION_CONTROL, icon: Target, title: "Mission Control", desc: "Strategic Operations Center" },
          { view: View.ACADEMIC_LEDGER, icon: Trophy, title: "Elite Ledger", desc: "Academic Performance Registry" },
          { view: View.CAMPUS_RADAR, icon: MapPin, title: "Campus Radar", desc: "Geospatial Awareness Node" },
          { view: View.FILE_HUB, icon: Database, title: "Secure Vault", desc: "Encrypted Asset Preservation" }
        ].map((card, idx) => (
          <motion.div 
            key={idx}
            variants={item}
            onClick={() => onNavigate(card.view)}
            className="glass-card p-10 group cursor-pointer hover:bg-white/10 transition-all border-white/5"
          >
              <div className="flex justify-between items-center mb-12">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                  <card.icon size={28} />
                </div>
                <ChevronRight size={24} className="text-white/10 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-display italic mb-2">{card.title}</h3>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{card.desc}</p>
          </motion.div>
        ))}
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
    </motion.div>
  );
};

