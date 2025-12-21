
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, View, Database } from '../types';
import { DatabaseBackup, HardDrive, Activity, ArrowRight, ShieldCheck, ShieldAlert, Cpu, Layers, Globe, Server, RefreshCw } from 'lucide-react';
import { APP_NAME, CREATOR_NAME } from '../constants';

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
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('System Initialized');
    else if (hour < 18) setGreeting('Processing Active');
    else setGreeting('Nodes Synchronized');
  }, []);

  const totalRecords = databases.reduce((acc, db) => acc + db.records.length, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full max-w-7xl mx-auto">
      
      {/* Header Module - Standardized Alignment */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#0f172a] shadow-sm border border-slate-200 dark:border-slate-800 p-8 lg:p-12">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/5 -skew-x-12 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-5 h-5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20"></div>
                    <span className="text-slate-400 font-black text-[10px] tracking-[0.4em] uppercase">Private System Instance</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-3 leading-none tracking-tight">
                    {greeting}, <span className="text-indigo-600">{user?.name?.split(' ')[0] || "User"}</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-tight">Lead Architect: {CREATOR_NAME}</p>
              </div>

              <div className="flex items-center space-x-4">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner ${isVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 border border-emerald-100' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 border border-amber-100'}`}>
                      {isVerified ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                  </div>
              </div>
          </div>
      </div>

      {/* Grid Alignment - Desktop & Mobile Synchronization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Cloud Instances', val: databases.length, icon: DatabaseBackup, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Logic Segments', val: totalRecords, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Node Status', val: 'Optimized', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Security Level', val: isVerified ? 'Verified' : 'Guest', icon: Cpu, color: 'text-slate-600', bg: 'bg-slate-50' }
          ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center space-x-5 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <div className={`p-4 rounded-2xl ${stat.bg} dark:bg-opacity-10 ${stat.color} shadow-sm`}>
                      <stat.icon size={28} />
                  </div>
                  <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</p>
                  </div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[400px] shadow-sm">
              <div>
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
                        <Server className="mr-4 text-indigo-600" size={32} /> System Synchronization
                    </h2>
                    <RefreshCw className="text-slate-300 animate-spin-slow" size={20} />
                  </div>
                  
                  <div className="space-y-5">
                      {['Master Logic Sync', 'AI Reasoning Node', 'Encryption Gate', 'Audit Protocol'].map((node, i) => (
                          <div key={i} className="p-6 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors hover:bg-white dark:hover:bg-slate-800">
                              <div className="flex items-center space-x-5">
                                  <div className={`w-2.5 h-2.5 rounded-full ${i === 3 && !isVerified ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
                                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{node}</span>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i === 3 && !isVerified ? 'Restricted' : 'Operational'}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Quick Access Alignments */}
          <div className="space-y-6">
              <div 
                onClick={() => isVerified && onNavigate(View.DATABASE_MANAGER)} 
                className={`p-10 rounded-[2.5rem] cursor-pointer transition-all flex flex-col justify-between group h-[200px] relative overflow-hidden ${isVerified ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 grayscale opacity-60'}`}
              >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <DatabaseBackup size={120} />
                  </div>
                  <div className="relative z-10">
                      <DatabaseBackup size={32} className="mb-6" />
                      <h3 className="text-2xl font-black tracking-tight">Architect</h3>
                      <p className="text-xs text-indigo-100 font-bold opacity-80 mt-1">Manage Cloud Schemas</p>
                  </div>
                  <div className="relative z-10 flex items-center text-[10px] font-black uppercase tracking-[0.2em]">
                    Initialize Node <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
              </div>

              <div onClick={() => onNavigate(View.NOTES)} className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 cursor-pointer h-[200px] flex flex-col justify-between group shadow-sm transition-all hover:border-indigo-200">
                  <div>
                      <HardDrive size={32} className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Documents</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1">Access System Logs</p>
                  </div>
                   <div className="flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                    Open Library <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </div>
              </div>
          </div>
      </div>

      <div className="text-center pt-12 opacity-40">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.8em]">{APP_NAME}</p>
      </div>
    </div>
  );
};
