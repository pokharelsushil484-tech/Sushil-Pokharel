
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, SubscriptionTier } from '../types';
import { 
  ShieldCheck, 
  Edit3, 
  Mail, 
  Crown, 
  Award,
  Fingerprint,
  AppWindow,
  Hash,
  Sparkles,
  ChevronRight,
  User
} from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME, COPYRIGHT_NOTICE, APP_VERSION, APP_NAME, MAX_PROFESSIONAL_LEVEL, PROFESSIONAL_TIER, VERSION_BETA, VERSION_PRO } from '../constants';
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

export const Settings: React.FC<SettingsProps> = ({ user, username, updateUser }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
      name: user.name,
      email: user.email,
      phone: user.phone,
      studentId: user.studentId || ''
  });

  const isAdmin = username.toUpperCase() === ADMIN_USERNAME;
  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;
  const versionString = isPro ? VERSION_PRO : VERSION_BETA;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = { ...user, ...editForm };
    await storageService.setData(`architect_data_${username.toUpperCase()}`, { user: updatedProfile });
    updateUser(updatedProfile);
    setIsEditingProfile(false);
  };

  const handleVerifyNode = async () => {
      const verifyToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      await emailService.sendInstitutionalMail(user.email, verifyToken, 'VERIFY_REQUEST', username);
      alert("Identity audit dispatched. Please check your institutional mail.");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="pb-20 space-y-12"
    >
      {/* Profile Hero */}
      <motion.div variants={item} className={`glass-card p-10 relative overflow-hidden ${isPro ? 'border-amber-500/20' : ''}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 ${isPro ? 'bg-amber-500/10' : 'bg-white/5'}`}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className={`w-32 h-32 rounded-3xl overflow-hidden border relative shadow-2xl shrink-0 ${isPro ? 'border-amber-500/30' : 'border-white/10'}`}>
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                     className="w-full h-full object-cover" alt="Avatar" />
                {user.isVerified && (
                    <div className={`absolute -top-1 -right-1 p-1.5 rounded-lg shadow-xl border-4 border-obsidian ${isPro ? 'bg-amber-400 text-black' : 'bg-white text-black'}`}>
                        <Crown size={12} />
                    </div>
                )}
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
                {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              value={editForm.name} 
                              onChange={e => setEditForm({...editForm, name: e.target.value})} 
                              className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-white/20" 
                              placeholder="Full Name" 
                            />
                            <input 
                              value={editForm.email} 
                              onChange={e => setEditForm({...editForm, email: e.target.value})} 
                              className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-white/20" 
                              placeholder="Email Address" 
                            />
                        </div>
                        <div className="flex gap-3 justify-center md:justify-start">
                            <button type="submit" className={`py-3 px-8 text-xs font-bold rounded-xl uppercase tracking-widest ${isPro ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white text-black hover:bg-white/90'}`}>Commit Changes</button>
                            <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-white/5 text-white/40 hover:text-white px-8 py-3 rounded-xl text-xs transition-colors">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h2 className={`text-5xl font-display italic tracking-tight ${isPro ? 'text-amber-100' : 'text-white'}`}>{user.name}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/60' : 'text-white/40'}`}>
                              {isAdmin ? 'Lead Architect' : `Elite Member • Level ${user.level || MAX_PROFESSIONAL_LEVEL}`}
                            </span>
                            {user.isVerified ? (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                  <ShieldCheck size={12}/> Verified Elite
                                </div>
                            ) : (
                                <button onClick={handleVerifyNode} className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest border-b border-amber-400/20 hover:border-amber-400 transition-all">
                                  Request Identity Audit
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} className={`p-5 rounded-2xl transition-all border ${isPro ? 'bg-amber-950/20 border-amber-500/20 hover:bg-amber-900/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <Edit3 size={20} className={isPro ? "text-amber-400/60" : "text-white/40"} />
                </button>
            )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Matrix */}
          <motion.div variants={item} className={`glass-card p-10 space-y-8 lg:col-span-2 ${isPro ? 'border-amber-500/20' : ''}`}>
              <div className="flex items-center gap-4">
                <Award className={isPro ? "text-amber-400" : "text-white/20"} size={24} />
                <h3 className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/60' : 'text-white/40'}`}>Professional Protocol</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-2xl border text-center ${isPro ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isPro ? 'text-amber-500/40' : 'text-white/20'}`}>Current Tier</p>
                    <p className={`text-lg font-display italic ${isPro ? 'text-amber-100' : 'text-white'}`}>
                      {user.subscriptionTier === SubscriptionTier.PRO_LIFETIME ? 'QUANTUM ELITE' : 
                       user.subscriptionTier === SubscriptionTier.PRO_TRIAL ? 'PRO TRIAL' : 'STANDARD BETA'}
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${isPro ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isPro ? 'text-amber-500/40' : 'text-white/20'}`}>Integrity</p>
                    <p className="text-lg font-display italic text-emerald-400">Optimal</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center ${isPro ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${isPro ? 'text-amber-500/40' : 'text-white/20'}`}>Build</p>
                    <p className={`text-lg font-display italic ${isPro ? 'text-amber-100' : 'text-white'}`}>{versionString}</p>
                  </div>
              </div>
          </motion.div>

          {/* Identity Info */}
          <motion.div variants={item} className={`glass-card p-10 space-y-8 ${isPro ? 'border-amber-500/20' : ''}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/60' : 'text-white/40'}`}>Identity Registry</h3>
              <div className="space-y-4">
                  <div className={`flex items-center gap-6 p-6 rounded-2xl border ${isPro ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white/5 border-white/5'}`}>
                      <Hash className={isPro ? "text-amber-400/40" : "text-white/20"} size={20} />
                      <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-white/20'}`}>Student Identifier</p>
                          <p className={`text-sm font-medium ${isPro ? 'text-amber-100' : 'text-white'}`}>{user.studentId || 'Pending Verification'}</p>
                      </div>
                  </div>
                  <div className={`flex items-center gap-6 p-6 rounded-2xl border ${isPro ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white/5 border-white/5'}`}>
                      <Mail className={isPro ? "text-amber-400/40" : "text-white/20"} size={20} />
                      <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-white/20'}`}>Institutional Mail</p>
                          <p className={`text-sm font-medium ${isPro ? 'text-amber-100' : 'text-white'}`}>{user.email}</p>
                      </div>
                  </div>
              </div>
          </motion.div>

          {/* Security Config */}
          <motion.div variants={item} className={`glass-card p-10 space-y-8 ${isPro ? 'border-amber-500/20' : ''}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/60' : 'text-white/40'}`}>Security Environment</h3>
              <div className="space-y-8">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Fingerprint className={isPro ? "text-amber-400/40" : "text-white/20"} size={20} />
                          <span className={`text-sm font-medium ${isPro ? 'text-amber-100' : 'text-white'}`}>Biometric Sync</span>
                      </div>
                      <button 
                        onClick={() => updateUser({...user, twoFactorEnabled: !user.twoFactorEnabled})}
                        className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${user.twoFactorEnabled ? (isPro ? 'bg-amber-400' : 'bg-white') : 'bg-white/10'}`}
                      >
                          <div className={`w-4 h-4 rounded-full transition-transform ${user.twoFactorEnabled ? 'translate-x-6 bg-black' : 'translate-x-0 bg-white/40'}`}></div>
                      </button>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <AppWindow className={isPro ? "text-amber-400/40" : "text-white/20"} size={20} />
                          <span className={`text-sm font-medium ${isPro ? 'text-amber-100' : 'text-white'}`}>Privacy Level</span>
                      </div>
                      <select 
                        value={user.privacyLevel} 
                        onChange={(e) => updateUser({...user, privacyLevel: e.target.value as any})}
                        className={`border rounded-lg px-4 py-2 text-[10px] font-semibold uppercase tracking-widest outline-none ${isPro ? 'bg-amber-950/20 border-amber-500/20 text-amber-100' : 'bg-white/5 border-white/10 text-white'}`}
                      >
                          <option value="STANDARD">Standard</option>
                          <option value="MAXIMUM">Maximum</option>
                          <option value="STEALTH">Stealth</option>
                      </select>
                  </div>
              </div>
          </motion.div>
      </div>

      <motion.div variants={item} className="flex flex-col items-center pt-20 pb-10 space-y-4 opacity-20">
        <p className="text-[10px] font-semibold uppercase tracking-[1em]">{WATERMARK}</p>
        <div className="flex items-center gap-6 text-[9px] font-semibold uppercase tracking-widest">
            <span>{COPYRIGHT_NOTICE}</span>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <span>{APP_VERSION}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

