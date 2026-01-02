
import React from 'react';
import { UserProfile, View } from '../types';
import { ShieldCheck, HardDrive, Activity, ArrowRight, Loader2, Sparkles, Lock, Database } from 'lucide-react';
import { CREATOR_NAME, ADMIN_USERNAME } from '../constants';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const isAdmin = username === ADMIN_USERNAME;
  
  // Safety defaults to prevent calculation errors
  const safeUsedBytes = user?.storageUsedBytes || 0;
  const safeLimitGB = Math.max(1, user?.storageLimitGB || 10);
  
  const usedGB = (safeUsedBytes / (1024 ** 3)).toFixed(2);
  const usedPercent = isAdmin ? 0 : Math.min(100, (safeUsedBytes / (safeLimitGB * 1024 ** 3)) * 100);

  const getVerificationUI = () => {
    if (user.isVerified || isAdmin) return null;
    if (user.verificationStatus === 'PENDING_APPROVAL') {
      return (
        <div className="bg-amber-500/10 p-8 rounded-[3rem] border border-amber-500/20 mb-8 flex items-center justify-between animate-pulse">
           <div className="flex items-center space-x-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                <Loader2 className="animate-spin" size={24} />
              </div>
              <div>
                 <p className="font-black text-amber-600 dark:text-amber-500 uppercase tracking-tight text-sm">Signal Pending</p>
                 <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest mt-1">Reviewing Authorization...</p>
              </div>
           </div>
        </div>
      );
    }
    return (
      <div 
        onClick={() => onNavigate(View.VERIFICATION_FORM)}
        className="bg-indigo-600/5 p-8 rounded-[3rem] border border-indigo-600/10 mb-8 flex flex-col md:flex-row items-center justify-between cursor-pointer group hover:bg-indigo-600/10 transition-all gap-6 text-center md:text-left"
      >
         <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
               <Sparkles size={28} />
            </div>
            <div>
               <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Provision Identity</p>
               <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Verify student credentials for access.</p>
            </div>
         </div>
         <div className="flex items-center text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-8 py-4 rounded-2xl group-hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
            Authorize <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-7xl mx-auto pb-24 px-4 sm:px-0">
      {/* PROFESSIONAL INFRASTRUCTURE HEADER */}
      <div className={`relative overflow-hidden rounded-[3.5rem] text-white shadow-2xl p-10 md:p-16 ${isAdmin ? 'bg-slate-900 border border-indigo-500/20' : 'bg-slate-950'}`}>
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-l from-indigo-600 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <ShieldCheck size={16} className="text-indigo-400" />
                    <span className="text-indigo-400 font-black text-[9px] tracking-[0.4em] uppercase">
                        {user.isVerified || isAdmin ? 'Status: Secure' : 'Status: Restricted'}
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter uppercase break-words">
                    Node <br/>
                    <span className="text-indigo-500">{user.name || 'Unknown'}</span>
                  </h1>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-8">Authored by {CREATOR_NAME}</p>
              </div>
              <div className="hidden md:flex w-32 h-32 rounded-[2.5rem] bg-indigo-600 items-center justify-center shadow-2xl border border-white/10">
                  {isAdmin ? <Activity size={56} className="text-white" /> : user.isVerified ? <ShieldCheck size={56} className="text-white" /> : <Lock size={56} className="text-white/50" />}
              </div>
          </div>
      </div>

      {getVerificationUI()}

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm hover:border-indigo-500/20 transition-all">
              <HardDrive size={28} className="text-indigo-600 mb-6" />
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Storage</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{isAdmin ? 'Unlimited' : `${usedGB} GB`}</p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${usedPercent}%` }} />
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm hover:border-indigo-500/20 transition-all">
              <ShieldCheck size={28} className="text-emerald-500 mb-6" />
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Security</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user.totpEnabled ? 'Locked' : 'Open'}</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase mt-4 tracking-widest">{user.totpEnabled ? 'MFA ACTIVE' : 'NO 2FA'}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm hover:border-indigo-500/20 transition-all">
              <Lock size={28} className="text-amber-500 mb-6" />
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Identity</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{isAdmin ? 'Admin' : user.isVerified ? 'Full' : 'Guest'}</p>
              <p className="text-[9px] text-amber-500 font-bold uppercase mt-4 tracking-widest">{isAdmin ? 'Master' : user.isVerified ? 'Verified' : 'Temp'}</p>
          </div>
      </div>

      <div 
        onClick={() => onNavigate(View.FILE_HUB)} 
        className="relative group p-12 bg-slate-900 rounded-[3.5rem] text-white flex justify-between items-center cursor-pointer overflow-hidden transition-all hover:bg-slate-800 shadow-xl"
      >
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <div className="flex items-center space-x-8">
              <div className="p-6 bg-indigo-600 rounded-[2rem] group-hover:rotate-12 transition-transform shadow-2xl shadow-indigo-600/30">
                <Database size={32} />
              </div>
              <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Repository</h3>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-2">Access Data Node</p>
              </div>
          </div>
          <div className="bg-white/10 p-4 rounded-full">
            <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={24} />
          </div>
      </div>
    </div>
  );
};
