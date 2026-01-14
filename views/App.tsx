import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AIChat } from './views/AIChat';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { View, UserProfile, VaultDocument, ChatMessage, Assignment } from './types';
import { SYSTEM_DOMAIN, DEFAULT_USER } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('architect_theme') === 'true');
  
  const [user, setUser] = useState<UserProfile>({
    ...DEFAULT_USER,
    name: "Sushil Pokharel",
    education: "Bachelor of Business Studies (BBS)",
    profession: "Student & Tech Innovator",
    isVerified: true,
    level: 2
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const loadLocalData = async () => {
      const stored = await storageService.getData('public_portfolio_data');
      if (stored) {
        if (stored.chatHistory) setChatHistory(stored.chatHistory);
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.assignments) setAssignments(stored.assignments);
      }
    };
    loadLocalData();
  }, []);

  useEffect(() => {
    storageService.setData('public_portfolio_data', {
      chatHistory, vaultDocs, assignments
    });
  }, [chatHistory, vaultDocs, assignments]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  const renderContent = () => {
    try {
      switch (view) {
        case View.DASHBOARD: 
          return <Dashboard user={user} username="sushil_p" onNavigate={setView} />;
        case View.FILE_HUB: 
          return <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />;
        case View.AI_CHAT: 
          return <AIChat chatHistory={chatHistory} setChatHistory={setChatHistory} isVerified={true} username="sushil_p" />;
        case View.SETTINGS: 
          return <Settings user={user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={() => {}} username="sushil_p" darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={setUser} />;
        case View.SUPPORT: 
          return <Support username="sushil_p" />;
        case View.VERIFY_LINK: 
          return <StudyPlanner assignments={assignments} setAssignments={setAssignments} isAdmin={true} />;
        case View.ERROR:
          return <ErrorPage type="404" onAction={() => setView(View.DASHBOARD)} />;
        default: 
          return <Dashboard user={user} username="sushil_p" onNavigate={setView} />;
      }
    } catch (e) {
      return <ErrorPage type="CRASH" errorDetails={e.toString()} onAction={() => window.location.reload()} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-300">
      <GlobalLoader isLoading={isLoading} />
      
      <div className="md:ml-20 lg:ml-64 transition-all animate-fade-in min-h-screen flex flex-col">
        <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
           <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-600/20">
                <div className="font-black text-xs">SP</div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none mb-0.5">Sushil Portfolio</span>
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{SYSTEM_DOMAIN}</span>
                </div>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identity Verified</p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Sushil Pokharel</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1">
                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" alt="User" />
              </div>
           </div>
        </header>
        
        <main className="flex-1 max-w-7xl mx-auto w-full pt-8 px-6 pb-24 md:pb-10">
            {renderContent()}
        </main>
      </div>
      
      <Navigation 
          currentView={view} 
          setView={setView} 
          isAdmin={false} 
          isVerified={true}
          username="Sushil Pokharel" 
          onLogout={() => {}}
      />
    </div>
  );
}

export default App;
