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
          setSecurityError('ACCESS DENIED: AUTHORIZATION FAILED');
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
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isUnlocked) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] py-32 px-6">
        <div className="text-center max-w-lg w-full bg-slate-900/60 backdrop-blur-3xl p-16 md:p-24 rounded-[4rem] shadow-2xl border border-white/5 relative group animate-scale-up">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-12 text-indigo-500 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <Lock size={44} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Secure Node Locked</h2>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] mb-14">Authorization Required</p>
            
            <form onSubmit={handleUnlock} className="space-y-10">
                <div className="relative">
                    <Terminal className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600" size={22} />
                    <input 
                      type="text" 
                      value={securityInput} 
                      onChange={(e) => setSecurityInput(e.target.value)} 
                      className="w-full pl-16 pr-8 py-6 bg-black/40 border border-white/5 rounded-[2rem] outline-none font-bold text-center text-white tracking-[0.3em] uppercase focus:border-indigo-500 transition-all placeholder:text-slate-800" 
                      placeholder="STUDENT ID" 
                      autoFocus
                    />
                </div>
                {securityError && <p className="text-[12px] font-black text-red-500 uppercase tracking-widest animate-shake">{securityError}</p>}
                <button type="submit" className="w-full py-6 rounded-[2.5rem] bg-white text-slate-950 font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 transition-all active:scale-95">Open Security Box</button>
            </form>
        </div>
    </div>
  );

  // Robust parsing of request details from the database
  let details = { fullName: 'Unknown Node', email: 'N/A', phone: 'N/A', permAddress: 'N/A', _profileImage: null };
  try {
      const parsed = JSON.parse(request?.details || '{}');
      // If it's a data change request, the info is inside the 'new' object
      details = parsed.new || parsed;
  } catch (e) {
      console.error("Critical: Detail Parsing Error", e);
  }

  return (
    <div className="min-h-screen bg-[#020617] py-32 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto animate-fade-in pb-40">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-20 gap-10">
                <div className="flex items-center space-x-8">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-indigo-500 border border-white/10 shadow-2xl">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Verification Box</h1>
                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.5em] mt-3">Node Protocol Alpha active</p>
                    </div>
                </div>
                <button onClick={() => onNavigate(View.DASHBOARD)} className="px-10 py-4 bg-white/5 text-slate-400 hover:text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] border border-white/5 transition-all flex items-center group shadow-lg">
                    <ArrowLeft size={18} className="mr-4 group-hover:-translate-x-2 transition-transform"/> Back to Console
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-2.5 ${request?.status === 'APPROVED' ? 'bg-emerald-500' : request?.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                
                <div className="p-16 md:p-28">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-24">
                        {/* Professional Portrait Section */}
                        <div className="relative shrink-0">
                            <div className="w-64 h-64 rounded-[4.5rem] bg-black/40 p-4 border border-white/5 shadow-inner group">
                                <div className="w-full h-full rounded-[3.8rem] overflow-hidden bg-slate-900 flex items-center justify-center border border-white/5 relative">
                                    {details._profileImage ? (
                                        <img src={details._profileImage} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt="Profile" />
                                    ) : (
                                        <ShieldCheck size={72} className="text-white/10" />
                                    )}
                                    <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none"></div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                {request?.status}
                            </div>
                        </div>

                        {/* Node Data Matrix */}
                        <div className="flex-1 space-y-16 w-full">
                            <div className="text-center lg:text-left space-y-2">
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{details.fullName}</h2>
                                <p className="text-indigo-500 text-sm font-black uppercase tracking-[0.5em] italic">Personnel Identifier Node</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 space-y-3 transition-colors hover:border-indigo-500/30">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Official Email</p>
                                    <div className="flex items-center text-white font-bold tracking-tight text-lg">
                                        <Mail size={18} className="mr-4 text-indigo-500" />
                                        <span className="truncate">{details.email}</span>
                                    </div>
                                </div>
                                <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 space-y-3 transition-colors hover:border-indigo-500/30">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Link</p>
                                    <div className="flex items-center text-white font-bold tracking-tight text-lg">
                                        <Phone size={18} className="mr-4 text-indigo-500" />
                                        <span>{details.phone}</span>
                                    </div>
                                </div>
                                <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 space-y-3 md:col-span-2 transition-colors hover:border-indigo-500/30">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Residency</p>
                                    <div className="flex items-start text-white font-bold tracking-tight text-lg">
                                        <MapPin size={18} className="mr-4 mt-1 text-indigo-500" />
                                        <span className="leading-relaxed">{details.permAddress || 'Global Infrastructure Node'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {isAdmin && (
                    <div className="bg-slate-950 p-12 md:p-20 flex flex-col md:flex-row gap-12 justify-between items-center border-t border-white/5">
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500">
                                <KeyRound size={32} />
                            </div>
                            <div>
                                <span className="block text-sm font-black text-white uppercase tracking-widest">Authority Override</span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Decision Console v9.2</span>
                            </div>
                        </div>
                        <div className="flex w-full md:w-auto gap-6">
                            <button 
                                onClick={() => handleAction('REJECT')} 
                                disabled={actionProcessing || request?.status !== 'PENDING'} 
                                className="flex-1 md:px-16 py-6 rounded-3xl bg-white/5 text-red-500 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-red-500/10 transition-all disabled:opacity-20 border border-white/5"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => handleAction('APPROVE')} 
                                disabled={actionProcessing || request?.status !== 'PENDING'} 
                                className="flex-1 md:px-20 py-6 rounded-3xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all disabled:opacity-20"
                            >
                                Authorize
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Log Transparency */}
            <div className="mt-16 flex items-center justify-center space-x-4 opacity-30">
                <AlertCircle size={16} className="text-slate-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">Institutional audit logging enabled for this data transaction</p>
            </div>
        </div>
    </div>
  );
};