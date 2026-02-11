
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, Lock, ArrowLeft, Mail, Phone, KeyRound, CheckCircle2, XCircle, Cpu, ShieldAlert, Globe, Loader2, Copy, Check, BadgeCheck } from 'lucide-react';
import { ADMIN_USERNAME, SYSTEM_DOMAIN, ADMIN_SECRET } from '../constants';
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
  
  // Admin Login States
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const fetchRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        if (match) {
            setRequest(match);
        }
      }
      setLoading(false);
    };
    fetchRequest();
  }, [linkId]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    // Simulate high-security admin auth
    await new Promise(r => setTimeout(r, 1000));
    if (adminUser === ADMIN_USERNAME && adminPass === ADMIN_SECRET) {
        setIsAdminAuth(true);
    } else {
        setAuthError('AUTHORITY_DENIED: INVALID MASTER KEY');
    }
    setLoading(false);
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdminAuth) return;
    setActionProcessing(true);
    
    const dataKey = `architect_data_${request.username}`;
    const stored = await storageService.getData(dataKey);
    
    if (stored && stored.user) {
        const targetEmail = stored.user.email;
        const targetUsername = request.username;

        stored.user.isVerified = action === 'APPROVE';
        stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
        
        await storageService.setData(dataKey, stored);
        
        // Update request status in local storage
        const reqStr = localStorage.getItem('studentpocket_requests');
        const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
        const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
        localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));

        if (action === 'APPROVE') {
            // DISPATCH: The specific formal TFA Confirmation requested
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await emailService.sendInstitutionalMail(targetEmail, otpCode, 'TFA_CONFIRMATION', targetUsername);
        }
        
        alert(`IDENTITY NODE ${action === 'APPROVE' ? 'AUTHORIZED' : 'REJECTED'}. Dispatching Formal Notification.`);
        window.location.href = '/';
    }
    setActionProcessing(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isAdminAuth) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black pointer-events-none opacity-50"></div>
        
        <div className="relative z-10 text-center max-w-md w-full bg-[#0a0a0a] p-12 rounded-[4rem] border border-white/10 shadow-2xl animate-scale-up">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-black shadow-[0_0_50px_rgba(255,255,255,0.1)] transform -rotate-12">
                <Lock size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Security Check</h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-0.5em mb-12">Login to View Node Details</p>
            
            <form onSubmit={handleAdminAuth} className="space-y-6">
                <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-black border border-white/5 rounded-3xl outline-none text-xs font-bold text-white tracking-widest uppercase focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="ADMIN IDENTITY" required />
                </div>
                <div className="relative group">
                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-black border border-white/5 rounded-3xl outline-none text-xs font-bold text-white tracking-widest uppercase focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="MASTER KEY" required />
                </div>
                {authError && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-shake">{authError}</p>}
                <button type="submit" className="w-full py-6 rounded-3xl bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-slate-200 transition-all active:scale-95">Verify & View Details</button>
            </form>
        </div>
    </div>
  );

  let details = { fullName: 'Unknown Personnel', email: 'N/A', phone: 'N/A', permAddress: 'N/A', _profileImage: null };
  try {
      const parsed = JSON.parse(request?.details || '{}');
      details = parsed;
  } catch (e) {
      console.error("Critical Detail Sync Error", e);
  }

  return (
    <div className="min-h-screen bg-black py-24 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto animate-fade-in pb-40">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-8">
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-2xl">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Identity Audit</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">Authenticated Review Mode</p>
                    </div>
                </div>
                <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-white/5 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/5 transition-all flex items-center group">
                    <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Close Session
                </button>
            </div>

            <div className="bg-[#0a0a0a] backdrop-blur-3xl rounded-[4.5rem] shadow-2xl border border-white/10 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-2 ${request?.status === 'APPROVED' ? 'bg-emerald-500' : request?.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                
                <div className="p-12 md:p-20">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16">
                        <div className="relative shrink-0">
                            <div className="w-64 h-64 rounded-[4rem] bg-black p-3 border border-white/5 shadow-inner">
                                <div className="w-full h-full rounded-[3.5rem] overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
                                    {details._profileImage ? (
                                        <img src={details._profileImage} className="w-full h-full object-cover" alt="Biometric" />
                                    ) : (
                                        <ShieldCheck size={72} className="text-white/5" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-10 w-full">
                            <div className="text-center lg:text-left space-y-2">
                                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase italic">{details.fullName}</h2>
                                <p className="text-indigo-500 text-xs font-black uppercase tracking-[0.5em] italic">Assigned Node: {request?.generatedStudentId}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-2">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Institutional Email</p>
                                    <div className="flex items-center text-white font-bold text-sm">
                                        <Mail size={16} className="mr-3 text-indigo-500" />
                                        <span className="truncate">{details.email}</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-2">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Phone Record</p>
                                    <div className="flex items-center text-white font-bold text-sm">
                                        <Phone size={16} className="mr-3 text-indigo-500" />
                                        <span>{details.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-950 p-12 flex flex-col md:flex-row gap-8 justify-between items-center border-t border-white/10">
                    <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 border border-white/10">
                            <BadgeCheck size={28} />
                        </div>
                        <div>
                            <span className="block text-xs font-black text-white uppercase tracking-widest">Admin Clearance</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Authorize Node Identity</span>
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <button 
                            onClick={() => handleAction('REJECT')} 
                            disabled={actionProcessing || request?.status !== 'PENDING'} 
                            className="flex-1 md:px-10 py-5 rounded-2xl bg-white/5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all border border-red-500/20 disabled:opacity-20"
                        >
                            Reject Identity
                        </button>
                        <button 
                            onClick={() => handleAction('APPROVE')} 
                            disabled={actionProcessing || request?.status !== 'PENDING'} 
                            className="flex-1 md:px-12 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 transition-all disabled:opacity-20"
                        >
                            Authorize & Notify Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
