
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, View, Database } from '../types';
import { DatabaseBackup, HardDrive, ArrowRight, ShieldCheck, Cpu, Layers, Server, Cloud, ShieldAlert } from 'lucide-react';
import { APP_NAME, CREATOR_NAME, ADMIN_USERNAME } from '../constants';

interface DashboardProps {
  user: UserProfile;
  isVerified: boolean;
  username: string;
  expenses: Expense[];
  databases?: Database[];
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, isVerified, username, expenses = [], databases = [], onNavigate }) => {
  const [greeting, setGreeting] = useState('');
  const isAdmin = username === ADMIN_USERNAME;
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const totalRecords = databases.reduce((acc, db) => acc + db.records.length, 0);
  const usedGB = (user.storageUsedBytes / (1024 ** 3)).toFixed(2);
  const usedPercent = Math.min(100, (user.storageUsedBytes / (user.storageLimitGB * 1024 ** 3)) * 100);

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in pb-12 w-full max-w-7xl mx-auto">
      
      {/* Dynamic Header */}
      <div className={`relative overflow-hidden rounded-[2.5rem] text-white shadow-2xl p-8 lg:p-14 transition-all duration-700 ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'}`}>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    {isAdmin ? <ShieldAlert className="w-5 h-5 text-indigo-400" /> : <Cloud className="w-5 h-5 text-indigo-200" />}
                    <span className="text-indigo-200 font-black text-[10px] tracking-[0.4em] uppercase">
                        {isAdmin ? 'System Override Active' : 'Private Node Synced'}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-6xl font-black mb-3 leading-none tracking-tight">
                    {greeting}, <br/>
                    <span className={`${isAdmin ? 'text-indigo-500' : 'text-indigo-200'}`}>{user?.name || "Architect"}</span>
                  </h1>
                  <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mt-6">Designed by {CREATOR_NAME}</p>
              </div>

              <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-[2.5rem] backdrop-blur-xl border flex items-center justify-center shadow-2xl mb-4 group hover:scale-110 transition-transform ${isAdmin ? 'bg-indigo-600/30 border-indigo-500/30' : 'bg-white/20 border-white/30'}`}>
                      {isAdmin ? <Cpu size={48} className="text-indigo-500" /> : <ShieldCheck size={48} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {isAdmin ? 'Admin Clearance' : 'Authorized Access'}
                  </span>
              </div>
          </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Cloud Storage', val: `${usedGB} / ${user.storageLimitGB} GB`, icon: HardDrive, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${usedPercent.toFixed(1)}% consumed` },
            { label: 'Databases', val: databases.length, icon: DatabaseBackup, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Managed nodes' },
            { label: 'Records', val: totalRecords, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Indexed segments' },
            { label: 'System Health', val: 'Optimized', icon: Cpu, color: 'text-slate-600', bg: 'bg-slate-50', sub: 'Low latency' }
          ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#0f172a] p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col space-y-4 shadow-sm group hover:shadow-xl transition-all">
                  <div className={`p-4 rounded-2xl w-fit ${stat.bg} dark:bg-opacity-10 ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={28} />
                  </div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{stat.sub}</p>
                  </div>
              </div>
          ))}
      </div>

      {/* Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight uppercase">
                    <Server className="mr-4 text-indigo-600" size={32} /> System Node Matrix
                </h2>
                <div className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Node Alpha Online
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Primary Logic Node', 'Storage Cluster A', 'AI Reasoning Core', 'Security Gateway'].map((node, i) => (
                      <div key={i} className="p-6 rounded-2xl flex items-center justify-between border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all border-l-4 border-l-indigo-500">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{node}</span>
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Active</span>
                      </div>
                  ))}
              </div>

              {isAdmin && (
                  <div onClick={() => onNavigate(View.ADMIN_DASHBOARD)} className="mt-8 p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-between cursor-pointer group hover:bg-indigo-950 transition-all">
                      <div className="flex items-center space-x-6">
                          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl group-hover:rotate-12 transition-transform">
                              <ShieldAlert size={28} />
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-white uppercase tracking-tight">Authority Command</h3>
                              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Manage global nodes and identity matrix</p>
                          </div>
                      </div>
                      <ArrowRight size={24} className="text-indigo-600 group-hover:translate-x-2 transition-transform" />
                  </div>
              )}
          </div>

          <div className="space-y-6">
              <div 
                onClick={() => onNavigate(View.DATABASE_MANAGER)} 
                className="p-10 rounded-[3rem] bg-slate-900 text-white cursor-pointer transition-all flex flex-col justify-between group h-64 relative overflow-hidden shadow-2xl"
              >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                      <DatabaseBackup size={140} />
                  </div>
                  <div className="relative z-10">
                      <DatabaseBackup size={32} className="mb-6 text-indigo-400" />
                      <h3 className="text-2xl font-black tracking-tight uppercase">Database Architect</h3>
                      <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">Design and deploy local data nodes with AI-assisted schema generation.</p>
                  </div>
                  <div className="relative z-10 flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                    Initialize Core <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
              </div>

              <div 
                onClick={() => onNavigate(View.VAULT)} 
                className="bg-white dark:bg-[#0f172a] rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 cursor-pointer h-64 flex flex-col justify-between group shadow-sm transition-all hover:border-indigo-300"
              >
                  <div>
                      <HardDrive size={32} className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Storage Boxes</h3>
                      <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">Manage your personal cloud storage boxes and encrypted documents.</p>
                  </div>
                   <div className="flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">
                    Open Vault <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
              </div>
          </div>
      </div>

      <div className="text-center pt-8 opacity-20">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[1em]">{APP_NAME} • CREATED BY SUSHIL</p>
      </div>
    </div>
  );
};
