
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View } from '../types';
import { ShieldCheck, User, MapPin, Globe, Mail, Phone, Video, CheckCircle, XCircle, Home, Lock, RefreshCw, Search, LayoutGrid, ArrowRight, Eye, KeyRound, ArrowLeft, Clock, Camera, LogIn } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';
import { storageService } from '../services/storageService';

interface LinkVerificationProps {
  linkId: string;
  onNavigate: (view: View) => void;
  currentUser: string | null;
}

const LINK_EXPIRATION_MS = 60 * 1000; // 1 Minute Validity
const MASTER_KEY_INTERVAL = 50000; // 50 seconds

export const LinkVerification: React.FC<LinkVerificationProps> = ({ linkId, onNavigate, currentUser }) => {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
  
  // Security State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securityInput, setSecurityInput] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Manual Verification State
  const [showManualVerify, setShowManualVerify] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualProcessing, setManualProcessing] = useState(false);
  const [manualFaceScan, setManualFaceScan] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const isAdmin = currentUser === ADMIN_USERNAME;

  // Real-time Status Check
  useEffect(() => {
    let intervalId: any;

    const fetchRequest = () => {
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
        const requests: ChangeRequest[] = JSON.parse(reqStr);
        const match = requests.find(r => r.linkId === linkId);
        
        if (match) {
            // Check Expiration (only if pending)
            if (match.status === 'PENDING' && (Date.now() - match.createdAt > LINK_EXPIRATION_MS)) {
                setExpired(true);
            } else {
                // If status changed from what we had, update it
                setRequest(prev => {
                    if (!prev || prev.status !== match.status) {
                        return match;
                    }
                    return prev;
                });
                
                // If Admin or the owner is viewing, auto-unlock
                if (isAdmin || (currentUser && match.username === currentUser)) {
                    setIsUnlocked(true);
                }
            }
        } else {
            // Check for replaced/old link
            const expiredMatch = requests.find(r => r.previousLinkIds && r.previousLinkIds.includes(linkId));
            if (expiredMatch && expiredMatch.linkId) {
                setRedirecting(true);
                // In a real app, you might not auto-redirect for security, but for UX here:
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
    // Poll every 2 seconds if request is pending to show updates immediately
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
          setSecurityError('Incorrect Student ID. Access Denied.');
      }
  };

  const handleManualVerification = async (e: React.FormEvent) => {
      e.preventDefault();
      setManualProcessing(true);
      setSecurityError('');

      // 1. Validate ID - Check if it matches the request on this link OR if it's a known user
      let targetUsername = '';
      
      // Try to match ID with requests
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
          const requests: ChangeRequest[] = JSON.parse(reqStr);
          const match = requests.find(r => r.generatedStudentId === manualId || r.username === manualId);
          if (match) targetUsername = match.username;
      }

      if (!targetUsername) {
           // Fallback to checking if user exists directly
           const usersStr = localStorage.getItem('studentpocket_users');
           const users = usersStr ? JSON.parse(usersStr) : {};
           if (users[manualId]) targetUsername = manualId;
      }

      if (!targetUsername) {
          setSecurityError('Student ID not found in system.');
          setManualProcessing(false);
          return;
      }

      // 2. Validate Code - 50s Window Logic
      const timeStep = MASTER_KEY_INTERVAL;
      const now = Date.now();
      const seed = Math.floor(now / timeStep);
      // Generate current Master Key based on same deterministic logic as Admin
      const currentMasterKey = Math.abs(Math.sin(seed + 1) * 1000000).toFixed(0).slice(0, 6).padEnd(6, '0');
      
      // Allow for previous window grace period (optional, strict for now)
      // const prevSeed = seed - 1;
      // const prevMasterKey = Math.abs(Math.sin(prevSeed + 1) * 1000000).toFixed(0).slice(0, 6).padEnd(6, '0');

      const dataKey = `architect_data_${targetUsername}`;
      const stored = await storageService.getData(dataKey);
      const userRescueKey = stored?.user?.rescueKey;

      const isValid = 
        manualCode === currentMasterKey || 
        (userRescueKey && manualCode === userRescueKey);

      if (!isValid) {
          setSecurityError('Invalid Master Code. Please check with Admin.');
          setManualProcessing(false);
          return;
      }

      // 3. Success - Verify User
      if (stored && stored.user) {
          stored.user.isVerified = true;
          stored.user.verificationStatus = 'VERIFIED';
          stored.user.adminFeedback = "Identity Verified via Master Key Override.";
          // Clear rescue key after use if it was used
          if (manualCode === userRescueKey) {
              stored.user.rescueKey = undefined; 
          }
          await storageService.setData(dataKey, stored);
      }
      
      // Update requests
      if (reqStr) {
          const requests: ChangeRequest[] = JSON.parse(reqStr);
          // Approve all pending for this user
          const updatedRequests = requests.map(r => r.username === targetUsername ? { ...r, status: 'APPROVED' } : r);
          localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
          
           // Update local state if valid
          const updatedReq = updatedRequests.find(r => r.id === request?.id);
          if (updatedReq) setRequest(updatedReq as ChangeRequest);
      }

      setVerificationSuccess(true);
      setManualProcessing(false);
  };

  const simulateFaceScan = () => {
      setManualFaceScan(true);
      setTimeout(() => {
          setManualFaceScan(false);
          alert("Face Verification Simulated: Match Found. (In production this would call biometric API). Please use Master Code if this fails.");
      }, 2000);
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!request || !isAdmin) return;
    
    if (!window.confirm(`Are you sure you want to ${action} this identity?`)) return;

    setActionProcessing(true);
    
    // Simulate API/Storage delay
    setTimeout(async () => {
        const dataKey = `architect_data_${request.username}`;
        const stored = await storageService.getData(dataKey);
        
        if (stored && stored.user) {
            stored.user.isVerified = action === 'APPROVE';
            stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
            if (action === 'REJECT') {
                stored.user.adminFeedback = "Identity verification failed. Information provided did not match records or was incomplete.";
            } else {
                stored.user.adminFeedback = "Identity Verified. Welcome to StudentPocket.";
            }
            await storageService.setData(dataKey, stored);
            
            // Update request status
            const reqStr = localStorage.getItem('studentpocket_requests');
            if (reqStr) {
                const requests: ChangeRequest[] = JSON.parse(reqStr);
                const updatedRequests = requests.map(r => r.id === request.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
                localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
                
                // Update local state
                const updatedReq = updatedRequests.find(r => r.id === request.id);
                if (updatedReq) setRequest(updatedReq as ChangeRequest);
            }
            
            await storageService.logActivity({
                actor: ADMIN_USERNAME,
                targetUser: request.username,
                actionType: 'ADMIN',
                description: `Link Verification ${action}: ${request.username}`,
                metadata: JSON.stringify({ requestId: request.id, linkId })
            });
        } else {
            alert("Error: User data node not found.");
        }

        setActionProcessing(false);
    }, 1500);
  };

  if (redirecting) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
          <div className="flex flex-col items-center space-y-4">
             <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Redirecting to latest version...</p>
          </div>
      </div>
      );
  }

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

  // MANUAL VERIFICATION UI (Alternative Option)
  if (showManualVerify) {
      if (verificationSuccess) {
          return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
                <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl border border-emerald-500/20 animate-scale-up relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-xl">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Access Granted</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">Your identity has been verified by the Master Key protocol.</p>
                    
                    <button onClick={() => window.location.href = '/'} className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center">
                        <LogIn size={16} className="mr-2"/> Login Now
                    </button>
                </div>
            </div>
          );
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
            <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-fade-in relative overflow-hidden">
                <button onClick={() => setShowManualVerify(false)} className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors"><ArrowLeft size={20}/></button>
                
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
                    <KeyRound size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Master Override</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Enter the dynamic Master Key provided by the Admin Console.
                </p>

                <form onSubmit={handleManualVerification} className="space-y-4">
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all"
                            placeholder="Student ID"
                            required
                        />
                    </div>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-black text-lg text-center tracking-[0.5em] uppercase transition-all"
                            placeholder="CODE"
                            maxLength={6}
                            required
                        />
                    </div>

                    {securityError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{securityError}</p>}
                    
                    <button type="submit" disabled={manualProcessing} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg disabled:opacity-50">
                        {manualProcessing ? <RefreshCw className="animate-spin" size={16}/> : 'Verify Identity'}
                    </button>
                </form>
                
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Biometric Option</p>
                     <button onClick={simulateFaceScan} disabled={manualFaceScan} className="w-full py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center">
                        {manualFaceScan ? <RefreshCw className="animate-spin mr-2" size={14}/> : <Camera className="mr-2" size={16}/>} Scan Face
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // EXPIRED OR INVALID LINK UI
  if (expired || notFound || !request) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
            <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-inner">
                    {expired ? <Clock size={28} /> : <Search size={28} />}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{expired ? 'Link Expired' : 'Link Invalid'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {expired ? 'This verification link has expired for security reasons.' : 'This verification link does not exist or has been removed.'}
                </p>
                
                <div className="space-y-3">
                    <button onClick={() => setShowManualVerify(true)} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg">
                        <KeyRound size={14} className="mr-2"/> Use Master Key
                    </button>
                    <button onClick={() => window.location.href = '/'} className="w-full py-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
                        <Home size={14} className="mr-2"/> Return Home
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // Parse details safely
  let details: any = {};
  try { details = JSON.parse(request.details); } catch(e) { details = {}; }

  // LOCKED STATE UI (Valid link, but requires ID to view)
  if (!isUnlocked) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
            <div className="text-center max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-lg shadow-indigo-500/10">
                    <Lock size={32} />
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Protected Data</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">Enter the Student ID associated with this application to view details.</p>
                
                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={securityInput}
                            onChange={(e) => setSecurityInput(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-center tracking-widest uppercase transition-all"
                            placeholder="STUDENT ID"
                        />
                    </div>
                    
                    {securityError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">{securityError}</p>}
                    
                    <button type="submit" className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl">
                        Unlock Data
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // UNLOCKED STATE UI
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-3xl mx-auto animate-scale-up">
            {/* Brand Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <ShieldCheck className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">StudentPocket</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Identity Data Node</p>
                    </div>
                </div>
                {currentUser ? (
                    <button onClick={() => onNavigate(isAdmin ? View.ADMIN_DASHBOARD : View.DASHBOARD)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                        <ArrowLeft size={14} className="mr-2"/> Back
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
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><img src="/logo.svg" alt="Profile" className="w-full h-full object-contain p-4 opacity-20" /></div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm flex items-center ${
                                    request.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400' :
                                    request.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' :
                                    'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400'
                                }`}>
                                    {request.status === 'PENDING' && <RefreshCw size={10} className="mr-2 animate-spin"/>}
                                    {request.status === 'APPROVED' && <CheckCircle size={12} className="mr-2"/>}
                                    {request.status === 'REJECTED' && <XCircle size={12} className="mr-2"/>}
                                    {request.status}
                                </div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="flex-1 w-full space-y-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{details.fullName || 'Unknown Student'}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start">
                                    <Globe size={14} className="mr-2 text-indigo-500" /> {details.country || 'No Country'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
                                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm"><Mail size={16}/></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-mono">{details.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
                                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-indigo-500 shadow-sm"><Phone size={16}/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{details.phone}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center"><MapPin size={12} className="mr-1.5"/> Permanent Address</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">{details.permAddress}</p>
                                </div>
                                {details.tempAddress && (
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center"><MapPin size={12} className="mr-1.5"/> Temporary Address</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pl-4 border-l-2 border-slate-200 dark:border-slate-700">{details.tempAddress}</p>
                                    </div>
                                )}
                            </div>

                            {details._videoFile && (
                                 <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
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

                {/* Admin Controls */}
                {isAdmin && (
                    <div className="bg-slate-900 dark:bg-black p-6 md:p-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center space-x-3 text-slate-400">
                            <KeyRound size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Administrative Control</span>
                        </div>
                        <div className="flex w-full md:w-auto gap-3">
                            <button 
                                onClick={() => handleAction('REJECT')}
                                disabled={actionProcessing || request.status !== 'PENDING'}
                                className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-white/5 text-red-400 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-red-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <XCircle size={16} className="mr-2"/> Reject
                            </button>
                            <button 
                                onClick={() => handleAction('APPROVE')}
                                disabled={actionProcessing || request.status !== 'PENDING'}
                                className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transform active:scale-95"
                            >
                                {actionProcessing ? <RefreshCw size={16} className="animate-spin mr-2"/> : <CheckCircle size={16} className="mr-2"/>} 
                                Approve Identity
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Footer for non-admins */}
                {!isAdmin && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-6 flex justify-between items-center text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800">
                        <span>SECURE LINK ID: {linkId}</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
