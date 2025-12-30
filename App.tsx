
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { ErrorPage } from './views/ErrorPage';
import { DatabaseManager } from './views/DatabaseManager';
import { Notes } from './views/Notes';
import { Vault } from './views/Vault';
import { ExpenseTracker } from './views/ExpenseTracker';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { TermsModal } from './components/TermsModal';
import { RefreshCw, Layout, User, Database as DbIcon, Cloud } from 'lucide-react';

import { View, UserProfile, Database, ChatMessage, Expense, Note, VaultDocument } from './types';
import { ADMIN_USERNAME, APP_VERSION, CURRENT_TERMS_VERSION, COPYRIGHT_NOTICE, CREATOR_NAME, APP_NAME } from './constants';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem('active_session_user'));
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('architect_theme') === 'true');
  
  const initialData = {
    user: null as UserProfile | null,
    databases: [] as Database[],
    chatHistory: [] as ChatMessage[],
    expenses: [] as Expense[],
    notes: [] as Note[],
    vaultDocs: [] as VaultDocument[]
  };

  const [data, setData] = useState(initialData);

  // PERSISTENCE: Load data from "Central Server" (LocalStorage simulation)
  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem('active_session_user', currentUsername);
      const storageKey = `architect_data_${currentUsername}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({
            ...initialData,
            ...parsed
          });

          if (parsed.user) {
            if (parsed.user.acceptedTermsVersion !== CURRENT_TERMS_VERSION) {
              setShowTerms(true);
            }
            setView(currentUsername === ADMIN_USERNAME ? View.ADMIN_DASHBOARD : View.DASHBOARD);
          } else {
            setView(View.ONBOARDING);
          }
        } catch (e) {
          console.error("Data corruption detected. Resetting node.");
          setData(initialData);
          setView(View.ONBOARDING);
        }
      } else {
        setData(initialData);
        setView(View.ONBOARDING);
      }
    } else {
      localStorage.removeItem('active_session_user');
    }
  }, [currentUsername]);

  // AUTO-SAVE: Persistent data storage
  useEffect(() => {
    if (currentUsername && data.user) {
      localStorage.setItem(`architect_data_${currentUsername}`, JSON.stringify(data));
    }
  }, [data, currentUsername]);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  const handleAcceptTerms = () => {
    if (data.user) {
      const updatedUser = { ...data.user, acceptedTermsVersion: CURRENT_TERMS_VERSION };
      setData(prev => ({ ...prev, user: updatedUser }));
      setShowTerms(false);
    }
  };

  const systemReload = () => {
    setIsLoading(true);
    // Simulate server synchronization
    setTimeout(() => {
        window.location.reload();
    }, 800);
  };

  const handleLogout = () => {
    setCurrentUsername(null);
    setData(initialData);
    setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!currentUsername) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500">
        <GlobalLoader isLoading={isLoading} />
        <Login 
          user={null} 
          onLogin={(u) => { 
            setIsLoading(true); 
            setTimeout(() => { 
              setCurrentUsername(u); 
              setIsLoading(false); 
            }, 800); 
          }} 
        />
      </div>
    );
  }

  const renderContent = () => {
    if (!data.user) return <Onboarding onComplete={(p) => { setIsLoading(true); setTimeout(() => { setData(prev => ({...prev, user: p})); setView(View.DASHBOARD); setIsLoading(false); }, 1000); }} />;
    
    const isAdmin = currentUsername === ADMIN_USERNAME;
    
    switch (view) {
      case View.DASHBOARD:
        return <Dashboard user={data.user} isVerified={true} username={currentUsername} expenses={data.expenses} databases={data.databases} onNavigate={setView} />;
      case View.EXPENSES:
        return <ExpenseTracker expenses={data.expenses} setExpenses={(e) => setData(prev => ({...prev, expenses: e}))} />;
      case View.DATABASE_MANAGER:
        return <DatabaseManager databases={data.databases} setDatabases={(d) => setData(prev => ({...prev, databases: d}))} isVerified={true} />;
      case View.NOTES:
        return <Notes notes={data.notes} setNotes={(n) => setData(prev => ({...prev, notes: n}))} isAdmin={isAdmin} />;
      case View.VAULT:
        return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={(d) => setData(prev => ({...prev, vaultDocs: d}))} updateUser={(u) => setData(prev => ({...prev, user: u}))} isVerified={true} />;
      case View.AI_CHAT:
        return <AIChat chatHistory={data.chatHistory} setChatHistory={(msg) => setData(prev => ({...prev, chatHistory: msg}))} isVerified={true} />;
      case View.SETTINGS:
        return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={(u) => setData(prev => ({...prev, user: u}))} />;
      case View.ADMIN_DASHBOARD:
        return isAdmin ? <AdminDashboard resetApp={() => { localStorage.clear(); window.location.reload(); }} /> : <ErrorPage type="404" title="Access Denied" message={`Authority Required.`} />;
      default:
        return <Dashboard user={data.user} isVerified={true} username={currentUsername} expenses={data.expenses} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500 overflow-x-hidden">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
      
      <div className="md:ml-20 lg:ml-64 transition-all">
        <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-[100]">
           <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
                <DbIcon size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hidden sm:block">
                {APP_NAME} • {view.replace('_', ' ')}
              </span>
           </div>
           
           <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 mr-4 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                <Cloud size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Server Synced</span>
              </div>

              <button 
                onClick={systemReload}
                className="p-3 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Synchronize Now"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
              
              <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
              
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                <User size={16} className="text-slate-400" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{currentUsername}</span>
              </div>
           </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 lg:p-12 pb-24 lg:pb-16 min-h-[calc(100vh-64px)] w-full">
            {renderContent()}
        </main>
      </div>

      <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={true} />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-black/40 backdrop-blur-md p-1.5 z-[100] text-center hidden md:block border-t border-slate-200 dark:border-slate-800">
          <p className="text-[7px] text-slate-400 font-black tracking-[0.4em] uppercase max-w-5xl mx-auto opacity-60">
            {COPYRIGHT_NOTICE}
          </p>
      </div>
    </div>
  );
}

export default App;
