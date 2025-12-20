
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, View } from '../types';
import { Flame, Wallet, ListChecks, Sun, Cloud, Moon, Coffee, ArrowRight, Zap, BadgeCheck, Sparkles, Activity, LayoutGrid } from 'lucide-react';
import { APP_NAME } from '../constants';

interface DashboardProps {
  user: UserProfile;
  isVerified: boolean;
  username: string;
  expenses: Expense[];
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, isVerified, username, expenses, onNavigate }) => {
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) { setGreeting('Good Morning'); setTimeOfDay('MORNING'); }
    else if (hour < 18) { setGreeting('Good Afternoon'); setTimeOfDay('AFTERNOON'); }
    else { setGreeting('Good Evening'); setTimeOfDay('EVENING'); }
  }, []);

  const balance = expenses.reduce((acc, curr) => curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount, 0);

  return (
    <div className="space-y-12 animate-fade-in perspective-3d">
      
      {/* 3D Glass Morphic Header */}
      <div className={`relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br ${
        timeOfDay === 'MORNING' ? 'from-orange-400 to-rose-500' :
        timeOfDay === 'AFTERNOON' ? 'from-blue-500 to-indigo-700' :
        'from-slate-800 to-slate-950'
      } shadow-2xl p-12 text-white transform-gpu rotate-x-2 transition-all duration-700 hover:rotate-x-0`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[120px] animate-pulse"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                  <div>
                      <p className="text-white/70 font-bold text-xs tracking-[0.3em] uppercase mb-3">Personal Daily Hub</p>
                      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 depth-text">
                          {greeting},<br/>
                          <span className="opacity-90">{user.name.split(' ')[0]}</span>
                          {isVerified && <BadgeCheck className="inline-block ml-4 text-blue-300 fill-white/10" size={42} />}
                      </h1>
                  </div>
                  <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl animate-float">
                      {timeOfDay === 'MORNING' ? <Sun size={40} className="text-yellow-300" /> : 
                       timeOfDay === 'AFTERNOON' ? <Cloud size={40} className="text-white" /> : 
                       <Moon size={40} className="text-indigo-300" />}
                  </div>
              </div>

              <div className="flex flex-wrap gap-6">
                  <div className="bg-black/30 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-xl flex items-center">
                      <Flame size={20} className="text-orange-400 mr-3" />
                      <span className="font-bold text-xs tracking-widest uppercase">{user.streak || 0} Day Streak</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-xl flex items-center">
                      <Activity size={20} className="text-green-300 mr-3" />
                      <span className="font-bold text-xs tracking-widest uppercase">3D Active</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 3D Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Activity Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 h-96 card-3d group relative flex flex-col justify-between">
              <div className="absolute top-10 right-10 text-slate-100 dark:text-slate-800 transition-transform group-hover:scale-110">
                  <Zap size={150} strokeWidth={4} />
              </div>
              
              <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 flex items-center">
                      <Coffee className="mr-4 text-indigo-600" size={32} /> Routine Power
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                      {['Finance Check', 'Task Review', 'Note Reflection', 'AI Strategy'].map((item, i) => (
                          <div key={i} className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer">
                              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                              <span className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">{item}</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                      <span>Daily Resilience</span>
                      <span>85% Optimal</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full w-[85%] shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-pulse"></div>
                  </div>
              </div>
          </div>

          {/* Quick Stats Column */}
          <div className="space-y-10">
              <div onClick={() => onNavigate(View.EXPENSES)} className="bg-slate-950 p-8 rounded-[3rem] shadow-2xl text-white cursor-pointer hover:-translate-y-3 transition-all border border-white/5 h-44 flex flex-col justify-between group">
                  <div className="flex justify-between items-start">
                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em]">Wealth</p>
                    <Wallet size={20} className="text-indigo-400 opacity-50 group-hover:scale-110" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tighter">NPR {balance.toLocaleString()}</h3>
                  <div className="flex items-center text-xs text-indigo-400 font-bold">
                    Manage Wallet <ArrowRight size={14} className="ml-2 group-hover:translate-x-1" />
                  </div>
              </div>

              <div onClick={() => onNavigate(View.PLANNER)} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:-translate-y-3 transition-all h-44 flex flex-col justify-between group">
                   <div className="flex justify-between items-start">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Missions</p>
                    <ListChecks size={20} className="text-slate-400 opacity-50 group-hover:scale-110" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Planner</h3>
                  <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    View Planner <ArrowRight size={14} className="ml-2 group-hover:translate-x-1" />
                  </div>
              </div>
          </div>
      </div>

      {/* AI Embedding - 3D Section */}
      <div 
        onClick={() => onNavigate(View.AI_CHAT)}
        className="relative group cursor-pointer overflow-hidden rounded-[4rem] bg-indigo-600 shadow-2xl p-1 transition-all hover:scale-[1.01]"
      >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-tilt"></div>
          <div className="relative bg-white/5 backdrop-blur-3xl m-1 p-12 rounded-[3.8rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex items-center gap-10">
                    <div className="bg-white/20 p-8 rounded-[2rem] border border-white/20 animate-float">
                        <Sparkles size={60} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-2">3D AI Embedded Engine</h3>
                        <p className="text-indigo-100 text-sm opacity-80 uppercase tracking-widest font-medium">Daily Intelligence & Guidance Hub</p>
                    </div>
               </div>
               <button className="bg-white text-indigo-600 px-12 py-5 rounded-3xl font-bold shadow-2xl hover:bg-slate-50 transition-all flex items-center group/btn text-lg">
                  Initiate AI <ArrowRight className="ml-3 group-hover/btn:translate-x-2 transition-transform" />
               </button>
          </div>
      </div>

      <div className="text-center pt-10 pb-10 opacity-40">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">{APP_NAME} • Professional Mastery</p>
      </div>
    </div>
  );
};
