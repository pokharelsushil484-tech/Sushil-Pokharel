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
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Login } from './views/Login';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  // App Data State
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
    if (username === ADMIN_USERNAME) {
        // Force Admin to be Verified and High Level
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
        if (stored?.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored?.assignments) setAssignments(stored.assignments);
    } else if (stored) {
      if (stored.user) setUser(stored.user);
      if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
      if (stored.assignments) setAssignments(stored.assignments);
    }
  };

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
      setUser({ ...DEFAULT_USER, isVerified: false });
      setView(View.DASHBOARD);
  };

  useEffect(() => {
    if (activeUser) {
        storageService.setData(`architect_data_${activeUser}`, {
          user, vaultDocs, assignments
        });
    }
  }, [user, vaultDocs, assignments, activeUser]);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  // Enforce Verification State for non-verified users, BYPASS FOR ADMIN
  if (activeUser !== ADMIN_USERNAME && !user.isVerified && view !== View.VERIFICATION_FORM && view !== View.SUPPORT && view !== View.ACCESS_RECOVERY) {
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
        case View.DASHBOARD: 
          return <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />;
        case View.FILE_HUB: 
          return <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />;
        case View.SETTINGS: 
          return <Settings user={user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={activeUser || ''} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />;
        case View.SUPPORT: 
          return <Support username={activeUser || ''} />;
        case View.VERIFY_LINK: 
          return <StudyPlanner assignments={assignments} setAssignments={setAssignments} isAdmin={true} />;
        case View.VERIFICATION_FORM:
          return <VerificationForm user={user} username={activeUser || ''} updateUser={setUser} onNavigate={setView} />;
        case View.ACCESS_RECOVERY:
          return <AccessRecovery onNavigate={setView} />;
        case View.ADMIN_DASHBOARD:
          return <AdminDashboard />;
        default: 
          return <Dashboard user={user} username={activeUser || ''} onNavigate={setView} />;
      }
    } catch (e: any) {
      const errStr = e instanceof Error ? e.message : JSON.stringify(e);
      return <ErrorPage type="CRASH" errorDetails={String(errStr)} onAction={() => window.location.reload()} />;
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
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Authorized Layer</p>
                  <p className="text-xs font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-slate-900 flex items-center justify-center p-0.5 shadow-xl">
                <img src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover rounded-full" alt="User" />
              </div>
           </div>
        </header>
        
        <main className="flex-1 max-w-7xl mx-auto w-full pt-10 px-6 sm:px-10 pb-32 md:pb-12">
            <div className="w-full h-full min-h-[600px]">
                {renderContent()}
            </div>
        </main>
      </div>
      
      <Navigation 
          currentView={view} 
          setView={setView} 
          isAdmin={activeUser === ADMIN_USERNAME} 
          isVerified={user.isVerified}
          username={activeUser || ''} 
          onLogout={handleLogout}
      />
    </div>
  );
}

export default App;