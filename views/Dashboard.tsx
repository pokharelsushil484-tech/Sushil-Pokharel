
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
          className={`border py-4 overflow-hidden flex items-center ${isPro ? 'bg-white/5 border-white/10 rounded-2xl' : 'bg-gray-300 border-gray-500 rounded-none'}`}
        >
            <div className={`flex items-center gap-3 px-6 z-10 border-r shrink-0 ${isPro ? 'bg-obsidian border-white/10' : 'bg-gray-400 border-gray-500'}`}>
                <Cpu size={16} className={isPro ? "text-white animate-pulse" : "text-gray-800"} />
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-white' : 'text-gray-800'}`}>System Broadcast</span>
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center">
                <span className={`text-sm font-medium px-12 ${isPro ? 'text-white/60' : 'text-gray-700'}`}>{broadcast}</span>
                <span className={`text-sm font-medium px-12 ${isPro ? 'text-white/60' : 'text-gray-700'}`}>{broadcast}</span>
            </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <motion.div variants={item} className="space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 flex items-center gap-2 ${isPro ? 'border border-amber-500/20 bg-amber-500/5 rounded-full' : 'border-2 border-gray-500 bg-gray-300 rounded-none'}`}>
                    <div className={`w-1.5 h-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)] ${isPro ? 'bg-amber-500 shadow-amber-500/50 rounded-full' : 'bg-gray-600 shadow-none rounded-none'}`}></div>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-400' : 'text-gray-800'}`}>
                      {versionString} Active
                    </span>
                </div>
                <div className={`px-4 py-1.5 flex items-center gap-2 ${isPro ? 'bg-white/5 border border-white/10 rounded-full' : 'bg-gray-300 border-2 border-gray-500 rounded-none'}`}>
                    <Activity size={12} className={isPro ? "text-white/40" : "text-gray-600"} />
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-white/60' : 'text-gray-800'}`}>Integrity: {user.integrityScore || 100}%</span>
                </div>
              </div>
              <h1 className={`text-5xl md:text-7xl leading-none ${isPro ? 'font-display italic tracking-tight' : 'font-sans font-bold tracking-normal'}`}>
                Welcome to the<br/>
                <span className={isPro ? "text-white/40 not-italic" : "text-gray-600"}>Elite Executive Hub</span>
              </h1>
              <p className={`max-w-lg font-medium ${isPro ? 'text-white/40' : 'text-gray-700'}`}>
                Your centralized command center for academic excellence, financial oversight, and strategic growth.
              </p>
          </motion.div>

          {/* Identity Card */}
          <motion.div 
            variants={item}
            className={`w-full lg:w-96 p-8 relative overflow-hidden group ${isPro ? 'glass-card' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
          >
              {isPro && <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-colors bg-amber-500/20"></div>}
              <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-24 h-24 overflow-hidden border mb-6 ${isPro ? 'rounded-2xl border-amber-500/50 shadow-2xl shadow-amber-500/20' : 'rounded-none border-4 border-gray-500 shadow-none'}`}>
                      <img 
                        src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                        className="w-full h-full object-cover" 
                        alt="Identity" 
                      />
                  </div>
                  <h3 className={`text-2xl mb-1 ${isPro ? 'font-display italic' : 'font-sans font-bold text-gray-900'}`}>{user.name}</h3>
                  <div className={`px-4 py-1 mb-8 ${isPro ? 'bg-white/5 rounded-full border border-white/10' : 'bg-gray-400 rounded-none border-2 border-gray-500'}`}>
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-white/40' : 'text-gray-800'}`}>{user.studentId || 'ID Pending'}</span>
                  </div>
                  
                  <div className={`w-full pt-6 border-t flex justify-between items-center ${isPro ? 'border-white/5' : 'border-gray-500'}`}>
                      <div className="text-left">
                          <span className={`block text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-white/20' : 'text-gray-600'}`}>Status</span>
                          <span className={`text-xs font-medium ${isPro ? (user.isVerified ? 'text-emerald-400' : 'text-amber-400') : 'text-gray-800'}`}>
                              {user.isVerified ? 'Verified Elite' : 'Audit Pending'}
                          </span>
                      </div>
                      <div className="text-right">
                          <span className={`block text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-white/20' : 'text-gray-600'}`}>Tier</span>
                          <span className={`text-xs font-medium ${isPro ? 'text-amber-400' : 'text-gray-800'}`}>
                            {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME ? 'Quantum Elite' : 'Standard Beta'}
                          </span>
                      </div>
                  </div>
              </div>
          </motion.div>
      </div>

      {/* Pro Status Section */}
      <motion.div variants={item} className={`p-8 relative overflow-hidden ${isPro ? 'glass-card' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
          {isPro && <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 bg-amber-500/10"></div>}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown size={24} className={isPro ? "text-amber-400" : "text-gray-600"} />
                <h2 className={`text-2xl ${isPro ? 'font-display italic' : 'font-sans font-bold text-gray-900'}`}>
                  {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME ? 'Quantum Elite Status' : 'Upgrade Status'}
                </h2>
              </div>
              <p className={`text-sm max-w-xl ${isPro ? 'text-white/60' : 'text-gray-700'}`}>
                {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME 
                  ? "System fully operational. All elite modules active and synchronized."
                  : "Running in Beta Mode. Upgrade to unlock full Quantum Elite capabilities."}
              </p>
            </div>
            
            {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME && (
               <div className={`px-4 py-2 text-right ${isPro ? 'bg-emerald-500/10 border border-emerald-500/20 rounded-xl' : 'bg-gray-400 border-2 border-gray-500 rounded-none'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${isPro ? 'text-emerald-400' : 'text-gray-800'}`}>Status</span>
                <span className={`text-xl ${isPro ? 'font-display italic text-white' : 'font-sans font-bold text-gray-900'}`}>Lifetime Active</span>
              </div>
            )}
          </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            variants={item} 
            className={`p-8 transition-transform ${
              isPro ? 'glass-card border-none group hover:scale-[1.02] bg-amber-400 text-black' : 'bg-gray-300 border-4 border-gray-500 rounded-none text-gray-900'
            }`}
          >
              <div className="flex justify-between items-start mb-8">
                  <Wallet size={24} />
                  <Sparkles size={16} className={isPro ? "opacity-20" : "text-gray-500"} />
              </div>
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'opacity-60' : 'text-gray-600'}`}>Net Balance</p>
              <h3 className={`text-3xl tracking-tight ${isPro ? 'font-display italic' : 'font-sans font-bold'}`}>NPR {financials.balance.toLocaleString()}</h3>
          </motion.div>

          <motion.div 
            variants={item} 
            className={`p-8 transition-colors ${
              isPro ? 'glass-card bg-amber-950/20 border-amber-500/20 hover:bg-amber-900/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'
            }`}
          >
              <div className="flex justify-between items-start mb-8">
                  <ArrowUpRight size={24} className={isPro ? "text-emerald-400" : "text-gray-800"} />
                  <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-400/60' : 'text-gray-600'}`}>Income</span>
              </div>
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-amber-100/40' : 'text-gray-600'}`}>Total Inflow</p>
              <h3 className={`text-3xl tracking-tight ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>+{financials.income.toLocaleString()}</h3>
          </motion.div>

          <motion.div 
            variants={item} 
            className={`p-8 transition-colors ${
              isPro ? 'glass-card bg-amber-950/20 border-amber-500/20 hover:bg-amber-900/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'
            }`}
          >
              <div className="flex justify-between items-start mb-8">
                  <TrendingUp size={24} className={isPro ? "text-amber-400" : "text-gray-800"} />
                  <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-400/60' : 'text-gray-600'}`}>Academic</span>
              </div>
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-amber-100/40' : 'text-gray-600'}`}>Performance</p>
              <h3 className={`text-3xl tracking-tight ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{avgPercentage.toFixed(1)}%</h3>
          </motion.div>

          <motion.div 
            variants={item} 
            className={`p-8 transition-colors ${
              isPro ? 'glass-card bg-amber-950/20 border-amber-500/20 hover:bg-amber-900/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'
            }`}
          >
              <div className="flex justify-between items-start mb-8">
                  <TrendingDown size={24} className={isPro ? "text-red-400" : "text-gray-800"} />
                  <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-400/60' : 'text-gray-600'}`}>Expenses</span>
              </div>
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-amber-100/40' : 'text-gray-600'}`}>Total Outflow</p>
              <h3 className={`text-3xl tracking-tight ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>-{financials.expense.toLocaleString()}</h3>
          </motion.div>
      </div>

      {/* Quick Access Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { view: View.MISSION_CONTROL, icon: Target, title: "Mission Control", desc: "Strategic Operations Center", isProFeature: true },
          { view: View.FOCUS_MATRIX, icon: Cpu, title: "Focus Matrix", desc: "Neural Synchronization Protocol", isProFeature: true },
          { view: View.CAMPUS_RADAR, icon: MapPin, title: "Campus Radar", desc: "Geospatial Awareness Node", isProFeature: true },
          { view: View.FILE_HUB, icon: Database, title: "Secure Vault", desc: "Encrypted Asset Preservation", isProFeature: true },
          { view: View.COMPOSE_MAIL, icon: Globe, title: "Compose Mail", desc: "Direct Admin Dispatch", isProFeature: true }
        ].map((card, idx) => {
          const isLocked = card.isProFeature && !isPro;
          
          return (
            <motion.div 
              key={idx}
              variants={item}
              onClick={() => !isLocked && onNavigate(card.view)}
              className={`p-10 group transition-all border relative overflow-hidden ${
                isLocked 
                  ? (isPro ? 'glass-card opacity-60 cursor-not-allowed bg-white/5 border-white/5' : 'bg-gray-400 border-4 border-gray-500 rounded-none cursor-not-allowed')
                  : isPro 
                    ? 'glass-card cursor-pointer bg-amber-950/10 border-amber-500/10 hover:bg-amber-900/20 hover:border-amber-500/30' 
                    : 'bg-gray-300 border-4 border-gray-500 rounded-none cursor-pointer hover:bg-gray-400'
              }`}
            >
                {isPro && !isLocked && <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}
                
                <div className="flex justify-between items-center mb-12 relative z-10">
                  <div className={`w-16 h-16 flex items-center justify-center border transition-all ${
                    isLocked
                      ? (isPro ? 'rounded-2xl bg-white/5 text-white/20 border-white/5' : 'rounded-none bg-gray-500 text-gray-700 border-gray-600')
                      : isPro
                        ? 'rounded-2xl bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black'
                        : 'rounded-none bg-gray-400 text-gray-800 border-gray-500 group-hover:bg-gray-500 group-hover:text-black'
                  }`}>
                    {isLocked ? <Lock size={28} /> : <card.icon size={28} />}
                  </div>
                  {!isLocked && <ChevronRight size={24} className={`transition-colors ${isPro ? 'text-amber-500/40 group-hover:text-amber-400' : 'text-gray-500 group-hover:text-gray-800'}`} />}
                </div>
                
                <div className="relative z-10">
                  <h3 className={`text-2xl mb-2 ${isPro && !isLocked ? 'font-display italic text-amber-100' : (isPro ? 'font-display italic text-white' : 'font-sans font-bold text-gray-900')}`}>
                    {card.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isLocked && <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest ${isPro ? 'bg-white/10 rounded text-white/40' : 'bg-gray-500 rounded-none text-gray-800'}`}>Locked</span>}
                    <p className={`text-[10px] font-semibold uppercase tracking-widest ${isPro && !isLocked ? 'text-amber-200/40' : (isPro ? 'text-white/40' : 'text-gray-600')}`}>
                      {card.desc}
                    </p>
                  </div>
                </div>
            </motion.div>
          );
        })}
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

