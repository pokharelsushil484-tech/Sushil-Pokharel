
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Moon, LogOut, Sun, ShieldCheck, RefreshCw, ShieldAlert, Copy, Check, ShieldX, Key, Monitor, Smartphone, Plus, Mail, Database, Zap, CheckCircle, Fingerprint, QrCode } from 'lucide-react';
import { WATERMARK, DEFAULT_STORAGE_LIMIT_GB, ADMIN_USERNAME } from '../constants';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const isAdmin = username === ADMIN_USERNAME;

  const initiateTotpSetup = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const secret = Array.from({ length: 16 }).map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[Math.floor(Math.random() * 32)]).join('');
      updateUser({ ...user, totpSecret: secret });
      setShowTotpSetup(true);
      setIsSyncing(false);
    }, 1000);
  };

  const finalizeTotp = () => {
    updateUser({ ...user, totpEnabled: true });
    setShowTotpSetup(false);
    alert("Authenticator Synced. Your node is now protected by Google Authenticator protocols.");
  };

  const copySecret = () => {
    if (user.totpSecret) {
      navigator.clipboard.writeText(user.totpSecret);
      alert("Secret Key Copied to Clipboard.");
    }
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-10">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Infrastructure Panel</h1>
      
      <div className={`rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden ${isAdmin ? 'bg-slate-900 border border-indigo-500/20' : 'bg-indigo-600'}`}>
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
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{isAdmin ? 'Lead System Architect' : 'Consumer Node Occupant'}</p>
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20 flex items-center">
                        <Database size={12} className="mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{isAdmin ? 'Unlimited' : user.storageLimitGB + 'GB'} GBN</span>
                    </div>
                    <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20 flex items-center">
                        <Zap size={12} className="mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.totpEnabled ? 'TOTP ACTIVE' : 'QUANTUM SECURED'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* SECURITY PROTOCOLS */}
          <div className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <Fingerprint className="mr-4 text-indigo-600" size={28} /> Authentication Hub
              </h3>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl mr-4"><Smartphone size={20} /></div>
                      <div>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Google Authenticator</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.totpEnabled ? 'Protocol Linked' : 'Available for Linking'}</p>
                      </div>
                  </div>
                  {user.totpEnabled ? (
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                          <Check size={20} />
                      </div>
                  ) : (
                      <button 
                        onClick={initiateTotpSetup} 
                        disabled={isSyncing}
                        className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
                      >
                          {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : 'Link App'}
                      </button>
                  )}
              </div>

              {showTotpSetup && (
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-indigo-500/30 animate-scale-up space-y-6">
                      <div className="flex justify-center py-6">
                          <div className="w-48 h-48 bg-white p-4 rounded-3xl flex flex-col items-center justify-center">
                              <QrCode size={140} className="text-slate-900" />
                          </div>
                      </div>
                      <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4">Scan Matrix or Input Key</p>
                          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                              <code className="text-indigo-400 font-mono text-sm tracking-widest">{user.totpSecret}</code>
                              <button onClick={copySecret} className="text-white hover:text-indigo-400"><Copy size={16}/></button>
                          </div>
                          <button onClick={finalizeTotp} className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Confirm Synchronization</button>
                      </div>
                  </div>
              )}
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <Monitor className="mr-4 text-indigo-600" size={28} /> Authorized Nodes
              </h3>
              <div className="space-y-4">
                  {user.authorizedDevices.map((device, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center space-x-3">
                              <Monitor size={16} className="text-slate-400" />
                              <span className="text-xs font-bold dark:text-slate-200">{device}</span>
                          </div>
                          <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                  ))}
                  <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">Register New Terminal</button>
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

      <div className="text-center pb-12 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.8em]">{WATERMARK}</p>
      </div>
    </div>
  );
};
