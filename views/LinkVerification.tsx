
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, Lock, RefreshCw, ArrowLeft, Mail, Phone, MapPin, KeyRound, AlertCircle, Terminal } from 'lucide-react';
import { ADMIN_USERNAME, SYSTEM_DOMAIN } from '../constants';
import { storageService } from '../services/storageService';

interface LinkVerificationProps {
  linkId: string;
  onNavigate: (view: View) => void;
  currentUser: string | null;
}

export const LinkVerification: React.FC<LinkVerificationProps> = ({ linkId, onNavigate, currentUser }) => {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securityInput, setSecurityInput] = useState('');
  const [securityError, setSecurityError] = useState('');

  const isAdmin = currentUser === ADMIN_USERNAME;

  useEffect(() => {
    const fetchRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        if (match) {
            setRequest(match);
            if (isAdmin || (currentUser && match.username === currentUser)) setIsUnlocked(true);
        }
      }
      setLoading(false);
    };
    fetchRequest();
  }, [linkId, isAdmin, currentUser]);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (!request) return;
      if (securityInput.trim() === request.username || securityInput.trim() === request.generatedStudentId) {
          setIsUnlocked(true);
          setSecurityError('');
      } else {
          setSecurityError('AUTHORIZATION FAILED');
      }
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdmin) return;
    setActionProcessing(true);
    const dataKey = `architect_data_${request.username}`;
    const stored = await storageService.getData(dataKey);
    if (stored && stored.user) {
        stored.user.isVerified = action === 'APPROVE';
        stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
        await storageService.setData(dataKey, stored);
        
        const reqStr = localStorage.getItem('studentpocket_requests');
        const requests: ChangeRequest[] = JSON.parse(reqStr || '[]');
        const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
        localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
        window.location.reload();
    }
    setActionProcessing(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isUnlocked) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-20 px-6">
        <div className="text-center max-w-md w-full bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 relative animate-scale-in shadow-2xl">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-10 text-white border border-white/10 shadow-inner">
                <Lock size={36} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">Secure Node Access</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-12">Identification Required</p>
            
            <form onSubmit={handleUnlock} className="space-y-8">
                <div className="relative">
                    <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                    <input 
                      type="text" 
                      value={securityInput} 
                      onChange={(e) => setSecurityInput(e.target.value)} 
                      className="w-full pl-16 pr-6 py-5 bg-black/40 border border-white/5 rounded-3xl outline-none font-bold text-center text-white tracking-[0.3em] uppercase focus:border-indigo-500 transition-all placeholder:text-slate-800 text-xs" 
                      placeholder="STUDENT ID" 
                      autoFocus
                    />
                </div>
                {securityError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-shake">{securityError}</p>}
                <button type="submit" className="w-full py-5 rounded-3xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-200 transition-all">Unlock Node</button>
            </form>
        </div>
    </div>
  );

  let details = { fullName: 'Unknown Personnel', email: 'N/A', phone: 'N/A', permAddress: 'N/A', _profileImage: null };
  try {
      const parsed = JSON.parse(request?.details || '{}');
      details = parsed.new || parsed;
  } catch (e) {
      console.error("Critical: Detail Parsing Error", e);
  }

  return (
    <div className="min-h-screen bg-black py-24 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto animate-fade-in pb-40">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-8">
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Verification Portal</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.5em] mt-2">Institutional Audit Active</p>
                    </div>
                </div>
                <button onClick={() => onNavigate(View.DASHBOARD)} className="px-8 py-3 bg-white/5 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border border-white/5 transition-all flex items-center group">
                    <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform"/> Return to Command
                </button>
            </div>

            <div className="bg-[#0a0a0a] backdrop-blur-3xl rounded-[4.5rem] shadow-2xl border border-white/10 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-2 ${request?.status === 'APPROVED' ? 'bg-emerald-500' : request?.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                
                <div className="p-12 md:p-20">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16">
                        {/* Portrait Section */}
                        <div className="relative shrink-0">
                            <div className="w-60 h-60 rounded-[4rem] bg-black p-3 border border-white/5 shadow-inner group">
                                <div className="w-full h-full rounded-[3.5rem] overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10 relative">
                                    {details._profileImage ? (
                                        <img src={details._profileImage} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Profile" />
                                    ) : (
                                        <ShieldCheck size={72} className="text-white/5" />
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                {request?.status}
                            </div>
                        </div>

                        {/* Data Matrix */}
                        <div className="flex-1 space-y-12 w-full">
                            <div className="text-center lg:text-left space-y-2">
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{details.fullName}</h2>
                                <p className="text-indigo-500 text-xs font-black uppercase tracking-[0.5em] italic">Personnel Profile Node</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-black rounded-[2.5rem] border border-white/5 space-y-2 hover:border-white/20 transition-colors">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Email</p>
                                    <div className="flex items-center text-white font-bold tracking-tight text-base">
                                        <Mail size={16} className="mr-3 text-indigo-500" />
                                        <span className="truncate">{details.email}</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-black rounded-[2.5rem] border border-white/5 space-y-2 hover:border-white/20 transition-colors">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Telecom Link</p>
                                    <div className="flex items-center text-white font-bold tracking-tight text-base">
                                        <Phone size={16} className="mr-3 text-indigo-500" />
                                        <span>{details.phone}</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-black rounded-[2.5rem] border border-white/5 space-y-2 md:col-span-2 hover:border-white/20 transition-colors">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Geographic Node</p>
                                    <div className="flex items-start text-white font-bold tracking-tight text-base">
                                        <MapPin size={16} className="mr-3 mt-1 text-indigo-500" />
                                        <span className="leading-relaxed">{details.permAddress || 'Global Infrastructure Node'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {isAdmin && (
                    <div className="bg-slate-950 p-12 flex flex-col md:flex-row gap-10 justify-between items-center border-t border-white/10">
                        <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 border border-white/10">
                                <KeyRound size={28} />
                            </div>
                            <div>
                                <span className="block text-xs font-black text-white uppercase tracking-widest">Authority Override</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Decision Node v9.2.5</span>
                            </div>
                        </div>
                        <div className="flex w-full md:w-auto gap-5">
                            <button 
                                onClick={() => handleAction('REJECT')} 
                                disabled={actionProcessing || request?.status !== 'PENDING'} 
                                className="flex-1 md:px-12 py-5 rounded-2xl bg-white/5 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-500/10 transition-all disabled:opacity-20 border border-white/5"
                            >
                                Reject Access
                            </button>
                            <button 
                                onClick={() => handleAction('APPROVE')} 
                                disabled={actionProcessing || request?.status !== 'PENDING'} 
                                className="flex-1 md:px-14 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 transition-all disabled:opacity-20"
                            >
                                Authorize Entry
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-16 flex flex-col items-center space-y-4 opacity-40 text-center">
                <div className="flex items-center space-x-3">
                   <AlertCircle size={14} className="text-slate-500" />
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Audit Logging Enabled: {SYSTEM_DOMAIN}</p>
                </div>
                <div className="bg-white/10 text-white px-4 py-1 rounded text-[8px] font-black tracking-widest uppercase">
                    Build Ref: SP-9.2.5-INST-2026
                </div>
            </div>
        </div>
    </div>
  );
};
