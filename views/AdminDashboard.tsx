
import React, { useState, useEffect } from 'react';
import { ChangeRequest, UserProfile } from '../types';
import { 
  Trash2, ShieldCheck, UserCheck, ShieldAlert, HardDrive, Plus, 
  Minus, Activity, Key, Eye, EyeOff, BellRing, Infinity
} from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME, APP_VERSION } from '../constants';
import { storageService } from '../services/storageService';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'REQUESTS' | 'STORAGE'>('OVERVIEW');
  const [showSecret, setShowSecret] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
        const usersObj = JSON.parse(usersStr);
        const list = await Promise.all(Object.entries(usersObj).map(async ([key, value]: [string, any]) => {
          const storedData = await storageService.getData(`architect_data_${key}`);
          let storageLimit = 15;
          let storageUsed = 0;
          if (storedData) {
              storageLimit = storedData.user?.storageLimitGB || 15;
              storageUsed = storedData.user?.storageUsedBytes || 0;
          }
          return {
              username: key,
              verified: value.verified,
              email: value.email,
              storageLimit,
              storageUsed,
              isAdmin: key === ADMIN_USERNAME
          };
        }));
        setUsersList(list);
      }
      
      const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
      setRequests(JSON.parse(reqStr));
    };
    fetchUsers();
  }, [refreshTrigger]);

  const handleManualGrant = async (username: string, amount: number) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored) {
        stored.user.storageLimitGB = Math.max(1, amount);
        await storageService.setData(dataKey, stored);
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleProcessRequest = async (reqId: string, action: 'APPROVE' | 'REJECT') => {
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;
    
    const request = requests[reqIndex];
    if (action === 'APPROVE') {
        const gbMatch = request.details.match(/(\d+)GB/);
        const requestedGb = gbMatch ? parseInt(gbMatch[1]) : 20;
        await handleManualGrant(request.username, requestedGb);
    }
    
    const updatedRequests = requests.map(r => 
        r.id === reqId ? { ...r, status: action === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const } : r
    );
    
    localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
    setRefreshTrigger(prev => prev + 1);
  };

  const deleteUser = async (username: string) => {
    if (username === ADMIN_USERNAME) return;
    if (window.confirm(`Permanently purge node: ${username}?`)) {
        const usersStr = localStorage.getItem('studentpocket_users');
        if (usersStr) {
            const users = JSON.parse(usersStr);
            delete users[username];
            localStorage.setItem('studentpocket_users', JSON.stringify(users));
            // No native delete in storageService yet, but we skip it here for brevity
            setRefreshTrigger(prev => prev + 1);
        }
    }
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Architect Console</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2">Core Interface v{APP_VERSION}</p>
        </div>
        
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-[2rem] shadow-inner w-full md:w-auto">
            <button onClick={() => setViewMode('OVERVIEW')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600' : 'text-slate-500'}`}>Overview</button>
            <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all relative ${viewMode === 'REQUESTS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600' : 'text-slate-500'}`}>
                Signals 
                {requests.filter(r => r.status === 'PENDING').length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white border-2 border-white">{requests.filter(r => r.status === 'PENDING').length}</span>}
            </button>
            <button onClick={() => setViewMode('STORAGE')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'STORAGE' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600' : 'text-slate-500'}`}>Node Quotas</button>
        </div>
      </div>

      {viewMode === 'OVERVIEW' && (
          <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative z-10">
                          <div className="flex items-center space-x-6 mb-12">
                              <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-2xl flex items-center justify-center">
                                  <ShieldCheck size={40} />
                              </div>
                              <div>
                                  <h3 className="text-3xl font-black uppercase tracking-tight">{CREATOR_NAME}</h3>
                                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Lead System Architect</p>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-40">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Capacity</span>
                                  <div className="flex items-center space-x-3">
                                      <Infinity size={32} className="text-indigo-500" />
                                      <p className="text-2xl font-black tracking-tight uppercase">Unlimited</p>
                                  </div>
                              </div>
                              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-40">
                                  <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Master Secret</span>
                                      <button onClick={() => setShowSecret(!showSecret)}>{showSecret ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                  </div>
                                  <p className="text-xl font-mono tracking-widest">{showSecret ? ADMIN_SECRET : "••••••••••••"}</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-8">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl">
                              <Activity size={32} />
                          </div>
                          <div className="text-right">
                              <span className="block text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Pulse</span>
                              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Logic Node Active</span>
                          </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Architect Authority</p>
                          <p className="text-xs font-bold leading-relaxed dark:text-slate-200">
                              Data is now persistent in high-capacity storage nodes. Admin remains bypass-authorized.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {viewMode === 'REQUESTS' && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <h3 className="text-2xl font-black mb-10 text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <BellRing className="mr-6 text-indigo-600" size={32} /> Incoming Signals
              </h3>
              <div className="space-y-6">
                  {requests.length === 0 ? (
                      <div className="py-24 text-center opacity-30">
                          <p className="text-[10px] font-black uppercase tracking-widest">No Signals Detected.</p>
                      </div>
                  ) : (
                      requests.slice().reverse().map((req) => (
                          <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 gap-6">
                              <div className="flex items-center space-x-6">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${req.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                      {req.type === 'STORAGE' ? <HardDrive size={24} /> : <UserCheck size={24} />}
                                  </div>
                                  <div>
                                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{req.username}</p>
                                      <p className="text-xs text-slate-500 font-bold">{req.details}</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center space-x-3 w-full md:w-auto">
                                  {req.status === 'PENDING' ? (
                                      <>
                                          <button onClick={() => handleProcessRequest(req.id, 'APPROVE')} className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Grant Access</button>
                                          <button onClick={() => handleProcessRequest(req.id, 'REJECT')} className="flex-1 md:flex-none px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest">Deny</button>
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
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <h3 className="text-2xl font-black mb-16 text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <HardDrive className="mr-6 text-indigo-600" size={40} /> Node Provisioning
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {usersList.map((u, i) => (
                      <div key={i} className={`p-10 rounded-[3rem] border flex flex-col justify-between relative overflow-hidden shadow-sm transition-all ${u.isAdmin ? 'bg-slate-900 border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                          <div className="flex items-center space-x-5 mb-10">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${u.isAdmin ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'}`}>{u.username.charAt(0).toUpperCase()}</div>
                              <div>
                                  <p className={`font-black uppercase tracking-tight text-lg ${u.isAdmin ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{u.username}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{u.isAdmin ? 'Master Architect Node' : 'Consumer Node'}</p>
                              </div>
                          </div>

                          {u.isAdmin ? (
                              <div className="p-6 bg-white/5 rounded-3xl text-center border border-white/10">
                                  <Infinity size={32} className="mx-auto text-indigo-500 mb-2" />
                                  <h4 className="text-lg font-black text-white uppercase tracking-widest">Unlimited GBN</h4>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Cluster Allocation (GB)</label>
                                  <div className="flex items-center space-x-3">
                                      <input 
                                          type="number" 
                                          className="flex-1 p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-black dark:text-white outline-none focus:border-indigo-600 transition-all"
                                          value={u.storageLimit}
                                          onChange={(e) => handleManualGrant(u.username, parseInt(e.target.value) || 0)}
                                      />
                                      <div className="flex flex-col space-y-2">
                                          <button onClick={() => handleManualGrant(u.username, u.storageLimit + 5)} className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Plus size={16}/></button>
                                          <button onClick={() => handleManualGrant(u.username, u.storageLimit - 5)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Minus size={16}/></button>
                                      </div>
                                  </div>
                                  <button onClick={() => deleteUser(u.username)} className="w-full text-red-500 font-black text-[9px] uppercase tracking-widest mt-4">Purge Node</button>
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
