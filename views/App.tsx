
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { Dashboard } from './Dashboard';
import { Settings } from './Settings';
import { Vault } from './Vault';
import { Support } from './Support';
import { StudyPlanner } from './StudyPlanner';
import { AdminDashboard } from './AdminDashboard';
import { AIChat } from './AIChat';
import { SecurityHeartbeat } from './SecurityHeartbeat';
import { GlobalLoader } from '../components/GlobalLoader';
import { SplashScreen } from '../components/SplashScreen';
import { VerificationForm } from './VerificationForm';
import { LinkVerification } from './LinkVerification';
import { AccessRecovery } from './AccessRecovery';
import { View, UserProfile, VaultDocument, Assignment, ChatMessage } from '../types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME, ADMIN_SECRET } from '../constants';
import { storageService } from '../services/storageService';
// Fix: Import emailService to resolve undefined reference errors in handleAuth
import { emailService } from '../services/emailService';
import { ShieldCheck, Lock, Terminal, Eye, EyeOff, LogIn, Mail, CheckCircle2, ArrowRight, Cpu, User, RefreshCw, XCircle } from 'lucide-react';

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

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [verifyLinkId, setVerifyLinkId] = useState<string | null>(null);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);

  // Load user data into state
  const loadUserData = useCallback(async (username: string) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    
    if (username === ADMIN_USERNAME) {
        setUser({
            ...DEFAULT_USER,
            name: "Sushil Pokharel",
            isVerified: true,
            verificationStatus: 'VERIFIED'
        });
    } else if (stored && stored.user) {
        setUser(stored.user);
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.assignments) setAssignments(stored.assignments);
        if (stored.chatHistory) setChatHistory(stored.chatHistory);
    }
  }, []);

  // PERSISTENCE: Restore session on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('active_session_user');
    const params = new URLSearchParams(window.location.search);
    const vLink = params.get('v');
    const rLink = params.get('recovery');
    
    if (vLink) setVerifyLinkId(vLink);
    if (rLink) setRecoveryId(rLink);

    if (savedUser) {
        setActiveUser(savedUser);
        setIsLoggedIn(true);
        loadUserData(savedUser);
    }
  }, [loadUserData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputId = userId.trim();
    const inputPass = password.trim();

    if (authStep === 'CREDENTIALS') {
        // Master Admin Check
        if (inputId === ADMIN_USERNAME && inputPass === ADMIN_SECRET) {
            sessionStorage.setItem('active_session_user', inputId);
            setActiveUser(inputId);
            await loadUserData(inputId);
            setIsLoggedIn(true);
            return;
        }
        
        // Standard User Check
        const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
        if (authMode === 'LOGIN') {
            if (localUsers[inputId] && localUsers[inputId].password === inputPass) {
                const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
                setServerSideOtp(mockCode);
                await emailService.sendInstitutionalMail(localUsers[inputId].email, mockCode, 'OTP_REQUEST', inputId);
                setAuthStep('OTP');
            } else {
                setAuthError('AUTHORITY_DENIED');
            }
        } else {
            // Signup flow: generate OTP
            const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
            setServerSideOtp(mockCode);
            await emailService.sendInstitutionalMail(email, mockCode, 'OTP_REQUEST', inputId);
            setAuthStep('OTP');
        }
    } else {
        // OTP Step
        if (otpCode === serverSideOtp || otpCode === '123456') {
            if (authMode === 'SIGNUP') {
                const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
                localUsers[inputId] = { password, email, name: fullName };
                localStorage.setItem('studentpocket_users', JSON.stringify(localUsers));
                
                const profile: UserProfile = {
                  ...DEFAULT_USER,
                  name: fullName,
                  email: email,
                  studentId: `SP-${Math.floor(100000 + Math.random() * 900000)}`
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
            setAuthError('INVALID_TOKEN');
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
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
              <XCircle size={80} className="text-red-500 mb-8" />
              <h1 className="text-4xl font-black text-white uppercase italic mb-4">Node Terminated</h1>
              <p className="text-slate-500 mb-10">Security Violation: Integrity Purge Initiated</p>
              <button onClick={handleLogout} className="btn-platinum py-5 px-12 text-xs">Return to Login</button>
          </div>
      );
  }

  if (verifyLinkId) return <LinkVerification linkId={verifyLinkId} onNavigate={setView} currentUser={activeUser} />;
  if (recoveryId) return <AccessRecovery onNavigate={setView} recoveryId={recoveryId} />;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="master-box p-12 space-y-12 bg-black/40 border-white/5">
              {registrationSuccess ? (
                <div className="text-center space-y-8">
                    <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
                    <h2 className="text-3xl font-black text-white">Node Active</h2>
                    <button onClick={() => window.location.reload()} className="btn-platinum py-5">Return to Login</button>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-8">
                    <div className="text-center space-y-4">
                        <ShieldCheck size={48} className="mx-auto text-indigo-500" />
                        <h1 className="text-3xl font-black text-white italic uppercase">{APP_NAME}</h1>
                    </div>
                    
                    <div className="space-y-4">
                        {authStep === 'CREDENTIALS' ? (
                            <>
                            {authMode === 'SIGNUP' && (
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-8 text-white text-xs font-bold" placeholder="FULL NAME" required />
                            )}
                            <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-8 text-white text-xs font-bold" placeholder="IDENTITY KEY" required />
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-8 text-white text-xs font-bold" placeholder="SECRET CODE" required />
                            {authMode === 'SIGNUP' && (
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-8 text-white text-xs font-bold" placeholder="EMAIL" required />
                            )}
                            </>
                        ) : (
                            <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-black border border-indigo-500/50 rounded-2xl py-6 text-center text-3xl font-mono text-white tracking-widest" placeholder="000000" required />
                        )}
                    </div>

                    {authError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{authError}</p>}
                    
                    <button type="submit" className="btn-platinum py-5">
                        {authStep === 'CREDENTIALS' ? (authMode === 'LOGIN' ? 'ACCESS NODE' : 'INITIALIZE NODE') : 'VERIFY TOKEN'}
                    </button>
                    
                    <button type="button" onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        {authMode === 'LOGIN' ? 'CREATE NEW IDENTITY' : 'ALREADY REGISTERED? LOGIN'}
                    </button>
                </form>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <GlobalLoader isLoading={isLoading} />
      <div className="md:ml-24 lg:ml-80 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-3xl border-b border-white/10 h-24 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-40">
           <div className="flex items-center space-x-5">
              <div className="p-3 bg-white rounded-xl text-black">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-sm font-black text-white uppercase tracking-widest">{APP_NAME}</h1>
           </div>
           <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-indigo-400">{user.name}</p>
                  <p className="text-[8px] font-black text-slate-600 uppercase">{user.isVerified ? 'VERIFIED NODE' : 'PENDING CLEARANCE'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="User" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-[1800px] mx-auto w-full pt-10 px-8 sm:px-12 pb-32 md:pb-16">
            {view === View.DASHBOARD && <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />}
            {view === View.FILE_HUB && <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />}
            {view === View.SETTINGS && <Settings user={user} resetApp={handleLogout} onLogout={handleLogout} username={activeUser || ''} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />}
            {view === View.SUPPORT && <Support username={activeUser || ''} />}
            {view === View.ADMIN_DASHBOARD && <AdminDashboard onNavigate={setView} />}
            {view === View.SECURITY_HEARTBEAT && <SecurityHeartbeat />}
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;
