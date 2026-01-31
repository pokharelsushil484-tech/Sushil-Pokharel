
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
import { ErrorPage } from './ErrorPage';
import { Footer } from '../components/Footer';
import { VerificationForm } from './VerificationForm';
import { VerificationPending } from './VerificationPending';
import { AccessRecovery } from './AccessRecovery';
import { View, UserProfile, VaultDocument, Assignment, Expense } from '../types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME } from '../constants';
import { storageService } from '../services/storageService';
import { ShieldCheck, Lock, Terminal, Eye, EyeOff, LogIn, UserPlus, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
            email: email || `user@${SYSTEM_DOMAIN}`,
            isVerified: false,
            verificationStatus: 'NONE',
            level: 1,
            studentId: `SP-${Math.floor(100000 + Math.random() * 900000)}`
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
        setAuthError('STORAGE_FAILURE');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    const inputId = userId.trim().toLowerCase();
    const inputPass = password.trim();

    if (authMode === 'LOGIN') {
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
                body: JSON.stringify({ action: 'AUTHORIZE_IDENTITY', identity: inputId, hash: inputPass })
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                sessionStorage.setItem('active_session_user', inputId);
                setActiveUser(inputId);
                await loadUserData(inputId);
                setIsLoggedIn(true);
                setIsLoading(false);
                return;
            }
        } catch (err) {
            console.warn("Registry Offline - Local Access Engaged");
        }

        // Local Storage Fallback
        const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
        if (localUsers[inputId] && localUsers[inputId].password === inputPass) {
            sessionStorage.setItem('active_session_user', inputId);
            setActiveUser(inputId);
            await loadUserData(inputId);
            setIsLoggedIn(true);
        } else {
            setAuthError('AUTHORIZATION_DENIED');
        }
    } else {
        // SIGNUP Flow
        try {
            const res = await fetch('/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REGISTER_IDENTITY', identity: inputId })
            });
            if (res.ok) {
                await finalizeLocalRegistration(inputId);
            } else {
                setAuthError('NETWORK_REG_FAILED');
            }
        } catch (err) {
            await finalizeLocalRegistration(inputId);
        }
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('active_session_user');
      window.location.reload();
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
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
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Identity Created</h2>
                        <p className="text-sm text-slate-400 font-medium tracking-widest">Node {userId.toUpperCase()} Ready.<br/>StudentPocket – By Sushil</p>
                    </div>
                    <button 
                        onClick={() => { setRegistrationSuccess(false); setAuthMode('LOGIN'); setUserId(''); setPassword(''); }}
                        className="btn-platinum py-5 text-xs flex items-center justify-center gap-3"
                    >
                        Proceed to Login <ArrowRight size={18} />
                    </button>
                </div>
              ) : (
                <>
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                        <ShieldCheck size={48} className="text-black" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{APP_NAME}</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.6em]">
                            {authMode === 'LOGIN' ? 'Authorized Access' : 'Create New Profile'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-4">
                    {authMode === 'SIGNUP' && (
                        <>
                        <div className="relative group">
                            <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="FULL NAME" required />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="EMAIL ADDRESS" required />
                        </div>
                        </>
                    )}
                    <div className="relative group">
                        <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="USERNAME" required />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-16 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800" placeholder="PASSWORD" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    </div>

                    {authError && (
                    <div className="text-[10px] font-black text-center uppercase tracking-widest py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500">
                        {authError}
                    </div>
                    )}

                    <button type="submit" className="btn-platinum py-5 text-xs flex items-center justify-center gap-3 shadow-2xl">
                        {authMode === 'LOGIN' ? <LogIn size={18} /> : <UserPlus size={18} />}
                        {authMode === 'LOGIN' ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="flex flex-col items-center space-y-6 pt-8 border-t border-white/5">
                    <button 
                        type="button" 
                        onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setAuthError(''); }}
                        className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.4em] transition-all"
                    >
                        {authMode === 'LOGIN' ? "Need an account? Sign Up" : "Have an account? Log In"}
                    </button>
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
      case View.ADMIN_DASHBOARD: return <AdminDashboard />;
      case View.VERIFICATION_FORM: return <VerificationForm user={user} username={activeUser || ''} updateUser={setUser} onNavigate={setView} />;
      case View.ACCESS_RECOVERY: return <AccessRecovery onNavigate={setView} />;
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
                     <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#4f46e5]"></div>
                  </div>
                  <p className="text-sm font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden bg-slate-900">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="User" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-[1800px] mx-auto w-full pt-10 px-8 sm:px-12 pb-32 md:pb-16">
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={activeUser === ADMIN_USERNAME} isVerified={user.isVerified} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;
