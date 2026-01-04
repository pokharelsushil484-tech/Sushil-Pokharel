import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Moon, LogOut, Sun, ShieldCheck, RefreshCw, Copy, Check, Smartphone, Monitor, Database, Zap, Fingerprint, QrCode, Gavel, ExternalLink, ShieldAlert, Camera, UserMinus, Key, Lock, Eye, EyeOff } from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME, COPYRIGHT_NOTICE, CREATOR_NAME, MIN_PASSWORD_LENGTH, DEFAULT_USER } from '../constants';
import { storageService } from '../services/storageService';

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
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const finalizeTotp = async () => {
    updateUser({ ...user, totpEnabled: true });
    setShowTotpSetup(false);
    
    // Log MFA Activation
    await storageService.logActivity({
        actor: user.name,
        targetUser: user.name,
        actionType: 'SECURITY',
        description: `MFA Protocol Enforced: ${user.name}`
    });

    alert("Authenticator Synced. Your node is now protected by Google Authenticator protocols.");
  };

  const copySecret = () => {
    if (user.totpSecret) {
      navigator.clipboard.writeText(user.totpSecret);
      alert("Secret Key Copied to Clipboard.");
    }
  };

  const validatePasswordStrength = (pw: string) => {
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    return pw.length >= MIN_PASSWORD_LENGTH && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError('');
      setPasswordSuccess('');

      if (!currentPassword || !newPassword || !confirmNewPassword) {
          setPasswordError("All fields are required.");
          return;
      }
      if (newPassword !== confirmNewPassword) {
          setPasswordError("New passwords do not match.");
          return;
      }
      if (!validatePasswordStrength(newPassword)) {
          setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} chars, include upper/lowercase, number & symbol.`);
          return;
      }

      // Verify Current Password (simulated fetch from localStorage since we don't have user obj with password here)
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
          const users = JSON.parse(usersStr);
          const userData = users[username];
          const storedPassword = typeof userData === 'string' ? userData : userData.password;

          if (storedPassword !== currentPassword) {
              setPasswordError("Incorrect current password.");
              return;
          }

          // Update Password
          if (typeof userData === 'string') {
              // Legacy format handling if needed, though login updates it
              users[username] = { ...DEFAULT_USER, password: newPassword, name: user.name, email: user.email, verified: true };
          } else {
              users[username].password = newPassword;
          }
          localStorage.setItem('studentpocket_users', JSON.stringify(users));

          await storageService.logActivity({
            actor: username,
            targetUser: username,
            actionType: 'SECURITY',
            description: `Password Rotation: ${username}`
          });

          setPasswordSuccess("Password updated successfully.");
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setTimeout(() => {
              setShowPasswordChange(false);
              setPasswordSuccess('');
          }, 1500);
      } else {
          setPasswordError("User record not found.");
      }
  };

  const handleSystemWipe = async () => {
      if (window.confirm("CRITICAL: Wipe all local data nodes permanently?")) {
          // Log Critical Action
          await storageService.logActivity({
            actor: username,
            actionType: 'SYSTEM',
            description: `SYSTEM PURGE INITIATED`,
            metadata: 'Factory Reset Triggered'
          });
          resetApp();
      }
  };

  const handleDeleteAccount = async () => {
    if (username === ADMIN_USERNAME) {
      alert("System Architect node cannot be deleted.");
      return;
    }

    if (window.confirm("CRITICAL WARNING: This will permanently delete your identity node and all associated data segments (Files, Notes, Tasks). This action cannot be undone.\n\nAre you sure you want to proceed?")) {
      
      try {
        await storageService.logActivity({
            actor: user.name,
            targetUser: user.name,
            actionType: 'SYSTEM',
            description: `IDENTITY DELETION: ${username}`,
            metadata: 'Permanent Account Removal'
        });

        // 1. Remove from Users List (localStorage)
        const usersStr = localStorage.getItem('studentpocket_users');
        if (usersStr) {
          const users = JSON.parse(usersStr);
          delete users[username];
          localStorage.setItem('studentpocket_users', JSON.stringify(users));
        }

        // 2. Remove Requests (localStorage)
        const reqStr = localStorage.getItem('studentpocket_requests');
        if (reqStr) {
          const requests = JSON.parse(reqStr);
          const filteredReqs = requests.filter((r: any) => r.username !== username);
          localStorage.setItem('studentpocket_requests', JSON.stringify(filteredReqs));
        }

        // 3. Remove Data Node (IndexedDB)
        await storageService.deleteData(`architect_data_${username}`);

      } catch (e) { 
        console.error("Deletion Process Error", e); 
      } finally {
        // 4. Logout regardless of minor errors
        onLogout();
      }
    }
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Architect Hub</h1>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.6em] mt-4">Identity Control & Node Management</p>
        </div>
        <div className="p-4 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-600/20 overflow-hidden">
          <img src="/logo.svg" className="w-10 h-10 object-contain" alt="Logo" />
        </div>
      </div>
      
      {/* IDENTITY NODE HEADER */}
      <div className={`rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden ${isAdmin ? 'bg-slate-900 border border-indigo-500/20' : 'bg-slate-950'}`}>
        <div className="absolute -top-10 -right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-16 gap-12 relative z-10">
            <div className="w-48 h-48 rounded-[4rem] bg-white/5 backdrop-blur-3xl flex items-center justify-center overflow-hidden border border-white/10 shadow-inner group">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Avatar" />
                ) : (
                  <span className="text-7xl font-black uppercase text-indigo-500">{user.name.charAt(0)}</span>
                )}
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                    <h2 className="text-5xl font-black uppercase tracking-tight">{user.name}</h2>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                   <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.5em]">{isAdmin ? 'Lead System Architect' : 'Standard Identity Node'}</p>
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: {username}</p>
                </div>
                
                <div className="mt-12 flex flex-wrap gap-6 justify-center md:justify-start">
                    <div className="px-8 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center group hover:bg-white/10 transition-all">
                        <Database size={16} className="mr-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{isAdmin ? 'Infrastructure Tier' : user.storageLimitGB + 'GB Segment Allocation'}</span>
                    </div>
                    <div className="px-8 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center group hover:bg-white/10 transition-all">
                        <Zap size={16} className="mr-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{user.totpEnabled ? 'MFA_ENFORCED' : 'LEGACY_HANDSHAKE'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* SECURITY HUB */}
          <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[4.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-12">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <Fingerprint className="mr-6 text-indigo-600" size={36} /> Security Layers
              </h3>
              
              <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5">
                  <div className="flex items-center">
                      <div className="p-5 bg-indigo-600 rounded-3xl text-white mr-8 shadow-2xl shadow-indigo-600/20"><Key size={28} /></div>
                      <div>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Access Control</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">{user.totpEnabled ? 'PROTOCOL ACTIVE' : 'VULNERABLE STATE'}</p>
                      </div>
                  </div>
                  {user.totpEnabled ? (
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
                          <Check size={28} />
                      </div>
                  ) : (
                      <button onClick={initiateTotpSetup} disabled={isSyncing} className="px-10 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center">
                          {isSyncing ? <RefreshCw className="animate-spin" size={18}/> : 'ENABLE AUTH'}
                      </button>
                  )}
              </div>

              <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 group">
                  <div className="flex items-center">
                      <div className="p-5 bg-slate-900 rounded-3xl text-indigo-500 mr-8 group-hover:scale-110 transition-transform"><Lock size={28} /></div>
                      <div>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Credentials</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">PASSWORD ROTATION</p>
                      </div>
                  </div>
                  <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                      {showPasswordChange ? 'CANCEL' : 'UPDATE'}
                  </button>
              </div>

               {showPasswordChange && (
                  <div className="p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border border-slate-200 dark:border-slate-800 animate-scale-up space-y-6">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h4>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Current Password</label>
                              <div className="relative">
                                  <input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white"
                                  />
                                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">New Password</label>
                              <div className="relative">
                                  <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white"
                                  />
                                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Confirm New Password</label>
                              <input 
                                type={showNewPassword ? "text" : "password"} 
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white"
                              />
                          </div>

                          {passwordError && <p className="text-xs font-bold text-red-500 text-center uppercase tracking-wide bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-900">{passwordError}</p>}
                          {passwordSuccess && <p className="text-xs font-bold text-emerald-500 text-center uppercase tracking-wide bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900">{passwordSuccess}</p>}

                          <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-opacity shadow-lg">Save New Password</button>
                      </form>
                  </div>
               )}

              {showTotpSetup && (
                  <div className="p-12 bg-slate-950 rounded-[4rem] border border-indigo-500/30 animate-scale-up space-y-10">
                      <div className="flex justify-center py-8">
                          <div className="w-64 h-64 bg-white p-8 rounded-[3rem] flex flex-col items-center justify-center shadow-inner group">
                              <QrCode size={200} className="text-slate-900 group-hover:scale-105 transition-transform" />
                          </div>
                      </div>
                      <div className="text-center space-y-8">
                          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.6em]">Shared Encryption Segment</p>
                          <div className="flex items-center justify-between bg-white/5 p-8 rounded-[2rem] border border-white/10">
                              <code className="text-indigo-400 font-mono text-xl tracking-[0.4em]">{user.totpSecret}</code>
                              <button onClick={copySecret} className="p-3 text-white hover:text-indigo-400 transition-colors bg-white/5 rounded-xl"><Copy size={24}/></button>
                          </div>
                          <button onClick={finalizeTotp} className="w-full bg-indigo-600 text-white py-8 rounded-[3rem] font-black text-sm uppercase tracking-[0.6em] shadow-2xl">VERIFY MFA SYNC</button>
                      </div>
                  </div>
              )}
          </div>

          {/* LEGAL & COMPLIANCE */}
          <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[4.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-12">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                  <Gavel className="mr-6 text-indigo-600" size={36} /> Compliance Hub
              </h3>
              
              <div className="space-y-8">
                  <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-slate-100 dark:border-white/5">
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em] mb-6">Official Legal Partner</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{CREATOR_NAME} Architecture</h4>
                      <div className="w-12 h-1 bg-indigo-600 my-6"></div>
                      <p className="text-[11px] text-indigo-500 font-black uppercase tracking-[0.4em] leading-relaxed">Jurisdiction: Local Infrastructure Cloud</p>
                  </div>

                  <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-slate-100 dark:border-white/5">
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em] mb-8">Governance Protocol</p>
                      <ul className="space-y-6">
                          <li className="flex items-center text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                             <div className="w-3 h-3 bg-indigo-500 rounded-full mr-5 shadow-[0_0_10px_indigo]"></div> Data Residency: Node-Level
                          </li>
                          <li className="flex items-center text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                             <div className="w-3 h-3 bg-indigo-500 rounded-full mr-5 shadow-[0_0_10px_indigo]"></div> Identity Privacy: Zero-Share Logic
                          </li>
                      </ul>
                      <button className="mt-12 flex items-center text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] hover:text-indigo-400 transition-colors group">
                          AUDIT FULL COMPLIANCE <ExternalLink size={18} className="ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div onClick={toggleDarkMode} className="bg-white dark:bg-[#0f172a] p-12 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between cursor-pointer group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center space-x-8">
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl group-hover:bg-indigo-600/10 transition-colors shadow-inner">
                      {darkMode ? <Sun size={36} className="text-amber-500" /> : <Moon size={36} className="text-indigo-600" />}
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{darkMode ? 'Luminous' : 'Obsidian'} Mode</span>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Interface State</p>
                  </div>
              </div>
              <div className={`w-20 h-12 rounded-full p-2 transition-all flex items-center shadow-inner ${darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'}`}>
                  <div className="w-8 h-8 bg-white rounded-full shadow-2xl"></div>
              </div>
          </div>

          <div onClick={onLogout} className="bg-white dark:bg-[#0f172a] p-12 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center space-x-8 cursor-pointer group hover:bg-red-500/5 transition-all">
              <div className="p-6 bg-red-500/10 rounded-3xl text-red-600 shadow-2xl shadow-red-500/10 group-hover:scale-110 transition-transform">
                  <LogOut size={36} />
              </div>
              <div>
                <span className="text-xl font-black text-red-600 uppercase tracking-tight">Terminal Shutdown</span>
                <p className="text-[11px] text-red-400/50 font-black uppercase tracking-[0.3em] mt-1">Disconnect Interface Node</p>
              </div>
          </div>
      </div>

      {!isAdmin && (
        <div onClick={handleDeleteAccount} className="bg-white dark:bg-[#0f172a] p-12 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center space-x-8 cursor-pointer group hover:bg-red-600 hover:border-red-600 transition-all mt-6">
            <div className="p-6 bg-red-500/10 rounded-3xl text-red-600 shadow-2xl shadow-red-500/10 group-hover:bg-white/20 group-hover:text-white transition-all group-hover:scale-110">
                <UserMinus size={36} />
            </div>
            <div>
              <span className="text-xl font-black text-red-600 uppercase tracking-tight group-hover:text-white">Delete Identity</span>
              <p className="text-[11px] text-red-400/50 font-black uppercase tracking-[0.3em] mt-1 group-hover:text-red-100">Permanent Node Removal</p>
            </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-red-500/5 p-16 rounded-[4.5rem] border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
            <div className="flex items-center space-x-10 text-center md:text-left flex-col md:flex-row">
                <ShieldAlert className="text-red-600 animate-pulse mb-6 md:mb-0" size={64} />
                <div>
                    <h3 className="text-3xl font-black text-red-600 uppercase tracking-tighter">Emergency Purge</h3>
                    <p className="text-[11px] text-red-400 font-black uppercase tracking-[0.4em] mt-3">Perform destructive factory reset on this cluster node.</p>
                </div>
            </div>
            <button onClick={handleSystemWipe} className="px-14 py-7 bg-red-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] shadow-2xl hover:bg-red-700 active:scale-95 transition-all">WIPE INFRASTRUCTURE</button>
        </div>
      )}

      <div className="text-center pb-12 opacity-30 mt-12">
        <p className="text-[11px] text-slate-500 font-black uppercase tracking-[1.2em]">{WATERMARK}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.6em] mt-6">{COPYRIGHT_NOTICE}</p>
      </div>
    </div>
  );
};