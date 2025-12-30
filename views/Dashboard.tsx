
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, View, Database } from '../types';
import { DatabaseBackup, HardDrive, ArrowRight, ShieldCheck, Cpu, Layers, Server, Cloud, ShieldAlert, Infinity } from 'lucide-react';
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
  const usedPercent = isAdmin ? 0 : Math.min(100, (user.storageUsedBytes / (user.storageLimitGB * 1024 ** 3)) * 100);

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in pb-12 w-full max-w-7xl mx-auto">
      
      {/* Professional Header */}
      <div className={`relative overflow-hidden rounded-[3.5rem] text-white shadow-2xl p-10 lg:p-16 transition-all duration-700 ${isAdmin ? 'bg-slate-900 border border-indigo-500/20' : 'bg-indigo-600'}`}>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-6">
                    {isAdmin ? <ShieldAlert className="w-5 h-5 text-indigo-400" /> : <Cloud className="w-5 h-5 text-indigo-200" />}
                    <span className="text-indigo-200 font-black text-[10px] tracking-[0.5em] uppercase">
                        {isAdmin ? 'Architectural Core Active' : 'Verified Hub Synced'}
                    </span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-black mb-4 leading-tight tracking-tighter">
                    {greeting}, <br/>
                    <span className={`${isAdmin ? 'text-indigo-500' : 'text-indigo-200'}`}>{user?.name || "Architect"}</span>
                  </h1>
                  <p className="text-indigo-100/40 text-xs font-black uppercase tracking-[0.4em] mt-8">Engineered by {CREATOR_NAME}</p>
              </div>

              <div className="flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-[3rem] backdrop-blur-3xl border flex items-center justify-center shadow-2xl mb-6 transition-transform hover:scale-105 ${isAdmin ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-white/10 border-white/20'}`}>
                      {isAdmin ? <Infinity size={56} className="text-indigo-500" /> : <ShieldCheck size={56} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-200">
                      {isAdmin ? 'Unlimited GBN' : 'Encrypted node'}
                  </span>
              </div>
          </div>
      </div>

      {/* Grid Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Storage Cluster', val: isAdmin ? '∞' : `${usedGB} GB`, icon: HardDrive, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: isAdmin ? 'No capacity limit' : `${usedPercent.toFixed(1)}% Saturation` },
            { label: 'DB Architect', val: databases.length, icon: DatabaseBackup, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Managed logic nodes' },
            { label: 'Total Indexing', val: totalRecords, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Indexed data segments' },
            { label: 'Core Integrity', val: 'OPTIMIZED', icon: Cpu, color: 'text-slate-600', bg: 'bg-slate-50', sub: 'Zero latency handshake' }
          ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#0f172a] p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col space-y-6 shadow-sm hover:shadow-2xl transition-all">
                  <div className={`p-5 rounded-2xl w-fit ${stat.bg} dark:bg-opacity-10 ${stat.color}`}>
                      <stat.icon size={32} />
                  </div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{stat.val}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{stat.sub}</p>
                  </div>
              </div>
          ))}
      </div>

      {/* Primary Operation Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center tracking-tight uppercase">
                    <Server className="mr-6 text-indigo-600" size={40} /> System Node Grid
                </h2>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 animate-pulse"></span> Network Stable
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['Primary Logic Node', 'Storage Cluster A', 'AI Reasoning Core', 'Identity Gateway'].map((node, i) => (
                      <div key={i} className="p-8 rounded-[1.5rem] flex items-center justify-between border-l-[6px] border-indigo-600 bg-slate-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.2em]">{node}</span>
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Active</span>
                      </div>
                  ))}
              </div>

              {isAdmin && (
                  <div onClick={() => onNavigate(View.ADMIN_DASHBOARD)} className="mt-12 p-10 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex items-center justify-between cursor-pointer group hover:bg-indigo-950 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none">
                      <div className="flex items-center space-x-8">
                          <div className="p-5 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl transition-transform group-hover:rotate-6">
                              <ShieldAlert size={32} />
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-white uppercase tracking-tight">Authority Console</h3>
                              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-2">Manage consumer nodes and quota grants</p>
                          </div>
                      </div>
                      <ArrowRight size={28} className="text-indigo-600 group-hover:translate-x-3 transition-transform" />
                  </div>
              )}
          </div>

          <div className="space-y-10">
              <div onClick={() => onNavigate(View.DATABASE_MANAGER)} className="p-12 rounded-[3.5rem] bg-slate-900 text-white cursor-pointer h-72 flex flex-col justify-between group relative overflow-hidden shadow-2xl transition-all hover:-translate-y-2">
                  <DatabaseBackup size={160} className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform" />
                  <div>
                      <DatabaseBackup size={40} className="mb-8 text-indigo-500" />
                      <h3 className="text-3xl font-black tracking-tight uppercase">Database</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Architect local data nodes</p>
                  </div>
                  <ArrowRight size={24} className="text-indigo-500 group-hover:translate-x-2 transition-transform" />
              </div>

              <div onClick={() => onNavigate(View.VAULT)} className="bg-white dark:bg-[#0f172a] rounded-[3.5rem] border border-slate-100 dark:border-slate-800 p-12 cursor-pointer h-72 flex flex-col justify-between group shadow-sm hover:border-indigo-300 transition-all hover:-translate-y-2">
                  <div>
                      <HardDrive size={40} className="text-indigo-600 mb-8" />
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">The Vault</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Secure Cloud Transmission</p>
                  </div>
                  <ArrowRight size={24} className="text-indigo-600 group-hover:translate-x-2 transition-transform" />
              </div>
          </div>
      </div>
    </div>
  );
};
