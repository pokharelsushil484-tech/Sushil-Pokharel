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
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${countdown < 10 ? 'bg-red-600' : 'bg-indigo-600'}`}></div>

      <div className="relative z-10 w-full max-w-lg bg-slate-900/90 backdrop-blur-3xl p-10 sm:p-14 rounded-[3rem] border border-white/10 shadow-2xl text-center">
        {mode === 'STATUS' ? (
            <div className="animate-fade-in">
                <div className="w-28 h-28 mx-auto mb-10 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 relative shadow-2xl">
                  <div className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${countdown < 10 ? 'border-red-500' : 'border-indigo-500'}`}></div>
                  <ShieldAlert size={48} className={countdown < 10 ? "text-red-500" : "text-indigo-400"} />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                      {countdown}S
                  </div>
                </div>

                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Verification Pending</h1>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-12">Security Access Protocol</p>

                <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 mb-10 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">Your request is currently in the queue. You can unlock instantly using a Master Key.</p>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Session Node ID</p>
                        <p className="font-mono text-xl text-indigo-400 font-bold tracking-widest">{studentId || 'PENDING'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <button onClick={onLogout} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5">Log Out</button>
                        <button onClick={() => { setMode('MASTER_KEY'); setInputKey(''); }} className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">Master Key</button>
                    </div>
                    {onNavigate && (
                        <button onClick={() => onNavigate(View.SUPPORT)} className="w-full py-4 text-[9px] font-black text-slate-600 hover:text-slate-300 uppercase tracking-[0.3em] transition-colors">Emergency Support</button>
                    )}
                </div>
            </div>
        ) : (
            <div className="animate-scale-up space-y-8">
                 <div className="flex items-center justify-between">
                     <button onClick={() => setMode('STATUS')} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
                         <ChevronLeft size={20} />
                     </button>
                     <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Enter Key</h2>
                     <div className="w-10"></div>
                 </div>
                 <div className="w-20 h-20 mx-auto bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <KeyRound size={32} />
                 </div>
                 <form onSubmit={handleUnlock} className="space-y-6">
                     <input type="text" value={inputKey} onChange={(e) => setInputKey(e.target.value)} className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl text-center text-white font-mono font-bold tracking-[0.4em] uppercase outline-none focus:border-indigo-500 transition-all" placeholder="KEY-XXXX" autoFocus />
                     {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>}
                     <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all flex items-center justify-center">
                        {loading ? <RefreshCw className="animate-spin mr-2" size={16}/> : 'Authorize Access'}
                     </button>
                 </form>
            </div>
        )}
      </div>
      <div className="absolute bottom-10 text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">{APP_NAME}</div>
    </div>
  );
};