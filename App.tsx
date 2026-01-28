import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { VerificationForm } from './views/VerificationForm';
import { AccessRecovery } from './views/AccessRecovery';
import { VerificationPending } from './views/VerificationPending';
import { AdminDashboard } from './views/AdminDashboard';
import { InviteRegistration } from './views/InviteRegistration';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Footer } from './components/Footer';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME, APP_VERSION } from './constants';
import { storageService } from './services/storageService';
import { ShieldCheck, ArrowRight, UserPlus, Lock, ShieldAlert, Cpu } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  const [user, setUser] = useState<UserProfile>({
    ...DEFAULT_USER,
    isVerified: false,
    verificationStatus: 'NONE'
  });

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

  const handleRegisterSuccess = (username: string) => {
      localStorage.setItem('active_session_user', username);
      setActiveUser(username);
      setIsLoggedIn(true);
      loadUserData(username);
      setView(View.DASHBOARD);
  };

  const handleLogout = () => {
      localStorage.removeItem('active_session_user');
      setIsLoggedIn(false);
      setActiveUser(null);
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
            onAction={() => setView(View.ACCESS_RECOVERY)}
        />
      );
  }

  // Privacy Entry Grid - Replaces Login.tsx
  if (!isLoggedIn && view !== View.REGISTER && view !== View.ACCESS_RECOVERY) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-950/20 rounded-full blur-[160px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/30 rounded-full blur-[160px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg animate-platinum">
          <div className="master-box p-12 md:p-16 border border-white/10 text-center space-y-12">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(255,255,255,0.1)] transform -rotate-3">
                <ShieldCheck size={48} className="text-black" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{APP_NAME}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.7em]">Institutional Privacy Secured</p>
              </div>

              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-center space-x-3 text-indigo-400">
                  <Lock size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Ghost Grid Active</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase italic">
                  Traditional entry fields are disabled for node protection. Identity validation is restricted to authorized hardware handshakes.
                </p>
              </div>

              <div className="space-y-4">
                <button onClick={() => setView(View.REGISTER)} className="btn-platinum w-full py-6">
                   Initialize New Node <UserPlus size={18} className="ml-3" />
                </button>
                <div className="flex gap-4">
                   <button onClick={() => setView(View.ACCESS_RECOVERY)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
                      Access Recovery
                   </button>
                   <button onClick={() => { localStorage.setItem('active_session_user', ADMIN_USERNAME); window.location.reload(); }} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:text-indigo-400 transition-all">
                      Admin Node
                   </button>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-center space-x-2 text-slate-700">
                  <Cpu size={14} />
                  <span className="text-[8px] font-black uppercase tracking-[0.5em]">{SYSTEM_DOMAIN}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === View.REGISTER) {
    return <InviteRegistration onRegister={handleRegisterSuccess} onNavigate={setView} />;
  }

  if (view === View.ACCESS_RECOVERY) {
    return <AccessRecovery onNavigate={setView} />;
  }

  // Fix: Removed redundant check for View.ACCESS_RECOVERY as it is already handled earlier at line 160.
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