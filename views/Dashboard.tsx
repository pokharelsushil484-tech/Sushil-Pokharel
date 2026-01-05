
import React, { useState, useEffect } from 'react';
import { UserProfile, View, ChangeRequest } from '../types';
import { ShieldCheck, HardDrive, ArrowRight, Loader2, Sparkles, Lock, Database, Mail, XCircle, FileText, ChevronDown, ChevronUp, RefreshCw, CheckCircle, Copy, Award, BadgeCheck } from 'lucide-react';
import { CREATOR_NAME, ADMIN_USERNAME, SYSTEM_DOMAIN } from '../constants';
import { storageService } from '../services/storageService';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const isAdmin = username === ADMIN_USERNAME;
  const [showFeedback, setShowFeedback] = useState(false);
  const [resending, setResending] = useState(false);
  const [newLinkState, setNewLinkState] = useState<{ link: string; email: string } | null>(null);
  const [currentLinkId, setCurrentLinkId] = useState<string | null>(null);

  // Safety defaults
  const safeUsedBytes = user?.storageUsedBytes || 0;
  const safeLimitGB = Math.max(1, user?.storageLimitGB || 10);
  
  const usedGB = (safeUsedBytes / (1024 ** 3)).toFixed(2);
  const usedPercent = isAdmin ? 0 : Math.min(100, (safeUsedBytes / (safeLimitGB * 1024 ** 3)) * 100);

  // Fetch current link ID on mount
  useEffect(() => {
    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const myRequest = requests.find(r => r.username === username && r.status === 'PENDING');
        if (myRequest?.linkId) {
            setCurrentLinkId(myRequest.linkId);
        }
    }
  }, [username]);

  const handleResendLink = () => {
    setResending(true);
    
    // Simulate network delay for better UX
    setTimeout(() => {
        const reqStr = localStorage.getItem('studentpocket_requests');
        if (reqStr) {
            const requests: ChangeRequest[] = JSON.parse(reqStr);
            const myRequestIndex = requests.findIndex(r => r.username === username && r.status === 'PENDING');
            
            if (myRequestIndex !== -1) {
                const newLinkId = Math.random().toString(36).substring(7);
                const oldLinkId = requests[myRequestIndex].linkId;
                
                // Archive old Link ID
                if (oldLinkId) {
                    if (!requests[myRequestIndex].previousLinkIds) {
                        requests[myRequestIndex].previousLinkIds = [];
                    }
                    requests[myRequestIndex].previousLinkIds!.push(oldLinkId);
                }

                // Update Request
                requests[myRequestIndex].linkId = newLinkId;
                requests[myRequestIndex].createdAt = Date.now();
                
                localStorage.setItem('studentpocket_requests', JSON.stringify(requests));
                
                const details = JSON.parse(requests[myRequestIndex].details);
                const origin = window.location.origin;
                const link = `${origin}/v/${newLinkId}`;
                
                setNewLinkState({ link, email: details.email });
                setCurrentLinkId(newLinkId);
            } else {
                alert("No pending request found to resend.");
            }
        }
        setResending(false);
    }, 1500);
  };

  const handleCheckStatus = async () => {
      const stored = await storageService.getData(`architect_data_${username}`);
      if (stored && stored.user && stored.user.verificationStatus !== user.verificationStatus) {
          window.location.reload();
      } else {
          alert("Status is still pending review by administrator.");
      }
  };

  const getVerificationUI = () => {
    if (user.isVerified || isAdmin) return null;
    
    if (user.verificationStatus === 'REJECTED') {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 mb-6 transition-all">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-400 text-xs uppercase tracking-wide">Application Rejected</p>
                            <p className="text-xs text-red-500/80 mt-1">Please review admin feedback.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowFeedback(!showFeedback)}
                        className="flex items-center px-4 py-2 bg-white dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-red-100 dark:border-red-800 hover:bg-red-50 transition-colors"
                    >
                        {showFeedback ? 'Hide Report' : 'View Report'}
                        {showFeedback ? <ChevronUp size={14} className="ml-2"/> : <ChevronDown size={14} className="ml-2"/>}
                    </button>
                </div>
                
                {showFeedback && (
                    <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-800/50 animate-fade-in">
                        <div className="flex items-start space-x-4 mb-4">
                             <Mail size={16} className="text-red-400 mt-1 flex-shrink-0" />
                             <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-100 dark:border-slate-800">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Feedback</p>
                                 <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line">{user.adminFeedback || "No specific feedback provided."}</p>
                             </div>
                        </div>
                        
                        <div className="flex justify-end">
                             <button 
                                onClick={() => onNavigate(View.VERIFICATION_FORM)}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-red-700 transition-all"
                             >
                                Resubmit Application
                             </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (user.verificationStatus === 'PENDING_APPROVAL') {
      return (
        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                <Loader2 className="animate-spin" size={20} />
              </div>
              <div>
                 <p className="font-bold text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wide">Pending Review</p>
                 <p className="text-xs text-amber-600/70 mt-1">Admin is reviewing your identity.</p>
                 {currentLinkId && <p className="text-[10px] text-amber-500/60 font-mono mt-1">Link ID: {currentLinkId}</p>}
              </div>
           </div>
           
           <div className="flex flex-row items-center gap-2">
               <button 
                   onClick={handleCheckStatus}
                   className="px-4 py-2 bg-white dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-100 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 transition-colors shadow-sm"
               >
                   Check Status
               </button>
               <button 
                    onClick={handleResendLink}
                    disabled={resending}
                    className="flex items-center px-3 py-2 bg-white dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-100 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/40 transition-colors shadow-sm"
                    title="Generate a new secure link if previous one was lost"
                >
                    {resending ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                </button>
           </div>
        </div>
      );
    }

    // Default "Access Control" CTA
    return (
      <div 
        onClick={() => onNavigate(View.VERIFICATION_FORM)}
        className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-6 flex flex-col md:flex-row items-center justify-between cursor-pointer group hover:border-indigo-200 transition-all gap-4"
      >
         <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
               <Sparkles size={20} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Access Control</p>
               <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-widest mt-0.5">Verification Required for Level Up</p>
            </div>
         </div>
         <div className="flex items-center text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-indigo-900/40 text-indigo-600 px-5 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            Begin Verification <ArrowRight className="ml-2 w-3 h-3" />
         </div>
      </div>
    );
  };

  if (newLinkState) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
             <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 shadow-2xl border border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden max-w-xl w-full">
                 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-xl shadow-emerald-500/10 animate-scale-up">
                     <CheckCircle size={40} strokeWidth={3} />
                 </div>
                 
                 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Link Regenerated</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Previous link invalidated</p>
                 
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 relative">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        New Secure Link
                     </div>
                     <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono break-all mb-4 select-all p-2 bg-white dark:bg-black rounded border border-indigo-100 dark:border-indigo-900">{newLinkState.link}</p>
                     
                     <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Loader2 size={12} className="animate-spin text-indigo-500" />
                            <span>Awaiting Admin Approval</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email: {newLinkState.email}</p>
                     </div>
                 </div>
    
                 <button 
                    onClick={() => setNewLinkState(null)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                 >
                    Return to Dashboard
                 </button>
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className={`relative overflow-hidden rounded-2xl text-white shadow-xl p-6 md:p-10 ${isAdmin ? 'bg-slate-900' : 'bg-[#0f172a]'}`}>
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                    <span className="text-indigo-200 font-bold text-[10px] tracking-widest uppercase">
                        {user.isVerified || isAdmin ? 'System Active' : 'Access Limited'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                        {user.name || 'Student'}
                      </h1>
                      {user.isVerified && <BadgeCheck size={24} className="text-blue-500 fill-white dark:fill-slate-900" />}
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID: {username}</p>
              </div>
          </div>
      </div>

      {/* Admin Console Card */}
      {isAdmin && (
        <div 
          onClick={() => onNavigate(View.ADMIN_DASHBOARD)}
          className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all relative overflow-hidden group"
        >
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Admin Console</h3>
                        <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest mt-0.5">System Control & Management</p>
                    </div>
                </div>
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                    <ArrowRight size={20} />
                </div>
             </div>
        </div>
      )}

      {getVerificationUI()}

      {/* METRICS - Adjusted for straight alignment and smaller icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-indigo-600">
                    <HardDrive size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage</span>
              </div>
              <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{isAdmin ? 'Unlimited' : `${usedGB} GB`}</p>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${usedPercent}%` }} />
                  </div>
              </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-emerald-500">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security</span>
              </div>
              <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{user.totpEnabled ? 'Secured' : 'Standard'}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{user.totpEnabled ? '2FA Enabled' : 'No 2FA'}</p>
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${user.level > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-500'} dark:bg-slate-800`}>
                    <Award size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</span>
              </div>
              <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Level {user.level}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{isAdmin ? 'Admin' : user.level === 0 ? 'Guest' : user.level === 1 ? 'Student' : user.level === 2 ? 'Verified' : 'Elite'}</p>
              </div>
          </div>
      </div>

      {/* REPOSITORY LINK - Simplified & Professional */}
      <div 
        onClick={() => onNavigate(View.FILE_HUB)} 
        className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
          <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 group-hover:scale-105 transition-transform">
                <Database size={24} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Repository</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Secure file management system.</p>
              </div>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-indigo-600 transition-colors">
            <ArrowRight size={18} />
          </div>
      </div>
    </div>
  );
};
