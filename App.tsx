
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
import { CVBuilder } from './views/CVBuilder';
import { ScholarshipTracker } from './views/ScholarshipTracker';
import { ExpenseTracker } from './views/ExpenseTracker';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';

import { View, UserProfile, Assignment, Scholarship, ChatMessage, ChangeRequest, Expense, Note, VaultDocument } from './types';
import { DEFAULT_USER, ADMIN_USERNAME, APP_VERSION } from './constants';

interface AppData {
  user: UserProfile | null;
  assignments: Assignment[];
  scholarships?: Scholarship[];
  chatHistory?: ChatMessage[];
  expenses?: Expense[];
  notes?: Note[];
  vaultDocs?: VaultDocument[];
}

const INITIAL_DATA: AppData = {
  user: null,
  assignments: [],
  scholarships: [],
  chatHistory: [],
  expenses: [],
  notes: [],
  vaultDocs: []
};

function App() {
  const [view, setView] = useState<View>(View.ONBOARDING);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [resetUser, setResetUser] = useState<string | null>(null);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentpocket_theme') === 'true';
  });

  const [data, setData] = useState<AppData>(INITIAL_DATA);

  // v2.0 MIGRATION / RESET LOGIC
  useEffect(() => {
      const storedVersion = localStorage.getItem('studentpocket_version');
      if (storedVersion !== APP_VERSION) {
          console.log("New version detected. Performing reset/migration...");
          // Keep critical user verification if possible, but for a "Reset" request, we clear data
          // However, we don't want to annoy returning users too much, so let's just clear cache-like items
          // Or if strict reset is requested:
          // localStorage.clear(); // Uncomment for hard reset
          
          localStorage.setItem('studentpocket_version', APP_VERSION);
      }
  }, []);

  // Helper to check verification status
  const isVerified = (() => {
    if (!currentUsername) return false;
    if (currentUsername === ADMIN_USERNAME) return true; 

    try {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (!usersStr) return false;
      const users = JSON.parse(usersStr);
      return users[currentUsername]?.verified === true;
    } catch (e) {
      return false;
    }
  })();

  // Handle URL Reset Links
  useEffect(() => {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        try {
            window.history.replaceState(null, '', '/' + window.location.search);
        } catch (e) {
            // Ignore history errors
        }
    }

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const user = params.get('user');
    const token = params.get('token');

    if (user && token && mode === 'reset') {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const userData = users[user];
        if (userData && userData.resetToken === token) {
           setResetUser(user);
        }
      }
    }
  }, []);

  // Data Load
  useEffect(() => {
    if (currentUsername) {
      const storageKey = `studentpocket_data_${currentUsername}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.chatHistory) parsed.chatHistory = [];
        if (!parsed.expenses) parsed.expenses = [];
        if (!parsed.notes) parsed.notes = [];
        if (!parsed.vaultDocs) parsed.vaultDocs = [];
        
        setData(parsed);
        if (parsed.user) {
          setView(currentUsername === ADMIN_USERNAME ? View.ADMIN_DASHBOARD : View.DASHBOARD);
        } else {
          setView(View.ONBOARDING);
        }
      } else {
        setData(INITIAL_DATA);
        setView(View.ONBOARDING);
      }
    } else {
      setData(INITIAL_DATA);
    }
  }, [currentUsername]);

  // Data Save
  useEffect(() => {
    if (currentUsername && data.user) {
      const storageKey = `studentpocket_data_${currentUsername}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [data, currentUsername]);

  // Theme Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studentpocket_theme', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studentpocket_theme', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setIsLoading(true);
    setTimeout(() => {
        setData(prev => ({ ...prev, user: profile }));
        setView(currentUsername === ADMIN_USERNAME ? View.ADMIN_DASHBOARD : View.DASHBOARD);
        setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    if (currentUsername) {
       const storageKey = `studentpocket_data_${currentUsername}`;
       localStorage.removeItem(storageKey);
       setData(INITIAL_DATA);
       setView(View.ONBOARDING);
    }
  };

  const handleFactoryReset = () => {
      localStorage.clear();
      window.location.reload();
  };

  const handleLogin = (username: string) => {
    setIsLoading(true);
    setTimeout(() => {
        setCurrentUsername(username);
        setIsLoading(false);
    }, 1000); 
  };
  
  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
        setCurrentUsername(null);
        setView(View.ONBOARDING); 
        setIsLoading(false);
    }, 800);
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    setData(prev => ({ ...prev, user: updatedProfile }));
  };

  const handleStringNav = (viewName: string) => {
      // @ts-ignore
      if (View[viewName]) setView(View[viewName]);
  };

  if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const MainContent = () => {
      if (!currentUsername) {
        return <Login user={null} onLogin={handleLogin} resetUser={resetUser} />;
      }

      if (!data.user) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
      }

      const isAdmin = currentUsername === ADMIN_USERNAME;

      switch (view) {
        case View.DASHBOARD:
          return <Dashboard 
                    user={data.user} 
                    isVerified={isVerified} 
                    username={currentUsername} 
                    expenses={data.expenses || []}
                    onNavigate={handleStringNav}
                  />;
        case View.EXPENSES:
          return <ExpenseTracker 
                    expenses={data.expenses || []}
                    setExpenses={(e) => setData({...data, expenses: e})}
                  />;
        case View.PLANNER:
          return <StudyPlanner 
                    assignments={data.assignments} 
                    setAssignments={(a) => setData({...data, assignments: a})}
                    isAdmin={isAdmin}
                  />;
        case View.NOTES:
          return <Notes 
                  notes={data.notes || []}
                  setNotes={(n) => setData({...data, notes: n})}
                  isAdmin={isAdmin}
                 />;
        case View.VAULT:
          return <Vault 
                  user={data.user}
                  documents={data.vaultDocs || []}
                  saveDocuments={(d) => setData({...data, vaultDocs: d})}
                  isVerified={isVerified}
                 />;
        case View.CV_BUILDER:
          return <CVBuilder user={data.user} updateUser={handleUpdateUser} isVerified={isVerified} />;
        case View.SCHOLARSHIPS:
          return <ScholarshipTracker scholarships={data.scholarships} setScholarships={(s) => setData({...data, scholarships: s})} />;
        case View.AI_CHAT:
          return <AIChat 
            chatHistory={data.chatHistory || []}
            setChatHistory={(msg) => setData({...data, chatHistory: msg})}
            isVerified={isVerified}
          />;
        case View.SETTINGS:
          return <Settings 
            user={data.user} 
            resetApp={handleReset} 
            onLogout={handleLogout} 
            username={currentUsername}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            updateUser={handleUpdateUser}
          />;
        case View.ADMIN_DASHBOARD:
          return isAdmin ? <AdminDashboard resetApp={handleFactoryReset} /> : <ErrorPage type="404" title="Access Denied" message="You do not have permission to view this page." />;
        default:
          return <Dashboard user={data.user} isVerified={isVerified} username={currentUsername} expenses={data.expenses || []} onNavigate={handleStringNav} />;
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <GlobalLoader isLoading={isLoading} />
      <div className="md:ml-20 lg:ml-64 min-h-screen transition-all">
        <main className="max-w-4xl mx-auto p-4 md:p-8 pt-6 pb-24 md:pb-8">
            <MainContent />
        </main>
      </div>
      <Navigation 
        currentView={view} 
        setView={setView} 
        isAdmin={currentUsername === ADMIN_USERNAME} 
        isVerified={isVerified}
      />
    </div>
  );
}

export default App;
