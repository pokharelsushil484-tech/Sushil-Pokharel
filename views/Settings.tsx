
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  ShieldCheck, LogOut, Key, Lock, Edit3, 
  Smartphone, Mail, Server, Laptop, Tablet, 
  RefreshCw, Globe, ShieldAlert 
} from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME, COPYRIGHT_NOTICE, APP_VERSION } from '../constants';
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

export const Settings: React.FC<SettingsProps> = ({ user, resetApp, onLogout, username, updateUser }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
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

  const syncAllDevices = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="pb-40 animate-fade-in w-full max-w-6xl mx-auto space-y-12">
      
      {/* Executive Profile Header */}
      <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
            <Server size={300} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="w-40 h-40 rounded-[3.5rem] bg-black p-2 border border-white/10 shadow-inner">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                     className="w-full h-full object-cover rounded-[3rem]" alt="Avatar" />
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
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.6em]">{isAdmin ? 'Master Architect' : 'Student Node Identity'}</p>
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

      {/* Multi-Device Mesh Registry - NEW SECTION */}
      <div className="space-y-8">
          <div className="flex justify-between items-center px-6">
              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">Multi-Device Mesh Registry</h3>
              <button onClick={syncAllDevices} className="flex items-center space-x-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-white transition-all">
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Force Global Sync</span>
              </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { icon: Laptop, name: "Master Workstation", status: "Primary Node", type: "DESKTOP" },
                  { icon: Smartphone, name: "Mobile Terminal", status: "Active Sync", type: "PHONE" },
                  { icon: Tablet, name: "Library Portal", status: "Standby", type: "TABLET" }
              ].map((device, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 flex items-center space-x-6 hover:border-indigo-500/30 transition-all">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                          <device.icon size={24} />
                      </div>
                      <div>
                          <p className="font-bold text-white text-xs uppercase tracking-widest">{device.name}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center">
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${idx === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                              {device.status}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Security Matrix */}
          <div className="space-y-8">
              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] ml-6">Encryption Protocol</h3>
              <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                          <div className="p-5 bg-white/5 text-indigo-400 rounded-2xl border border-white/5"><Lock size={24} /></div>
                          <div>
                              <p className="font-black text-white text-sm uppercase tracking-wider italic">Master Credentials</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Identity Access Key</p>
                          </div>
                      </div>
                      <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-white">
                          {showPasswordChange ? 'ABORT' : 'UPDATE'}
                      </button>
                  </div>
                  {showPasswordChange && (
                      <div className="space-y-6 animate-slide-up">
                          <input type="password" placeholder="CURRENT TOKEN" className="w-full p-5 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-xs tracking-widest outline-none" />
                          <input type="password" placeholder="NEW TOKEN" className="w-full p-5 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-xs tracking-widest outline-none" />
                          <button className="btn-platinum w-full">Commit Token Change</button>
                      </div>
                  )}
              </div>
          </div>

          {/* Critical Actions */}
          <div className="space-y-8">
              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] ml-6">Node Control</h3>
              <div className="bg-red-500/5 p-10 rounded-[3rem] border border-red-500/10 space-y-6">
                  <div className="flex items-center gap-4 text-red-500">
                      <ShieldAlert size={20} />
                      <h4 className="text-xs font-black uppercase tracking-[0.3em]">Institutional Exit</h4>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={onLogout} className="flex-1 py-4 bg-white/5 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Sign Out All Devices</button>
                      <button onClick={() => { if(window.confirm("CRITICAL: THIS WIPES ALL DATA ON ALL DEVICES. PROCEED?")) { localStorage.clear(); window.location.reload(); } }} className="flex-1 py-4 bg-white/5 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Wipe All Nodes</button>
                  </div>
              </div>
          </div>
      </div>

      <div className="text-center pt-20 pb-10 space-y-4 opacity-30">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">{WATERMARK}</p>
        <div className="flex items-center justify-center space-x-4">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">{COPYRIGHT_NOTICE}</p>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">APP VERSION: {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};
