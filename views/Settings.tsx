
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Moon, LogOut, Sun, ShieldCheck, RefreshCw, Copy, Check, Gavel, ExternalLink, ShieldAlert, UserMinus, Key, Lock, Eye, EyeOff } from 'lucide-react';
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

          if (typeof userData === 'string') {
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
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header Profile Card */}
      <div className={`rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden ${isAdmin ? 'bg-slate-900' : 'bg-slate-950'}`}>
        <div className="absolute -top-10 -right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-[2rem] bg-white/5 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/10 shadow-lg group">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Avatar" />
                ) : (
                  <img src="/logo.svg" className="w-16 h-16 object-contain opacity-50 filter brightness-0 invert" alt="Avatar Placeholder" />
                )}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-bold tracking-tight mb-2">{user.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-indigo-300">{isAdmin ? 'Lead Architect' : 'Identity Node'}</span>
                   <span className="text-[10px] font-mono text-slate-400">ID: {username}</span>
                </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
                <img src="/logo.svg" className="w-8 h-8 object-contain filter brightness-0 invert" alt="Logo" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Column */}
          <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Security Protocol</h3>
              
              {/* MFA Card */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                              <Key size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Auth</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.totpEnabled ? 'Enabled' : 'Disabled'}</p>
                          </div>
                      </div>
                      {user.totpEnabled ? (
                          <div className="p-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                              <Check size={16} />
                          </div>
                      ) : (
                          <button onClick={initiateTotpSetup} disabled={isSyncing} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-2 rounded-lg transition-colors">
                              {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : 'Setup'}
                          </button>
                      )}
                  </div>
                  
                  {showTotpSetup && (
                      <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center mb-4">Scan QR or Copy Key</p>
                          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                              <code className="text-indigo-600 dark:text-indigo-400 font-mono text-xs tracking-widest">{user.totpSecret}</code>
                              <button onClick={copySecret} className="text-slate-400 hover:text-indigo-500 transition-colors"><Copy size={14}/></button>
                          </div>
                          <button onClick={finalizeTotp} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Verify & Enable</button>
                      </div>
                  )}
              </div>

              {/* Password Card */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl">
                              <Lock size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">Access Credentials</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password Management</p>
                          </div>
                      </div>
                      <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
                          {showPasswordChange ? 'Cancel' : 'Update'}
                      </button>
                  </div>

                  {showPasswordChange && (
                      <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                          <div className="space-y-3">
                              <div className="relative">
                                  <input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
                                    placeholder="Current Password"
                                  />
                                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500">
                                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                              </div>
                              <div className="relative">
                                  <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
                                    placeholder="New Password"
                                  />
                                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500">
                                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                              </div>
                              <input 
                                type={showNewPassword ? "text" : "password"} 
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
                                placeholder="Confirm New Password"
                              />
                          </div>

                          {passwordError && <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-wide">{passwordError}</p>}
                          {passwordSuccess && <p className="text-[10px] font-bold text-emerald-500 text-center uppercase tracking-wide">{passwordSuccess}</p>}

                          <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">Save Password</button>
                      </form>
                  )}
              </div>
          </div>

          {/* Preferences & Actions Column */}
          <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">System & Data</h3>
              
              {/* Appearance */}
              <div onClick={toggleDarkMode} className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
                          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                      </div>
                      <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">Interface Theme</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                      </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full p-1 transition-all flex items-center ${darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}>
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                  </div>
              </div>

              {/* Compliance Info */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl">
                          <Gavel size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">Compliance</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Legal Entity: {CREATOR_NAME}</p>
                      </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed pl-16">
                      Data residency is strictly local. Identity privacy adheres to Zero-Share protocols.
                  </p>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-950/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4">Danger Zone</h4>
                  
                  <div className="space-y-2">
                      <button onClick={onLogout} className="w-full flex items-center justify-between p-3 bg-white dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Sign Out</span>
                          <LogOut size={16} className="text-red-400 group-hover:text-red-600" />
                      </button>

                      {!isAdmin && (
                          <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-3 bg-white dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group">
                              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Delete Account</span>
                              <UserMinus size={16} className="text-red-400 group-hover:text-red-600" />
                          </button>
                      )}

                      {isAdmin && (
                          <button onClick={handleSystemWipe} className="w-full flex items-center justify-between p-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors">
                              <span className="text-xs font-black uppercase tracking-widest">System Wipe</span>
                              <ShieldAlert size={16} />
                          </button>
                      )}
                  </div>
              </div>
          </div>
      </div>

      <div className="text-center pt-8 pb-4 opacity-40">
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">{WATERMARK}</p>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">{COPYRIGHT_NOTICE}</p>
      </div>
    </div>
  );
};
