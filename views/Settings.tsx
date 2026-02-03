
import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, LogOut, Key, Lock, Edit3, 
  Smartphone, Mail, Server, Laptop, Tablet, 
  RefreshCw, Globe, ShieldAlert, CheckCircle2,
  Fingerprint, Eye, EyeOff, Bell, AppWindow
} from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME, COPYRIGHT_NOTICE, APP_VERSION } from '../constants';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';

interface SettingsProps {
  user: UserProfile;
  resetApp: () => void;
  onLogout: () => void;
  username: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  updateUser: (u: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, resetApp, onLogout, username, updateUser }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
      name: user.name,
      email: user.email,
      phone: user.phone,
      education: user.education || ''
  });

  const isAdmin = username === ADMIN_USERNAME;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(async () => {
        const updatedProfile = { ...user, ...editForm };
        await storageService.setData(`architect_data_${username}`, { user: updatedProfile });
        updateUser(updatedProfile);
        setIsEditingProfile(false);
        setIsSyncing(false);
    }, 1000);
  };

  const handleVerifyEmail = async () => {
      setIsVerifyingEmail(true);
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      await emailService.sendInstitutionalMail(user.email, mockCode);
      // In a real app, we'd wait for OTP, here we simulation dispatch
      alert("Verification link and OTP dispatched to your mail client.");
      setIsVerifyingEmail(false);
  };

  const toggle2FA = async () => {
      const updatedProfile = { ...user, twoFactorEnabled: !user.twoFactorEnabled };
      await storageService.setData(`architect_data_${username}`, { user: updatedProfile });
      updateUser(updatedProfile);
  };

  return (
    <div className="pb-40 animate-fade-in w-full max-w-6xl mx-auto space-y-12">
      
      {/* Executive Profile Header */}
      <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
            <Server size={300} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="w-40 h-40 rounded-[3.5rem] bg-black p-2 border border-white/10 shadow-inner group relative">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                     className="w-full h-full object-cover rounded-[3rem]" alt="Avatar" />
                {user.emailVerified && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-black p-2 rounded-xl shadow-xl border-4 border-slate-900">
                        <CheckCircle2 size={16} />
                    </div>
                )}
            </div>
            
            <div className="flex-1 space-y-8 text-center md:text-left">
                {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6 animate-scale-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="FULL NAME" />
                            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="EMAIL" />
                        </div>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <button type="submit" className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest">Commit Changes</button>
                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-10 py-4 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="space-y-2">
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">{user.name}</h2>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.6em]">{isAdmin ? 'Master Architect' : 'Student Node Identity'}</p>
                                {user.emailVerified ? (
                                    <span className="flex items-center text-[8px] font-black text-emerald-500 uppercase tracking-widest"><CheckCircle2 size={10} className="mr-1"/> Email Secured</span>
                                ) : (
                                    <button onClick={handleVerifyEmail} className="text-[8px] font-black text-red-500 hover:text-white uppercase tracking-widest border-b border-red-500 pb-0.5">Verify Node Email</button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                <Mail size={16} className="text-indigo-400" />
                                <span className="text-xs font-bold text-slate-400 tracking-tight">{user.email}</span>
                            </div>
                            <button onClick={() => setIsEditingProfile(true)} className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl">
                                <Edit3 size={20} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Privacy Matrix */}
          <div className="space-y-8">
              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] ml-6 italic">Privacy Protocols</h3>
              <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/5 space-y-10">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                          <div className="p-5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><Fingerprint size={24} /></div>
                          <div>
                              <p className="font-black text-white text-sm uppercase tracking-wider italic">Two-Factor Auth</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional 2FA Node</p>
                          </div>
                      </div>
                      <button 
                        onClick={toggle2FA}
                        className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${user.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${user.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                          <div className="p-5 bg-white/5 text-slate-400 rounded-2xl border border-white/10"><Bell size={24} /></div>
                          <div>
                              <p className="font-black text-white text-sm uppercase tracking-wider italic">Security Alerts</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Node Monitoring</p>
                          </div>
                      </div>
                      <div className="stark-badge">ACTIVE</div>
                  </div>
              </div>
          </div>

          {/* System Control */}
          <div className="space-y-8">
              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] ml-6 italic">Node Governance</h3>
              <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/5 space-y-10">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                          <div className="p-5 bg-white/5 text-slate-400 rounded-2xl border border-white/10"><AppWindow size={24} /></div>
                          <div>
                              <p className="font-black text-white text-sm uppercase tracking-wider italic">Registry Privacy</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Stealth Node Access</p>
                          </div>
                      </div>
                      <select 
                        value={user.privacyLevel} 
                        onChange={(e) => updateUser({...user, privacyLevel: e.target.value as any})}
                        className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-indigo-400 outline-none"
                      >
                          <option value="STANDARD">STANDARD</option>
                          <option value="MAXIMUM">MAXIMUM</option>
                          <option value="STEALTH">STEALTH</option>
                      </select>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Clearance</p>
                      <button onClick={onLogout} className="flex items-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                          <LogOut size={16}/> Terminate Session
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="text-center pt-20 pb-10 space-y-4 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">{WATERMARK}</p>
        <div className="flex items-center justify-center space-x-4">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">{COPYRIGHT_NOTICE}</p>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">VERSION MESH: {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};
