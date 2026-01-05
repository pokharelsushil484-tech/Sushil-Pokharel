
import React, { useState, useEffect } from 'react';
import { View, ChangeRequest } from '../types';
import { ShieldAlert, Send, ArrowLeft, KeyRound, Copy, Check, Lock } from 'lucide-react';
import { SYSTEM_DOMAIN } from '../constants';

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

  // If entering via link, could auto-populate or handle differently
  // For now, we assume user is requesting recovery
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate slight delay
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
            linkId: newRecoveryId // Use linkId field to store recovery token
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 animate-fade-in">
             <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
                 <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-xl">
                     <Lock size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Appeal Submitted</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">
                     Your recovery request has been logged. Please share the generated link below with the administrator.
                 </p>
                 
                 <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl mb-8 relative group text-left">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recovery Link</p>
                     <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all select-all bg-white dark:bg-black p-3 rounded border border-slate-200 dark:border-slate-700">{recoveryLink}</p>
                     <button onClick={handleCopyLink} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-black/5 hover:bg-black/20 rounded-lg transition-all">
                        {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                     </button>
                 </div>

                 <button onClick={() => window.location.href = '/'} className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-transform">
                     Return to Login
                 </button>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Access Recovery</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Submit Appeal Form</p>
                </div>
                <button onClick={() => window.location.href = '/'} className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 dark:border-slate-700">
                    <ArrowLeft size={20} className="text-slate-400"/>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                    <ShieldAlert className="text-red-500 shrink-0" size={20} />
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">
                        Your account is currently locked due to security protocols. Please provide a valid reason for reactivation.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username / Student ID</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-sm focus:border-indigo-500 transition-all dark:text-white"
                        placeholder="Enter your ID"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apology / Explanation</label>
                    <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 transition-all resize-none dark:text-white"
                        placeholder="Please explain the situation..."
                        required
                    />
                </div>

                <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50">
                    <Send size={16} className="mr-2"/> {isProcessing ? 'Generating...' : 'Generate Recovery Link'}
                </button>
            </form>
        </div>
    </div>
  );
};
