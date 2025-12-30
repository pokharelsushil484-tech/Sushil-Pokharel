
import React, { useState, useEffect } from 'react';
import { ChangeRequest, UserProfile } from '../types';
import { 
  Trash2, BadgeCheck, Megaphone, Check, ShieldCheck, Sparkles, 
  UserCheck, ShieldAlert, ShieldX, UserMinus, HardDrive, Plus, 
  Minus, ShieldOff, Cpu, Activity, Database, Key, Eye, EyeOff, Mail, Info,
  BellRing, CheckCircle, XCircle, ArrowUpCircle
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
    // Sync Users
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const usersObj = JSON.parse(usersStr);
      const list = Object.entries(usersObj).map(([key, value]: [string, any]) => {
        const dataKey = `architect_data_${key}`;
        const storedData = localStorage.getItem(dataKey);
        let storageLimit = 15;
        let storageUsed = 0;
        let twoFactorEnabled = false;
        if (storedData) {
            const data = JSON.parse(storedData);
            storageLimit = data.user?.storageLimitGB || 15;
            storageUsed = data.user?.storageUsedBytes || 0;
            twoFactorEnabled = data.user?.twoFactorEnabled || false;
        }
        return {
            username: key,
            verified: value.verified,
            email: value.email,
            storageLimit,
            storageUsed,
            twoFactorEnabled
        };
      });
      setUsersList(list.filter(u => u.username !== ADMIN_USERNAME));
    }
    
    // Sync Requests
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));
  }, [refreshTrigger]);

  const totalSystemStorage = usersList.reduce((acc, u) => acc + u.storageUsed, 0);
  const totalSystemLimit = usersList.reduce((acc, u) => acc + u.storageLimit, 0);

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

  const handleProcessRequest = (reqId: string, action: 'APPROVE' | 'REJECT') => {
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;
    
    const request = requests[reqIndex];
    if (action === 'APPROVE') {
        // Extract GB from details e.g. "Request 50GB"
        const gbMatch = request.details.match(/(\d+)GB/);
        const requestedGb = gbMatch ? parseInt(gbMatch[1]) : 20;
        updateUserStorage(request.username, requestedGb);
    }
    
    const updatedRequests = requests.map(r => 
        r.id === reqId ? { ...r, status: action === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const } : r
    );
    
    setRequests(updatedRequests);
    localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
    setRefreshTrigger(prev => prev + 1);
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

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Command Center</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2">Infrastructure v{APP_VERSION}</p>
        </div>
        
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-[2rem] shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
            <button onClick={() => setViewMode('OVERVIEW')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap ${viewMode === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>System Overview</button>
            <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap relative ${viewMode === 'REQUESTS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>
                Signals 
                {requests.filter(r => r.status === 'PENDING').length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white border-2 border-white dark:border-slate-800">{requests.filter(r => r.status === 'PENDING').length}</span>}
            </button>
            <button onClick={() => setViewMode('DASHBOARD')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap ${viewMode === 'DASHBOARD' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Identity Matrix</button>
            <button onClick={() => setViewMode('STORAGE')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap ${viewMode === 'STORAGE' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Node Quotas</button>
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
                              <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                                  <div className="flex items-center space-x-3 mb-4">
                                      <Mail size={16} className="text-indigo-200" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Admin Contact</span>
                                  </div>
                                  <p className="text-sm font-bold truncate">{ADMIN_EMAIL}</p>
                              </div>
                              
                              <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                                  <div className="flex items-center space-x-3 mb-4">
                                      <Key size={16} className="text-indigo-200" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Master Logic Key</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <p className="text-sm font-mono tracking-widest">
                                          {showSecret ? ADMIN_SECRET : "••••••••••••"}
                                      </p>
                                      <button onClick={() => setShowSecret(!showSecret)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                          {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                      </button>
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
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Core Pulse Statistics</p>
                          <div className="space-y-3">
                              <div className="flex justify-between text-[11px] font-bold dark:text-white uppercase">
                                  <span>Network Saturation</span>
                                  <span className="text-indigo-500">{((totalSystemStorage / (totalSystemLimit || 1)) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${(totalSystemStorage / (totalSystemLimit || 1)) * 100}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                      { label: 'Provisioned Nodes', val: usersList.length, icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Unprocessed Signals', val: requests.filter(r => r.status === 'PENDING').length, icon: BellRing, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Total Cloud Quota', val: `${totalSystemLimit} GB`, icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'System Auth', val: 'Level 5', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                  ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className={`p-4 ${stat.bg} dark:bg-opacity-10 ${stat.color} rounded-2xl w-fit mb-6`}>
                              <stat.icon size={24} />
                          </div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</h4>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {viewMode === 'REQUESTS' && (
          <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <h3 className="text-2xl font-black mb-10 text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <BellRing className="mr-4 text-indigo-600" /> Incoming Node Signals
              </h3>
              <div className="space-y-6">
                  {requests.length === 0 ? (
                      <div className="py-24 text-center opacity-30">
                          <Info size={48} className="mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">Frequency Clear. No Signals.</p>
                      </div>
                  ) : (
                      requests.slice().reverse().map((req) => (
                          <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 gap-6">
                              <div className="flex items-center space-x-6">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${req.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                      {req.type === 'STORAGE' ? <HardDrive size={24} /> : <UserCheck size={24} />}
                                  </div>
                                  <div>
                                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{req.username}</p>
                                      <p className="text-xs text-slate-500 font-bold">{req.details}</p>
                                      <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Transmitted: {new Date(req.createdAt).toLocaleString()}</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center space-x-3 w-full md:w-auto">
                                  {req.status === 'PENDING' ? (
                                      <>
                                          <button onClick={() => handleProcessRequest(req.id, 'APPROVE')} className="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center">
                                              <CheckCircle size={16} className="mr-2" /> Grant GB
                                          </button>
                                          <button onClick={() => handleProcessRequest(req.id, 'REJECT')} className="flex-1 md:flex-none px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
                                              <XCircle size={16} className="mr-2" /> Deny
                                          </button>
                                      </>
                                  ) : (
                                      <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                          {req.status}
                                      </span>
                                  )}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {viewMode === 'STORAGE' && (
          <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                    <HardDrive className="mr-6 text-indigo-600" size={40} /> Manual Node Override
                  </h3>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Authority Grant: UNLIMITED GBN</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {usersList.map((u, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 flex flex-col group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm relative overflow-hidden">
                          <div className="flex items-center space-x-5 mb-10">
                              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl">{u.username.charAt(0).toUpperCase()}</div>
                              <div>
                                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{u.username}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Status: Stable Interface</p>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Grant Input (GB)</label>
                              <div className="flex items-center space-x-3">
                                  <input 
                                      type="number"
                                      className="flex-1 p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-black dark:text-white outline-none focus:border-indigo-600 transition-all"
                                      value={u.storageLimit}
                                      onChange={(e) => updateUserStorage(u.username, parseInt(e.target.value) || 0)}
                                  />
                                  <div className="flex flex-col space-y-2">
                                      <button onClick={() => updateUserStorage(u.username, u.storageLimit + 10)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Plus size={16}/></button>
                                      <button onClick={() => updateUserStorage(u.username, u.storageLimit - 10)} className="p-2 bg-slate-100 text-slate-400 rounded-lg"><Minus size={16}/></button>
                                  </div>
                              </div>
                              <p className="text-[9px] text-indigo-500 font-bold uppercase text-center mt-2">Granting over 1024GB authorizes TB mode.</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {viewMode === 'DASHBOARD' && (
        <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
            <h3 className="text-2xl font-black mb-10 text-slate-900 dark:text-white uppercase tracking-tight">Active Node Matrix</h3>
            <div className="space-y-6">
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
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                            <button onClick={() => deleteUser(u.username)} className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-red-400 hover:text-red-600 transition-colors border border-slate-100 dark:border-slate-700"><UserMinus size={24} /></button>
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Interface Logs</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
