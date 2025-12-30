
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
import { StudyPlanner } from './views/StudyPlanner';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { TermsModal } from './components/TermsModal';
import { RefreshCw, Layout, User, Database as DbIcon, Cloud, Power, AlertTriangle, ArrowRight } from 'lucide-react';

import { View, UserProfile, Database, ChatMessage, Expense, Note, VaultDocument, Assignment } from './types';
import { ADMIN_USERNAME, APP_VERSION, CURRENT_TERMS_VERSION, COPYRIGHT_NOTICE, CREATOR_NAME, APP_NAME, CURRENT_MONTH_KEY } from './constants';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem('active_session_user'));
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(() => localStorage.getItem('system_active_state') === 'true');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('architect_theme') === 'true');
  
  const initialData = {
    user: null as UserProfile | null,
    databases: [] as Database[],
    chatHistory: [] as ChatMessage[],
    expenses: [] as Expense[],
    notes: [] as Note[],
    vaultDocs: [] as VaultDocument[],
    assignments: [] as Assignment[]
  };

  const [data, setData] = useState(initialData);

  // Check for monthly update
  useEffect(() => {
    const lastCheck = localStorage.getItem('last_system_update_check');
    if (lastCheck && lastCheck !== CURRENT_MONTH_KEY) {
      setShowUpdatePrompt(true);
    }
    localStorage.setItem('last_system_update_check', CURRENT_MONTH_KEY);
  }, []);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem('active_session_user', currentUsername);
      const storageKey = `architect_data_${currentUsername}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({ ...initialData, ...parsed });
          if (parsed.user) {
            if (parsed.user.acceptedTermsVersion !== CURRENT_TERMS_VERSION) {
              setShowTerms(true);
            }
          } else {
            setView(View.ONBOARDING);
          }
        } catch (e) {
          setData(initialData);
          setView(View.ONBOARDING);
        }
      } else {
        setData(initialData);
        setView(View.ONBOARDING);
      }
    }
  }, [currentUsername]);

  useEffect(() => {
    if (currentUsername && data.user) {
      localStorage.setItem(`architect_data_${currentUsername}`, JSON.stringify(data));
    }
  }, [data, currentUsername]);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  const handleEnableSystem = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsSystemActive(true);
      localStorage.setItem('system_active_state', 'true');
      setIsLoading(false);
    }, 1500);
  };

  const handleReloadUpdate = () => {
    setIsLoading(true);
    localStorage.setItem('last_system_update_check', CURRENT_MONTH_KEY);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleLogout = () => {
    setCurrentUsername(null);
    setData(initialData);
    localStorage.removeItem('active_session_user');
    setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!isSystemActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <GlobalLoader isLoading={isLoading} message="Initializing Hub Core..." />
        <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl max-w-md animate-scale-up">
          <Power size={64} className="mx-auto mb-8 text-indigo-500 animate-pulse" />
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">System Offline</h1>
          <p className="text-slate-400 mb-10 text-sm font-medium leading-relaxed">
            The workspace infrastructure is currently dormant. Access granted by Sushil is required to initialize the encrypted nodes.
          </p>
          <button 
            onClick={handleEnableSystem}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center"
          >
            Enable System Core <ArrowRight size={18} className="ml-3" />
          </button>
        </div>
        <p className="mt-12 text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">{COPYRIGHT_NOTICE}</p>
      </div>
    );
  }

  if (showUpdatePrompt) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md animate-scale-up">
          <RefreshCw size={64} className="mx-auto mb-8 animate-spin-slow" />
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Update Ready</h1>
          <p className="text-indigo-100 mb-10 text-lg font-bold">
            A new monthly version of {APP_NAME} is available. Updates ensure your data nodes remain synchronized and secure.
          </p>
          <button 
            onClick={handleReloadUpdate}
            className="bg-white text-indigo-600 px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-50 transition-all"
          >
            Reload Workspace Now
          </button>
        </div>
      </div>
    );
  }

  if (!currentUsername) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans">
        <GlobalLoader isLoading={isLoading} />
        <Login user={null} onLogin={(u) => { setIsLoading(true); setTimeout(() => { setCurrentUsername(u); setIsLoading(false); }, 800); }} />
      </div>
    );
  }

  const renderContent = () => {
    if (!data.user) return <Onboarding onComplete={(p) => { setIsLoading(true); setTimeout(() => { setData(prev => ({...prev, user: p})); setView(View.DASHBOARD); setIsLoading(false); }, 1000); }} />;
    const isAdmin = currentUsername === ADMIN_USERNAME;
    
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={data.user} isVerified={true} username={currentUsername} expenses={data.expenses} databases={data.databases} onNavigate={setView} />;
      case View.EXPENSES: return <ExpenseTracker expenses={data.expenses} setExpenses={(e) => setData(prev => ({...prev, expenses: e}))} />;
      case View.DATABASE_MANAGER: return <DatabaseManager databases={data.databases} setDatabases={(d) => setData(prev => ({...prev, databases: d}))} isVerified={true} />;
      case View.NOTES: return <Notes notes={data.notes} setNotes={(n) => setData(prev => ({...prev, notes: n}))} isAdmin={isAdmin} />;
      case View.VAULT: return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={(d) => setData(prev => ({...prev, vaultDocs: d}))} updateUser={(u) => setData(prev => ({...prev, user: u}))} isVerified={true} />;
      case View.PLANNER: return <StudyPlanner assignments={data.assignments || []} setAssignments={(a) => setData(prev => ({...prev, assignments: a}))} isAdmin={true} />;
      case View.AI_CHAT: return <AIChat chatHistory={data.chatHistory} setChatHistory={(msg) => setData(prev => ({...prev, chatHistory: msg}))} isVerified={true} />;
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={(u) => setData(prev => ({...prev, user: u}))} />;
      case View.ADMIN_DASHBOARD: return isAdmin ? <AdminDashboard resetApp={() => { localStorage.clear(); window.location.reload(); }} /> : <ErrorPage type="404" title="Access Denied" />;
      default: return <Dashboard user={data.user} isVerified={true} username={currentUsername} expenses={data.expenses} databases={data.databases} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500 overflow-x-hidden">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={() => { if(data.user) setData(prev => ({...prev, user: { ...prev.user!, acceptedTermsVersion: CURRENT_TERMS_VERSION } })); setShowTerms(false); }} />}
      <div className="md:ml-20 lg:ml-64 transition-all">
        <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-[100]">
           <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white"><DbIcon size={18} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hidden sm:block">{APP_NAME} • {view.replace('_', ' ')}</span>
           </div>
           <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 mr-4 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                <Cloud size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Nodes Active</span>
              </div>
              <button onClick={() => window.location.reload()} className="p-3 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl"><RefreshCw size={20} /></button>
              <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                <User size={16} className="text-slate-400" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{currentUsername}</span>
              </div>
           </div>
        </header>
        <main className="max-w-7xl mx-auto p-6 lg:p-12 pb-24 lg:pb-16 min-h-[calc(100vh-64px)] w-full">{renderContent()}</main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={true} />
    </div>
  );
}

export default App;
