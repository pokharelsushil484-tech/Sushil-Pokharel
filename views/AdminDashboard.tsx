
import React, { useState, useEffect } from 'react';
import { ChangeRequest, UserProfile } from '../types';
import { 
  Trash2, BadgeCheck, Megaphone, Check, ShieldCheck, Sparkles, 
  UserCheck, ShieldAlert, ShieldX, UserMinus, HardDrive, Plus, 
  Minus, ShieldOff, Cpu, Activity, Database, Key, Eye, EyeOff, Mail, Info,
  BellRing, CheckCircle, XCircle, ArrowUpCircle, Infinity
} from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME, ADMIN_EMAIL, APP_VERSION, SYSTEM_UPGRADE_TOKEN } from '../constants';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'STORAGE' | 'OVERVIEW' | 'REQUESTS'>('OVERVIEW');
  const [showSecret, setShowSecret] = useState(false);
  
  useEffect(() => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const usersObj = JSON.parse(usersStr);
      const list = Object.entries(usersObj).map(([key, value]: [string, any]) => {
        const dataKey = `architect_data_${key}`;
        const storedData = localStorage.getItem(dataKey);
        let storageLimit = 15;
        let storageUsed = 0;
        if (storedData) {
            const data = JSON.parse(storedData);
            storageLimit = data.user?.storageLimitGB || 15;
            storageUsed = data.user?.storageUsedBytes || 0;
        }
        return {
            username: key,
            verified: value.verified,
            email: value.email,
            storageLimit,
            storageUsed,
            isAdmin: key === ADMIN_USERNAME
        };
      });
      setUsersList(list);
    }
    
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));
  }, [refreshTrigger]);

  const totalSystemStorage = usersList.reduce((acc, u) => acc + u.storageUsed, 0);
  const totalSystemLimit = usersList.filter(u => !u.isAdmin).reduce((acc, u) => acc + u.storageLimit, 0);

  const updateUserStorage = (username: string, newLimit: number) => {
    const dataKey = `architect_data_${username}`;
    const stored = localStorage.getItem(dataKey);
    if (stored) {
        const data = JSON.parse(stored);
        // ABSOLUTE SETTING OF LIMIT
        data.user.storageLimitGB = Math.max(1, newLimit);
        localStorage.setItem(dataKey, JSON.stringify(data));
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const deleteUser = (username: string) => {
    if (username === ADMIN_USERNAME) return;
    if (window.confirm(`Permanently purge node: ${username}?`)) {
        const usersStr = localStorage.getItem('studentpocket_users');
        if (usersStr) {
            const users = JSON.parse(usersStr);
            delete users[username];
            localStorage.setItem('studentpocket_users', JSON.stringify(users));
            localStorage.removeItem(`architect_data_${username}`);
            setRefreshTrigger(prev => prev + 1);
        }
    }
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Infrastructure Console</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2">Architecture v{APP_VERSION}</p>
        </div>
        
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-[2rem] shadow-inner w-full md:w-auto">
            <button onClick={() => setViewMode('OVERVIEW')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>System Overview</button>
            <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'REQUESTS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Node Signals</button>
            <button onClick={() => setViewMode('STORAGE')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'STORAGE' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Node Quotas</button>
        </div>
      </div>

      {viewMode === 'OVERVIEW' && (
          <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-indigo-600 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative z-10">
                          <div className="flex items-center space-x-6 mb-10">
                              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] border border-white/30 flex items-center justify-center">
                                  <ShieldCheck size={40} />
                              </div>
                              <div>
                                  <h3 className="text-3xl font-black uppercase tracking-tight">{CREATOR_NAME}</h3>
                                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Lead System Architect</p>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="bg-white/10 p-6 rounded-3xl border border-white/20 flex flex-col justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Personal Capacity</span>
                                  <div className="flex items-center space-x-3 mt-4">
                                      <Infinity size={24} className="text-white" />
                                      <p className="text-xl font-black tracking-tight uppercase">Unlimited GBN</p>
                                  </div>
                              </div>
                              
                              <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                                  <div className="flex items-center space-x-3 mb-4">
                                      <Key size={16} className="text-indigo-200" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Master Key</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <p className="text-sm font-mono tracking-widest">{showSecret ? ADMIN_SECRET : "••••••••••••"}</p>
                                      <button onClick={() => setShowSecret(!showSecret)}>{showSecret ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-8">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl">
                              <Activity size={32} />
                          </div>
                          <div className="text-right">
                              <span className="block text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">100%</span>
                              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Uptime Active</span>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Network Consumption</p>
                          <div className="space-y-3">
                              <div className="flex justify-between text-[11px] font-black dark:text-white uppercase">
                                  <span>Cluster Load</span>
                                  <span className="text-indigo-500">{((totalSystemStorage / (totalSystemLimit || 1)) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${(totalSystemStorage / (totalSystemLimit || 1)) * 100}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {viewMode === 'STORAGE' && (
          <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <h3 className="text-2xl font-black mb-16 text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <HardDrive className="mr-6 text-indigo-600" size={40} /> Capacity Provisioning
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {usersList.map((u, i) => (
                      <div key={i} className={`p-10 rounded-[3rem] border flex flex-col justify-between relative overflow-hidden transition-all ${u.isAdmin ? 'bg-slate-900 border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                          <div className="flex items-center space-x-5 mb-10">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${u.isAdmin ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{u.username.charAt(0).toUpperCase()}</div>
                              <div>
                                  <p className={`font-black uppercase tracking-tight text-lg ${u.isAdmin ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{u.username}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{u.isAdmin ? 'Lead Architect node' : 'Consumer Node'}</p>
                              </div>
                          </div>

                          {u.isAdmin ? (
                              <div className="p-6 bg-white/5 rounded-3xl text-center border border-white/10">
                                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Architectural Status</p>
                                  <h4 className="text-2xl font-black text-white mt-2">UNLIMITED</h4>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Capacity (GB)</label>
                                  <div className="flex items-center space-x-3">
                                      <input 
                                          type="number" 
                                          className="flex-1 p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-black dark:text-white outline-none focus:border-indigo-600 transition-all"
                                          value={u.storageLimit}
                                          onChange={(e) => updateUserStorage(u.username, parseInt(e.target.value) || 0)}
                                      />
                                      <div className="flex flex-col space-y-2">
                                          <button onClick={() => updateUserStorage(u.username, u.storageLimit + 1)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Plus size={16}/></button>
                                          <button onClick={() => updateUserStorage(u.username, u.storageLimit - 1)} className="p-2 bg-slate-100 text-slate-400 rounded-lg"><Minus size={16}/></button>
                                      </div>
                                  </div>
                                  <button onClick={() => deleteUser(u.username)} className="w-full text-[9px] font-black text-red-500 uppercase tracking-widest py-2">De-provision Node</button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
