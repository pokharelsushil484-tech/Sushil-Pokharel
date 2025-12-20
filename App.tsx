
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { ErrorPage } from './views/ErrorPage';
import { StudyPlanner } from './views/StudyPlanner';
import { Notes } from './views/Notes';
import { Vault } from './views/Vault';
import { ExpenseTracker } from './views/ExpenseTracker';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { TermsModal } from './components/TermsModal';

import { View, UserProfile, Assignment, ChatMessage, Expense, Note, VaultDocument } from './types';
import { ADMIN_USERNAME, APP_VERSION, CURRENT_TERMS_VERSION } from './constants';

const LockedView = () => (
  <div className="h-[70vh] flex flex-col items-center justify-center animate-fade-in perspective-3d">
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 text-center card-3d max-w-md">
      <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-float">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Verification Required</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
        This dashboard contains personal sensitive data. Please request identity verification from the Config page to unlock this module.
      </p>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-400 uppercase tracking-widest">
        Security Level: Personal High
      </div>
    </div>
  </div>
);

function App() {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('studentpocket_theme') === 'true');
  const [data, setData] = useState({
    user: null as UserProfile | null,
    assignments: [] as Assignment[],
    chatHistory: [] as ChatMessage[],
    expenses: [] as Expense[],
    notes: [] as Note[],
    vaultDocs: [] as VaultDocument[]
  });

  const isVerified = (() => {
    if (!currentUsername) return false;
    if (currentUsername === ADMIN_USERNAME) return true; 
    try {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (!usersStr) return false;
      const users = JSON.parse(usersStr);
      return users[currentUsername]?.verified === true;
    } catch (e) { return false; }
  })();

  useEffect(() => {
    if (currentUsername) {
      const storageKey = `studentpocket_data_${currentUsername}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
        // If logged in and has a profile, check if terms are accepted
        if (parsed.user) {
          if (parsed.user.acceptedTermsVersion !== CURRENT_TERMS_VERSION) {
            setShowTerms(true);
          }
          setView(currentUsername === ADMIN_USERNAME ? View.ADMIN_DASHBOARD : View.DASHBOARD);
        } else {
          setView(View.ONBOARDING);
        }
      } else {
        setView(View.ONBOARDING);
      }
    }
  }, [currentUsername]);

  useEffect(() => {
    if (currentUsername && data.user) {
      localStorage.setItem(`studentpocket_data_${currentUsername}`, JSON.stringify(data));
    }
  }, [data, currentUsername]);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('studentpocket_theme', String(darkMode));
  }, [darkMode]);

  const handleAcceptTerms = () => {
    if (data.user) {
      const updatedUser = { ...data.user, acceptedTermsVersion: CURRENT_TERMS_VERSION };
      setData(prev => ({ ...prev, user: updatedUser }));
      setShowTerms(false);
    }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!currentUsername) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-all duration-300">
        <GlobalLoader isLoading={isLoading} />
        <Login user={null} onLogin={(u) => { setIsLoading(true); setTimeout(() => { setCurrentUsername(u); setIsLoading(false); }, 1000); }} />
      </div>
    );
  }

  const MainContent = () => {
    if (!data.user) return <Onboarding onComplete={(p) => { setIsLoading(true); setTimeout(() => { setData(prev => ({...prev, user: p})); setView(View.DASHBOARD); setIsLoading(false); }, 1000); }} />;
    
    const isAdmin = currentUsername === ADMIN_USERNAME;
    
    // DASHBOARD ACCESS CONTROL
    if (!isVerified && view !== View.DASHBOARD && view !== View.SETTINGS && view !== View.ONBOARDING) {
        return <LockedView />;
    }

    switch (view) {
      case View.DASHBOARD:
        return <Dashboard user={data.user} isVerified={isVerified} username={currentUsername} expenses={data.expenses} onNavigate={(v: any) => setView(v)} />;
      case View.EXPENSES:
        return <ExpenseTracker expenses={data.expenses} setExpenses={(e) => setData({...data, expenses: e})} />;
      case View.PLANNER:
        return <StudyPlanner assignments={data.assignments} setAssignments={(a) => setData({...data, assignments: a})} isAdmin={isAdmin} />;
      case View.NOTES:
        return <Notes notes={data.notes} setNotes={(n) => setData({...data, notes: n})} isAdmin={isAdmin} />;
      case View.VAULT:
        return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={(d) => setData({...data, vaultDocs: d})} isVerified={isVerified} />;
      case View.AI_CHAT:
        return <AIChat chatHistory={data.chatHistory} setChatHistory={(msg) => setData({...data, chatHistory: msg})} isVerified={isVerified} />;
      case View.SETTINGS:
        return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={() => setCurrentUsername(null)} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={(u) => setData({...data, user: u})} />;
      case View.ADMIN_DASHBOARD:
        return isAdmin ? <AdminDashboard resetApp={() => { localStorage.clear(); window.location.reload(); }} /> : <ErrorPage type="404" title="Forbidden" message="Only Sushil's Admin account can enter." />;
      default:
        return <Dashboard user={data.user} isVerified={isVerified} username={currentUsername} expenses={data.expenses} onNavigate={(v: any) => setView(v)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-all duration-300 overflow-x-hidden">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
      <div className="md:ml-20 lg:ml-64 min-h-screen transition-all">
        <main className="max-w-6xl mx-auto p-4 md:p-10 pt-6 pb-24 md:pb-10 perspective-3d">
            <MainContent />
        </main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={isVerified} />
    </div>
  );
}

export default App;
