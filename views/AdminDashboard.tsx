
import React, { useState, useEffect } from 'react';
import { ChangeRequest, UserProfile } from '../types';
import { Trash2, BadgeCheck, Megaphone, Check, ShieldCheck, Sparkles, UserCheck, ShieldAlert, ShieldX, UserMinus, HardDrive, Plus, Minus, ShieldOff } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'STORAGE' | 'VERIFICATIONS'>('DASHBOARD');
  
  useEffect(() => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const usersObj = JSON.parse(usersStr);
      const list = Object.entries(usersObj).map(([key, value]: [string, any]) => {
        const dataKey = `architect_data_${key}`;
        const storedData = localStorage.getItem(dataKey);
        let storageLimit = 5;
        let twoFactorEnabled = false;
        if (storedData) {
            const data = JSON.parse(storedData);
            storageLimit = data.user?.storageLimitGB || 5;
            twoFactorEnabled = data.user?.twoFactorEnabled || false;
        }
        return {
            username: key,
            verified: value.verified,
            email: value.email,
            storageLimit,
            twoFactorEnabled
        };
      });
      setUsersList(list.filter(u => u.username !== ADMIN_USERNAME));
    }
    
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));
  }, [refreshTrigger]);

  const updateUserStorage = (username: string, newLimit: number) => {
    const dataKey = `architect_data_${username}`;
    const stored = localStorage.getItem(dataKey);
    if (stored) {
        const data = JSON.parse(stored);
        data.user.storageLimitGB = Math.max(1, newLimit);
        localStorage.setItem(dataKey, JSON.stringify(data));
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const forceToggle2FA = (username: string, currentState: boolean) => {
    const dataKey = `architect_data_${username}`;
    const stored = localStorage.getItem(dataKey);
    if (stored) {
        const data = JSON.parse(stored);
        data.user.twoFactorEnabled = !currentState;
        localStorage.setItem(dataKey, JSON.stringify(data));
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const toggleUserVerification = (username: string, currentStatus: boolean) => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
        const users = JSON.parse(usersStr);
        if (users[username]) {
            users[username].verified = !currentStatus;
            localStorage.setItem('studentpocket_users', JSON.stringify(users));
            
            const dataKey = `architect_data_${username}`;
            const stored = localStorage.getItem(dataKey);
            if (stored) {
                const data = JSON.parse(stored);
                data.user.isPro = !currentStatus;
                data.user.verificationStatus = !currentStatus ? 'VERIFIED' : 'NONE';
                localStorage.setItem(dataKey, JSON.stringify(data));
            }
            setRefreshTrigger(prev => prev + 1);
        }
    }
  };

  const deleteUser = (username: string) => {
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

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-12">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Authority Core</h1>

      <div className="flex bg-slate-200 dark:bg-slate-800 p-2 rounded-[2.5rem] max-w-2xl shadow-inner overflow-x-auto no-scrollbar">
          <button onClick={() => setViewMode('DASHBOARD')} className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all whitespace-nowrap ${viewMode === 'DASHBOARD' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Identity Matrix</button>
          <button onClick={() => setViewMode('STORAGE')} className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all whitespace-nowrap ${viewMode === 'STORAGE' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Node Quotas</button>
          <button onClick={() => setViewMode('VERIFICATIONS')} className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all relative whitespace-nowrap ${viewMode === 'VERIFICATIONS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>
            Audit Segments {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 animate-pulse">{pendingRequests.length}</span>}
          </button>
      </div>

      {viewMode === 'DASHBOARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-12 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black mb-10 text-slate-900 dark:text-white uppercase tracking-tight">Active Node Matrix</h3>
                <div className="space-y-6">
                    {usersList.length === 0 && <p className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-xs">Zero Nodes Provisioned</p>}
                    {usersList.map((u, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 gap-6 shadow-sm">
                            <div className="flex items-center space-x-6">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl ${u.verified ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center">
                                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{u.username}</p>
                                      {u.verified ? <BadgeCheck className="text-indigo-600 ml-2" size={20} /> : <ShieldAlert className="text-amber-500 ml-2" size={20} />}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{u.email}</p>
                                    <div className="flex items-center mt-2 space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${u.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                            2FA: {u.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 w-full sm:w-auto">
                                <button 
                                  onClick={() => forceToggle2FA(u.username, u.twoFactorEnabled)}
                                  className={`p-3 rounded-2xl transition-all border ${u.twoFactorEnabled ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                                  title={u.twoFactorEnabled ? 'De-authorize 2FA' : 'Force 2FA Requirement'}
                                >
                                    {u.twoFactorEnabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
                                </button>
                                <button 
                                  onClick={() => toggleUserVerification(u.username, u.verified)}
                                  className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${u.verified ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
                                >
                                    {u.verified ? 'Suspend Node' : 'Authorize Identity'}
                                </button>
                                <button onClick={() => deleteUser(u.username)} className="p-3 text-slate-300 hover:text-red-600"><UserMinus size={24} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="bg-indigo-600 p-12 rounded-[3rem] shadow-2xl text-white flex flex-col items-center justify-center group h-64 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><UserCheck size={140} /></div>
                    <Megaphone size={56} className="mb-6 relative z-10" />
                    <span className="font-black text-xs uppercase tracking-[0.4em] relative z-10">Node Statistics</span>
                    <p className="text-[10px] text-indigo-200 font-black uppercase mt-4 tracking-widest relative z-10">{usersList.length} Authenticated Segments</p>
                </div>
                <div onClick={resetApp} className="bg-white dark:bg-[#0f172a] border-2 border-dashed border-red-200 dark:border-red-900/40 p-12 rounded-[3.5rem] shadow-xl text-red-600 cursor-pointer hover:bg-red-50 transition-all flex flex-col items-center justify-center h-64">
                    <ShieldX size={56} className="mb-6" />
                    <span className="font-black text-xs uppercase tracking-[0.4em]">Master Factory Wipe</span>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'STORAGE' && (
          <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between mb-16">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                    <HardDrive className="mr-6 text-indigo-600" size={40} /> Storage Provisioning
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">Susil Authority Node 0</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {usersList.map((u, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 flex flex-col justify-between group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                          <div className="flex items-center space-x-5 mb-10">
                              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl">{u.username.charAt(0).toUpperCase()}</div>
                              <div>
                                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{u.username}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Current Limit: {u.storageLimit} GB</p>
                              </div>
                          </div>

                          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                              <button onClick={() => updateUserStorage(u.username, u.storageLimit - 1)} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><Minus size={24} /></button>
                              <div className="text-center flex-1">
                                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{u.storageLimit}</span>
                                  <span className="text-[10px] font-black text-slate-400 ml-2 uppercase">Gigabytes</span>
                              </div>
                              <button onClick={() => updateUserStorage(u.username, u.storageLimit + 1)} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={24} /></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
