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
import { ShieldCheck, Lock, Cpu, Fingerprint, Terminal, Eye, EyeOff, Mail, Copy, Check, Info } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  // Login flow states
  const [loginStage, setLoginStage] = useState<'SPLASH' | 'CREDENTIALS' | 'BIOMETRIC' | 'RECOVERY' | 'RECOVERY_SUCCESS'>('SPLASH');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [handshakeToken, setHandshakeToken] = useState('');
  
  const [recoveryReason, setRecoveryReason] = useState('');
  const [generatedRecoveryId, setGeneratedRecoveryId] = useState('');
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
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
    // API Call to login.php
    try {
        const res = await fetch('/login.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'INITIALIZE_HANDSHAKE' })
        });
        const data = await res.json();
        setHandshakeToken(data.token);
        setLoginStage('CREDENTIALS');
    } catch (e) {
        setHandshakeToken(Math.random().toString(36).substring(7).toUpperCase());
        setLoginStage('CREDENTIALS');
    } finally {
        setIsLoading(false);
    }
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
        setLoginError(`ACCESS DENIED [ATTEMPT ${attempts}/3]`);
        setIsLoading(false);
        return;
    }

    setLoginStage('BIOMETRIC');
    setIsLoading(false);
    startBiometric();
  };

  const startBiometric = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.warn("Hardware Bypass: Protocol Active.");
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

  const handleLogout = () => {
      localStorage.removeItem('active_session_user');
      setIsLoggedIn(false);
      setActiveUser(null);
      setLoginStage('SPLASH');
      setUserId('');
      setPassword('');
      setUser(DEFAULT_USER);
      setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (user.isBanned) {
      return (
        <ErrorPage 
            type="CRASH" 
            title="NODE TERMINATED" 
            message={`Identity node revoked for safety reasons. Context: ${user.banReason || 'Security Alert'}`}
            actionLabel="Request Recovery"
            onAction={() => { setLoginStage('RECOVERY'); setIsLoggedIn(false); }}
        />
      );
  }

  // --- Professional Institutional Login UI ---
  if (!isLoggedIn && view !== View.REGISTER) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[180px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-800/20 rounded-full blur-[160px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-xl animate-platinum">
          <div className="master-box p-12 md:p-20 border border-white/5 space-y-16">
              
              {loginStage === 'SPLASH' && (
                <div className="text-center space-y-16">
                    <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_32px_64px_-12px_rgba(255,255,255,0.15)] transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                        <ShieldCheck size={56} className="text-black" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{APP_NAME}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.8em] ml-2">Executive Portal Node</p>
                    </div>
                    <div className="space-y-6">
                        <button onClick={handleHandshake} className="btn-platinum w-full py-7 text-sm">
                            Initiate Handshake <Cpu size={20} className="ml-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-5">
                            <button onClick={() => setView(View.REGISTER)} className="py-5 bg-white/5 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                                Initialize Account
                            </button>
                            <button onClick={() => setLoginStage('RECOVERY')} className="py-5 bg-white/5 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                                Access Support
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {loginStage === 'CREDENTIALS' && (
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">Identity Check</h2>
                        <div className="inline-flex items-center space-x-3 bg-white/5 px-5 py-2 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Session: {handshakeToken}</span>
                        </div>
                    </div>
                    <form onSubmit={handleAuthorize} className="space-y-10">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type="text" value={userId} onChange={e => setUserId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                                    placeholder="NODE IDENTIFIER"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-[2rem] py-6 pl-16 pr-16 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                                    placeholder="SECURITY TOKEN"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        {loginError && <p className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest bg-red-500/5 py-3 rounded-xl border border-red-500/10">{loginError}</p>}
                        <button type="submit" className="btn-platinum w-full py-6">Authorize Data Sink</button>
                        <button type="button" onClick={() => setLoginStage('SPLASH')} className="w-full text-[9px] font-bold text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Abort Node Sequence</button>
                    </form>
                </div>
              )}

              {loginStage === 'BIOMETRIC' && (
                <div className="text-center space-y-12">
                    <div className="relative mx-auto w-72 h-72 rounded-[5rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] bg-black">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-30 grayscale" />
                        <div className="absolute inset-0 border-[32px] border-black/90"></div>
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,1)] animate-[scan_4s_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Fingerprint size={96} className="text-indigo-500 opacity-20 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">Validating Node</h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em]">Synchronizing Hardware Matrix</p>
                    </div>
                    <button onClick={finalizeLogin} className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-[0.98]">
                        Complete Node Link
                    </button>
                </div>
              )}

              <div className="pt-12 border-t border-white/5 flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-3 text-slate-700">
                    <Info size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Grid ID: {SYSTEM_DOMAIN}</span>
                </div>
                <span className="stark-badge">BUILD {APP_VERSION.split(' ')[0]}</span>
              </div>
          </div>
        </div>
        <style>{`@keyframes scan { 0%, 100% { top: 0%; opacity: 0.3; } 50% { top: 100%; opacity: 1; } }`}</style>
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
        <header className="bg-black/90 backdrop-blur-3xl border-b border-white/10 h-24 flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center space-x-6">
              <div className="p-3 bg-white rounded-xl text-black shadow-2xl shadow-white/5">
                <div className="font-black text-sm">SP</div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-[0.2em]">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Node</p>
                  <p className="text-sm font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center p-0.5">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover rounded-[0.8rem]" alt="User" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-[1400px] mx-auto w-full pt-12 px-8 sm:px-12 pb-40 md:pb-20">
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;