
import React, { useState, useEffect } from 'react';
import { View, ChangeRequest, UserProfile } from '../types';
import { ShieldAlert, Send, ArrowLeft, KeyRound, Copy, Check, Lock, Mail, Loader2, User, CheckCircle2 } from 'lucide-react';
import { SYSTEM_DOMAIN, ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME } from '../constants';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';

interface AccessRecoveryProps {
  onNavigate: (view: View) => void;
  recoveryId?: string | null;
}

export const AccessRecovery: React.FC<AccessRecoveryProps> = ({ onNavigate, recoveryId: initialId }) => {
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [recoveryId, setRecoveryId] = useState(initialId || '');
  
  // Admin Approval States
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const newId = Math.random().toString(36).substring(2, 9).toUpperCase();
    
    setTimeout(async () => {
        const existingReqs = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
        const request: ChangeRequest = {
            id: 'REC-' + Date.now(),
            userId: username,
            username: username,
            type: 'RECOVERY',
            details: JSON.stringify({ reason }),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: newId 
        };
        existingReqs.push(request);
        localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));
        
        await emailService.sendInstitutionalMail(ADMIN_EMAIL, newId, 'RECOVERY_REQUEST', username);
        setRecoveryId(newId);
        setSubmitted(true);
        setIsProcessing(false);
    }, 1200);
  };

  const handleAdminApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (adminUser !== ADMIN_USERNAME || adminPass !== ADMIN_SECRET) {
        setAuthError("AUTHORITY DENIED: INCORRECT MASTER CREDENTIALS");
        return;
    }

    setIsProcessing(true);
    const reqStr = localStorage.getItem('studentpocket_requests');
    const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
    const targetReq = requests.find(r => r.linkId === recoveryId);

    if (targetReq) {
        const dataKey = `architect_data_${targetReq.username}`;
        const stored = await storageService.getData(dataKey);
        if (stored && stored.user) {
            stored.user.isBanned = false;
            stored.user.violationCount = 0;
            stored.user.verificationStatus = 'VERIFIED';
            await storageService.setData(dataKey, stored);
            
            // Update request status
            const updated = requests.map(r => r.linkId === recoveryId ? { ...r, status: 'APPROVED' as const } : r);
            localStorage.setItem('studentpocket_requests', JSON.stringify(updated));
            
            setIsApproved(true);
        }
    } else {
        setAuthError("ERROR: RECOVERY NODE NOT FOUND");
    }
    setIsProcessing(false);
  };

  if (initialId) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-platinum">
            <div className="max-w-md w-full master-box p-12 bg-[#050505] border-white/5 space-y-12">
                {isApproved ? (
                    <div className="text-center space-y-8 animate-scale-up">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic">Node Restored</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Access keys have been re-synchronized.</p>
                        <button onClick={() => window.location.href = '/'} className="btn-platinum py-4 text-xs">Return to Terminal</button>
                    </div>
                ) : (
                    <>
                    <div className="text-center">
                        <Lock className="mx-auto text-indigo-500 mb-6" size={40} />
                        <h2 className="text-2xl font-black text-white uppercase italic">Master Unlock</h2>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">Admin Approval Required</p>
                    </div>
                    <form onSubmit={handleAdminApproval} className="space-y-6">
                        <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-xs text-white font-bold tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="ADMIN USERNAME" required />
                        <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-xs text-white font-bold tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="MASTER SECRET" required />
                        {authError && <p className="text-[9px] font-black text-red-500 text-center uppercase tracking-widest">{authError}</p>}
                        <button type="submit" disabled={isProcessing} className="w-full py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.4em]">
                            {isProcessing ? 'Processing...' : 'Authorize Restoration'}
                        </button>
                    </form>
                    </>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-platinum">
        <div className="max-w-lg w-full master-box p-12 bg-[#050505] border-white/5 space-y-12">
            {submitted ? (
                <div className="text-center space-y-10 animate-fade-in">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-500 border border-indigo-500/20">
                        <Mail size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase italic">Appeal Dispatched</h2>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Your recovery letter has been sent to **{CREATOR_NAME}**. Please await an email confirmation.
                        </p>
                    </div>
                    <button onClick={() => window.location.href = '/'} className="btn-platinum py-5 text-xs">Back to Home</button>
                </div>
            ) : (
                <>
                <div className="text-center">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Access Appeal</h1>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] mt-2">Identity Restoration Form</p>
                </div>
                <form onSubmit={handleUserSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-black border border-white/5 rounded-3xl text-white font-bold text-xs uppercase outline-none focus:border-indigo-500 transition-all" placeholder="YOUR IDENTITY NODE" required />
                        </div>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} className="w-full p-6 bg-black border border-white/5 rounded-[2rem] text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none" placeholder="Reason for restoration appeal..." required />
                    </div>
                    <button type="submit" disabled={isProcessing} className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 transition-all">
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Commit Appeal Dispatch'}
                    </button>
                </form>
                </>
            )}
        </div>
    </div>
  );
};
