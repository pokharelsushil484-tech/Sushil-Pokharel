
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Moon, LogOut, Sun, ShieldCheck, RefreshCw, ShieldAlert, Copy, Check, ShieldX, Key, Eye, EyeOff } from 'lucide-react';
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
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');

  const generateBackupCodes = () => {
    // Generate 10 random codes
    const codes = Array.from({ length: 10 }).map(() => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
    updateUser({ ...user, backupCodes: codes });
  };

  const toggle2FA = () => {
    const newState = !user.twoFactorEnabled;
    if (newState && user.backupCodes.length === 0) {
      generateBackupCodes();
    }
    updateUser({ ...user, twoFactorEnabled: newState });
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(user.backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    const usersStr = localStorage.getItem('studentpocket_users');
    if (!usersStr) return;
    const users = JSON.parse(usersStr);
    const userData = users[username];

    if (userData.password !== passwordForm.old) {
      setPassError("Incorrect current password.");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPassError("New passwords do not match.");
      return;
    }
    
    users[username].password = passwordForm.new;
    localStorage.setItem('studentpocket_users', JSON.stringify(users));
    alert("✅ Security credentials updated.");
    setPasswordForm({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-10">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Hub Configuration</h1>
      
      {/* Identity Profile */}
      <div className={`rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden bg-indigo-600`}>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-8 gap-6 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/30 shadow-2xl">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-4xl font-black uppercase">{user.name.charAt(0)}</span>}
            </div>
            <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                    <h2 className="text-3xl font-black uppercase tracking-tight">{user.name}</h2>
                    <ShieldCheck size={24} className="ml-3 text-indigo-200" />
                </div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{user.profession || 'System Architect'}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Security Module */}
          <div className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <ShieldAlert className="mr-4 text-indigo-600" size={28} /> Security Guard
              </h3>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Two-Factor Auth</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Requires backup code at login</p>
                  </div>
                  <button 
                    onClick={toggle2FA} 
                    className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${user.twoFactorEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                  >
                      <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                  </button>
              </div>

              {user.twoFactorEnabled && (
                  <div className="space-y-4 animate-scale-up">
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                          <div className="flex justify-between items-center mb-4">
                              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-[0.2em]">Safety Backup Cluster</p>
                              <button onClick={generateBackupCodes} className="text-indigo-600 hover:text-indigo-700"><RefreshCw size={14} /></button>
                          </div>
                          {showBackupCodes ? (
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                  {user.backupCodes.map((code, i) => <code key={i} className="bg-white dark:bg-slate-800 p-2 rounded-lg text-[10px] font-black text-center border border-slate-100 dark:border-slate-700">{code}</code>)}
                              </div>
                          ) : (
                              <button onClick={() => setShowBackupCodes(true)} className="w-full py-3 bg-white dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">Reveal Recovery Keys</button>
                          )}
                          {showBackupCodes && (
                              <button onClick={copyCodes} className="w-full flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">
                                  {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                                  {copied ? "Copied" : "Copy Cluster"}
                              </button>
                          )}
                      </div>
                  </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Security Key</p>
                  <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="Old Password" />
                  <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="New Password" />
                  <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="Confirm New" />
                  {passError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{passError}</p>}
                  <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Commit Changes</button>
              </form>
          </div>

          {/* Preferences */}
          <div className="space-y-6">
              <div onClick={toggleDarkMode} className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-5">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                          {darkMode ? <Sun size={24} className="text-amber-500" /> : <Moon size={24} className="text-indigo-600" />}
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{darkMode ? 'Daylight' : 'Nightfall'}</span>
                  </div>
                  <div className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                      <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                  </div>
              </div>

              <div onClick={onLogout} className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-5 cursor-pointer group">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                      <LogOut size={24} />
                  </div>
                  <span className="text-sm font-black text-red-600 uppercase tracking-widest">Logout Node</span>
              </div>

              <div onClick={() => { if(window.confirm('Wipe all local data clusters permanently?')) resetApp(); }} className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border-2 border-dashed border-red-200 hover:border-red-600 transition-all cursor-pointer flex items-center space-x-5">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600"><ShieldX size={24} /></div>
                  <div>
                    <span className="text-sm font-black text-red-600 uppercase tracking-widest block">System Reset</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">De-initialize infrastructure</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="text-center pb-12 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.8em]">{WATERMARK}</p>
      </div>
    </div>
  );
};
