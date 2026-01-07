
import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Clock, Lock, FileText, LogOut, KeyRound, ArrowRight, RefreshCw, ChevronLeft, Ticket, AlertTriangle, Zap } from 'lucide-react';
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
  const [countdown, setCountdown] = useState(30);
  const isVerifying = useRef(false);

  // Real-time countdown with Forced Logout on Expiry
  useEffect(() => {
    const timer = setInterval(() => {
      // Don't decrement if we are currently awaiting a verification response
      if (isVerifying.current) return;

      setCountdown((prev) => {
        if (prev <= 1) {
            clearInterval(timer);
            // TIMER EXPIRED: Force Login
            onLogout(); 
            return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onLogout]);

  const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputKey.trim()) return;

      isVerifying.current = true;
      setLoading(true);
      setError('');

      const input = inputKey.trim().toUpperCase();
      const username = localStorage.getItem('active_session_user');

      if (!username) {
          onLogout();
          return;
      }

      // Simulate a small network delay for "Challenge" feel
      await new Promise(r => setTimeout(r, 800));

      // 1. Check System Keys (MS-, ADM-, or TKN-)
      const isSystemValid = await storageService.validateSystemKey(input);
      
      // 2. Check Personal Admission Key / Verification Token
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey);
      const isPersonalValid = stored?.user?.admissionKey === input;

      if (isSystemValid || isPersonalValid) {
          if (stored && stored.user) {
              // Master Key Used -> Grant Access
              stored.user.isVerified = true;
              stored.user.verificationStatus = 'VERIFIED';
              stored.user.isSuspicious = false;
              stored.user.isBanned = false;
              stored.user.adminFeedback = isSystemValid ? "Verified via Master Protocol." : "Verified via Admission Key.";
              
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
               setError("Data Corruption Detected.");
               setLoading(false);
               isVerifying.current = false;
          }
      } else {
          // PENALTY SYSTEM: Incorrect Key
          setError("INVALID KEY. TIME PENALTY APPLIED (-10s).");
          setCountdown(prev => {
              const newVal = prev - 10;
              if (newVal <= 0) {
                  onLogout(); // Instant fail if penalty drains timer
                  return 0;
              }
              return newVal;
          });
          setLoading(false);
          isVerifying.current = false;
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pulse Effect */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse ${countdown < 10 ? 'bg-red-900/20' : 'bg-indigo-500/10'}`}></div>

      <div className="relative z-10 w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl text-center transition-all duration-300">
        
        {mode === 'STATUS' ? (
            <>
                <div className="w-24 h-24 mx-auto mb-8 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 relative">
                  <div className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${countdown < 10 ? 'border-red-500' : 'border-indigo-500'}`}></div>
                  <ShieldAlert size={40} className={countdown < 10 ? "text-red-500" : "text-indigo-400"} />
                  <div className="absolute -bottom-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/50">
                      {countdown}s
                  </div>
                </div>

                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Verification Required</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">Data Access Locked</p>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4 text-emerald-400">
                        <Clock size={18} />
                        <span className="text-xs font-black uppercase tracking-wider">
                           Time Remaining: {countdown}s
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        Admin verification link has been sent. Use the link to unblock all features. Alternatively, enter Master Keys below.
                    </p>
                    
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-4 ${countdown < 10 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                        {countdown < 10 ? "Session Termination Imminent" : "Enter Keys to Unblock"}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Session Reference</span>
                        <span className="font-mono text-lg text-white font-bold tracking-wider">{studentId || 'PENDING-ID'}</span>
                    </div>
                </div>

                <div className="space-y-3">
                     <button 
                        onClick={onLogout}
                        className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center border border-slate-700"
                    >
                        <LogOut size={14} className="mr-2"/> Log Out
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => { setMode('MASTER_KEY'); setInputKey(''); setError(''); }}
                            className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest flex items-center justify-center py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <KeyRound size={12} className="mr-2"/> Master / ADM
                        </button>
                        <button 
                            onClick={() => { setMode('TOKEN'); setInputKey(''); setError(''); }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center justify-center py-3 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-colors"
                        >
                            <Ticket size={12} className="mr-2"/> Master Token
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="animate-scale-up">
                 <div className="flex items-center justify-between mb-4">
                     <button onClick={() => setMode('STATUS')} className="text-slate-400 hover:text-white p-2 -ml-2">
                         <ChevronLeft size={20} />
                     </button>
                     <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                        {mode === 'MASTER_KEY' ? 'System Override' : 'Token Entry'}
                     </h2>
                     <div className="flex items-center text-[9px] font-mono text-red-500 font-bold">
                         <Clock size={10} className="mr-1"/> {countdown}s
                     </div>
                 </div>
                 
                 <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6 flex items-center justify-center animate-pulse">
                     <Zap size={18} className="text-red-500 mr-3" />
                     <div className="text-left">
                         <span className="block text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Mistakes are Penalized</span>
                         <span className="block text-[9px] text-red-500/70">-10s for invalid keys</span>
                     </div>
                 </div>

                 <div className="w-20 h-20 mx-auto mb-6 bg-emerald-900/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      {mode === 'MASTER_KEY' ? <KeyRound size={32} className="text-emerald-500" /> : <Ticket size={32} className="text-emerald-500" />}
                 </div>

                 <p className="text-[10px] text-slate-400 font-medium mb-6 leading-relaxed">
                     Required: <span className="text-white">ADM / Master / Admission Key / Master Token</span>.
                     <br/>Enter any valid key to unblock all features.
                 </p>

                 <form onSubmit={handleUnlock} className="space-y-4">
                     <input 
                        type="text" 
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-white font-mono font-bold tracking-[0.2em] uppercase focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        placeholder={mode === 'MASTER_KEY' ? "ADM- / MS- KEY" : "TKN- / ADMISSION KEY"}
                        autoFocus
                     />
                     
                     {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-shake">{error}</p>}

                     <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? <RefreshCw size={14} className="animate-spin mr-2"/> : <ArrowRight size={14} className="mr-2"/>}
                        {loading ? 'Verifying...' : 'Unblock System'}
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
