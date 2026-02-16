
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, Lock, ArrowLeft, Mail, Phone, KeyRound, CheckCircle2, BadgeCheck, Loader2, XCircle, ShieldAlert } from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, CREATOR_NAME, APP_NAME, APP_VERSION } from '../constants';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';

interface LinkVerificationProps {
  linkId: string;
  onNavigate: (view: View) => void;
  currentUser: string | null;
}

export const LinkVerification: React.FC<LinkVerificationProps> = ({ linkId, onNavigate, currentUser }) => {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const fetchRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        if (match) setRequest(match);
      }
      setLoading(false);
    };
    fetchRequest();
  }, [linkId]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (adminUser.toUpperCase() === ADMIN_USERNAME && adminPass.toUpperCase() === ADMIN_SECRET) {
        setIsAdminAuth(true);
    } else {
        setAuthError('AUTHORITY DENIED: MASTER LOGIC MISMATCH');
    }
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdminAuth) return;
    setActionProcessing(true);
    
    const dataKey = `architect_data_${request.username.toUpperCase()}`;
    const stored = await storageService.getData(dataKey);
    
    if (stored && stored.user) {
        const targetEmail = stored.user.email;
        stored.user.isVerified = action === 'APPROVE';
        stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
        
        await storageService.setData(dataKey, stored);
        
        const reqStr = localStorage.getItem('studentpocket_requests');
        const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
        const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
        localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));

        if (action === 'APPROVE') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            // Official V19 Activation String Dispatch
            await emailService.sendInstitutionalMail(targetEmail, otpCode, 'RECOVERY_ACTIVATED', request.username);
        } else {
            // Official V19 Rejection String Dispatch
            await emailService.sendInstitutionalMail(targetEmail, "", 'RECOVERY_REJECTED', request.username);
        }
        
        alert(`NODE VERDICT: ${action === 'APPROVE' ? 'AUTHORIZED' : 'REJECTED'}. PROTOCOL SYNC COMPLETE.`);
        window.location.href = '/';
    }
    setActionProcessing(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isAdminAuth) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-20 px-6 uppercase relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black pointer-events-none opacity-50"></div>
        <div className="master-box text-center max-w-md w-full bg-[#030303] p-12 border-white/5 shadow-[0_0_120px_rgba(0,0,0,1)] animate-platinum">
            <div className="w-20 h-20 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-red-500 border border-red-500/20">
                <ShieldAlert size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter italic">Master Audit</h2>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-12">Institutional Architect Only</p>
            
            <form onSubmit={handleAdminAuth} className="space-y-6">
                <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value.toUpperCase())} className="w-full p-6 bg-black border border-white/5 rounded-2xl text-xs font-bold text-white tracking-widest uppercase outline-none focus:border-red-500/40" placeholder="ADMIN IDENTITY" required />
                <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value.toUpperCase())} className="w-full p-6 bg-black border border-white/5 rounded-2xl text-xs font-bold text-white tracking-widest uppercase outline-none focus:border-red-500/40" placeholder="MASTER SECRET" required />
                {authError && <p className="text-[9px] font-black text-red-500 tracking-widest animate-shake">{authError}</p>}
                <button type="submit" className="w-full py-6 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-slate-200 transition-all">Unlock Audit Mesh</button>
            </form>
        </div>
    </div>
  );

  let details = { fullName: 'Unknown Personnel', email: 'N/A', phone: 'N/A', _profileImage: null, institutionalTier: 'N/A', academicDomain: 'N/A' };
  try {
      details = JSON.parse(request?.details || '{}');
  } catch (e) {}

  return (
    <div className="min-h-screen bg-black py-24 px-6 uppercase relative">
        <div className="max-w-5xl mx-auto space-y-12 animate-platinum">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <ShieldCheck size={48} className="text-indigo-500" />
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">Audit Terminal V19</h1>
                </div>
                <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black border border-white/5 hover:text-white transition-all">Close Auditor</button>
            </div>

            <div className="bg-slate-900/60 rounded-[4rem] border border-white/10 p-12 md:p-20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-white to-indigo-500 opacity-20"></div>
                <div className="flex flex-col lg:flex-row gap-20 items-center lg:items-start">
                    <div className="w-80 h-80 rounded-[4rem] bg-black p-2 border border-white/10 shadow-inner group">
                        <div className="w-full h-full rounded-[3.5rem] overflow-hidden bg-slate-950 flex items-center justify-center">
                            {details._profileImage ? <img src={details._profileImage} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Node Capture" /> : <User size={100} className="text-white/5" />}
                        </div>
                    </div>
                    <div className="flex-1 space-y-12 w-full">
                        <div className="text-center lg:text-left space-y-3">
                            <h2 className="text-7xl font-black text-white tracking-tighter italic leading-none">{details.fullName}</h2>
                            <div className="flex items-center justify-center lg:justify-start gap-4">
                                <span className="px-4 py-1.5 bg-indigo-500 text-black text-[9px] font-black rounded-lg">TIER: {details.institutionalTier}</span>
                                <p className="text-indigo-400 text-xs font-black tracking-[0.6em]">NODE: {request?.generatedStudentId}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3">Target Mesh Link</p>
                                <p className="text-base font-bold text-white truncate lowercase">{details.email}</p>
                            </div>
                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3">Academic Domain</p>
                                <p className="text-base font-bold text-white uppercase">{details.academicDomain}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-20 border-t border-white/5 flex flex-col md:flex-row gap-12 justify-between items-center">
                    <div className="text-slate-500 space-y-1">
                        <span className="block text-xs font-black uppercase tracking-widest text-white italic">Protocol Verdict Required</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">Registry Audit ID: {request?.id}</span>
                    </div>
                    <div className="flex gap-6 w-full md:w-auto">
                        <button onClick={() => handleAction('REJECT')} disabled={actionProcessing || request?.status !== 'PENDING'} className="flex-1 px-12 py-6 rounded-2xl bg-red-500/10 text-red-500 font-black text-[11px] uppercase tracking-widest hover:bg-red-500/20 border border-red-500/20 disabled:opacity-20 transition-all">Decline Node</button>
                        <button onClick={() => handleAction('APPROVE')} disabled={actionProcessing || request?.status !== 'PENDING'} className="flex-1 px-14 py-6 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 disabled:opacity-20 transition-all">Authorize Personnel</button>
                    </div>
                </div>
            </div>
            <div className="text-center opacity-20">
                <p className="text-[10px] font-black text-slate-500 tracking-[1em]">{APP_VERSION}</p>
            </div>
        </div>
    </div>
  );
};
