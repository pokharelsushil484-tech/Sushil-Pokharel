
import React, { useState, useEffect } from 'react';
import { ChangeRequest, UserProfile } from '../types';
import { 
  Trash2, ShieldCheck, UserCheck, ShieldAlert, HardDrive, Plus, 
  Minus, Activity, Key, Eye, EyeOff, BellRing, Infinity, Check, ShieldX, UserMinus, UserPlus
} from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME, APP_VERSION } from '../constants';
import { storageService } from '../services/storageService';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'REQUESTS' | 'STORAGE' | 'SUSPENSIONS'>('OVERVIEW');
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
          let isBanned = false;
          let isUnlimited = false;

          if (storedData) {
              storageLimit = storedData.user?.storageLimitGB || 15;
              storageUsed = storedData.user?.storageUsedBytes || 0;
              isBanned = !!storedData.user?.isBanned;
              isUnlimited = storageLimit >= 99999;
          }
          return {
              username: key,
              verified: value.verified,
              email: value.email,
              storageLimit,
              storageUsed,
              isBanned,
              isUnlimited,
              isAdmin: key === ADMIN_USERNAME
          };
        }));
        setUsersList(list);
      }
      
      const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
      setRequests(JSON.parse(reqStr));
    };
    fetchUsers();
  }, [refreshTrigger, viewMode]);

  const handleManualGrant = async (username: string, amount: number) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored) {
        stored.user.storageLimitGB = Math.max(1, amount);
        await storageService.setData(dataKey, stored);
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const toggleUserBan = async (username: string, status: boolean) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored) {
        stored.user.isBanned = status;
        stored.user.banReason = status ? "ADMIN_ACTION: Manual node suspension by architect." : "";
        await storageService.setData(dataKey, stored);
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const toggleUnlimited = async (username: string, status: boolean) => {
    await handleManualGrant(username, status ? 999999 : 15);
  };

  const handleProcessRequest = async (reqId: string, action: 'APPROVE' | 'REJECT') => {
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;
    
    const request = requests[reqIndex];
    if (action === 'APPROVE') {
        let requestedGb = request.amountRequested;
        if (!requestedGb) {
          const gbMatch = request.details.match(/(\d+)GB/);
          requestedGb = gbMatch ? parseInt(gbMatch[1]) : 30;
        }
        await handleManualGrant(request.username, requestedGb);
    }
    
    const updatedRequests = requests.map(r => 
        r.id === reqId ? { 
            ...r, 
            status: action === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const,
            processedAt: Date.now(),
            acknowledged: false 
        } : r
    );
    
    localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Architect Console</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2">Core Hub Interface</p>
        </div>
        
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-[2rem] w-full md:w-auto">
            <button onClick={() => setViewMode('OVERVIEW')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600' : 'text-slate-500'}`}>Overview</button>
            <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all relative ${viewMode === 'REQUESTS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600' : 'text-slate-500'}`}>
                Signals 
                {requests.filter(r => r.status === 'PENDING').length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white border-2 border-white">{requests.filter(r => r.status === 'PENDING').length}</span>}
            </button>
            <button onClick={() => setViewMode('STORAGE')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'STORAGE' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600' : 'text-slate-500'}`}>Nodes</button>
            <button onClick={() => setViewMode('SUSPENSIONS')} className={`flex-1 md:flex-none py-3 px-6 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${viewMode === 'SUSPENSIONS' ? 'bg-white dark:bg-slate-700 shadow-xl text-red-600' : 'text-slate-500'}`}>Sentries</button>
        </div>
      </div>

      {viewMode === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative border border-indigo-500/30">
                  <div className="flex items-center space-x-6 mb-12">
                      <ShieldCheck size={40} className="text-indigo-500" />
                      <div>
                          <h3 className="text-3xl font-black uppercase tracking-tight">{CREATOR_NAME}</h3>
                          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Lead System Architect</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Handshake</span>
                          <div className="flex items-center space-x-3 mt-4">
                              <Infinity size={32} className="text-indigo-500" />
                              <p className="text-2xl font-black uppercase">Admin Bypass</p>
                          </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Status</span>
                          <div className="flex items-center space-x-3 mt-4">
                              <Activity size={32} className="text-emerald-500" />
                              <p className="text-2xl font-black uppercase">Functional</p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                      <BellRing size={32} className="text-indigo-600" />
                      <div className="text-right">
                          <span className="block text-2xl font-black uppercase tracking-tighter">Sentinel</span>
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Active Enforcement</span>
                      </div>
                  </div>
                  <p className="text-xs font-bold leading-relaxed dark:text-slate-300">Automatic detection of bad activity (unauthorized architectural access) is enabled.</p>
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
                      <div className="py-24 text-center opacity-30 font-black uppercase tracking-widest text-xs">No signals logged.</div>
                  ) : (
                      requests.slice().reverse().map((req) => (
                          <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 gap-6">
                              <div className="flex items-center space-x-6">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${req.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                      <HardDrive size={24} />
                                  </div>
                                  <div>
                                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{req.username}</p>
                                      <p className="text-xs text-slate-500 font-bold">{req.details}</p>
                                  </div>
                              </div>
                              <div className="flex items-center space-x-3 w-full md:w-auto">
                                  {req.status === 'PENDING' ? (
                                      <>
                                          <button onClick={() => handleProcessRequest(req.id, 'APPROVE')} className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center"><Check size={14} className="mr-2"/> Grant</button>
                                          <button onClick={() => handleProcessRequest(req.id, 'REJECT')} className="flex-1 md:flex-none px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest">Deny</button>
                                      </>
                                  ) : (
                                      <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{req.status}</span>
                                  )}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {viewMode === 'STORAGE' && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 animate-fade-in">
              <h3 className="text-2xl font-black mb-16 uppercase tracking-tight flex items-center"><HardDrive className="mr-6 text-indigo-600" size={40} /> Capacity Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {usersList.map((u, i) => (
                      <div key={i} className={`p-10 rounded-[3rem] border flex flex-col justify-between relative overflow-hidden transition-all ${u.isAdmin ? 'bg-slate-900 border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                          <div className="flex items-center space-x-5 mb-10">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-indigo-600 text-white">{u.username.charAt(0)}</div>
                              <div>
                                  <p className="font-black text-lg dark:text-white uppercase">{u.username}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Node Provisioning</p>
                              </div>
                          </div>
                          {!u.isAdmin && (
                              <div className="space-y-6">
                                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bypass Quota</span>
                                      <button onClick={() => toggleUnlimited(u.username, !u.isUnlimited)} className={`w-12 h-6 rounded-full p-1 flex items-center transition-all ${u.isUnlimited ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></button>
                                  </div>
                                  <div>
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Allocation (GB)</label>
                                      <input type="number" value={u.isUnlimited ? 999 : u.storageLimit} disabled={u.isUnlimited} onChange={(e) => handleManualGrant(u.username, parseInt(e.target.value) || 0)} className="w-full mt-2 p-5 bg-white dark:bg-slate-900 rounded-2xl font-black text-lg outline-none border border-slate-100 dark:border-slate-800" />
                                  </div>
                              </div>
                          )}
                          {u.isAdmin && <div className="p-8 bg-indigo-600/10 rounded-3xl text-center"><Infinity size={32} className="mx-auto text-indigo-500 mb-2" /><p className="text-sm font-black text-white uppercase tracking-widest">Unlimited</p></div>}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {viewMode === 'SUSPENSIONS' && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-red-500/10 animate-fade-in">
              <h3 className="text-2xl font-black mb-16 text-red-600 uppercase tracking-tight flex items-center"><ShieldX className="mr-6" size={40} /> Node Suspensions</h3>
              <div className="space-y-6">
                  {usersList.filter(u => !u.isAdmin).map((u, i) => (
                      <div key={i} className="flex flex-col md:flex-row items-center justify-between p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center space-x-6">
                              <div className={`p-4 rounded-2xl ${u.isBanned ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                  {u.isBanned ? <ShieldX size={24} /> : <ShieldCheck size={24} />}
                              </div>
                              <div>
                                  <p className="font-black text-lg dark:text-white uppercase">{u.username}</p>
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${u.isBanned ? 'text-red-500' : 'text-emerald-500'}`}>{u.isBanned ? 'Node Suspended' : 'Operational'}</p>
                              </div>
                          </div>
                          <button onClick={() => toggleUserBan(u.username, !u.isBanned)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${u.isBanned ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                              {u.isBanned ? <span className="flex items-center"><UserPlus size={14} className="mr-2" /> Re-Authorize</span> : <span className="flex items-center"><UserMinus size={14} className="mr-2" /> Suspend Node</span>}
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
