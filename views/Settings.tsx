
import React, { useState } from 'react';
import { UserProfile } from '../types';
// Fix: Added missing CheckCircle import from lucide-react
import { Moon, LogOut, Sun, ShieldCheck, RefreshCw, ShieldAlert, Copy, Check, ShieldX, Key, Monitor, Smartphone, Plus, Mail, Database, Zap, CheckCircle } from 'lucide-react';
import { WATERMARK, DEFAULT_STORAGE_LIMIT_GB } from '../constants';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');

  const generateBackupCodes = () => {
    // Generate 12 high-security cluster keys
    const codes = Array.from({ length: 12 }).map(() => 
      Math.random().toString(36).substring(2, 11).toUpperCase()
    );
    updateUser({ ...user, backupCodes: codes });
  };

  const toggle2FA = () => {
    setIsSyncing(true);
    setTimeout(() => {
        const newState = !user.twoFactorEnabled;
        if (newState && user.backupCodes.length === 0) {
            generateBackupCodes();
        }
        updateUser({ ...user, twoFactorEnabled: newState });
        setIsSyncing(false);
    }, 800);
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
      setPassError("Invalid primary security key.");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPassError("Confirmation keys do not match.");
      return;
    }
    
    users[username].password = passwordForm.new;
    localStorage.setItem('studentpocket_users', JSON.stringify(users));
    alert("✅ Quantum security key re-calculated.");
    setPasswordForm({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-10">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Infrastructure Panel</h1>
      
      {/* Node Profile */}
      <div className={`rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden bg-indigo-600`}>
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-8 gap-6 relative z-10">
            <div className="w-28 h-28 rounded-[2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/30 shadow-2xl">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-4xl font-black uppercase">{user.name.charAt(0)}</span>}
            </div>
            <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                    <h2 className="text-3xl font-black uppercase tracking-tight">{user.name}</h2>
                    <ShieldCheck size={24} className="ml-3 text-indigo-200" />
                </div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{user.profession || 'Lead Architect'}</p>
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20 flex items-center">
                        <Database size={12} className="mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{DEFAULT_STORAGE_LIMIT_GB}GB Node</span>
                    </div>
                    <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20 flex items-center">
                        <Zap size={12} className="mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Quantum Secured</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Security Protocols */}
          <div className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <ShieldAlert className="mr-4 text-indigo-600" size={28} /> Security Guard
              </h3>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center">
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl mr-4"><Mail size={20} /></div>
                      <div>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Gmail 2FA Integration</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Require OTP for all handshakes</p>
                      </div>
                  </div>
                  <button 
                    onClick={toggle2FA} 
                    disabled={isSyncing}
                    className={`w-14 h-8 rounded-full p-1 transition-all flex items-center relative ${user.twoFactorEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                  >
                      {isSyncing ? <RefreshCw size={14} className="mx-auto text-white animate-spin" /> : <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>}
                  </button>
              </div>

              {user.twoFactorEnabled && (
                  <div className="space-y-4 animate-scale-up">
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                          <div className="flex justify-between items-center mb-4">
                              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-[0.2em]">Safety Cluster (12 Active Keys)</p>
                              <button onClick={generateBackupCodes} className="text-indigo-600 hover:text-indigo-700"><RefreshCw size={14} /></button>
                          </div>
                          {showBackupCodes ? (
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                  {user.backupCodes.map((code, i) => <code key={i} className="bg-white dark:bg-slate-800 p-2 rounded-lg text-[9px] font-black text-center border border-slate-100 dark:border-slate-700 font-mono tracking-widest">{code}</code>)}
                              </div>
                          ) : (
                              <button onClick={() => setShowBackupCodes(true)} className="w-full py-3 bg-white dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">Reveal Cluster Nodes</button>
                          )}
                          {showBackupCodes && (
                              <button onClick={copyCodes} className="w-full flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">
                                  {copied ? <CheckCircle size={14} className="mr-2 text-emerald-500" /> : <Copy size={14} className="mr-2" />}
                                  {copied ? "Keys Indexed" : "Copy Cluster to Vault"}
                              </button>
                          )}
                      </div>
                  </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center">Update Quantum Key Map</p>
                  <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="Current Secret" />
                  <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="New Secret" />
                  <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="Confirm Secret" />
                  {passError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{passError}</p>}
                  <button type="submit" className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Synchronize Protocols</button>
              </form>
          </div>

          {/* Device & Node Info */}
          <div className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <Monitor className="mr-4 text-indigo-600" size={28} /> Infrastructure Nodes
              </h3>
              
              <div className="space-y-4">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authorized Admin Terminals</p>
                      {user.authorizedDevices.map((device, i) => (
                          <div key={i} className="flex items-center justify-between mb-3 last:mb-0">
                              <div className="flex items-center space-x-4">
                                  <Smartphone className="text-slate-400" size={18} />
                                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{device}</p>
                              </div>
                              <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Primary</span>
                          </div>
                      ))}
                  </div>

                  <div className="p-8 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Database size={20} className="text-indigo-600 mr-3" />
                            <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Core Storage Box</h4>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600">{DEFAULT_STORAGE_LIMIT_GB} GB</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                          Your workspace is assigned a 15GB secure logic box. Contact SUSHIL for GBN upgrades.
                      </p>
                  </div>

                  <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center">
                      <Plus size={14} className="mr-2" /> REQUEST ADDITIONAL NODE
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div onClick={toggleDarkMode} className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer group hover:border-indigo-300 transition-all">
              <div className="flex items-center space-x-5">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                      {darkMode ? <Sun size={24} className="text-amber-500" /> : <Moon size={24} className="text-indigo-600" />}
                  </div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{darkMode ? 'Luminous Phase' : 'Dark Space Phase'}</span>
              </div>
              <div className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                  <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
              </div>
          </div>

          <div onClick={onLogout} className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-5 cursor-pointer group hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600">
                  <LogOut size={24} />
              </div>
              <span className="text-sm font-black text-red-600 uppercase tracking-widest">Terminate Node Interface</span>
          </div>
      </div>

      <div onClick={() => { if(window.confirm('WIPE WARNING: This will permanently de-initialize all local node clusters. Are you sure?')) resetApp(); }} className="bg-red-600 p-12 rounded-[3.5rem] text-white cursor-pointer shadow-xl shadow-red-200 dark:shadow-none flex flex-col items-center justify-center space-y-4 text-center active:scale-95 transition-all">
          <ShieldX size={48} />
          <div>
            <span className="text-2xl font-black uppercase tracking-tight block">Master Factory Purge</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] mt-2 opacity-60">Complete System De-initialization</span>
          </div>
      </div>

      <div className="text-center pb-12 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.8em]">{WATERMARK}</p>
      </div>
    </div>
  );
};
