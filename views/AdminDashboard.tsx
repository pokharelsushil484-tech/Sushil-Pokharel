
import React, { useState, useEffect } from 'react';
import { ChangeRequest, Post, UserProfile } from '../types';
import { Trash2, BadgeCheck, Search, Megaphone, X, Send, Check, Monitor, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { ADMIN_USERNAME, APP_NAME } from '../constants';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'VERIFICATIONS'>('DASHBOARD');
  
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const usersObj = JSON.parse(usersStr);
      const list = Object.entries(usersObj).map(([key, value]: [string, any]) => ({
        username: key,
        verified: value.verified,
        email: value.email
      }));
      setUsersList(list);
    }
    
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));
  }, [refreshTrigger]);

  const handleVerification = (req: ChangeRequest, approved: boolean) => {
      if (approved) {
          const usersStr = localStorage.getItem('studentpocket_users');
          if (usersStr) {
              const users = JSON.parse(usersStr);
              if (users[req.username]) {
                  users[req.username].verified = true;
                  localStorage.setItem('studentpocket_users', JSON.stringify(users));
              }
          }
          
          // Update profession in profile
          const dataKey = `studentpocket_data_${req.username}`;
          const stored = localStorage.getItem(dataKey);
          if (stored) {
              const data = JSON.parse(stored);
              data.user.profession = req.payload.profession;
              localStorage.setItem(dataKey, JSON.stringify(data));
          }
      }

      const updatedRequests = requests.map(r => r.id === req.id ? { ...r, status: approved ? 'APPROVED' as const : 'REJECTED' as const } : r);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      setRefreshTrigger(prev => prev + 1);
      alert(approved ? "Identity Verified Successfully" : "Verification Rejected");
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="pb-24 animate-fade-in perspective-3d">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10 depth-text tracking-tight">Authority Console</h1>

      <div className="flex bg-slate-200 dark:bg-slate-800 p-2 rounded-[2.5rem] mb-12 max-w-md shadow-inner">
          <button onClick={() => setViewMode('DASHBOARD')} className={`flex-1 py-4 text-sm font-bold rounded-3xl transition-all ${viewMode === 'DASHBOARD' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white translate-z-10' : 'text-slate-500'}`}>Core View</button>
          <button onClick={() => setViewMode('VERIFICATIONS')} className={`flex-1 py-4 text-sm font-bold rounded-3xl transition-all relative ${viewMode === 'VERIFICATIONS' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-white translate-z-10' : 'text-slate-500'}`}>
            Identity Queue {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 animate-pulse">{pendingRequests.length}</span>}
          </button>
      </div>

      {viewMode === 'DASHBOARD' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 card-3d">
                <h3 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Active Identity Records</h3>
                <div className="space-y-4">
                    {usersList.map((u, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold ${u.verified ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{u.username}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.email}</p>
                                </div>
                            </div>
                            {u.verified ? <BadgeCheck className="text-indigo-600" size={24} /> : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unverified</span>}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-8">
                <div onClick={() => setShowPostForm(true)} className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl text-white cursor-pointer hover:scale-[1.02] transition-all card-3d flex flex-col items-center justify-center group h-64">
                    <Megaphone size={48} className="mb-4 group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-[0.2em]">Broadcast Global</span>
                </div>
                <div onClick={resetApp} className="bg-red-500 p-10 rounded-[3rem] shadow-2xl text-white cursor-pointer hover:scale-[1.02] transition-all card-3d flex flex-col items-center justify-center group h-64">
                    <Trash2 size={48} className="mb-4 group-hover:animate-pulse" />
                    <span className="font-bold text-sm uppercase tracking-[0.2em]">Master Reset</span>
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
                              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                                  <div className="flex items-center space-x-8">
                                      <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center font-bold text-4xl shadow-2xl">{req.username.charAt(0).toUpperCase()}</div>
                                      <div>
                                          <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{req.username}</h4>
                                          <div className="flex items-center space-x-3 mt-3">
                                              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Identity Claim</span>
                                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{new Date(req.timestamp).toLocaleDateString()}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex-1 max-w-md bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Claimed Identity</p>
                                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-tight">{req.payload.profession}</p>
                                  </div>
                                  <div className="flex flex-col space-y-3 min-w-[200px]">
                                      <button onClick={() => handleVerification(req, true)} className="w-full bg-indigo-600 text-white px-8 py-5 rounded-3xl font-bold shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center">
                                          <Check size={20} className="mr-3" /> Verify User
                                      </button>
                                      <button onClick={() => handleVerification(req, false)} className="w-full text-red-500 font-bold py-3 hover:bg-red-50 rounded-2xl transition-all">Deny Access</button>
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
