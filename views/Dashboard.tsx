
import React from 'react';
import { UserProfile, View } from '../types';
import { ShieldCheck, HardDrive, Infinity as InfinityIcon, ArrowRight, Loader2, Sparkles, Lock, Database } from 'lucide-react';
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
  const safeLimitGB = user?.storageLimitGB || 10;
  
  const usedGB = (safeUsedBytes / (1024 ** 3)).toFixed(2);
  const usedPercent = isAdmin ? 0 : Math.min(100, (safeUsedBytes / (safeLimitGB * 1024 ** 3)) * 100);

  const getVerificationUI = () => {
    if (user.isVerified || isAdmin) return null;
    if (user.verificationStatus === 'PENDING_APPROVAL') {
      return (
        <div className="bg-amber-950/20 p-10 rounded-[3rem] border border-amber-500/30 mb-10 flex items-center justify-between animate-pulse">
           <div className="flex items-center space-x-6">
              <Loader2 className="text-amber-500 animate-spin" size={32} />
              <div>
                 <p className="font-black text-amber-500 uppercase tracking-tight">Authorization Signal Pending</p>
                 <p className="text-[10px] text-amber-500/40 font-bold uppercase tracking-widest mt-1">The System Architect is reviewing your node authorization credentials.</p>
              </div>
           </div>
        </div>
      );
    }
    return (
      <div 
        onClick={() => onNavigate(View.VERIFICATION_FORM)}
        className="bg-indigo-600/10 dark:bg-indigo-600/5 p-10 rounded-[3.5rem] border border-indigo-600/30 mb-10 flex flex-col md:flex-row items-center justify-between cursor-pointer group hover:bg-indigo-600/15 transition-all"
      >
         <div className="flex items-center space-x-8 mb-6 md:mb-0">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
               <Sparkles size={32} />
            </div>
            <div>
               <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Provision Identity Protocol</p>
               <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Submit credential verification to enable professional repository access.</p>
            </div>
         </div>
         <div className="flex items-center text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-8 py-4 rounded-2xl group-hover:bg-indigo-700 transition-colors">
            Authorize Node <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in w-full max-w-7xl mx-auto pb-24">
      {/* PROFESSIONAL INFRASTRUCTURE HEADER */}
      <div className={`relative overflow-hidden rounded-[4rem] text-white shadow-2xl p-12 lg:p-20 ${isAdmin ? 'bg-slate-900 border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.15)]' : 'bg-slate-950'}`}>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-l from-indigo-600 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-8">
                    <ShieldCheck size={18} className="text-indigo-400" />
                    <span className="text-indigo-400 font-black text-[10px] tracking-[0.6em] uppercase">
                        {user.isVerified || isAdmin ? 'Status: Secure Architect' : 'Status: Restricted Guest'}
                    </span>
                  </div>
                  <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase">
                    Node <br/>
                    <span className="text-indigo-500">{user.name || 'Unknown Node'}</span>
                  </h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-12">Engineering Authority: {CREATOR_NAME}</p>
              </div>
              <div className="w-40 h-40 rounded-[3rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] border border-white/20">
                  {isAdmin ? <InfinityIcon size={72} className="text-white" /> : user.isVerified ? <ShieldCheck size={72} className="text-white" /> : <Lock size={72} className="text-white/50" />}
              </div>
          </div>
      </div>

      {getVerificationUI()}

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="bg-white dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/20 transition-all">
              <HardDrive size={32} className="text-indigo-600 mb-8" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Cluster Storage</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{isAdmin ? 'Unlimited' : `${usedGB} GB`}</p>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${usedPercent}%` }} />
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/20 transition-all">
              <ShieldCheck size={32} className="text-emerald-500 mb-8" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Protocol Layer</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user.totpEnabled ? 'Locked' : 'Open'}</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase mt-4 tracking-widest">{user.totpEnabled ? 'MFA_ACTIVE' : 'Quantum_Vulnerable'}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/20 transition-all">
              <Lock size={32} className="text-amber-500 mb-8" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Identity Governance</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{isAdmin ? 'Admin' : user.isVerified ? 'Full' : 'Guest'}</p>
              <p className="text-[10px] text-amber-500 font-bold uppercase mt-4 tracking-widest">{isAdmin ? 'Master Privilege' : user.isVerified ? 'Verified Asset' : 'Temporary Session'}</p>
          </div>
      </div>

      <div 
        onClick={() => onNavigate(View.FILE_HUB)} 
        className="relative group p-16 bg-slate-900 rounded-[4rem] text-white flex justify-between items-center cursor-pointer overflow-hidden transition-all hover:bg-slate-800 shadow-2xl"
      >
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <div className="flex items-center space-x-12">
              <div className="p-8 bg-indigo-600 rounded-[2.5rem] group-hover:rotate-12 transition-transform shadow-2xl shadow-indigo-600/30">
                <Database size={48} />
              </div>
              <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Access Repository</h3>
                  <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-3">Enter encrypted professional data node</p>
              </div>
          </div>
          <ArrowRight className="text-indigo-600 group-hover:translate-x-6 transition-all" size={48} />
      </div>
    </div>
  );
};
