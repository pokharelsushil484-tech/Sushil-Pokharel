
import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { Moon, Bell, LogOut, Trash2, Sun, Camera, CheckCircle2, Shield, UserCheck, Sparkles, X, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
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
  const [isRequesting, setIsRequesting] = useState(false);
  const [profession, setProfession] = useState(user.profession || '');

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

  const submitVerification = () => {
    if (!profession.trim()) return;
    
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
    
    alert("Verification request sent to Sushil. Dashboards will unlock once approved.");
    setIsRequesting(false);
  };

  return (
    <div className="pb-20 animate-fade-in perspective-3d">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10 depth-text tracking-tight">Configuration</h1>
      
      {/* 3D Profile Card */}
      <div className="bg-indigo-600 dark:bg-indigo-800 rounded-[3rem] p-10 text-white mb-10 shadow-2xl relative overflow-hidden card-3d">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="flex items-center space-x-8 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/30 shadow-2xl">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-4xl font-bold">{user.name.charAt(0)}</span>}
            </div>
            <div className="flex-1">
                <div className="flex items-center">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    {isVerified && <ShieldCheck size={20} className="ml-3 text-blue-300 fill-blue-500" />}
                </div>
                <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mt-1 opacity-80">{user.profession || 'Identity Pending'}</p>
                <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isVerified ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    <Shield size={12} className="mr-2"/> {isVerified ? 'Verified Core User' : 'Limited Guest Access'}
                </div>
            </div>
        </div>
      </div>

      {/* Verification Action */}
      {!isVerified && (
          <div className="mb-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-xl card-3d">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <UserCheck size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Request Verification</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Submit your professional title to unlock all 3D dashboards.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your Profession (e.g. Student, Manager...)" 
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl transition-all dark:text-white font-bold"
                  />
                  <button 
                    onClick={submitVerification}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center group"
                  >
                      Apply for Access <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
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
                  <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-widest">{darkMode ? 'Brighter UI' : 'Dark Dimension'}</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-all ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
          </div>

          <div onClick={onLogout} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer card-3d flex items-center space-x-4 group">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                  <LogOut size={20} />
              </div>
              <span className="font-bold text-red-600 uppercase text-xs tracking-widest">Terminate Session</span>
          </div>

          <div onClick={() => { if(window.confirm('Wipe all local data?')) resetApp(); }} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer card-3d flex items-center space-x-4 group col-span-full">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                  <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <span className="font-bold text-red-600 uppercase text-xs tracking-widest block">Core Master Reset</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Permanently delete all local identity and records</span>
              </div>
          </div>
      </div>

      <div className="text-center pb-12 opacity-30">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">{WATERMARK}</p>
      </div>
    </div>
  );
};
