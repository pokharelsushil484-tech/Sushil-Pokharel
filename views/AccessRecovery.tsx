
import React, { useState } from 'react';
import { View, ChangeRequest } from '../types';
import { ShieldAlert, Send, ArrowLeft, KeyRound, Mail, Loader2, User, CheckCircle2, Lock } from 'lucide-react';
import { SYSTEM_DOMAIN, ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME, APP_NAME } from '../constants';
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
            userId: username.toUpperCase(),
            username: username.toUpperCase(),
            type: 'RECOVERY',
            details: JSON.stringify({ reason: reason.toUpperCase() }),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: newId 
        };
        existingReqs.push(request);
        localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));
        
        await emailService.sendInstitutionalMail(ADMIN_EMAIL, newId, 'RECOVERY_REQUEST', username.toUpperCase());
        setRecoveryId(newId);
        setSubmitted(true);
        setIsProcessing(false);
    }, 1200);
  };

  const handleAdminAction = async (e: React.FormEvent, action: 'APPROVE' | 'REJECT') => {
    e.preventDefault();
    setAuthError('');
    if (adminUser.toUpperCase() !== ADMIN_USERNAME || adminPass !== ADMIN_SECRET) {
        setAuthError("AUTHORITY DENIED: INCORRECT MASTER SECRET");
        return;
    }

    setIsProcessing(true);
    const reqStr = localStorage.getItem('studentpocket_requests');
    const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
    const targetReq = requests.find(r => r.linkId === recoveryId);

    if (targetReq) {
        const dataKey = `architect_data_${targetReq.username.toUpperCase()}`;
        const stored = await storageService.getData(dataKey);
        if (stored && stored.user) {
            if (action === 'APPROVE') {
                stored.user.isBanned = false;
                stored.user.integrityScore = 100;
                stored.user.verificationStatus = 'VERIFIED';
                await storageService.setData(dataKey, stored);
                await emailService.sendInstitutionalMail(stored.user.email, "", 'RECOVERY_ACTIVATED', targetReq.username);
                setIsApproved(true);
            } else {
                await emailService.sendInstitutionalMail(stored.user.email, "", 'RECOVERY_REJECTED', targetReq.username);
                alert("NODE RECOVERY REJECTED. FORMAL REJECTION DISPATCHED.");
                window.location.href = '/';
            }
        }
    } else {
        setAuthError("ERROR: RECOVERY NODE NOT FOUND IN REGISTRY");
    }
    setIsProcessing(false);
  };

  if (initialId || (submitted && recoveryId)) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-platinum uppercase">
            <div className="max-w-md w-full master-box p-12 bg-[#050505] border-white/5 space-y-12">
                {isApproved ? (
                    <div className="text-center space-y-8 animate-scale-up">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Node Restored</h2>
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.4em]">Identity Node Re-Synchronized</p>
                        <button onClick={() => window.location.href = '/'} className="btn-platinum py-4 text-xs">Return to Terminal</button>
                    </div>
                ) : (
                    <>
                    <div className="text-center">
                        <Lock className="mx-auto text-indigo-500 mb-6" size={40} />
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Master Override</h2>
                        <p className="text-[9px] text-slate-500 font-bold tracking-widest mt-2 uppercase">{CREATOR_NAME} Clearance Level Required</p>
                    </div>
                    <form className="space-y-6">
                        <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value.toUpperCase())} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-xs text-white font-black tracking-widest uppercase" placeholder="ADMIN IDENTITY" required />
                        <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-xs text-white font-black tracking-widest uppercase" placeholder="MASTER SECRET" required />
                        {authError && <p className="text-[9px] font-black text-red-500 text-center uppercase tracking-widest">{authError}</p>}
                        <div className="flex gap-4">
                            <button onClick={(e) => handleAdminAction(e, 'REJECT')} disabled={isProcessing} className="flex-1 py-4 rounded-xl bg-white/5 text-red-500 font-black text-[9px] uppercase tracking-widest border border-red-500/20">Reject Node</button>
                            <button onClick={(e) => handleAdminAction(e, 'APPROVE')} disabled={isProcessing} className="flex-1 py-4 rounded-xl bg-white text-black font-black text-[9px] uppercase tracking-widest shadow-xl">Activate Node</button>
                        </div>
                    </form>
                    </>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-platinum uppercase">
        <div className="max-w-lg w-full master-box p-12 bg-[#050505] border-white/5 space-y-12">
            <div className="text-center">
                <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Node Recovery</h1>
                <p className="text-[10px] text-slate-600 font-bold tracking-widest mt-2 uppercase">Institutional Appeal Registry</p>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-8">
                <div className="space-y-4">
                    <input type="text" value={username} onChange={e => setUsername(e.target.value.toUpperCase())} className="w-full p-5 bg-black border border-white/5 rounded-3xl text-white font-black text-xs uppercase tracking-widest" placeholder="INSERT RECOVERY IDENTITY" required />
                    <textarea value={reason} onChange={e => setReason(e.target.value.toUpperCase())} rows={4} className="w-full p-6 bg-black border border-white/5 rounded-[2rem] text-white text-sm uppercase resize-none font-medium" placeholder="STATE REASON FOR ACCESS RESTORATION..." required />
                </div>
                <button type="submit" disabled={isProcessing} className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl">
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Dispatch Appeal Node'}
                </button>
            </form>
            <button onClick={() => window.location.href = '/'} className="w-full text-[9px] font-black text-slate-700 uppercase tracking-widest text-center hover:text-white transition-colors">Abort Recovery Process</button>
        </div>
    </div>
  );
};
