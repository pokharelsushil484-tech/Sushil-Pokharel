
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { ErrorPage } from './views/ErrorPage';
import { StudyPlanner } from './views/StudyPlanner'; // Reusing for Tasks
import { Notes } from './views/Notes'; // New import (using existing file if available, assuming structure)
import { Vault } from './views/Vault'; // New import
import { CVBuilder } from './views/CVBuilder'; // New import
import { ScholarshipTracker } from './views/ScholarshipTracker';
import { ExpenseTracker } from './views/ExpenseTracker';
import { GlobalLoader } from './components/GlobalLoader';

import { View, UserProfile, Assignment, Scholarship, ChatMessage, ChangeRequest, Expense, Note, VaultDocument } from './types';
import { DEFAULT_USER, ADMIN_USERNAME } from './constants';

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
  
  // Loading State for transitions
  const [isLoading, setIsLoading] = useState(false);
  
  // New state to handle reset password flow
  const [resetUser, setResetUser] = useState<string | null>(null);
  
  // Global Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentpocket_theme') === 'true';
  });

  const [data, setData] = useState<AppData>(INITIAL_DATA);

  // Helper to check verification status dynamically
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

  // Handle URL Reset Links Only
  useEffect(() => {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        try {
            window.history.replaceState(null, '', '/' + window.location.search);
        } catch (e) {
            // Ignore history errors in restricted environments
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

  // System Cleanup & Data Load
  useEffect(() => {
    // Show loader on initial mount
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);

    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) {
        try {
            const requests: ChangeRequest[] = JSON.parse(reqStr);
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            const validRequests = requests.filter(req => 
                req.status === 'PENDING' || (now - new Date(req.timestamp).getTime() < thirtyDaysMs)
            );
            
            if (validRequests.length !== requests.length) {
                localStorage.setItem('studentpocket_requests', JSON.stringify(validRequests));
            }
        } catch (e) {
            console.error("Cleanup Error", e);
        }
    }

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

  // Save data on change
  useEffect(() => {
    if (currentUsername && data.user) {
      const storageKey = `studentpocket_data_${currentUsername}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [data, currentUsername]);

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
    }, 1000);
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
    }, 800);
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

  const handleViewChange = (newView: View) => {
      // Small simulated delay for smoothness
      // setIsLoading(true);
      // setTimeout(() => {
          setView(newView);
      //    setIsLoading(false);
      // }, 300);
  };

  // Convert string View to enum View safely for Navigation callbacks
  const handleStringNav = (viewName: string) => {
      // @ts-ignore
      if (View[viewName]) handleViewChange(View[viewName]);
  };

  // 1. Authentication Check
  if (!currentUsername) {
    return (
        <>
            <GlobalLoader isLoading={isLoading} message="Authenticating..." />
            <Login user={null} onLogin={handleLogin} resetUser={resetUser} />
        </>
    );
  }

  // 2. Onboarding Check
  if (!data.user) {
    return (
        <>
             <GlobalLoader isLoading={isLoading} message="Setting up profile..." />
             <Onboarding onComplete={handleOnboardingComplete} />
        </>
    );
  }

  // 3. Main App Views
  const renderView = () => {
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
      case View.PLANNER: // Using StudyPlanner logic for general Tasks
        return <StudyPlanner 
                  assignments={data.assignments} 
                  setAssignments={(a) => setData({...data, assignments: a})}
                  isAdmin={isAdmin}
                />;
      case View.NOTES: // If previously existing, or we can use placeholder
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
    <div className="min-h-screen transition-colors duration-300">
      <GlobalLoader isLoading={isLoading} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="md:ml-64 min-h-screen transition-all">
          <main className="max-w-3xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
             {renderView()}
          </main>
        </div>
        <Navigation 
          currentView={view} 
          setView={handleViewChange} 
          isAdmin={currentUsername === ADMIN_USERNAME} 
          isVerified={isVerified}
        />
      </div>
    </div>
  );
}

export default App;
