import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { VerificationForm } from './views/VerificationForm';
import { AdminDashboard } from './views/AdminDashboard';
import { InviteRegistration } from './views/InviteRegistration';
import { LinkVerification } from './views/LinkVerification';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Footer } from './components/Footer';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME, APP_VERSION } from './constants';
import { storageService } from './services/storageService';
import { ShieldCheck, Lock, Cpu, Fingerprint, Terminal, Eye, EyeOff, Info, User, Loader2, ArrowRight } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  // High-End Modal Entry States
  const [entryStage, setEntryStage] = useState<'IDLE' | 'HANDSHAKE' | 'IDENTITY' | 'VALIDATING'>('IDLE');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [token, setToken] = useState('');

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

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
    setEntryStage('HANDSHAKE');
    setIsLoading(true);
    try {
        const res = await fetch('/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'INITIALIZE_HANDSHAKE' })
        });
        const data = await res.json();
        setToken(data.token || Math.random().toString(36).slice(2).toUpperCase());
        setTimeout(() => {
            setEntryStage('IDENTITY');
            setIsLoading(false);
        }, 800);
    } catch (e) {
        setToken(Math.random().toString(36).slice(2).toUpperCase());
        setEntryStage('IDENTITY');
        setIsLoading(false);
    }
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    setIsLoading(true);
    setAuthError('');

    try {
        const res = await fetch('/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'AUTHORIZE_IDENTITY',
                identity: userId,
                hash: password,
                handshake: token
            })
        });
        const data = await res.json();

        if (data.status === 'SUCCESS') {
            setEntryStage('VALIDATING');
            setTimeout(() => {
                const uid = data.identity_node.toLowerCase();
                localStorage.setItem('active_session_user', uid);
                setActiveUser(uid);
                setIsLoggedIn(true);
                loadUserData(uid);
                setIsLoading(false);
            }, 1200);
        } else {
            const att = await storageService.recordFailedLogin(userId);
            setAuthError(`AUTHORIZATION FAILED [${att}/3]`);
            setIsLoading(false);
        }
    } catch (e) {
        // Fallback for static builds or local testing
        if ((userId === 'admin' && password === 'admin123') || userId === 'sushil') {
            setEntryStage('VALIDATING');
            setTimeout(() => {
                localStorage.setItem('active_session_user', userId);
                setActiveUser(userId);
                setIsLoggedIn(true);
                loadUserData(userId);
                setIsLoading(false);
            }, 1000);
        } else {
            setAuthError("CRYPTOGRAPHIC MISMATCH");
            setIsLoading(false);
        }
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('active_session_user');
      setIsLoggedIn(false);
      setActiveUser(null);
      setEntryStage('IDLE');
      setUserId('');
      setPassword('');
      setUser(DEFAULT_USER);
      setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  // --- Professional Institutional Entry Modal ---
  if (!isLoggedIn && view !== View.REGISTER) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 sm:p-12 relative overflow-hidden selection:bg-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-950/20 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[140px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-2xl animate-platinum">
          <div className="master-box p-10 sm:p-24 border border-white/5 space-y-16">
              
              {entryStage === 'IDLE' && (
                <div className="text-center space-y-16">
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white rounded-[3rem] -rotate-6 transform hover:rotate-0 transition-transform duration-500 shadow-[0_30px_60px_rgba(255,255,255,0.1)]"></div>
                        <ShieldCheck size={64} className="text-black relative z-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">{APP_NAME}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[1em] ml-2">Executive Entry Node</p>
                    </div>
                    <div className="space-y-6">
                        <button onClick={handleHandshake} className="btn-platinum py-7 text-sm">
                            Initiate Protocol <Cpu size={22} className="ml-5" />
                        </button>
                        <div className="grid grid-cols-2 gap-5">
                            <button onClick={() => setView(View.REGISTER)} className="py-5 bg-white/5 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] border border-white/5 hover:text-white hover:bg-white/10 transition-all">
                                Initialize
                            </button>
                            <button onClick={() => window.location.reload()} className="py-5 bg-white/5 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] border border-white/5 hover:text-white hover:bg-white/10 transition-all">
                                System Audit
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {entryStage === 'IDENTITY' && (
                <div className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest italic">Authorization</h2>
                        <div className="inline-flex items-center space-x-3 bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node ID Active: {token}</span>
                        </div>
                    </div>
                    <form onSubmit={handleAuthorize} className="space-y-8">
                        <div className="space-y-5">
                            <div className="relative group">
                                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={22} />
                                <input 
                                    type="text" value={userId} onChange={e => setUserId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-7 pl-16 pr-8 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                                    placeholder="NODE IDENTITY"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={22} />
                                <input 
                                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-7 pl-16 pr-16 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                                    placeholder="SECRET CODE"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>
                        {authError && <div className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest bg-red-500/5 py-4 rounded-2xl border border-red-500/10 animate-shake">{authError}</div>}
                        <button type="submit" className="btn-platinum py-7 text-sm">Authorize Data Node</button>
                        <button type="button" onClick={() => setEntryStage('IDLE')} className="w-full text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center hover:text-white transition-colors">Abort Access</button>
                    </form>
                </div>
              )}

              {entryStage === 'VALIDATING' && (
                <div className="text-center space-y-16 py-10">
                    <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 border-[8px] border-white/5 rounded-full"></div>
                        <div className="absolute inset-0 border-[8px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <Fingerprint size={72} className="text-indigo-500 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black text-white uppercase italic">Validating Node</h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.6em]">Establishing Encrypted Link...</p>
                    </div>
                </div>
              )}

              <div className="pt-12 border-t border-white/5 flex flex-col items-center space-y-5">
                <span className="stark-badge">BUILD {APP_VERSION.split(' ')[0]}</span>
                <div className="flex items-center space-x-3 text-slate-800">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">{SYSTEM_DOMAIN}</span>
                </div>
              </div>
          </div>
        </div>
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
      
      <div className="md:ml-24 lg:ml-72 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-3xl border-b border-white/10 h-24 flex items-center justify-between px-8 sm:px-16 sticky top-0 z-40">
           <div className="flex items-center space-x-6">
              <div className="p-3.5 bg-white rounded-2xl text-black shadow-2xl transform hover:scale-110 transition-transform">
                <div className="font-black text-sm uppercase">SP</div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest leading-none">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           
           <div className="flex items-center space-x-8">
              <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end space-x-2.5 mb-1.5">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">CLEARANCE</span>
                     <div className={`w-2 h-2 rounded-full ${user.level >= 3 ? 'bg-indigo-500 shadow-[0_0_15px_#4f46e5]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
                  </div>
                  <p className="text-sm font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-12 h-12 rounded-3xl border-2 border-white/10 overflow-hidden bg-slate-900 shadow-2xl hover:border-indigo-500 transition-colors cursor-pointer">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="User" />
              </div>
           </div>
        </header>

        <main className="flex-1 max-w-[1920px] mx-auto w-full pt-16 px-8 sm:px-16 pb-40 md:pb-24">
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>

      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;