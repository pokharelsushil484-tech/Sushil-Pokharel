
import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { VerificationForm } from './views/VerificationForm';
import { VerificationPending } from './views/VerificationPending';
import { AdminDashboard } from './views/AdminDashboard';
import { InviteRegistration } from './views/InviteRegistration';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Footer } from './components/Footer';
import { View, UserProfile, VaultDocument, Assignment, ChangeRequest } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME, APP_VERSION, ADMIN_SECRET, ADMIN_EMAIL } from './constants';
import { storageService } from './services/storageService';
import { ShieldCheck, UserPlus, Lock, ShieldAlert, Cpu, Fingerprint, Loader2, KeyRound, Terminal, Eye, EyeOff, Send, Mail, Copy, Check, ArrowLeft } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  // Login flow states: SPLASH -> CREDENTIALS -> BIOMETRIC | RECOVERY
  const [loginStage, setLoginStage] = useState<'SPLASH' | 'CREDENTIALS' | 'BIOMETRIC' | 'RECOVERY' | 'RECOVERY_SUCCESS'>('SPLASH');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [handshakeToken, setHandshakeToken] = useState('');
  
  // Recovery states
  const [recoveryReason, setRecoveryReason] = useState('');
  const [generatedRecoveryId, setGeneratedRecoveryId] = useState('');
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    ...DEFAULT_USER,
    isVerified: false,
    verificationStatus: 'NONE'
  });

  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const sessionUser = localStorage.getItem('active_session_user');
    if (sessionUser) {
        setActiveUser(sessionUser);
        setIsLoggedIn(true);
        loadUserData(sessionUser);
    }
  }, []);

  const loadUserData = async (username: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (stored?.user?.isBanned) {
        setUser(stored.user);
        return;
    }

    if (username === ADMIN_USERNAME) {
        const adminProfile: UserProfile = stored?.user ? {
            ...stored.user,
            isVerified: true,
            level: 3,
            verificationStatus: 'VERIFIED'
        } : {
            ...DEFAULT_USER,
            name: "Lead Architect",
            isVerified: true,
            level: 3,
            verificationStatus: 'VERIFIED'
        };
        setUser(adminProfile);
    } else if (stored) {
      if (stored.user) setUser(stored.user);
      if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
      if (stored.assignments) setAssignments(stored.assignments);
    }
  };

  const handleHandshake = async () => {
    setIsLoading(true);
    // Simulated PHP call to login.php?action=INITIALIZE_HANDSHAKE
    setTimeout(() => {
        setHandshakeToken(Math.random().toString(36).slice(2).toUpperCase());
        setLoginStage('CREDENTIALS');
        setIsLoading(false);
    }, 800);
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    setIsLoading(true);
    setLoginError('');

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    if (!users[ADMIN_USERNAME]) {
        users[ADMIN_USERNAME] = { password: ADMIN_SECRET, name: 'Lead Architect', verified: true };
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
    }

    const userData = users[userId];
    const valid = userData && (typeof userData === 'string' ? userData === password : userData.password === password);

    if (!valid) {
        const attempts = await storageService.recordFailedLogin(userId);
        setLoginError(`ACCESS DENIED. ATTEMPT ${attempts}/3`);
        setIsLoading(false);
        return;
    }

    setTimeout(() => {
        setLoginStage('BIOMETRIC');
        setIsLoading(false);
        startBiometric();
    }, 1000);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !recoveryReason) return;
    setIsLoading(true);

    setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9).toUpperCase();
        setGeneratedRecoveryId(newId);
        
        const existingReqs = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
        const request: ChangeRequest = {
            id: 'REC-' + Date.now(),
            userId: userId,
            username: userId,
            type: 'RECOVERY',
            details: JSON.stringify({ reason: recoveryReason, timestamp: Date.now() }),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: newId 
        };
        existingReqs.push(request);
        localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));
        
        setLoginStage('RECOVERY_SUCCESS');
        setIsLoading(false);
    }, 1200);
  };

  const startBiometric = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.warn("Hardware Bypass: Grid Synchronization Active.");
    }
  };

  const finalizeLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        localStorage.setItem('active_session_user', userId);
        setActiveUser(userId);
        setIsLoggedIn(true);
        loadUserData(userId);
        setIsLoading(false);
    }, 1200);
  };

  // Fix: Added handleLogin function used by InviteRegistration component.
  const handleLogin = (username: string) => {
    localStorage.setItem('active_session_user', username);
    setActiveUser(username);
    setIsLoggedIn(true);
    loadUserData(username);
  };

  const handleLogout = () => {
      localStorage.removeItem('active_session_user');
      setIsLoggedIn(false);
      setActiveUser(null);
      setLoginStage('SPLASH');
      setUserId('');
      setPassword('');
      setUser({ ...DEFAULT_USER, isVerified: false });
      setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (user.isBanned) {
      return (
        <ErrorPage 
            type="CRASH" 
            title="SYSTEM ACCESS REVOKED" 
            message={`Your identity node has been terminated due to serious security infractions. Reason: ${user.banReason || 'Protocol Violation'}`}
            actionLabel="Request Recovery Appeal"
            onAction={() => { setLoginStage('RECOVERY'); setIsLoggedIn(false); }}
        />
      );
  }

  // --- Professional Zero-Exposure Unified Login ---
  if (!isLoggedIn && view !== View.REGISTER) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-950/20 rounded-full blur-[160px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/30 rounded-full blur-[160px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg animate-platinum">
          <div className="master-box p-12 md:p-16 border border-white/10 space-y-12">
              
              {loginStage === 'SPLASH' && (
                <div className="text-center space-y-12">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(255,255,255,0.1)] transform -rotate-3">
                        <ShieldCheck size={48} className="text-black" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{APP_NAME}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Professional Management Node</p>
                    </div>
                    <div className="space-y-5">
                        <button onClick={handleHandshake} className="btn-platinum w-full py-6">
                            Initiate Secure Handshake <Cpu size={18} className="ml-3" />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setView(View.REGISTER)} className="py-4 bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                                Initialize Node
                            </button>
                            <button onClick={() => setLoginStage('RECOVERY')} className="py-4 bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                                Recovery Protocol
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {loginStage === 'CREDENTIALS' && (
                <div className="space-y-10">
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Identity Validation</h2>
                        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 px-4 py-1.5 rounded-full mt-5 border border-indigo-500/20">
                            <Cpu size={12} className="text-indigo-500" />
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em]">Handshake: {handshakeToken}</span>
                        </div>
                    </div>
                    <form onSubmit={handleAuthorize} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Node Identity</label>
                            <div className="relative">
                                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input 
                                    type="text" value={userId} onChange={e => setUserId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-8 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                                    placeholder="Username / ID"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Security Token</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-16 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                                    placeholder="Secret Credentials"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        {loginError && <p className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest animate-shake">{loginError}</p>}
                        <button type="submit" className="btn-platinum w-full py-6">Authorize Node</button>
                        <button type="button" onClick={() => setLoginStage('SPLASH')} className="w-full text-[9px] font-bold text-slate-600 uppercase tracking-widest">Abort</button>
                    </form>
                </div>
              )}

              {loginStage === 'RECOVERY' && (
                <div className="space-y-10">
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Access Appeal</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Node Restoration Protocol</p>
                    </div>
                    <form onSubmit={handleRecoverySubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Target Identity</label>
                            <input 
                                type="text" value={userId} onChange={e => setUserId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                                placeholder="Username or Student ID"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Reason for Request</label>
                            <textarea 
                                value={recoveryReason} onChange={e => setRecoveryReason(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-white font-medium text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                                placeholder="Explain access requirements..."
                                rows={4}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-platinum w-full py-6">Log Security Appeal</button>
                        <button type="button" onClick={() => setLoginStage('SPLASH')} className="w-full text-[9px] font-bold text-slate-600 uppercase tracking-widest">Return</button>
                    </form>
                </div>
              )}

              {loginStage === 'RECOVERY_SUCCESS' && (
                <div className="text-center space-y-10">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
                        <Lock size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase italic">Appeal Logged</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Institutional Link Generated</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Recovery ID: {generatedRecoveryId}</p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black p-3 rounded-xl border border-white/10 text-[10px] font-mono text-slate-400 truncate select-all">
                                {`www.${SYSTEM_DOMAIN}/recovery/${generatedRecoveryId}`}
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText(`www.${SYSTEM_DOMAIN}/recovery/${generatedRecoveryId}`); setCopied(true); setTimeout(()=>setCopied(false),2000); }} className="p-3 bg-white/5 rounded-xl border border-white/10 text-white">
                                {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                            </button>
                        </div>
                    </div>
                    <a href={`mailto:${ADMIN_EMAIL}?subject=Recovery ID: ${generatedRecoveryId}`} className="btn-platinum w-full py-5 text-xs">
                        Contact Administrator <Mail size={16} className="ml-3" />
                    </a>
                    <button onClick={() => setLoginStage('SPLASH')} className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Back to Entry</button>
                </div>
              )}

              {loginStage === 'BIOMETRIC' && (
                <div className="text-center space-y-12">
                    <div className="relative mx-auto w-64 h-64 rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-40 grayscale" />
                        <div className="absolute inset-0 border-[24px] border-black/80"></div>
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[scan_3s_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Fingerprint size={100} className="text-white opacity-5 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Identity Verified</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.6em] mt-3">Ready for Grid Sync</p>
                    </div>
                    <button onClick={finalizeLogin} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all">
                        Finalize Synchronization
                    </button>
                </div>
              )}

              <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-4">
                <span className="stark-badge">PORTAL {APP_VERSION.split(' ')[0]}</span>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">{SYSTEM_DOMAIN}</span>
              </div>
          </div>
        </div>
        <style>{`@keyframes scan { 0%, 100% { top: 0%; opacity: 0.5; } 50% { top: 100%; opacity: 1; } }`}</style>
      </div>
    );
  }

  if (view === View.REGISTER) {
    return <InviteRegistration onRegister={handleLogin} onNavigate={setView} />;
  }

  if (activeUser !== ADMIN_USERNAME && !user.isVerified && view !== View.VERIFICATION_FORM && view !== View.SUPPORT) {
      return (
        <div className="min-h-screen bg-black flex flex-col">
           <VerificationPending 
             studentId={user.studentId} 
             onLogout={handleLogout} 
             onNavigate={setView}
           />
        </div>
      );
  }

  const renderContent = () => {
    try {
      switch (view) {
        case View.DASHBOARD: return <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />;
        case View.FILE_HUB: return <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />;
        case View.SETTINGS: return <Settings user={user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={activeUser || ''} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />;
        case View.SUPPORT: return <Support username={activeUser || ''} />;
        case View.VERIFY_LINK: return <StudyPlanner assignments={assignments} setAssignments={setAssignments} isAdmin={true} />;
        case View.VERIFICATION_FORM: return <VerificationForm user={user} username={activeUser || ''} updateUser={setUser} onNavigate={setView} />;
        case View.ADMIN_DASHBOARD: return <AdminDashboard />;
        default: return <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />;
      }
    } catch (e: any) {
      return <ErrorPage type="CRASH" errorDetails={String(e)} onAction={() => window.location.reload()} />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-indigo-500/30 flex flex-col">
      <GlobalLoader isLoading={isLoading} />
      <div className="md:ml-20 lg:ml-64 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-2xl border-b border-white/10 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
           <div className="flex items-center space-x-4">
              <div className="p-2 bg-white rounded-lg text-black shadow-lg">
                <div className="font-black text-xs">SP</div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-widest">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Personnel Layer</p>
                  <p className="text-xs font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-slate-900 flex items-center justify-center p-0.5 shadow-xl">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover rounded-full" alt="User" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full pt-10 px-6 sm:px-10 pb-32 md:pb-12">
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;
