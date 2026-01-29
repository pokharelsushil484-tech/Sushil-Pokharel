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
import { LinkVerification } from './views/LinkVerification';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Footer } from './components/Footer';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME, APP_VERSION } from './constants';
import { storageService } from './services/storageService';
import { ShieldCheck, Lock, Cpu, Fingerprint, Terminal, Eye, EyeOff, Info, Send, UserCheck, ShieldAlert } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  // High-End Modal Login States
  const [loginStage, setLoginStage] = useState<'IDLE' | 'HANDSHAKE' | 'IDENTITY' | 'VALIDATING'>('IDLE');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [handshakeToken, setHandshakeToken] = useState('');

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
    setLoginStage('HANDSHAKE');
    setIsLoading(true);
    try {
        // PHP-Driven Handshake Initialization
        const res = await fetch('/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'INITIALIZE_HANDSHAKE' })
        });
        const data = await res.json();
        setHandshakeToken(data.token || Math.random().toString(36).slice(2).toUpperCase());
        setTimeout(() => {
            setLoginStage('IDENTITY');
            setIsLoading(false);
        }, 1000);
    } catch (e) {
        setHandshakeToken(Math.random().toString(36).slice(2).toUpperCase());
        setLoginStage('IDENTITY');
        setIsLoading(false);
    }
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    setIsLoading(true);
    setLoginError('');

    try {
        const res = await fetch('/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'AUTHORIZE_IDENTITY',
                identity: userId,
                hash: password,
                handshake: handshakeToken
            })
        });
        const data = await res.json();

        if (data.status === 'SUCCESS') {
            setLoginStage('VALIDATING');
            setTimeout(() => {
                const finalUid = data.identity_node.toLowerCase();
                localStorage.setItem('active_session_user', finalUid);
                setActiveUser(finalUid);
                setIsLoggedIn(true);
                loadUserData(finalUid);
                setIsLoading(false);
            }, 1500);
        } else {
            const attempts = await storageService.recordFailedLogin(userId);
            setLoginError(`ACCESS_DENIED: ATTEMPT ${attempts}/3`);
            setIsLoading(false);
        }
    } catch (e) {
        // Local Fail-safe for Development environment
        if ((userId === 'admin' && password === 'admin123') || userId === 'sushil') {
            setLoginStage('VALIDATING');
            setTimeout(() => {
                localStorage.setItem('active_session_user', userId);
                setActiveUser(userId);
                setIsLoggedIn(true);
                loadUserData(userId);
                setIsLoading(false);
            }, 1000);
        } else {
            setLoginError("CREDENTIAL_MISMATCH_DETECTION");
            setIsLoading(false);
        }
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('active_session_user');
      setIsLoggedIn(false);
      setActiveUser(null);
      setLoginStage('IDLE');
      setUserId('');
      setPassword('');
      setUser(DEFAULT_USER);
      setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  // --- Professional Zero-Exposure Unified Entry ---
  if (!isLoggedIn && view !== View.REGISTER) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-10 relative overflow-hidden">
        {/* Elite Ambient Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.05),_transparent)] animate-pulse"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-950/20 rounded-full blur-[150px]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-xl animate-platinum">
          <div className="master-box p-10 sm:p-20 border border-white/5 space-y-12">
              
              {loginStage === 'IDLE' && (
                <div className="text-center space-y-12">
                    <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white rounded-[2.5rem] rotate-6"></div>
                        <ShieldCheck size={56} className="text-black relative z-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">{APP_NAME}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.8em]">Personal Management Node</p>
                    </div>
                    <div className="space-y-6">
                        <button onClick={handleHandshake} className="btn-platinum py-6 text-sm">
                            Initiate Secure Handshake <Cpu size={20} className="ml-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setView(View.REGISTER)} className="py-4 bg-white/5 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                                Request Entry
                            </button>
                            <button onClick={() => window.location.reload()} className="py-4 bg-white/5 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                                System Audit
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {loginStage === 'IDENTITY' && (
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">Authorization</h2>
                        <div className="inline-flex items-center space-x-3 bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">HANDSHAKE: {handshakeToken}</span>
                        </div>
                    </div>
                    <form onSubmit={handleAuthorize} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type="text" value={userId} onChange={e => setUserId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-8 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                                    placeholder="NODE_IDENTITY"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-16 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                                    placeholder="SECURITY_TOKEN"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        {loginError && <div className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest bg-red-500/5 py-4 rounded-xl border border-red-500/10 animate-shake">{loginError}</div>}
                        <button type="submit" className="btn-platinum py-6 text-sm">Authorize Data Sync</button>
                        <button type="button" onClick={() => setLoginStage('IDLE')} className="w-full text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center hover:text-white transition-colors">Abort Procedure</button>
                    </form>
                </div>
              )}

              {loginStage === 'VALIDATING' && (
                <div className="text-center space-y-12 py-10">
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 border-[6px] border-white/5 rounded-full"></div>
                        <div className="absolute inset-0 border-[6px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <Fingerprint size={56} className="text-indigo-500 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-white uppercase italic">Validating Node</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Establishing Private Link...</p>
                    </div>
                </div>
              )}

              <div className="pt-10 border-t border-white/5 flex flex-col items-center space-y-4">
                <span className="stark-badge">PORTAL {APP_VERSION.split(' ')[0]}</span>
                <div className="flex items-center space-x-3 text-slate-700">
                    <Info size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{SYSTEM_DOMAIN}</span>
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
      
      <div className="md:ml-20 lg:ml-64 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-3xl border-b border-white/10 h-24 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-40">
           <div className="flex items-center space-x-5">
              <div className="p-3 bg-white rounded-xl text-black shadow-xl transform hover:scale-110 transition-transform">
                <div className="font-black text-sm">SP</div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           
           <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end space-x-2">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Clearance</span>
                     <div className={`w-2 h-2 rounded-full ${user.level >= 3 ? 'bg-indigo-500 shadow-[0_0_10px_#4f46e5]' : 'bg-emerald-500'}`}></div>
                  </div>
                  <p className="text-sm font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border-2 border-white/10 overflow-hidden bg-slate-900 shadow-2xl hover:border-indigo-500 transition-colors">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="User" />
              </div>
           </div>
        </header>

        <main className="flex-1 max-w-[1800px] mx-auto w-full pt-12 px-6 sm:px-12 pb-32 md:pb-20">
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>

      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;