
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, MapPin, Globe, Mail, Phone, Video, CheckCircle, XCircle, Home, Lock, AlertTriangle } from 'lucide-react';
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
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const loadRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        if (match) {
            setRequest(match);
        } else {
            // Fallback for demonstration if specific link not found in local browser storage
            setIsDemo(true);
            setRequest({
                id: 'DEMO-' + Date.now(),
                userId: 'student_demo',
                username: 'Demo Student',
                type: 'VERIFICATION',
                status: 'PENDING',
                createdAt: Date.now(),
                linkId: linkId,
                details: JSON.stringify({
                    fullName: "Aarav Sharma",
                    email: "student@example.com",
                    phone: "+977 9800000000",
                    permAddress: "Kathmandu, Nepal",
                    tempAddress: "Lalitpur, Nepal",
                    country: "Nepal",
                    _profileImage: null,
                    _videoFile: null
                })
            });
        }
      } else {
          // Fallback if no requests at all
          setIsDemo(true);
          setRequest({
              id: 'DEMO-' + Date.now(),
              userId: 'student_demo',
              username: 'Demo Student',
              type: 'VERIFICATION',
              status: 'PENDING',
              createdAt: Date.now(),
              linkId: linkId,
              details: JSON.stringify({
                  fullName: "Aarav Sharma",
                  email: "student@example.com",
                  phone: "+977 9800000000",
                  permAddress: "Kathmandu, Nepal",
                  tempAddress: "Lalitpur, Nepal",
                  country: "Nepal",
                  _profileImage: null,
                  _videoFile: null
              })
          });
      }
      setLoading(false);
    };
    loadRequest();
  }, [linkId]);

  const isAdmin = currentUser === ADMIN_USERNAME;

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdmin) return;
    
    setActionProcessing(true);
    
    // Simulate API/Storage delay
    setTimeout(async () => {
        if (!isDemo) {
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
        }

        setRequest({ ...request, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
        alert(`Verification ${action === 'APPROVE' ? 'Approved' : 'Rejected'} Successfully.${isDemo ? ' (Demo Mode)' : ''}`);
        
        if (!isDemo) {
            onNavigate(View.ADMIN_DASHBOARD);
        }
        setActionProcessing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Decrypting Link...</p>
          </div>
      </div>
    );
  }

  if (!request) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
            <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <XCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invalid Link</h2>
                <p className="text-sm text-slate-500 mb-8">This verification link has expired or does not exist.</p>
                <button onClick={() => window.location.href = '/'} className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
                    <Home size={16} className="mr-2"/> Return Home
                </button>
            </div>
        </div>
    );
  }

  const details = JSON.parse(request.details);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
            {/* Brand Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">StudentPocket</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Identity Verification</p>
                    </div>
                </div>
                {currentUser ? (
                    <button onClick={() => onNavigate(View.DASHBOARD)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Dashboard</button>
                ) : (
                    <button onClick={() => window.location.href = '/'} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Login to Approve</button>
                )}
            </div>

            {isDemo && (
                 <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl flex items-center gap-3 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={20} />
                    <p className="text-xs font-bold">Demo Mode: Request data not found locally. Showing placeholder data.</p>
                 </div>
            )}

            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <div className="w-40 h-40 rounded-[2rem] bg-slate-100 dark:bg-slate-800 p-1.5 shadow-xl border border-slate-200 dark:border-slate-700 rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-white dark:bg-slate-900">
                                    {details._profileImage ? (
                                        <img src={details._profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={48}/></div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center space-x-2">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    request.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                    request.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-600' :
                                    'bg-amber-50 border-amber-200 text-amber-600'
                                }`}>
                                    {request.status}
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="flex-1 w-full">
                            <div className="mb-8 text-center md:text-left">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{details.fullName}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start">
                                    <Globe size={14} className="mr-2" /> {details.country}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center space-x-4">
                                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-indigo-500 shadow-sm"><Mail size={18}/></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{details.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center space-x-4">
                                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-indigo-500 shadow-sm"><Phone size={18}/></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{details.phone}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-start space-x-4">
                                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-indigo-500 shadow-sm flex-shrink-0"><MapPin size={18}/></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Permanent Address</p>
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{details.permAddress}</p>
                                    </div>
                                </div>

                                {details._videoFile && (
                                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                                         <div className="flex items-center space-x-3">
                                            <Video size={18} className="text-indigo-600" />
                                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Introduction Video Attached</span>
                                         </div>
                                         <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">View Asset</button>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Action Area */}
                <div className="bg-slate-50 dark:bg-slate-950 p-8 md:p-10 border-t border-slate-100 dark:border-slate-800">
                    {isAdmin ? (
                        <div className="flex flex-col md:flex-row gap-4 justify-end">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest my-auto mr-auto hidden md:block">Admin Actions</p>
                            <button 
                                onClick={() => handleAction('REJECT')}
                                disabled={actionProcessing || request.status !== 'PENDING'}
                                className="px-8 py-4 rounded-xl bg-white dark:bg-slate-900 text-red-600 border border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-[0.15em] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <XCircle size={16} className="mr-2"/> Reject
                            </button>
                            <button 
                                onClick={() => handleAction('APPROVE')}
                                disabled={actionProcessing || request.status !== 'PENDING'}
                                className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <CheckCircle size={16} className="mr-2"/> Approve Identity
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-slate-400">
                                <Lock size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Administrator Access Required</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-300">ID: {linkId}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
