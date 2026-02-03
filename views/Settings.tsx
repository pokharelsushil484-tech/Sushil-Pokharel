
import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, LogOut, Key, Lock, Edit3, 
  Smartphone, Mail, Server, RefreshCw, Globe, 
  CheckCircle2, Fingerprint, Bell, AppWindow,
  Download, Database, Trash2, History, Phone, User
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

export const Settings: React.FC<SettingsProps> = ({ user, onLogout, username, updateUser }) => {
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
    const updatedProfile = { ...user, ...editForm };
    await storageService.setData(`architect_data_${username}`, { user: updatedProfile });
    updateUser(updatedProfile);
    setIsEditingProfile(false);
  };

  const handleVerifyEmailNode = async () => {
      setIsVerifyingEmail(true);
      const verifyToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      await emailService.sendInstitutionalMail(user.email, verifyToken, 'VERIFY');
      alert("Verification Protocol Dispatched to: " + user.email);
      setIsVerifyingEmail(false);
  };

  const exportDataRegistry = () => {
      const data = JSON.stringify(user, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StudentPocket_Registry_${username}.json`;
      a.click();
  };

  return (
    <div className="pb-40 animate-fade-in w-full max-w-6xl mx-auto space-y-12">
      {/* Executive Header */}
      <div className="bg-slate-900 rounded-[4rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 rounded-[3rem] bg-black p-1 border border-white/10 relative">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                     className="w-full h-full object-cover rounded-[2.8rem]" alt="Avatar" />
                {user.isVerified && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-black p-1.5 rounded-lg shadow-xl border-4 border-slate-900">
                        <CheckCircle2 size={12} />
                    </div>
                )}
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
                {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500" />
                            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500" />
                        </div>
                        <div className="flex gap-3 justify-center md:justify-start">
                            <button type="submit" className="px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest">Commit Changes</button>
                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 bg-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">{user.name}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em]">{isAdmin ? 'Master Architect' : 'Student Node Identity'}</span>
                            {user.isVerified ? (
                                <span className="stark-badge text-emerald-500 border-emerald-500/20 py-1 flex items-center gap-2"><CheckCircle2 size={10}/> Institutional Verified</span>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="stark-badge text-amber-500 border-amber-500/20 py-1">Awaiting Clearance</span>
                                    <button onClick={handleVerifyEmailNode} className="text-[10px] font-black text-red-500 uppercase border-b border-red-500 pb-0.5 hover:text-white transition-colors">Verify Node Node</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} className="p-5 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all border border-white/5">
                    <Edit3 size={20} className="text-slate-400" />
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Identity Matrix - New Section showing email/phone details */}
          <div className="master-box p-10 bg-slate-900/40 border-white/5 space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Identity Matrix</h3>
              <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4">
                          <Mail className="text-indigo-400" size={20} />
                          <div>
                              <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Communication Email</p>
                              <p className="text-sm font-bold text-white tracking-tight">{user.email}</p>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4">
                          <Phone className="text-indigo-400" size={20} />
                          <div>
                              <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Phone Record</p>
                              <p className="text-sm font-bold text-white tracking-tight">{user.phone}</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Privacy Protocols */}
          <div className="master-box p-10 bg-slate-900/40 border-white/5 space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Privacy Protocols</h3>
              <div className="space-y-8">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Fingerprint className="text-indigo-400" size={20} />
                          <span className="text-xs font-bold text-white uppercase italic">Two-Factor Security</span>
                      </div>
                      <button 
                        onClick={() => updateUser({...user, twoFactorEnabled: !user.twoFactorEnabled})}
                        className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${user.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${user.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <AppWindow className="text-slate-500" size={20} />
                          <span className="text-xs font-bold text-white uppercase italic">Registry Stealth</span>
                      </div>
                      <select 
                        value={user.privacyLevel} 
                        onChange={(e) => updateUser({...user, privacyLevel: e.target.value as any})}
                        className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase text-indigo-400"
                      >
                          <option value="STANDARD">STANDARD</option>
                          <option value="MAXIMUM">MAXIMUM</option>
                      </select>
                  </div>
              </div>
          </div>

          {/* Data Sovereignty */}
          <div className="master-box p-10 bg-slate-900/40 border-white/5 space-y-10 lg:col-span-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic text-center">Data Sovereignty</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button onClick={exportDataRegistry} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group flex flex-col items-center gap-4">
                      <Download size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Export Node Registry</span>
                  </button>
                  <button onClick={() => { if(confirm("CRITICAL: This will purge all local data. Continue?")) { localStorage.clear(); window.location.reload(); } }} className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 hover:bg-red-500/10 transition-all group flex flex-col items-center gap-4">
                      <Trash2 size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Purge Identity Node</span>
                  </button>
              </div>
          </div>
      </div>

      <div className="flex flex-col items-center pt-20 pb-10 space-y-4 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[1em]">{WATERMARK}</p>
        <div className="flex items-center gap-6 text-[8px] text-slate-600 font-bold uppercase tracking-widest">
            <span>{COPYRIGHT_NOTICE}</span>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <span>{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};
