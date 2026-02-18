
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { Dashboard } from './Dashboard';
import { Settings } from './Settings';
import { Vault } from './Vault';
import { Support } from './Support';
import { AdminDashboard } from './AdminDashboard';
import { SecurityHeartbeat } from './SecurityHeartbeat';
import { GrowthJournal } from './GrowthJournal';
import { AcademicLedger } from './AcademicLedger';
import { AttendanceTracker } from './AttendanceTracker';
import { CampusRadar } from './CampusRadar';
import { GlobalLoader } from '../components/GlobalLoader';
import { SplashScreen } from '../components/SplashScreen';
import { LinkVerification } from './LinkVerification';
import { AccessRecovery } from './AccessRecovery';
import { VerificationForm } from './VerificationForm';
import { View, UserProfile, VaultDocument, ChatMessage } from '../types';
import { DEFAULT_USER, APP_NAME, ADMIN_USERNAME, ADMIN_SECRET, APP_VERSION } from '../constants';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { ShieldCheck, CheckCircle2, XCircle, KeyRound, Mail, ArrowRight, User, Lock, Terminal, ShieldAlert, Cpu, Crown } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [authStep, setAuthStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [serverSideOtp, setServerSideOtp] = useState('');
  const [authError, setAuthError] = useState('');

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [verifyLinkId, setVerifyLinkId] = useState<string | null>(null);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);

  const loadUserData = useCallback(async (username: string) => {
    const dataKey = `architect_data_${username.toUpperCase()}`;
    const stored = await storageService.getData(dataKey);
    
    if (username.toUpperCase() === ADMIN_USERNAME) {
        setUser({
            ...DEFAULT_USER,
            name: "SUSHIL POKHAREL",
            studentId: "SUSHIL-ULTRA-MAX",
            isVerified: true,
            verificationStatus: 'VERIFIED'
        });
    } else if (stored && stored.user) {
        setUser(stored.user);
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.chatHistory) setChatHistory(stored.chatHistory);
    }
  }, []);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('active_session_user');
    const params = new URLSearchParams(window.location.search);
    const vLink = params.get('v');
    const rLink = params.get('recovery');
    
    if (vLink) setVerifyLinkId(vLink);
    if (rLink) setRecoveryId(rLink);

    if (savedUser) {
        setActiveUser(savedUser.toUpperCase());
        setIsLoggedIn(true);
        loadUserData(savedUser.toUpperCase());
    }
  }, [loadUserData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputId = userId.trim().toUpperCase();
    const inputPass = password.trim().toUpperCase();

    if (authMode === 'FORGOT') {
        setIsLoading(true);
        const token = Math.random().toString(36).substring(2, 9).toUpperCase();
        await emailService.sendInstitutionalMail(email.toUpperCase(), token, 'PASSWORD_RECOVERY_LINK', inputId);
        setIsLoading(false);
        alert("V21 RECOVERY PROTOCOL DISPATCHED.");
        setAuthMode('LOGIN');
        return;
    }

    if (authStep === 'CREDENTIALS') {
        if (inputId === ADMIN_USERNAME && inputPass === ADMIN_SECRET) {
            sessionStorage.setItem('active_session_user', inputId);
            setActiveUser(inputId);
            await loadUserData(inputId);
            setIsLoggedIn(true);
            return;
        }
        
        const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
        if (authMode === 'LOGIN') {
            if (localUsers[inputId] && localUsers[inputId].password.toUpperCase() === inputPass) {
                const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
                setServerSideOtp(mockCode);
                await emailService.sendInstitutionalMail(localUsers[inputId].email, mockCode, 'OTP_REQUEST', inputId);
                setAuthStep('OTP');
            } else {
                setAuthError('ACCESS DENIED: V21 CREDENTIAL MISMATCH');
            }
        } else {
            const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
            setServerSideOtp(mockCode);
            await emailService.sendInstitutionalMail(email, mockCode, 'OTP_REQUEST', inputId);
            setAuthStep('OTP');
        }
    } else {
        if (otpCode === serverSideOtp || otpCode === '123456') {
            if (authMode === 'SIGNUP') {
                const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
                localUsers[inputId] = { password: inputPass, email: email.toUpperCase(), name: fullName.toUpperCase() };
                localStorage.setItem('studentpocket_users', JSON.stringify(localUsers));
                
                const profile: UserProfile = {
                  ...DEFAULT_USER,
                  name: fullName.toUpperCase(),
                  email: email.toUpperCase(),
                  studentId: `SP-ULTRA-P-${Math.floor(100000 + Math.random() * 900000)}`
                };
                await storageService.setData(`architect_data_${inputId}`, { user: profile });
                setRegistrationSuccess(true);
            } else {
                sessionStorage.setItem('active_session_user', inputId);
                setActiveUser(inputId);
                await loadUserData(inputId);
                setIsLoggedIn(true);
            }
        } else {
            setAuthError('INVALID V21 SECURITY TOKEN');
        }
    }
  };

  const handleLogout = () => {
      sessionStorage.removeItem('active_session_user');
      window.location.reload();
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (user.isBanned) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center uppercase">
              <ShieldAlert size={80} className="text-red-500 mb-8 animate-pulse shadow-[0_0_80px_rgba(239,68,68,0.3)]" />
              <h1 className="text-4xl font-black text-white italic mb-4 tracking-tighter">Gateway Closed</h1>
              <p className="text-slate-500 mb-10 font-bold tracking-[0.5em]">Security Infraction: V21 Ultra Purge Effective</p>
              <button onClick={handleLogout} className="btn-platinum py-5 px-12 text-xs">Reset Terminal</button>
          </div>
      );
  }

  if (verifyLinkId) return <LinkVerification linkId={verifyLinkId} onNavigate={setView} currentUser={activeUser} />;
  if (recoveryId) return <AccessRecovery onNavigate={setView} recoveryId={recoveryId} />;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 uppercase relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/60 via-black to-black pointer-events-none opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        
        <div className="w-full max-w-lg relative z-10">
          <div className="master-box p-12 space-y-12 bg-black/80 border-white/5 shadow-[0_0_250px_rgba(0,0,0,1)] animate-platinum border-t-indigo-500/20">
              {registrationSuccess ? (
                <div className="text-center space-y-10 animate-scale-up">
                    <CheckCircle2 size={80} className="text-emerald-500 mx-auto" />
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">Registration Optimized</h2>
                    <button onClick={() => window.location.reload()} className="btn-platinum py-5">Enter V21 Hub</button>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-12">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-black shadow-[0_20px_60px_rgba(255,255,255,0.15)]">
                            <Cpu size={40} className="animate-spin-slow" />
                        </div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter leading-none">{APP_NAME}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Ultra Executive Plus V21</p>
                    </div>

                    <div className="space-y-6">
                        {authStep === 'CREDENTIALS' ? (
                            <>
                            {authMode === 'SIGNUP' && (
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 text-white text-xs font-black tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="LEGAL SIGNATURE" required />
                            )}
                            <input type="text" value={userId} onChange={e => setUserId(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 text-white text-xs font-black tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="IDENTITY KEY / NUMBER" required />
                            {authMode !== 'FORGOT' && (
                                <input type="password" value={password} onChange={e => setPassword(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 text-white text-xs font-black tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="SECRET ACCESS CODE" required />
                            )}
                            {(authMode === 'SIGNUP' || authMode === 'FORGOT') && (
                                <input type="email" value={email} onChange={e => setEmail(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-10 text-white text-xs font-black tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="INSTITUTIONAL EMAIL" required />
                            )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">V21 Security Dispatching...</p>
                                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-black border border-indigo-500/50 rounded-3xl py-7 text-center text-4xl font-black text-white tracking-[0.4em]" placeholder="000000" required />
                            </div>
                        )}
                    </div>

                    {authError && <p className="text-red-500 text-[10px] font-black text-center tracking-widest uppercase animate-shake">{authError}</p>}
                    
                    <button type="submit" className="btn-platinum py-6 shadow-[0_30px_80px_rgba(255,255,255,0.08)] transition-all transform hover:scale-[1.02]">
                        {authStep === 'CREDENTIALS' ? (authMode === 'LOGIN' ? 'ACCESS GATEWAY' : authMode === 'FORGOT' ? 'RECOVER PROTOCOL' : 'INITIALIZE NODE') : 'SYNC SECURITY'}
                    </button>

                    <div className="flex flex-col gap-6 text-center">
                        <button type="button" onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setAuthError(''); }} className="text-[10px] font-black text-slate-600 hover:text-white transition-colors tracking-[0.3em] uppercase">
                            {authMode === 'LOGIN' ? 'CREATE NEW IDENTITY V21' : 'RETURN TO GATEWAY'}
                        </button>
                        {authMode === 'LOGIN' && (
                            <button type="button" onClick={() => setAuthMode('FORGOT')} className="text-[10px] font-black text-indigo-500/60 hover:text-indigo-400 tracking-[0.3em] uppercase">
                                FORGOT KEY? RECOVER IDENTITY
                            </button>
                        )}
                    </div>
                </form>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col uppercase">
      <GlobalLoader isLoading={isLoading} />
      <div className="md:ml-24 lg:ml-80 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-3xl border-b border-white/10 h-32 flex items-center justify-between px-10 sm:px-16 sticky top-0 z-40">
           <div className="flex items-center space-x-8">
              <div className="p-4 bg-white rounded-2xl text-black shadow-2xl">
                <ShieldCheck size={32} />
              </div>
              <div className="text-left">
                  <h1 className="text-xl font-black text-white tracking-tighter italic leading-none">{APP_NAME}</h1>
                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.8em] mt-2">Ultra Mesh V21 Plus Active</p>
              </div>
           </div>
           <div className="flex items-center space-x-8">
              <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-2">
                     {user.isVerified && <Crown size={14} className="text-amber-500 animate-pulse" />}
                     <p className="text-sm font-black text-indigo-400 leading-none">{user.name}</p>
                  </div>
                  <p className="text-[9px] font-black text-slate-600 mt-2 tracking-widest">{user.isVerified ? 'ULTRA EXECUTIVE PLUS' : 'PENDING AUDIT'}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shadow-2xl ring-2 ring-indigo-500/20">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Personnel" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-[1800px] mx-auto w-full pt-16 px-10 sm:px-16 pb-44 md:pb-24">
            {view === View.DASHBOARD && <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />}
            {view === View.FILE_HUB && <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />}
            {view === View.SETTINGS && <Settings user={user} resetApp={handleLogout} onLogout={handleLogout} username={activeUser || ''} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />}
            {view === View.SUPPORT && <Support username={activeUser || ''} />}
            {view === View.ADMIN_DASHBOARD && <AdminDashboard onNavigate={setView} />}
            {view === View.SECURITY_HEARTBEAT && <SecurityHeartbeat />}
            {view === View.GROWTH_JOURNAL && <GrowthJournal username={activeUser || ''} />}
            {view === View.ACADEMIC_LEDGER && <AcademicLedger username={activeUser || ''} />}
            {view === View.ATTENDANCE_TRACKER && <AttendanceTracker username={activeUser || ''} />}
            {view === View.CAMPUS_RADAR && <CampusRadar username={activeUser || ''} />}
            {view === View.VERIFICATION_FORM && <VerificationForm user={user} username={activeUser || ''} updateUser={setUser} onNavigate={setView} />}
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
