
import React, { useState, useEffect } from 'react';
import { View, ChangeRequest } from '../types';
import { ShieldAlert, Send, ArrowLeft, KeyRound, Mail, Loader2, User, CheckCircle2, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { SYSTEM_DOMAIN, ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME, APP_NAME } from '../constants';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';

interface AccessRecoveryProps {
  onNavigate: (view: View) => void;
  recoveryId?: string | null;
}

export const AccessRecovery: React.FC<AccessRecoveryProps> = ({ onNavigate, recoveryId: initialId }) => {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [recoveryId, setRecoveryId] = useState(initialId || '');
  
  // Reset Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [requestNode, setRequestNode] = useState<ChangeRequest | null>(null);

  // Admin Verification State (for Reset Portal access)
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (initialId) {
        const reqStr = localStorage.getItem('studentpocket_requests');
        const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
        const match = requests.find(r => r.linkId === initialId);
        if (match) setRequestNode(match);
    }
  }, [initialId]);

  const handleIntakeSubmit = (e: React.FormEvent) => {
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
            details: JSON.stringify({ reason: 'ACCESS_KEY_RECOVERY_V23' }),
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

  const handleResetSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
          setAuthError("PROTOCOL ERROR: PASSWORDS DO NOT MATCH");
          return;
      }
      if (!requestNode) return;

      setIsProcessing(true);
      const userStoreStr = localStorage.getItem('studentpocket_users');
      const users = JSON.parse(userStoreStr || '{}');
      
      if (users[requestNode.username]) {
          users[requestNode.username].password = newPassword.toUpperCase();
          localStorage.setItem('studentpocket_users', JSON.stringify(users));
          
          // Update request status to APPROVED (Completed)
          const reqStr = localStorage.getItem('studentpocket_requests');
          const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
          const updated = requests.map(r => r.id === requestNode.id ? { ...r, status: 'APPROVED' } : r);
          localStorage.setItem('studentpocket_requests', JSON.stringify(updated));

          setResetSuccess(true);
      } else {
          setAuthError("IDENTITY ERROR: NODE NOT FOUND IN MASTER STORE");
      }
      setIsProcessing(false);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser.toUpperCase() === ADMIN_USERNAME && adminPass === ADMIN_SECRET) {
        setIsAdminAuth(true);
    } else {
        setAuthError("AUTHORITY DENIED: MASTER LOGIC MISMATCH");
    }
  };

  // State: Reset Link Portal
  if (initialId) {
      if (resetSuccess) {
          return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 uppercase">
                <div className="master-box p-12 text-center bg-slate-900/60 border-emerald-500/20 shadow-2xl animate-scale-up">
                    <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-8" />
                    <h2 className="text-2xl font-black text-white italic">Identity Restored</h2>
                    <p className="text-[10px] text-slate-500 tracking-widest mt-2 mb-10">Secret access key synchronized</p>
                    <button onClick={() => window.location.href = '/'} className="btn-platinum py-5 text-[10px]">Access Gateway</button>
                </div>
            </div>
          );
      }

      if (!isAdminAuth) {
          return (
              <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 uppercase">
                  <div className="master-box p-12 text-center max-w-md w-full bg-[#050505] border-white/5 space-y-10">
                      <Lock size={48} className="mx-auto text-indigo-500" />
                      <h2 className="text-2xl font-black text-white italic">Audit Required</h2>
                      <p className="text-[9px] text-slate-600 tracking-widest uppercase">Approving Authority Authorization</p>
                      <form onSubmit={handleAdminAuth} className="space-y-4">
                          <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value.toUpperCase())} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-xs text-white uppercase font-black" placeholder="ADMIN IDENTITY" required />
                          <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-xs text-white uppercase font-black" placeholder="MASTER SECRET" required />
                          {authError && <p className="text-[9px] text-red-500 font-bold">{authError}</p>}
                          <button type="submit" className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black tracking-widest">Verify Authority</button>
                      </form>
                  </div>
              </div>
          );
      }

      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 uppercase">
            <div className="master-box p-12 max-w-lg w-full bg-[#050505] border-indigo-500/30 space-y-12 shadow-2xl animate-platinum">
                <div className="text-center">
                    <RefreshCw size={48} className="mx-auto text-indigo-400 mb-6 animate-spin-slow" />
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">Restore Identity</h2>
                    <p className="text-[9px] text-slate-500 tracking-widest mt-2 uppercase">Personnel Node: {requestNode?.username}</p>
                </div>
                <form onSubmit={handleResetSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-6 bg-black border border-white/5 rounded-2xl text-white font-black text-xs tracking-[0.5em] text-center" placeholder="NEW SECRET KEY" required />
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-6 bg-black border border-white/5 rounded-2xl text-white font-black text-xs tracking-[0.5em] text-center" placeholder="RE-ENTER SECRET KEY" required />
                    </div>
                    {authError && <p className="text-[10px] text-red-500 font-black text-center tracking-widest">{authError}</p>}
                    <button type="submit" disabled={isProcessing} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all">
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Identity Re-Sync'}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // State: Intake Submission
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-platinum uppercase">
        <div className="max-w-lg w-full master-box p-12 bg-[#050505] border-white/5 space-y-12">
            {submitted ? (
                <div className="text-center space-y-8 animate-scale-up">
                    <CheckCircle2 size={64} className="text-indigo-500 mx-auto" />
                    <h2 className="text-2xl font-black text-white italic">Appeal Logged</h2>
                    <p className="text-sm text-slate-500 font-medium normal-case tracking-normal">Your recovery request has been submitted to the Master Architect. You will receive an official reset link upon authorization.</p>
                    <button onClick={() => window.location.href = '/'} className="btn-platinum py-5 text-[10px]">Return to Terminal</button>
                </div>
            ) : (
                <>
                <div className="text-center">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Identity Recovery</h1>
                    <p className="text-[10px] text-slate-600 font-bold tracking-widest mt-2 uppercase">Institutional Restoration Registry</p>
                </div>
                <form onSubmit={handleIntakeSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Personnel Identity Node</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value.toUpperCase())} className="w-full p-5 bg-black border border-white/5 rounded-3xl text-white font-black text-xs uppercase tracking-widest" placeholder="ENTER IDENTITY KEY" required />
                    </div>
                    {authError && <p className="text-[9px] text-red-500 font-black text-center">{authError}</p>}
                    <button type="submit" disabled={isProcessing} className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl">
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Request Restoration Token'}
                    </button>
                </form>
                <button onClick={() => window.location.href = '/'} className="w-full text-[9px] font-black text-slate-700 uppercase tracking-widest text-center hover:text-white transition-colors">Abort Recovery Process</button>
                </>
            )}
        </div>
    </div>
  );
};
