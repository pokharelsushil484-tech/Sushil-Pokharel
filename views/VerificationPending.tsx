import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Clock, LogOut, KeyRound, ArrowRight, RefreshCw, ChevronLeft, Ticket, Trash2, LifeBuoy } from 'lucide-react';
import { APP_NAME } from '../constants';
import { storageService } from '../services/storageService';
import { View } from '../types';

interface VerificationPendingProps {
  studentId?: string;
  onLogout: () => void;
  onNavigate?: (view: View) => void;
}

export const VerificationPending: React.FC<VerificationPendingProps> = ({ studentId, onLogout, onNavigate }) => {
  const [mode, setMode] = useState<'STATUS' | 'MASTER_KEY' | 'TOKEN'>('STATUS');
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const isVerifying = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isVerifying.current) return;
      setCountdown((prev) => {
        if (prev <= 1) {
            clearInterval(timer);
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
      if (!username) { onLogout(); return; }
      await new Promise(r => setTimeout(r, 800));
      const isSystemValid = await storageService.validateSystemKey(input);
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey);
      const isPersonalValid = stored?.user?.admissionKey === input;
      if (isSystemValid || isPersonalValid) {
          if (stored && stored.user) {
              stored.user.isVerified = true;
              stored.user.verificationStatus = 'VERIFIED';
              await storageService.setData(dataKey, stored);
              window.location.reload();
          }
      } else {
          setError("INVALID KEY. PENALTY APPLIED.");
          setCountdown(prev => Math.max(0, prev - 10));
          setLoading(false);
          isVerifying.current = false;
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:justify-center py-20 px-6 relative overflow-y-auto">
      {/* Visual Depth Background */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] opacity-10 ${countdown < 10 ? 'bg-red-600' : 'bg-indigo-600'} transition-colors duration-1000`}></div>

      <div className="relative z-10 w-full max-w-xl bg-slate-900/80 backdrop-blur-3xl p-12 sm:p-16 rounded-[3.5rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] text-center">
        {mode === 'STATUS' ? (
            <div className="animate-fade-in">
                <div className="w-32 h-32 mx-auto mb-12 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 relative shadow-2xl">
                  <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${countdown < 10 ? 'border-red-500' : 'border-indigo-500'}`}></div>
                  <ShieldAlert size={56} className={countdown < 10 ? "text-red-500" : "text-indigo-400"} />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[11px] font-black px-5 py-2 rounded-full border border-white/10 shadow-xl tracking-widest">
                      {countdown}S REMAINING
                  </div>
                </div>

                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Verification Pending</h1>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] mb-14">Security Node Access Protocol</p>

                <div className="bg-slate-950/40 p-10 rounded-[2.5rem] border border-white/5 mb-14 space-y-5">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">Your application box is locked. Request is awaiting authority approval or manual key entry.</p>
                    <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Active Session ID</p>
                        <p className="font-mono text-2xl text-indigo-400 font-bold tracking-widest">{studentId || 'INIT_PENDING'}</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onLogout} className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-widest transition-all border border-white/5">Exit Session</button>
                        <button onClick={() => { setMode('MASTER_KEY'); setInputKey(''); }} className="flex-1 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30">Enter Master Key</button>
                    </div>
                    {onNavigate && (
                        <button onClick={() => onNavigate(View.SUPPORT)} className="w-full py-4 text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-[0.3em] transition-colors">Emergency Protocol Support</button>
                    )}
                </div>
            </div>
        ) : (
            <div className="animate-scale-up space-y-10">
                 <div className="flex items-center justify-between">
                     <button onClick={() => setMode('STATUS')} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors border border-white/5">
                         <ChevronLeft size={24} />
                     </button>
                     <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Authorize Entry</h2>
                     <div className="w-14"></div>
                 </div>
                 <div className="w-24 h-24 mx-auto bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                    <KeyRound size={40} />
                 </div>
                 <form onSubmit={handleUnlock} className="space-y-8">
                     <div>
                        <input type="text" value={inputKey} onChange={(e) => setInputKey(e.target.value)} className="w-full p-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-center text-white font-mono font-bold text-xl tracking-[0.4em] uppercase outline-none focus:border-indigo-500 transition-all shadow-inner" placeholder="KEY-XXXX" autoFocus />
                        {error && <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mt-4 animate-shake">{error}</p>}
                     </div>
                     <button type="submit" disabled={loading} className="w-full py-5 rounded-[2rem] bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all flex items-center justify-center shadow-xl">
                        {loading ? <RefreshCw className="animate-spin mr-2" size={18}/> : 'Submit Authorization'}
                     </button>
                 </form>
            </div>
        )}
      </div>
      <div className="absolute bottom-10 text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">{APP_NAME}</div>
    </div>
  );
};