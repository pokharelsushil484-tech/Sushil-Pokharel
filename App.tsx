
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { AdminDashboard } from './views/AdminDashboard';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Footer } from './components/Footer';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME, APP_VERSION } from './constants';
import { storageService } from './services/storageService';
import { ShieldCheck, Lock, Terminal, Eye, EyeOff, LogIn, Info, HelpCircle } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  // Login States
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Strict Privacy: Logout on reload/refresh
  useEffect(() => {
    // We do NOT check sessionStorage here to enforce the "logout on reload" rule.
    // Every refresh resets the state, effectively logging the user out.
    sessionStorage.removeItem('active_session_user');
  }, []);

  const loadUserData = async (username: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    
    // For Admin, we always ensure full clearance and verification
    if (username.toLowerCase() === ADMIN_USERNAME) {
        const adminProfile: UserProfile = {
            ...DEFAULT_USER,
            name: "Lead Architect",
            isVerified: true,
            level: 3,
            verificationStatus: 'VERIFIED'
        };
        setUser(adminProfile);
        if (stored) {
          if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
          if (stored.assignments) setAssignments(stored.assignments);
        }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
        const payload = {
            action: 'AUTHORIZE_IDENTITY',
            identity: userId,
            hash: password
        };

        const res = await fetch('/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === 'SUCCESS' && data.identity_node.toLowerCase() === ADMIN_USERNAME) {
            const uid = data.identity_node.toLowerCase();
            sessionStorage.setItem('active_session_user', uid);
            setActiveUser(uid);
            setIsLoggedIn(true);
            await loadUserData(uid);
        } else {
            setAuthError('INVALID_ADMIN_CREDENTIALS');
        }
    } catch (e) {
        // Local fallback for dev/static environments
        if (userId === 'admin' && password === 'admin123') {
            sessionStorage.setItem('active_session_user', userId);
            setActiveUser(userId);
            setIsLoggedIn(true);
            await loadUserData(userId);
        } else {
            setAuthError("COMMUNICATION_FAULT");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
      sessionStorage.removeItem('active_session_user');
      window.location.reload(); // Force full reset
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  // --- Professional Admin Login View ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-950/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg animate-platinum">
          <div className="master-box p-10 sm:p-16 border border-white/5 space-y-12">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <ShieldCheck size={48} className="text-black" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{APP_NAME}</h1>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.6em]">By Sushil • Administrative Node</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                      placeholder="ADMIN USERNAME"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-16 text-white font-bold text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                      placeholder="SECURITY TOKEN"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="text-[9px] font-black text-red-500 text-center uppercase tracking-widest bg-red-500/5 py-3 rounded-xl border border-red-500/10 animate-shake">
                    {authError}
                  </div>
                )}

                <button type="submit" className="btn-platinum py-5 text-xs flex items-center justify-center gap-3">
                  <LogIn size={18} />
                  Authorize Access
                </button>
              </form>

              <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <button type="button" className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                  <HelpCircle size={12} /> Forgot Password?
                </button>
                <div className="flex items-center space-x-2 text-slate-800">
                  <Info size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
                </div>
              </div>
          </div>
          <p className="mt-8 text-center text-[9px] font-black text-slate-800 uppercase tracking-[0.5em]">
            Institutional Infrastructure {APP_VERSION.split(' ')[0]}
          </p>
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
      <div className="md:ml-24 lg:ml-80 transition-all flex-1 flex flex-col">
        <header className="bg-black/80 backdrop-blur-3xl border-b border-white/10 h-24 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-40">
           <div className="flex items-center space-x-5">
              <div className="p-3 bg-white rounded-xl text-black shadow-xl">
                <div className="font-black text-sm uppercase">SP</div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end space-x-2 mb-1">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Master Node</span>
                     <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#4f46e5]"></div>
                  </div>
                  <p className="text-sm font-bold text-indigo-400">Welcome, {user.name}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden bg-slate-900 shadow-xl">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover" alt="User" />
              </div>
           </div>
        </header>
        <main className="flex-1 max-w-[1800px] mx-auto w-full pt-10 px-8 sm:px-12 pb-32 md:pb-16">
            {renderContent()}
            <Footer onNavigate={setView} />
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={true} isVerified={true} username={activeUser || ''} onLogout={handleLogout} />
    </div>
  );
}

export default App;
