
import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, LogOut, Key, Lock, Edit3, 
  Smartphone, Mail, Server, RefreshCw, Globe, 
  CheckCircle2, Fingerprint, Bell, AppWindow,
  Download, Database, Trash2, History
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
      alert("Verification Protocol Dispatched. Please check your mail node.");
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
      <div className="bg-slate-900 rounded-[4rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 rounded-[3rem] bg-black p-1 border border-white/10 relative">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                     className="w-full h-full object-cover rounded-[2.8rem]" alt="Avatar" />
                {user.emailVerified && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-black p-1.5 rounded-lg shadow-xl">
                        <CheckCircle2 size={12} />
                    </div>
                )}
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
                {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none" />
                            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none" />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest">Update Identity</button>
                    </form>
                ) : (
                    <>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{user.name}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em]">{isAdmin ? 'Master Architect' : 'Student Node'}</span>
                            {user.emailVerified ? (
                                <span className="stark-badge text-emerald-500 border-emerald-500/20 py-1">Node Verified</span>
                            ) : (
                                <button onClick={handleVerifyEmailNode} className="text-[10px] font-black text-red-500 uppercase border-b border-red-500">Verify Email Node</button>
                            )}
                        </div>
                    </>
                )}
            </div>
            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <Edit3 size={20} className="text-slate-400" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Privacy Controls */}
          <div className="master-box p-10 bg-slate-900/40 border-white/5 space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Privacy Protocols</h3>
              <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Fingerprint className="text-indigo-400" size={20} />
                          <span className="text-xs font-bold text-white uppercase italic">2FA Security Node</span>
                      </div>
                      <button 
                        onClick={() => updateUser({...user, twoFactorEnabled: !user.twoFactorEnabled})}
                        className={`w-12 h-6 rounded-full transition-all relative ${user.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${user.twoFactorEnabled ? 'right-1' : 'left-1'}`}></div>
                      </button>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <AppWindow className="text-slate-500" size={20} />
                          <span className="text-xs font-bold text-white uppercase italic">Stealth Registry</span>
                      </div>
                      <select 
                        value={user.privacyLevel} 
                        onChange={(e) => updateUser({...user, privacyLevel: e.target.value as any})}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1 text-[9px] font-black uppercase text-indigo-400"
                      >
                          <option value="STANDARD">STANDARD</option>
                          <option value="MAXIMUM">MAXIMUM</option>
                      </select>
                  </div>
              </div>
          </div>

          {/* Data Sovereignty */}
          <div className="master-box p-10 bg-slate-900/40 border-white/5 space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Data Sovereignty</h3>
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={exportDataRegistry} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center space-y-3">
                      <Download size={20} className="mx-auto text-indigo-400" />
                      <span className="block text-[9px] font-black text-white uppercase tracking-widest">Export Node</span>
                  </button>
                  <button onClick={() => { if(confirm("Confirm Local Registry Purge?")) { localStorage.clear(); window.location.reload(); } }} className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 hover:bg-red-500/10 transition-all text-center space-y-3">
                      <Trash2 size={20} className="mx-auto text-red-500" />
                      <span className="block text-[9px] font-black text-red-500 uppercase tracking-widest">Purge Data</span>
                  </button>
              </div>
          </div>
      </div>

      <div className="flex flex-col items-center pt-20 pb-10 space-y-4 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.8em]">{WATERMARK}</p>
        <div className="flex items-center gap-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            <span>{COPYRIGHT_NOTICE}</span>
            <span>|</span>
            <span>{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};
