
import React, { useState, useEffect } from 'react';
import { ChangeRequest, UserProfile } from '../types';
import { Trash2, BadgeCheck, Megaphone, Check, ShieldCheck, Sparkles, UserCheck, ShieldAlert, ShieldX, UserMinus } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'VERIFICATIONS'>('DASHBOARD');
  
  useEffect(() => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const usersObj = JSON.parse(usersStr);
      const list = Object.entries(usersObj).map(([key, value]: [string, any]) => ({
        username: key,
        verified: value.verified,
        email: value.email
      }));
      setUsersList(list.filter(u => u.username !== ADMIN_USERNAME));
    }
    
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));
  }, [refreshTrigger]);

  const toggleUserVerification = (username: string, currentStatus: boolean) => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
        const users = JSON.parse(usersStr);
        if (users[username]) {
            users[username].verified = !currentStatus;
            localStorage.setItem('studentpocket_users', JSON.stringify(users));
            
            // Sync with profile isPro
            const dataKey = `studentpocket_data_${username}`;
            const stored = localStorage.getItem(dataKey);
            if (stored) {
                const data = JSON.parse(stored);
                data.user.isPro = !currentStatus;
                data.user.verificationStatus = !currentStatus ? 'VERIFIED' : 'NONE';
                localStorage.setItem(dataKey, JSON.stringify(data));
            }
            
            setRefreshTrigger(prev => prev + 1);
            alert(`User ${username} ${!currentStatus ? 'Verified (Pro)' : 'Unverified (Limited)'}`);
        }
    }
  };

  const handleVerificationRequest = (req: ChangeRequest, approved: boolean) => {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
          const users = JSON.parse(usersStr);
          if (users[req.username]) {
              users[req.username].verified = approved;
              localStorage.setItem('studentpocket_users', JSON.stringify(users));
              
              // Update profile
              const dataKey = `studentpocket_data_${req.username}`;
              const stored = localStorage.getItem(dataKey);
              if (stored) {
                  const data = JSON.parse(stored);
                  data.user.profession = req.payload.profession;
                  data.user.isPro = approved;
                  data.user.verificationStatus = approved ? 'VERIFIED' : 'REJECTED';
                  localStorage.setItem(dataKey, JSON.stringify(data));
              }
          }
      }

      const updatedRequests = requests.map(r => r.id === req.id ? { ...r, status: approved ? 'APPROVED' as const : 'REJECTED' as const } : r);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      setRefreshTrigger(prev => prev + 1);
  };

  const deleteUser = (username: string) => {
    if (window.confirm(`Permanently delete account: ${username}?`)) {
        const usersStr = localStorage.getItem('studentpocket_users');
        if (usersStr) {
            const users = JSON.parse(usersStr);
            delete users[username];
            localStorage.setItem('studentpocket_users', JSON.stringify(users));
            localStorage.removeItem(`studentpocket_data_${username}`);
            setRefreshTrigger(prev => prev + 1);
        }
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="pb-24 animate-fade-in perspective-3d">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10 depth-text tracking-tight">Authority Console</h1>

      <div className="flex bg-slate-200 dark:bg-slate-800 p-2 rounded-[2.5rem] mb-12 max-w-md shadow-inner">
          <button onClick={() => setViewMode('DASHBOARD')} className={`flex-1 py-4 text-sm font-bold rounded-3xl transition-all ${viewMode === 'DASHBOARD' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>User Management</button>
          <button onClick={() => setViewMode('VERIFICATIONS')} className={`flex-1 py-4 text-sm font-bold rounded-3xl transition-all relative ${viewMode === 'VERIFICATIONS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white' : 'text-slate-500'}`}>
            Requests {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 animate-pulse">{pendingRequests.length}</span>}
          </button>
      </div>

      {viewMode === 'DASHBOARD' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 card-3d">
                <h3 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Active Users</h3>
                <div className="space-y-4">
                    {usersList.length === 0 && <p className="text-center py-10 text-slate-400">No registered users.</p>}
                    {usersList.map((u, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 gap-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${u.verified ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center">
                                      <p className="font-bold text-slate-900 dark:text-white">{u.username}</p>
                                      {u.verified ? <BadgeCheck className="text-blue-500 ml-1.5" size={16} /> : <ShieldAlert className="text-amber-500 ml-1.5" size={16} />}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => toggleUserVerification(u.username, u.verified)}
                                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${u.verified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                >
                                    {u.verified ? 'Unverify' : 'Verify'}
                                </button>
                                <button onClick={() => deleteUser(u.username)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                    <UserMinus size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl text-white card-3d flex flex-col items-center justify-center group h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Megaphone size={48} className="mb-4 group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-[0.2em]">Global Pulse</span>
                    <p className="text-[10px] text-indigo-200 font-bold uppercase mt-4 tracking-widest">{usersList.length} Active Nodes</p>
                </div>
                <div onClick={resetApp} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] shadow-xl text-red-500 cursor-pointer hover:bg-red-50 transition-all card-3d flex flex-col items-center justify-center h-64">
                    <Trash2 size={48} className="mb-4" />
                    <span className="font-bold text-sm uppercase tracking-[0.2em]">Wipe Records</span>
                </div>
            </div>
        </div>
      ) : (
          <div className="space-y-8 animate-fade-in">
              {pendingRequests.length === 0 ? (
                  <div className="text-center py-32 bg-slate-50 dark:bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <Sparkles size={64} className="mx-auto text-slate-200 mb-6" />
                      <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Queue is Clear</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-6">
                      {pendingRequests.map(req => (
                          <div key={req.id} className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 card-3d relative overflow-hidden">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                                  <div className="flex items-center space-x-8">
                                      <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center font-bold text-4xl shadow-2xl">{req.username.charAt(0).toUpperCase()}</div>
                                      <div>
                                          <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{req.username}</h4>
                                          <div className="flex items-center space-x-3 mt-3">
                                              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Identity Claim</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex-1 max-w-md bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Claimed Professional Title</p>
                                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-tight">{req.payload.profession}</p>
                                  </div>
                                  <div className="flex flex-col space-y-3 min-w-[200px]">
                                      <button onClick={() => handleVerificationRequest(req, true)} className="w-full bg-indigo-600 text-white px-8 py-5 rounded-3xl font-bold shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center">
                                          <Check size={20} className="mr-3" /> Grant Pro
                                      </button>
                                      <button onClick={() => handleVerificationRequest(req, false)} className="w-full text-red-500 font-bold py-3 hover:bg-red-50 rounded-2xl transition-all">Reject Request</button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
