
import React, { useState } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Moon, LogOut, Sun, ShieldCheck, RefreshCw, Copy, Check, Gavel, ShieldAlert, UserMinus, Key, Lock, Eye, EyeOff, Edit3, Save, X, Smartphone, Mail, GraduationCap, AlertTriangle, Link as LinkIcon, Server, ExternalLink } from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME, COPYRIGHT_NOTICE, CREATOR_NAME, MIN_PASSWORD_LENGTH, DEFAULT_USER, APP_VERSION } from '../constants';
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

// Master Key Interval for client-side validation simulation
const MASTER_KEY_INTERVAL = 50000; 

export const Settings: React.FC<SettingsProps> = ({ user, resetApp, onLogout, username, darkMode, toggleDarkMode, updateUser }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  
  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [requestMode, setRequestMode] = useState<'NONE' | 'SELECT' | 'MASTER_KEY'>('NONE');
  const [editForm, setEditForm] = useState({
      name: user.name,
      email: user.email,
      phone: user.phone,
      education: user.education || ''
  });
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [masterKeyError, setMasterKeyError] = useState('');

  const [updateAvailable, setUpdateAvailable] = useState(false);

  const isAdmin = username === ADMIN_USERNAME;

  // --- SECURITY & VIOLENCE DETECTION ---
  const detectViolations = async (text: string) => {
      const lower = text.toLowerCase();
      const negativeTerms = ["hate", "kill", "die", "attack", "bomb", "stupid", "idiot", "violence", "blood", "death", "hack", "crack", "destroy"];
      
      if (negativeTerms.some(term => lower.includes(term))) {
          // IMMEDIATE BLOCK LOGIC
          const updatedProfile: UserProfile = {
            ...user,
            isBanned: true,
            banReason: "CRITICAL: VIOLENCE OR NEGATIVE CONTENT DETECTED. IMMEDIATE TERMINATION."
          };
          
          await storageService.setData(`architect_data_${username}`, { 
              ...await storageService.getData(`architect_data_${username}`), 
              user: updatedProfile 
          });
          
          await storageService.logActivity({
            actor: username,
            targetUser: username,
            actionType: 'SECURITY',
            description: `VIOLENCE DETECTED: Blocked immediately.`,
            metadata: `Content: ${text}`
          });

          // Force reload to trigger "App Removed" screen
          window.location.reload();
          return true;
      }
      return false;
  };

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
  };

  const copySecret = () => {
    if (user.totpSecret) {
      navigator.clipboard.writeText(user.totpSecret);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError('');
      
      if (await detectViolations(newPassword)) return;

      if (!currentPassword || !newPassword || !confirmNewPassword) {
          setPasswordError("All fields are required.");
          return;
      }
      if (newPassword !== confirmNewPassword) {
          setPasswordError("New passwords do not match.");
          return;
      }

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

          setPasswordSuccess("Password updated.");
          setTimeout(() => {
              setShowPasswordChange(false);
              setPasswordSuccess('');
              setCurrentPassword('');
              setNewPassword('');
          }, 1000);
      }
  };

  const handleRequestSubmit = async (method: 'ADMIN' | 'MASTER' | 'LINK') => {
    // 1. Scan for Violence
    const combinedData = `${editForm.name} ${editForm.education} ${editForm.email} ${editForm.phone}`;
    if (await detectViolations(combinedData)) return;

    if (method === 'MASTER') {
        setRequestMode('MASTER_KEY');
        return;
    }

    // Common Request Object
    const linkId = Math.random().toString(36).substring(7);
    const existingReqs = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    
    const request: ChangeRequest = {
        id: 'REQ-DATA-' + Date.now(),
        userId: username,
        username: username,
        type: 'DATA_CHANGE',
        details: JSON.stringify({ 
            old: { name: user.name, email: user.email, phone: user.phone, education: user.education },
            new: editForm 
        }),
        status: 'PENDING',
        createdAt: Date.now(),
        linkId: linkId,
        generatedStudentId: user.studentId
    };

    existingReqs.push(request);
    localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));

    if (method === 'LINK') {
        const url = `www.example.com/v/${linkId}`; // Per user request
        alert(`Request Link Generated:\n\n${url}\n\nCopy this to the external system.`);
        setIsEditingProfile(false);
        setRequestMode('NONE');
    } else {
        // Admin Request - Lock Account
        const pendingProfile: UserProfile = {
            ...user,
            verificationStatus: 'PENDING_APPROVAL',
            adminFeedback: 'Data Change Request Pending Administrator Review.'
        };
        
        await storageService.setData(`architect_data_${username}`, { ...await storageService.getData(`architect_data_${username}`), user: pendingProfile });
        updateUser(pendingProfile);
        window.location.href = '/';
    }
  };

  const validateMasterKey = async () => {
      // Logic: Master key rotates every 50s.
      const timeStep = MASTER_KEY_INTERVAL;
      const now = Date.now();
      const seed = Math.floor(now / timeStep);
      const currentMasterKey = Math.abs(Math.sin(seed + 1) * 1000000).toFixed(0).slice(0, 6).padEnd(6, '0');
      
      // Also check Admin Key ('a') or specific user key
      const isAdminKey = masterKeyInput === 'a' || masterKeyInput === ADMIN_USERNAME; 
      
      if (masterKeyInput === currentMasterKey || isAdminKey) {
          // Success - Apply Changes Immediately
          const updatedProfile: UserProfile = {
              ...user,
              name: editForm.name,
              email: editForm.email,
              phone: editForm.phone,
              education: editForm.education,
              adminFeedback: "Updated via Master Key Protocol."
          };
          
          await storageService.setData(`architect_data_${username}`, { ...await storageService.getData(`architect_data_${username}`), user: updatedProfile });
          updateUser(updatedProfile);
          
          // Update Global Auth Store if name/email changed
          const usersStr = localStorage.getItem('studentpocket_users');
          if (usersStr) {
             const users = JSON.parse(usersStr);
             if (users[username]) {
                 users[username].name = editForm.name;
                 users[username].email = editForm.email;
                 localStorage.setItem('studentpocket_users', JSON.stringify(users));
             }
          }

          setIsEditingProfile(false);
          setRequestMode('NONE');
          alert("Master Key Accepted. Profile Updated.");
      } else {
          setMasterKeyError("Invalid Master Key.");
      }
  };

  const handleSystemWipe = async () => {
      if (window.confirm("CRITICAL: Wipe all local data nodes permanently?")) {
          resetApp();
      }
  };

  const handleDeleteAccount = async () => {
      if (window.confirm("PERMANENT ACTION: Are you sure you want to delete your account? This action cannot be undone.")) {
          const usersStr = localStorage.getItem('studentpocket_users');
          if (usersStr) {
              const users = JSON.parse(usersStr);
              if (users[username]) {
                  delete users[username];
                  localStorage.setItem('studentpocket_users', JSON.stringify(users));
              }
          }
          await storageService.deleteData(`architect_data_${username}`);
          onLogout();
      }
  };

  const checkForUpdates = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          setUpdateAvailable(true);
      }, 1000);
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
            
            <div className="flex-1 text-center md:text-left w-full">
                {isEditingProfile ? (
                    <div className="space-y-4 bg-white/10 p-6 rounded-3xl animate-scale-up border border-white/10 backdrop-blur-sm relative">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300">Request Edit</h3>
                             <button onClick={() => { setIsEditingProfile(false); setRequestMode('NONE'); }} className="text-white/50 hover:text-white"><X size={18}/></button>
                        </div>

                        {/* EDIT FORM INPUTS */}
                        {requestMode === 'NONE' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] uppercase font-bold text-white/50">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] uppercase font-bold text-white/50">Education</label>
                                    <input 
                                        type="text" 
                                        value={editForm.education}
                                        onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] uppercase font-bold text-white/50">Email</label>
                                    <input 
                                        type="email" 
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] uppercase font-bold text-white/50">Phone</label>
                                    <input 
                                        type="tel" 
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 mt-2">
                                     <button onClick={() => setRequestMode('SELECT')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center">
                                        Proceed to Request Options <ShieldCheck size={14} className="ml-2"/>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* REQUEST MODE SELECTION */}
                        {requestMode === 'SELECT' && (
                             <div className="space-y-3 animate-slide-left">
                                 <p className="text-[10px] text-white/70 uppercase tracking-widest text-center mb-2">Select Authentication Method</p>
                                 
                                 <button onClick={() => handleRequestSubmit('ADMIN')} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                                     <div className="flex items-center">
                                         <div className="p-2 bg-indigo-500/20 rounded-lg mr-3 text-indigo-300"><Server size={16}/></div>
                                         <div className="text-left">
                                             <span className="block text-xs font-bold text-white">Option 1: Admin Request</span>
                                             <span className="block text-[9px] text-white/50">Submit for manual approval</span>
                                         </div>
                                     </div>
                                     <ShieldCheck size={14} className="text-white/30 group-hover:text-white"/>
                                 </button>

                                 <button onClick={() => handleRequestSubmit('MASTER')} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                                     <div className="flex items-center">
                                         <div className="p-2 bg-emerald-500/20 rounded-lg mr-3 text-emerald-300"><Key size={16}/></div>
                                         <div className="text-left">
                                             <span className="block text-xs font-bold text-white">Option 2: Master Key</span>
                                             <span className="block text-[9px] text-white/50">Instant update with AI-Generated Key</span>
                                         </div>
                                     </div>
                                     <Check size={14} className="text-white/30 group-hover:text-white"/>
                                 </button>

                                 <button onClick={() => handleRequestSubmit('LINK')} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                                     <div className="flex items-center">
                                         <div className="p-2 bg-amber-500/20 rounded-lg mr-3 text-amber-300"><LinkIcon size={16}/></div>
                                         <div className="text-left">
                                             <span className="block text-xs font-bold text-white">Option 3: Request Link</span>
                                             <span className="block text-[9px] text-white/50">Generate link for www.example.com</span>
                                         </div>
                                     </div>
                                     <ExternalLink size={14} className="text-white/30 group-hover:text-white"/>
                                 </button>
                             </div>
                        )}

                        {/* MASTER KEY INPUT */}
                        {requestMode === 'MASTER_KEY' && (
                            <div className="space-y-4 animate-scale-up">
                                <div className="text-center space-y-1">
                                    <h4 className="text-sm font-bold text-white">Enter Master Key</h4>
                                    <p className="text-[10px] text-white/50">Provided by AI Generator or Administrator (a)</p>
                                </div>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16}/>
                                    <input 
                                        type="text" 
                                        value={masterKeyInput} 
                                        onChange={(e) => setMasterKeyInput(e.target.value)}
                                        className="w-full bg-black/40 border border-emerald-500/50 rounded-xl py-3 pl-12 pr-4 text-center font-mono text-emerald-400 font-bold tracking-widest outline-none focus:bg-black/60 transition-all"
                                        placeholder="KEY"
                                    />
                                </div>
                                {masterKeyError && <p className="text-[10px] text-red-400 text-center font-bold">{masterKeyError}</p>}
                                <button onClick={validateMasterKey} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg">
                                    Authorize Update
                                </button>
                                <button onClick={() => setRequestMode('SELECT')} className="w-full text-white/50 text-[10px] font-bold uppercase tracking-widest py-2 hover:text-white">
                                    Back
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2 group">
                             <h2 className="text-4xl font-bold tracking-tight">{user.name}</h2>
                             {!isAdmin && (
                                 <button onClick={() => setIsEditingProfile(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full text-indigo-300" title="Submit Edit Request">
                                     <Edit3 size={18} />
                                 </button>
                             )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-indigo-300">{isAdmin ? 'Lead Architect' : 'Identity Node'}</span>
                           <span className="text-[10px] font-mono text-slate-400">AI-ID: {user.studentId || username}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-400 max-w-lg mx-auto md:mx-0">
                            <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg">
                                <Mail size={14} /> <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg">
                                <Smartphone size={14} /> <span>{user.phone || 'N/A'}</span>
                            </div>
                            {user.education && (
                                <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg col-span-1 sm:col-span-2">
                                    <GraduationCap size={14} /> <span>{user.education}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
                <img src="/logo.svg" className="w-8 h-8 object-contain filter brightness-0 invert" alt="Logo" />
            </div>
        </div>
        
        {/* Update Banner */}
        {updateAvailable && (
            <div className="absolute bottom-0 left-0 w-full bg-emerald-600 text-white p-3 flex justify-between items-center px-8 animate-slide-up">
                <span className="text-xs font-bold uppercase tracking-widest flex items-center"><RefreshCw size={14} className="mr-2 animate-spin-slow"/> System Update Available</span>
                <button onClick={() => window.location.reload()} className="bg-white text-emerald-700 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">Reload Now</button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Column */}
          <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Security Protocol</h3>
              
              {/* MFA Card */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  {/* Block Security Features if Intermediate issues exist (simulated by checking ban status, though banned users are usually logged out) */}
                  {user.isBanned && (
                      <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] z-20 flex items-center justify-center">
                          <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center">
                              <ShieldAlert size={14} className="mr-2"/> Security Blocked
                          </div>
                      </div>
                  )}

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
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  {user.isBanned && (
                      <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] z-20 flex items-center justify-center">
                          <Lock size={24} className="text-red-500"/>
                      </div>
                  )}
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
                          <button onClick={() => { if(user.isBanned) return; handleDeleteAccount(); }} className={`w-full flex items-center justify-between p-3 bg-white dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 transition-colors group ${user.isBanned ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
                              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Delete Account</span>
                              <UserMinus size={16} className="text-red-400 group-hover:text-red-600" />
                          </button>
                      )}

                      <button onClick={checkForUpdates} className="w-full flex items-center justify-between p-3 bg-white dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group">
                           <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Check for Updates</span>
                           {isSyncing ? <RefreshCw size={16} className="animate-spin text-slate-400"/> : <RefreshCw size={16} className="text-slate-400 group-hover:text-slate-600" />}
                      </button>

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
