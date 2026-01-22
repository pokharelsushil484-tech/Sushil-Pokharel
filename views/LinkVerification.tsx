import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, MapPin, Globe, Mail, Phone, Lock, RefreshCw, ChevronLeft, KeyRound, ArrowLeft, Clock, CheckCircle, XCircle, Edit2, ArrowRight } from 'lucide-react';
import { ADMIN_USERNAME, SYSTEM_DOMAIN } from '../constants';
import { storageService } from '../services/storageService';

interface LinkVerificationProps {
  linkId: string;
  onNavigate: (view: View) => void;
  currentUser: string | null;
}

const LINK_EXPIRATION_MS = 60 * 1000;
const MASTER_KEY_INTERVAL = 50000;

export const LinkVerification: React.FC<LinkVerificationProps> = ({ linkId, onNavigate, currentUser }) => {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securityInput, setSecurityInput] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [showManualVerify, setShowManualVerify] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualProcessing, setManualProcessing] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const isAdmin = currentUser === ADMIN_USERNAME;

  useEffect(() => {
    let intervalId: any;
    const fetchRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        if (match) {
            if (match.status === 'PENDING' && (Date.now() - match.createdAt > LINK_EXPIRATION_MS)) {
                setExpired(true);
            } else {
                setRequest(prev => (!prev || prev.status !== match.status ? match : prev));
                if (isAdmin || (currentUser && match.username === currentUser)) setIsUnlocked(true);
            }
        } else {
            const expiredMatch = requests.find(r => r.previousLinkIds && r.previousLinkIds.includes(linkId));
            if (expiredMatch && expiredMatch.linkId) {
                setRedirecting(true);
                window.location.replace(`/v/${expiredMatch.linkId}`);
                return;
            }
            setNotFound(true);
        }
      } else {
          setNotFound(true);
      }
      setLoading(false);
    };
    fetchRequest();
    intervalId = setInterval(fetchRequest, 2000);
    return () => clearInterval(intervalId);
  }, [linkId, isAdmin, currentUser]);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (!request) return;
      if (securityInput.trim() === request.username || securityInput.trim() === request.generatedStudentId) {
          setIsUnlocked(true);
          setSecurityError('');
      } else {
          setSecurityError('Incorrect Student ID.');
      }
  };

  const handleManualVerification = async (e: React.FormEvent) => {
      e.preventDefault();
      setManualProcessing(true);
      setSecurityError('');
      const inputId = manualId.trim();
      let targetUsername = '';
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
          const requests: ChangeRequest[] = JSON.parse(reqStr);
          const match = requests.find(r => r.generatedStudentId === inputId || r.username === inputId);
          if (match) targetUsername = match.username;
      }
      if (!targetUsername) {
           const usersStr = localStorage.getItem('studentpocket_users');
           const users = usersStr ? JSON.parse(usersStr) : {};
           if (users[inputId]) targetUsername = inputId;
           else {
               const foundUser = Object.keys(users).find(key => {
                   const u = users[key];
                   return (u.email && u.email.toLowerCase() === inputId.toLowerCase()) || 
                          (u.name && u.name.toLowerCase() === inputId.toLowerCase());
               });
               if (foundUser) targetUsername = foundUser;
           }
      }
      if (!targetUsername) {
          setSecurityError('User not found.');
          setManualProcessing(false);
          return;
      }
      const timeStep = MASTER_KEY_INTERVAL;
      const seed = Math.floor(Date.now() / timeStep);
      const currentMasterKey = Math.abs(Math.sin(seed + 1) * 1000000).toFixed(0).slice(0, 6).padEnd(6, '0');
      const dataKey = `architect_data_${targetUsername}`;
      const stored = await storageService.getData(dataKey);
      const isValid = manualCode === currentMasterKey || (stored?.user?.rescueKey && manualCode === stored.user.rescueKey) || (await storageService.validateSystemKey(manualCode));
      if (!isValid) {
          setSecurityError('Invalid Master Code.');
          setManualProcessing(false);
          return;
      }
      if (stored && stored.user) {
          stored.user.isVerified = true;
          stored.user.verificationStatus = 'VERIFIED';
          await storageService.setData(dataKey, stored);
      }
      if (reqStr) {
          const requests: ChangeRequest[] = JSON.parse(reqStr);
          const updatedRequests = requests.map(r => r.username === targetUsername ? { ...r, status: 'APPROVED' } : r);
          localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      }
      setVerificationSuccess(true);
      setManualProcessing(false);
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdmin) return;
    setActionProcessing(true);
    setTimeout(async () => {
        const dataKey = `architect_data_${request.username}`;
        const stored = await storageService.getData(dataKey);
        if (stored && stored.user) {
            stored.user.isVerified = action === 'APPROVE';
            stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
            await storageService.setData(dataKey, stored);
            const reqStr = localStorage.getItem('studentpocket_requests');
            if (reqStr) {
                const requests: ChangeRequest[] = JSON.parse(reqStr);
                const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
                localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
                const updatedReq = updatedRequests.find(r => r.id === request.id);
                if (updatedReq) setRequest(updatedReq as ChangeRequest);
            }
        }
        setActionProcessing(false);
    }, 1500);
  };

  if (redirecting) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
      <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
      <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isUnlocked) return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-slate-50 dark:bg-[#020617] py-20 px-6 overflow-y-auto">
        <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-10 sm:p-14 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-lg">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Protected Data</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">Enter your Student ID to view application details.</p>
            <form onSubmit={handleUnlock} className="space-y-6">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={securityInput} onChange={(e) => setSecurityInput(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm text-center tracking-widest uppercase focus:border-indigo-500 transition-all" placeholder="STUDENT ID" />
                </div>
                {securityError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{securityError}</p>}
                <button type="submit" className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl">Unlock Box</button>
            </form>
        </div>
    </div>
  );

  // Fix: Parse request details safely
  const details = request ? JSON.parse(request.details || '{}') : {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] py-16 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto animate-scale-up pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <ShieldCheck className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">StudentPocket</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Identity Verification Box</p>
                    </div>
                </div>
                <button onClick={() => onNavigate(isAdmin ? View.ADMIN_DASHBOARD : View.DASHBOARD)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors bg-white dark:bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                    <ArrowLeft size={14} className="mr-2"/> Return to Hub
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-2.5 ${request?.status === 'APPROVED' ? 'bg-emerald-500' : request?.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                <div className="p-10 sm:p-14 md:p-20">
                    <div className="flex flex-col md:flex-row items-start gap-16">
                        <div className="flex-shrink-0 mx-auto md:mx-0 flex flex-col items-center">
                            <div className="w-48 h-48 rounded-[3rem] bg-slate-50 dark:bg-slate-950 p-3 shadow-inner border border-slate-100 dark:border-slate-800">
                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center">
                                    {details._profileImage ? <img src={details._profileImage} className="w-full h-full object-cover" /> : <ShieldCheck size={56} className="text-indigo-500/20" />}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-12">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{details.fullName || 'Student Node'}</h2>
                                <span className={`inline-flex items-center px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${request?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                    {request?.status} Status
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Connection</p>
                                    <p className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{details.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Line</p>
                                    <p className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200">{details.phone}</p>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Permanent Residence</p>
                                    <p className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{details.permAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isAdmin && (
                    <div className="bg-slate-900 dark:bg-black p-10 sm:p-12 flex flex-col sm:flex-row gap-8 justify-between items-center border-t border-white/5">
                        <div className="flex items-center space-x-3 text-slate-500">
                            <KeyRound size={20} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Authority Panel</span>
                        </div>
                        <div className="flex w-full sm:w-auto gap-5">
                            <button onClick={() => handleAction('REJECT')} disabled={actionProcessing || request?.status !== 'PENDING'} className="flex-1 sm:px-10 py-5 rounded-2xl bg-white/5 text-red-400 border border-white/10 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500/10 transition-all disabled:opacity-20">Reject</button>
                            <button onClick={() => handleAction('APPROVE')} disabled={actionProcessing || request?.status !== 'PENDING'} className="flex-1 sm:px-12 py-5 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-20">Approve Node</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};