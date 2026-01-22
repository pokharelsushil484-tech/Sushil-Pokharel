import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Login } from './views/Login';
import { Footer } from './components/Footer';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // App Data State
  const [user, setUser] = useState<UserProfile>({
    ...DEFAULT_USER,
    education: "Academic Center for Excellence",
    isVerified: true
  });

  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const loadLocalData = async () => {
      const stored = await storageService.getData('student_pocket_v5_stable');
      if (stored) {
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.assignments) setAssignments(stored.assignments);
      }
    };
    loadLocalData();
  }, []);

  useEffect(() => {
    storageService.setData('student_pocket_v5_stable', {
      vaultDocs, assignments
    });
  }, [vaultDocs, assignments]);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  const renderContent = () => {
    try {
      switch (view) {
        case View.DASHBOARD: 
          return <Dashboard user={user} username={user.name} onNavigate={setView} />;
        case View.FILE_HUB: 
          return <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />;
        case View.SETTINGS: 
          return <Settings user={user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={() => setIsLoggedIn(false)} username={user.name} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />;
        case View.SUPPORT: 
          return <Support username={user.name} />;
        case View.VERIFY_LINK: 
          return <StudyPlanner assignments={assignments} setAssignments={setAssignments} isAdmin={true} />;
        default: 
          return <Dashboard user={user} username={user.name} onNavigate={setView} />;
      }
    } catch (e: any) {
      // FIX FOR ERROR #31: Ensure error is never a raw object child.
      const errStr = e instanceof Error ? e.message : JSON.stringify(e);
      return <ErrorPage type="CRASH" errorDetails={String(errStr)} onAction={() => window.location.reload()} />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-indigo-500/30">
      <GlobalLoader isLoading={isLoading} />
      
      <div className="md:ml-20 lg:ml-64 transition-all min-h-screen flex flex-col">
        <header className="bg-black/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
           <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                <div className="font-black text-xs">SP</div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-widest">{APP_NAME}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{SYSTEM_DOMAIN}</span>
              </div>
           </div>
           
           <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Profile</p>
                  <p className="text-xs font-bold text-indigo-400">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center p-0.5">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" alt="User" />
              </div>
           </div>
        </header>
        
        <main className="flex-1 max-w-7xl mx-auto w-full pt-10 px-8 pb-32 md:pb-12 flex flex-col">
            <div className="flex-1">
              {renderContent()}
            </div>
            <Footer onNavigate={setView} />
        </main>
      </div>
      
      <Navigation 
          currentView={view} 
          setView={setView} 
          isAdmin={false} 
          isVerified={true}
          username={user.name} 
          onLogout={() => setIsLoggedIn(false)}
      />
    </div>
  );
}

export default App;