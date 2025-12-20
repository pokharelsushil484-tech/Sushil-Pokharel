
import React, { useState } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Moon, LogOut, Trash2, Sun, Shield, UserCheck, ShieldCheck, ArrowRight, Clock, ShieldX } from 'lucide-react';
import { WATERMARK } from '../constants';

interface SettingsProps {
  user: UserProfile;
  resetApp: () => void;
  onLogout: () => void;
  username: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  updateUser: (u: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, resetApp, onLogout, username, darkMode, toggleDarkMode, updateUser }) => {
  const [profession, setProfession] = useState(user.profession || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVerified = (() => {
      try {
          const usersStr = localStorage.getItem('studentpocket_users');
          if (usersStr) {
              const users = JSON.parse(usersStr);
              return users[username]?.verified === true;
          }
      } catch(e) { return false; }
      return false;
  })();

  const pendingRequest = (() => {
    try {
        const requestsStr = localStorage.getItem('studentpocket_requests') || '[]';
        const requests = JSON.parse(requestsStr);
        return requests.find((r: any) => r.username === username && r.type === 'VERIFICATION_REQUEST' && r.status === 'PENDING');
    } catch(e) { return null; }
  })();

  const submitVerification = () => {
    if (!profession.trim()) return;
    setIsSubmitting(true);
    
    const request: ChangeRequest = {
        id: Date.now().toString(),
        username: username,
        type: 'VERIFICATION_REQUEST',
        payload: { profession },
        status: 'PENDING',
        timestamp: new Date().toISOString()
    };

    const requestsStr = localStorage.getItem('studentpocket_requests') || '[]';
    const requests = JSON.parse(requestsStr);
    requests.push(request);
    localStorage.setItem('studentpocket_requests', JSON.stringify(requests));
    
    // Sync UI local status
    const dataKey = `studentpocket_data_${username}`;
    const stored = localStorage.getItem(dataKey);
    if (stored) {
        const data = JSON.parse(stored);
        data.user.verificationStatus = 'PENDING';
        localStorage.setItem(dataKey, JSON.stringify(data));
    }

    setTimeout(() => {
        setIsSubmitting(false);
        alert("Verification request sent to Sushil. Pro features will unlock upon approval.");
    }, 1000);
  };

  return (
    <div className="pb-20 animate-fade-in perspective-3d">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10 depth-text tracking-tight">App Configuration</h1>
      
      {/* 3D Profile Card */}
      <div className={`rounded-[3rem] p-10 text-white mb-10 shadow-2xl relative overflow-hidden card-3d ${isVerified ? 'bg-indigo-600' : 'bg-slate-800'}`}>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-8 gap-6 relative z-10 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/30 shadow-2xl">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-4xl font-bold">{user.name.charAt(0)}</span>}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-center sm:justify-start">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    {isVerified && <ShieldCheck size={20} className="ml-3 text-blue-300 fill-blue-500" />}
                </div>
                <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mt-1 opacity-80">{user.profession || 'Identity Unverified'}</p>
                <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isVerified ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {isVerified ? <ShieldCheck size={12} className="mr-2"/> : <Shield size={12} className="mr-2"/>}
                    {isVerified ? 'Verified Pro User' : 'Limited Guest User'}
                </div>
            </div>
        </div>
      </div>

      {/* Verification Status Module */}
      {!isVerified && (
          <div className="mb-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-xl card-3d">
              {pendingRequest ? (
                  <div className="flex flex-col items-center text-center py-4">
                      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500 mb-6 animate-pulse">
                          <Clock size={40} />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Verification Pending</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">Sushil is reviewing your identity claim. Dashboards will unlock automatically once approved.</p>
                      <div className="mt-8 px-6 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                        Node: {pendingRequest.payload.profession}
                      </div>
                  </div>
              ) : (
                  <>
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Professional Verification</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Unlock AI Engine, Secure Vault, and Financial Wallet.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Your Profession / Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Mechanical Student, Senior Analyst..." 
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl transition-all dark:text-white font-bold"
                          />
                        </div>
                        <button 
                          onClick={submitVerification}
                          disabled={isSubmitting || !profession.trim()}
                          className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center group disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Apply for Pro Access'} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                  </>
              )}
          </div>
      )}

      {/* Verified Confirmation */}
      {isVerified && (
        <div className="mb-10 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-8 rounded-[3rem] shadow-xl flex items-center space-x-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-300 shadow-inner">
                <ShieldCheck size={32} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-green-900 dark:text-green-200 uppercase tracking-tight">Verified Pro System</h3>
                <p className="text-green-700/70 dark:text-green-400/70 text-sm">All 3D AI Engines and Secure Vaults are fully unlocked.</p>
            </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div onClick={toggleDarkMode} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer card-3d flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                      {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-600" />}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-[0.2em]">{darkMode ? 'Luminous' : 'Deep Space'}</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-all ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
          </div>

          <div onClick={onLogout} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer card-3d flex items-center space-x-4 group">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                  <LogOut size={20} />
              </div>
              <span className="font-bold text-red-600 uppercase text-[10px] tracking-[0.2em]">Exit Environment</span>
          </div>

          <div onClick={() => { if(window.confirm('Wipe all local data?')) resetApp(); }} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer card-3d flex items-center space-x-4 group col-span-full">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                  <ShieldX size={20} />
              </div>
              <div className="flex-1">
                <span className="font-bold text-red-600 uppercase text-[10px] tracking-[0.2em] block">Factory Master Reset</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Permanently purge all identity and cloud local storage</span>
              </div>
          </div>
      </div>

      <div className="text-center pb-12 opacity-30">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">{WATERMARK}</p>
      </div>
    </div>
  );
};
