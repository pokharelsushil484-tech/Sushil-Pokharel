
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, MapPin, Globe, Mail, Phone, Video, CheckCircle, XCircle, Home, Lock, RefreshCw, Search, LayoutGrid } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';
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
  const [notFound, setNotFound] = useState(false);

  const isAdmin = currentUser === ADMIN_USERNAME;

  // Initial Load
  useEffect(() => {
    const loadRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        if (match) {
            setRequest(match);
        } else {
            setNotFound(true);
        }
      } else {
          setNotFound(true);
      }
      setLoading(false);
    };
    loadRequest();
  }, [linkId]);

  // Real-time Status Polling
  useEffect(() => {
    if (!request || notFound) return;

    const interval = setInterval(() => {
        const reqStr = localStorage.getItem('studentpocket_requests');
        if (reqStr) {
            const requests: ChangeRequest[] = JSON.parse(reqStr);
            const match = requests.find(r => r.id === request.id);
            // If status changed, update local state
            if (match && match.status !== request.status) {
                setRequest(match);
            }
        }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [request, notFound]);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdmin) return;
    
    setActionProcessing(true);
    
    // Simulate API/Storage delay
    setTimeout(async () => {
        const dataKey = `architect_data_${request.username}`;
        const stored = await storageService.getData(dataKey);
        
        if (stored && stored.user) {
            stored.user.isVerified = action === 'APPROVE';
            stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
            await storageService.setData(dataKey, stored);
            
            // Update request status
            const reqStr = localStorage.getItem('studentpocket_requests');
            if (reqStr) {
                const requests: ChangeRequest[] = JSON.parse(reqStr);
                const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
                localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
            }
            
            await storageService.logActivity({
                actor: ADMIN_USERNAME,
                targetUser: request.username,
                actionType: 'ADMIN',
                description: `Link Verification ${action}: ${request.username}`,
                metadata: JSON.stringify({ requestId: request.id, linkId })
            });
        }

        setRequest(prev => prev ? ({ ...prev, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }) : null);
        alert(`Verification ${action === 'APPROVE' ? 'Approved' : 'Rejected'} Successfully.`);
        
        onNavigate(View.ADMIN_DASHBOARD);
        setActionProcessing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
          <div className="flex flex-col items-center space-y-4">
             <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Authenticating Secure Link...</p>
          </div>
      </div>
    );
  }

  if (notFound || !request) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
            <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-inner">
                    <Search size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Link Expired or Invalid</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    We couldn't retrieve the data for Link ID: <br/><span className="font-mono text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded mt-1 inline-block">{linkId}</span>
                </p>
                
                {isAdmin ? (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl mb-8 text-left border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-[11px] text-indigo-800 dark:text-indigo-400 font-semibold leading-relaxed">
                            Admin Notification: This link is no longer active. It may have been regenerated by the user or deleted. Please check the Requests panel for the latest active applications.
                        </p>
                    </div>
                ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl mb-8 text-left border border-amber-100 dark:border-amber-900/30">
                        <p className="text-[11px] text-amber-800 dark:text-amber-500 font-semibold leading-relaxed">
                            If you are the student, please log in to your dashboard and generate a new verification link.
                        </p>
                    </div>
                )}

                {isAdmin ? (
                    <button onClick={() => onNavigate(View.ADMIN_DASHBOARD)} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                        <LayoutGrid size={14} className="mr-2"/> Go to Admin Console
                    </button>
                ) : (
                    <button onClick={() => window.location.href = '/'} className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg">
                        <Home size={14} className="mr-2"/> Return Home
                    </button>
                )}
            </div>
        </div>
    );
  }

  const details = JSON.parse(request.details);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-3xl mx-auto">
            {/* Brand Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <ShieldCheck className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">StudentPocket</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verification for this Account</p>
                    </div>
                </div>
                {currentUser ? (
                    <button onClick={() => onNavigate(isAdmin ? View.ADMIN_DASHBOARD : View.DASHBOARD)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        {isAdmin ? 'Admin Console' : 'Dashboard'}
                    </button>
                ) : (
                    <button onClick={() => window.location.href = '/'} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">Login</button>
                )}
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-all duration-500">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                    request.status === 'APPROVED' ? 'bg-emerald-500' :
                    request.status === 'REJECTED' ? 'bg-red-500' :
                    'bg-amber-500'
                }`}></div>
                
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-start gap-10">
                        {/* Avatar Column */}
                        <div className="flex-shrink-0 mx-auto md:mx-0 flex flex-col items-center">
                            <div className="w-40 h-40 rounded-[2rem] bg-slate-50 dark:bg-slate-950 p-2 shadow-inner border border-slate-100 dark:border-slate-800">
                                <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-white dark:bg-slate-800 relative">
                                    {details._profileImage ? (
                                        <img src={details._profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={48}/></div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm flex items-center ${
                                    request.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400' :
                                    request.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' :
                                    'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400'
                                }`}>
                                    {request.status === 'PENDING' && <RefreshCw size={10} className="mr-2 animate-spin"/>}
                                    {request.status === 'APPROVED' && <CheckCircle size={10} className="mr-2"/>}
                                    {request.status === 'REJECTED' && <XCircle size={10} className="mr-2"/>}
                                    {request.status}
                                </div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="flex-1 w-full">
                            <div className="mb-8 text-center md:text-left">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{details.fullName}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start">
                                    <Globe size={14} className="mr-2 text-indigo-500" /> {details.country}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-5 transition-colors hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-800"><Mail size={18}/></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate font-mono">{details.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-5 transition-colors hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-800"><Phone size={18}/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{details.phone}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-5 transition-colors hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0"><MapPin size={18}/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Permanent Address</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{details.permAddress}</p>
                                    </div>
                                </div>

                                {details._videoFile && (
                                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between mt-2">
                                         <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                <Video size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Video Introduction</span>
                                         </div>
                                         <span className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500 tracking-widest">Attached</span>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Action Area */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 md:p-8 border-t border-slate-100 dark:border-slate-800">
                    {isAdmin ? (
                        <div className="flex flex-col md:flex-row gap-4 justify-end items-center">
                            <div className="flex items-center space-x-2 mr-auto text-slate-400">
                                <Lock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Administrator Mode</span>
                            </div>
                            <div className="flex w-full md:w-auto gap-3">
                                <button 
                                    onClick={() => handleAction('REJECT')}
                                    disabled={actionProcessing || request.status !== 'PENDING'}
                                    className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-red-600 border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                                >
                                    <XCircle size={16} className="mr-2"/> Reject
                                </button>
                                <button 
                                    onClick={() => handleAction('APPROVE')}
                                    disabled={actionProcessing || request.status !== 'PENDING'}
                                    className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <CheckCircle size={16} className="mr-2"/> Approve
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-slate-400">
                                <Lock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Secure View</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-300 select-all">ID: {linkId}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
