
import React, { useState } from 'react';
import { ShieldAlert, Clock, Lock, FileText, LogOut, KeyRound, ArrowRight, RefreshCw, ChevronLeft, Ticket } from 'lucide-react';
import { APP_NAME } from '../constants';
import { storageService } from '../services/storageService';

interface VerificationPendingProps {
  studentId?: string;
  onLogout: () => void;
}

export const VerificationPending: React.FC<VerificationPendingProps> = ({ studentId, onLogout }) => {
  const [mode, setMode] = useState<'STATUS' | 'MASTER_KEY' | 'TOKEN'>('STATUS');
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputKey.trim()) return;

      setLoading(true);
      setError('');

      const input = inputKey.trim().toUpperCase();
      const username = localStorage.getItem('active_session_user');

      if (!username) {
          setError("Session expired. Please re-login.");
          setLoading(false);
          return;
      }

      // 1. Check System Keys (MS-, ADM-, or TKN-)
      const isSystemValid = await storageService.validateSystemKey(input);
      
      // 2. Check Personal Admission Key / Verification Token
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey);
      const isPersonalValid = stored?.user?.admissionKey === input;

      if (isSystemValid || isPersonalValid) {
          if (stored && stored.user) {
              // Update User Profile
              stored.user.isVerified = true;
              stored.user.verificationStatus = 'VERIFIED';
              stored.user.isSuspicious = false;
              stored.user.isBanned = false;
              stored.user.adminFeedback = isSystemValid ? "Verified via System Key." : "Verified via Token.";
              
              // Clear Key if it was one-time (Personal)
              if (isPersonalValid) {
                  // Optional: stored.user.admissionKey = undefined; 
              }

              // Remove negative badges
              if (stored.user.badges) {
                  stored.user.badges = stored.user.badges.filter((b: string) => b !== 'SUSPICIOUS' && b !== 'DANGEROUS');
              }
              
              await storageService.setData(dataKey, stored);

              // Update Requests
              const reqStr = localStorage.getItem('studentpocket_requests');
              if (reqStr) {
                  const requests = JSON.parse(reqStr);
                  const updatedRequests = requests.map((r: any) => 
                      (r.username === username && r.status === 'PENDING') ? { ...r, status: 'APPROVED' } : r
                  );
                  localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
              }

              // Update Auth Registry
              const usersStr = localStorage.getItem('studentpocket_users');
              if (usersStr) {
                  const users = JSON.parse(usersStr);
                  if (users[username]) {
                      users[username].verified = true;
                      localStorage.setItem('studentpocket_users', JSON.stringify(users));
                  }
              }

              window.location.reload();
          } else {
               setError("Data corruption error.");
               setLoading(false);
          }
      } else {
          setError("Invalid Key or Token.");
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pulse Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative z-10 w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl text-center transition-all duration-300">
        
        {mode === 'STATUS' ? (
            <>
                <div className="w-24 h-24 mx-auto mb-8 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <ShieldAlert size={40} className="text-indigo-400" />
                </div>

                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Verification In Progress</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">System Security Scan Active</p>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4 text-emerald-400">
                        <Clock size={18} />
                        <span className="text-xs font-black uppercase tracking-wider">Est. Time: 30 Seconds</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                        Your data is currently undergoing a strict privacy review. During this time, access to the dashboard is <span className="text-white font-bold">BLOCKED</span> to prevent unauthorized data leakage.
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Reference ID</span>
                        <span className="font-mono text-lg text-white font-bold tracking-wider">{studentId || 'PENDING-ID'}</span>
                    </div>
                </div>

                <div className="space-y-3">
                     <button 
                        onClick={onLogout}
                        className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center border border-slate-700"
                    >
                        <LogOut size={14} className="mr-2"/> Sign Out & Wait
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => { setMode('MASTER_KEY'); setInputKey(''); }}
                            className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest flex items-center justify-center py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <KeyRound size={12} className="mr-2"/> Master Key
                        </button>
                        <button 
                            onClick={() => { setMode('TOKEN'); setInputKey(''); }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center justify-center py-3 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-colors"
                        >
                            <Ticket size={12} className="mr-2"/> Use Token
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="animate-scale-up">
                 <div className="flex items-center justify-between mb-6">
                     <button onClick={() => setMode('STATUS')} className="text-slate-400 hover:text-white p-2 -ml-2">
                         <ChevronLeft size={20} />
                     </button>
                     <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                        {mode === 'MASTER_KEY' ? 'Administrative Override' : 'Verification Token'}
                     </h2>
                     <div className="w-8"></div>
                 </div>

                 <div className="w-20 h-20 mx-auto mb-6 bg-emerald-900/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      {mode === 'MASTER_KEY' ? <KeyRound size={32} className="text-emerald-500" /> : <Ticket size={32} className="text-emerald-500" />}
                 </div>

                 <p className="text-[10px] text-slate-400 font-medium mb-6 leading-relaxed">
                     {mode === 'MASTER_KEY' 
                        ? 'Enter a valid Master Key (MS-), Admission Key (ADM-), or Master Token (TKN-).' 
                        : 'Enter the verification token received via email/link.'}
                 </p>

                 <form onSubmit={handleUnlock} className="space-y-4">
                     <input 
                        type="text" 
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-white font-mono font-bold tracking-[0.2em] uppercase focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        placeholder={mode === 'MASTER_KEY' ? "MASTER KEY / TOKEN" : "ENTER TOKEN"}
                        autoFocus
                     />
                     
                     {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-shake">{error}</p>}

                     <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? <RefreshCw size={14} className="animate-spin mr-2"/> : <ArrowRight size={14} className="mr-2"/>}
                        {loading ? 'Verifying...' : 'Unlock Account'}
                     </button>
                 </form>
            </div>
        )}
      </div>
      
      <div className="absolute bottom-8 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
        {APP_NAME} Security Protocol
      </div>
    </div>
  );
};
