
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { ErrorPage } from './views/ErrorPage';
import { View, UserProfile, Assignment, Scholarship, ChatMessage, ChangeRequest } from './types';
import { DEFAULT_USER, ADMIN_USERNAME } from './constants';

interface AppData {
  user: UserProfile | null;
  assignments: Assignment[]; // Kept for backend compatibility, but UI removed
  scholarships?: Scholarship[];
  chatHistory?: ChatMessage[];
}

const INITIAL_DATA: AppData = {
  user: null,
  assignments: [],
  scholarships: [],
  chatHistory: []
};

function App() {
  const [view, setView] = useState<View>(View.ONBOARDING);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  
  // New state to handle reset password flow
  const [resetUser, setResetUser] = useState<string | null>(null);
  const [isPathError, setIsPathError] = useState(false);

  // Global Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentpocket_theme') === 'true';
  });

  const [data, setData] = useState<AppData>(INITIAL_DATA);

  // --- URL ROUTING & ERROR HANDLING ---
  useEffect(() => {
     // Check for malformed URLs or non-root paths to simulate 404/Crash
     const path = window.location.pathname;
     
     // Allow root, index.html, or reset mode params
     const isValidPath = path === '/' || path === '/index.html';
     
     if (!isValidPath) {
         setIsPathError(true);
     }
     
     if (window.location.href.endsWith('-') || window.location.hash.endsWith('-')) {
         throw new Error("System Alert: Malformed URL detected (Trailing Dash Exception). Redirecting to Error Handler.");
     }
  }, []);

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
        } else {
           alert("❌ Invalid or expired reset link.");
        }
      }
    }
  }, []);

  // System Cleanup & Data Load
  useEffect(() => {
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
        if (parsed.user) {
             if (!parsed.user.experience) parsed.user.experience = [];
             if (!parsed.user.projects) parsed.user.projects = [];
        }
        
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
    setData(prev => ({ ...prev, user: profile }));
    setView(currentUsername === ADMIN_USERNAME ? View.ADMIN_DASHBOARD : View.DASHBOARD);
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
    setCurrentUsername(username);
  };
  
  const handleLogout = () => {
    setCurrentUsername(null);
    setView(View.ONBOARDING); 
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    setData(prev => ({ ...prev, user: updatedProfile }));
  };

  // 0. Path Error Check
  if (isPathError) {
      return (
        <ErrorPage 
          type="404" 
          title="Page Not Found"
          message="The link you followed may be broken, or the page may have been removed."
          onAction={() => window.location.href = '/'} 
          actionLabel="Return Home" 
        />
      );
  }

  // 1. Authentication Check
  if (!currentUsername) {
    return <Login user={null} onLogin={handleLogin} resetUser={resetUser} />;
  }

  // 2. Onboarding Check
  if (!data.user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // 3. Main App Views
  const renderView = () => {
    const isAdmin = currentUsername === ADMIN_USERNAME;

    switch (view) {
      case View.DASHBOARD:
        return <Dashboard user={data.user} isVerified={isVerified} username={currentUsername} />;
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
        return <ErrorPage type="404" onAction={() => setView(View.DASHBOARD)} actionLabel="Return to Stream" />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="md:ml-64 min-h-screen transition-all">
          <main className="max-w-3xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
             {renderView()}
          </main>
        </div>
        <Navigation 
          currentView={view} 
          setView={setView} 
          isAdmin={currentUsername === ADMIN_USERNAME} 
          isVerified={isVerified}
        />
      </div>
    </div>
  );
}

export default App;
