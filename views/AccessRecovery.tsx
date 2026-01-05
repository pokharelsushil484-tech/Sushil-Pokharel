
import React, { useState } from 'react';
import { View, ChangeRequest } from '../types';
import { ShieldAlert, Send, ArrowLeft, KeyRound, Copy, Check } from 'lucide-react';

interface AccessRecoveryProps {
  onNavigate: (view: View) => void;
}

export const AccessRecovery: React.FC<AccessRecoveryProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate unique recovery ID (Master Key for this request)
    const newMasterKey = 'REC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setMasterKey(newMasterKey);

    // Save request
    const existingReqs = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    
    const request: ChangeRequest = {
        id: newMasterKey, // Use key as ID for easy lookup
        userId: username,
        username: username,
        type: 'RECOVERY',
        details: JSON.stringify({ reason, timestamp: Date.now() }),
        status: 'PENDING',
        createdAt: Date.now(),
    };
    
    existingReqs.push(request);
    localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));
    
    setSubmitted(true);
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(masterKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 animate-fade-in">
             <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
                 <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-xl">
                     <KeyRound size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Request Filed</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">
                     Your recovery request ID (Master Key) has been generated. Send this key to the administrator to receive your Admission Key.
                 </p>
                 
                 <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl mb-8 relative group">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Recovery Master Key</p>
                     <p className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-wider">{masterKey}</p>
                     <button onClick={handleCopy} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-black/5 hover:bg-black/20 rounded-lg transition-all">
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
                        Your account has been flagged for security or privacy violations. Please explain why your access should be restored.
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Appeal</label>
                    <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 transition-all resize-none dark:text-white"
                        placeholder="Explain why the block was in error..."
                        required
                    />
                </div>

                <button type="submit" className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center">
                    <Send size={16} className="mr-2"/> Submit & Generate Key
                </button>
            </form>
        </div>
    </div>
  );
};
