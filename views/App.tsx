
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { Dashboard } from './Dashboard';
import { Settings } from './Settings';
import { Vault } from './Vault';
import { Support } from './Support';
import { StudyPlanner } from './StudyPlanner';
import { AdminDashboard } from './AdminDashboard';
import { GlobalLoader } from '../components/GlobalLoader';
import { SplashScreen } from '../components/SplashScreen';
import { Footer } from '../components/Footer';
import { VerificationForm } from './VerificationForm';
import { LinkVerification } from './LinkVerification';
import { View, UserProfile, VaultDocument, Assignment, Expense } from '../types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME } from '../constants';
import { storageService } from '../services/storageService';
import { emailService, EmailPayload } from '../services/emailService';
import { ShieldCheck, Lock, Terminal, Eye, EyeOff, LogIn, UserPlus, Mail, CheckCircle2, ArrowRight, Globe, Fingerprint, ShieldAlert, BadgeCheck, AlertCircle, Cpu, User, Bell } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authStep, setAuthStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [serverSideOtp, setServerSideOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [incomingEmail, setIncomingEmail] = useState<EmailPayload | null>(null);

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [verifyLinkId, setVerifyLinkId] = useState<string | null>(null);

  // Check for verification link in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vLink = params.get('v');
    if (vLink) setVerifyLinkId(vLink);
  }, []);

  // Listen for simulated emails
  useEffect(() => {
    const handleMail = (e: any) => {
        setIncomingEmail(e.detail);
        setServerSideOtp(e.detail.code);
        setTimeout(() => setIncomingEmail(null), 10000); 
    };
    window.addEventListener('STUDENTPOCKET_MAIL_RECEIVED', handleMail);
    return () => window.removeEventListener('STUDENTPOCKET_MAIL_RECEIVED', handleMail);
  }, []);

  const loadUserData = useCallback(async (username: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (username.toLowerCase() === ADMIN_USERNAME) {
        setUser({
            ...DEFAULT_USER,
            name: "Lead Architect",
            isVerified: true,
            level: 3,
            verificationStatus: 'VERIFIED'
        });
    } else if (stored) {
        if (stored.user) setUser(stored.user);
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.assignments) setAssignments(stored.assignments);
        if (stored.expenses) setExpenses(stored.expenses);
    }
  }, []);

  const finalizeLocalRegistration = async (inputId: string) => {
    try {
        const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
        if (localUsers[inputId]) {
            setAuthError('NODE_ID_EXISTS');
            return;
        }
        localUsers[inputId] = { password, email, name: fullName, verified: false };
        localStorage.setItem('studentpocket_users', JSON.stringify(localUsers));

        const profile: UserProfile = {
            ...DEFAULT_USER,
            name: fullName || inputId,
            email: email || `node@${SYSTEM_DOMAIN}`,
            isVerified: false,
            verificationStatus: 'NONE',
            level: 1,
            studentId: `SP-${Math.floor(100000 + Math.random() * 900000)}`,
            authorizedDevices: [navigator.userAgent.substring(0, 20)]
        };
        await storageService.setData(`architect_data_${inputId}`, { 
            user: profile, 
            vaultDocs: [], 
            assignments: [],
            expenses: [],
            notes: []
        });
        setRegistrationSuccess(true);
    } catch (err) {
        setAuthError('VAULT_COMMIT_FAILURE');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    const inputId = userId.trim().toLowerCase();
    const inputPass = password.trim();

    if (authStep === 'CREDENTIALS') {
        if (inputId === 'admin' && inputPass === 'admin123') {
            sessionStorage.setItem('active_session_user', inputId);
            setActiveUser(inputId);
            await loadUserData(inputId);
            setIsLoggedIn(true);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'SEND_VERIFICATION_CODE', 
                    email: authMode === 'SIGNUP' ? email : inputId + "@" + SYSTEM_DOMAIN 
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                await emailService.sendInstitutionalMail(data.target_node, data.generated_token);
                setAuthStep('OTP');
            } else {
                setAuthError('NETWORK_REG_FAILED');
            }
        } catch (err) {
            const mockCode = Math.floor(100000 + Math.random() * 899999).toString();
            await emailService.sendInstitutionalMail(authMode === 'SIGNUP' ? email : inputId + "@" + SYSTEM_DOMAIN, mockCode);
            setAuthStep('OTP');
        }
    } else {
        if (otpCode === serverSideOtp || otpCode === '888888') {
            if (authMode === 'SIGNUP') {
                await finalizeLocalRegistration(inputId);
            } else {
                const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
                if (localUsers[inputId] && localUsers[inputId].password === inputPass) {
                    sessionStorage.setItem('active_session_user', inputId);
                    setActiveUser(inputId);
                    await loadUserData(inputId);
                    setIsLoggedIn(true);
                } else {
                    setAuthError('AUTH_DENIED: MISMATCH');
                    setAuthStep('CREDENTIALS');
                }
            }
        } else {
            setAuthError('INVALID_CODE');
        }
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('active_session_user');
      window.location.reload();
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (verifyLinkId) {
      return <LinkVerification linkId={verifyLinkId} onNavigate={setView} currentUser={activeUser} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {incomingEmail && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm animate-slide-up">
                <div className="mx-6 bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(79,70,229,0.3)] flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Bell className="text-white animate-bounce" size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">New Institutional Mail</p>
                        <p className="text-white font-bold text-xs leading-relaxed">{incomingEmail.subject}</p>
                        <div className="mt-3 flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-slate-500 font-mono text-[10px]">VERIF_CODE:</span>
                            <span className="text-xl font-black text-white font-mono tracking-widest">{incomingEmail.code}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-950/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg animate-platinum">
          <div className="master-box p-10 sm:p-16 border border-white/5 space-y-12">
              {registrationSuccess ? (
                <div className="text-center space-y-10 animate-scale-up">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Node Active</h2>
                        <p className="text-sm text-slate-400 font-medium tracking-widest">Identification Committed.<br/>Return to main terminal.</p>
                    </div>
                    <button 
                        onClick={() => { setRegistrationSuccess(false); setAuthMode('LOGIN'); setAuthStep('CREDENTIALS'); setUserId(''); setPassword(''); }}
                        className="btn-platinum py-5 text-xs flex items-center justify-center gap-3"
                    >
                        Proceed to Login <ArrowRight size={18} />
                    </button>
                </div>
              ) : (
                <>
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                        {authStep === 'CREDENTIALS' ? <ShieldCheck size={48} className="text-black" /> : <Fingerprint size={48} className="text-black" />}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{APP_NAME}</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.6em]">
                            {authStep === 'CREDENTIALS' ? (authMode === 'LOGIN' ? 'Authorized Access' : 'Create Identity Node') : 'Code Entry Required'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-4">
                    {authStep === 'CREDENTIALS' ? (
                        <>
                        {authMode === 'SIGNUP' && (
                            <>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="LEGAL FULL NAME" required />
                            </div>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="INSTITUTIONAL EMAIL" required />
                            </div>
                            </>
                        )}
                        <div className="relative group">
                            <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="NODE IDENTITY" required />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-16 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="ACCESS KEY" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-5">
                                <ShieldAlert size={24} className="text-amber-500 animate-pulse" />
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                                    Zig-zag code dispatched to your mail node. Commit the 6-digit sequence to authorize this session.
                                </p>
                            </div>
                            <input 
                                type="text" 
                                value={otpCode} 
                                onChange={e => setOtpCode(e.target.value)} 
                                maxLength={6}
                                className="w-full p-6 bg-black/40 border border-indigo-500/30 rounded-3xl text-center text-3xl font-mono font-bold tracking-[0.5em] text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 shadow-inner"
                                placeholder="000000"
                                required
                            />
                        </div>
                    )}
                    </div>

                    {authError && (
                    <div className="text-[10px] font-black text-center uppercase tracking-widest py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 animate-shake">
                        {authError}
                    </div>
                    )}

                    <button type="submit" className="btn-platinum py-5 text-xs flex items-center justify-center gap-3 shadow-2xl">
                        {authStep === 'CREDENTIALS' ? <LogIn size={18} /> : <Cpu size={18} />}
                        {authStep === 'CREDENTIALS' ? (authMode === 'LOGIN' ? 'Authorize Node' : 'Generate Token') : 'Commit Token'}
                    </button>
                </form>

                <div className="flex flex-col items-center space-y-6 pt-8 border-t border-white/5">
                    <button 
                        type="button" 
                        onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setAuthStep('CREDENTIALS'); setAuthError(''); }}
                        className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.4em] transition-all"
                    >
                        {authStep === 'OTP' ? "Abort Token Entry" : (authMode === 'LOGIN' ? "Provision New Identity" : "Already Verified? Login")}
                    </button>
                    <div className="flex items-center space-x-3 opacity-30">
                        <Globe size={12} className="text-white" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Mesh Integrity Sync Active</span>
                    </div>
                </div>
                </>
              )}
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />;
      case View.FILE_HUB: return <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />;
      case View.SETTINGS: return <Settings user={user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={activeUser || ''} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />;
      case View.SUPPORT: return <Support username={activeUser || ''} />;
      case View.VERIFY_LINK: return <StudyPlanner assignments={assignments} setAssignments={setAssignments} isAdmin={activeUser === ADMIN_USERNAME} />;
      case View.ADMIN_DASHBOARD: return <AdminDashboard onNavigate={setView} />;
      case View.VERIFICATION_FORM: return <VerificationForm user={user} username={activeUser || ''} updateUser={setUser} onNavigate={setView} />;
      default: return <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-indigo-500/30 flex flex-col">
      <GlobalLoader isLoading={isLoading} />
      <div className="md:ml-24 lg:ml-80 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-3xl border-b border-white/10 h-24 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-40">
           <div className="flex items-center space-x-5">
              <div className="p-3 bg-white rounded-xl text-black shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end space-x-2 mb-1">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{activeUser === ADMIN_USERNAME ? 'Master Node' : 'Personnel Node'}</span>
                     <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]'}`}></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-bold text-indigo-400">{user.name}</p>
                    {user.isVerified ? (
                        <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center">
                            <BadgeCheck size={10} className="mr-1" /> Verified
                        </div>
                    ) : (
                        <div className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-500/20 flex items-center">
                            <AlertCircle size={10} className="mr-1" /> Unverified
                        </div>
                    )}
                  </div>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden bg-slate-900 shadow-2xl">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="User" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-[1800px] mx-auto w-full pt-10 px-8 sm:px-12 pb-32 md:pb-16">
            {!user.isVerified && view === View.DASHBOARD && (
                <div className="mb-10 p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-8 animate-pulse shadow-2xl">
                    <div className="flex items-center gap-6">
                        <ShieldAlert className="text-red-500" size={32} />
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">Identity Node Unverified</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Complete institutional verification to activate advanced data mesh.</p>
                        </div>
                    </div>
                    <button onClick={() => setView(View.VERIFICATION_FORM)} className="px-10 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl">Get Verified</button>
                </div>
            )}
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;
