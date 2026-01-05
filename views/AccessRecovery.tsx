
import React, { useState, useEffect } from 'react';
import { View, ChangeRequest } from '../types';
import { ShieldAlert, Send, ArrowLeft, KeyRound, Copy, Check, Lock, Mail } from 'lucide-react';
import { SYSTEM_DOMAIN, ADMIN_EMAIL } from '../constants';

interface AccessRecoveryProps {
  onNavigate: (view: View) => void;
  initialRecoveryId?: string | null;
}

export const AccessRecovery: React.FC<AccessRecoveryProps> = ({ onNavigate, initialRecoveryId }) => {
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [recoveryId, setRecoveryId] = useState('');
  const [recoveryLink, setRecoveryLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
        // Generate unique recovery ID 
        const newRecoveryId = Math.random().toString(36).substring(2, 9).toUpperCase();
        setRecoveryId(newRecoveryId);
        
        const link = `www.${SYSTEM_DOMAIN}/recovery/${newRecoveryId}`;
        setRecoveryLink(link);

        // Save request
        const existingReqs = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
        
        const request: ChangeRequest = {
            id: 'REC-' + Date.now(),
            userId: username,
            username: username,
            type: 'RECOVERY',
            details: JSON.stringify({ reason, timestamp: Date.now() }),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: newRecoveryId 
        };
        
        existingReqs.push(request);
        localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));
        
        setSubmitted(true);
        setIsProcessing(false);
    }, 1500);
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(recoveryLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>

             <div className="relative z-10 w-full max-w-lg text-center">
                 <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)] animate-scale-up">
                     <Lock size={40} className="text-amber-500" />
                 </div>
                 
                 <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Request Logged</h2>
                 <p className="text-sm text-slate-400 mb-10 font-medium leading-relaxed max-w-sm mx-auto">
                     Your appeal has been generated. You must now contact the administrator to receive your unlocking keys.
                 </p>
                 
                 <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 mb-8 backdrop-blur-md">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Step 1: Copy Link</p>
                     <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 bg-black/40 p-4 rounded-xl border border-white/10 font-mono text-sm text-indigo-400 select-all truncate">
                            {recoveryLink}
                        </div>
                        <button onClick={handleCopyLink} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white">
                            {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20}/>}
                        </button>
                     </div>

                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Step 2: Send to Admin</p>
                     <a href={`mailto:${ADMIN_EMAIL}?subject=Unlock Request for ${username}&body=Recovery Link: ${recoveryLink}`} 
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center group">
                        <Mail size={16} className="mr-3 group-hover:scale-110 transition-transform"/> Email Administrator
                     </a>
                 </div>

                 <button onClick={() => window.location.href = '/'} className="text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-colors">
                     Back to Login
                 </button>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg">
            <div className="mb-8 flex items-center justify-between">
                <button onClick={() => window.location.href = '/'} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-white">
                    <ArrowLeft size={20}/>
                </button>
                <div className="text-right">
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Access Recovery</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Security Appeal Protocol</p>
                </div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start gap-4">
                        <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                        <p className="text-xs text-red-200 leading-relaxed font-medium">
                            Your account is locked. Submitting this form does not guarantee access. You must verify your identity with the admin.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Student ID / Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-5 bg-black/40 border border-white/10 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                            placeholder="Enter Identity"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Reason for Appeal</label>
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full p-5 bg-black/40 border border-white/10 rounded-2xl outline-none font-medium text-sm focus:border-indigo-500 transition-all resize-none text-white placeholder:text-slate-600"
                            placeholder="Why should the admin unlock your account?"
                            required
                        />
                    </div>

                    <button type="submit" disabled={isProcessing} className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50">
                        <Send size={16} className="mr-3"/> {isProcessing ? 'Processing...' : 'Generate Request'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};
