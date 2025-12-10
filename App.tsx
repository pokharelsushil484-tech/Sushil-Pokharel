
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { StudyPlanner } from './views/StudyPlanner';
import { Notes } from './views/Notes';
import { Vault } from './views/Vault';
import { CVBuilder } from './views/CVBuilder';
import { Settings } from './views/Settings';
import { ScholarshipTracker } from './views/ScholarshipTracker';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { ErrorPage } from './views/ErrorPage';
import { View, UserProfile, Assignment, Note, VaultDocument, Scholarship, ChatMessage, ChangeRequest } from './types';
import { DEFAULT_USER, ADMIN_USERNAME } from './constants';

interface AppData {
  user: UserProfile | null;
  assignments: Assignment[];
  notes: Note[];
  vaultDocs: VaultDocument[];
  scholarships?: Scholarship[];
  chatHistory?: ChatMessage[];
}

const INITIAL_DATA: AppData = {
  user: null,
  assignments: [],
  notes: [],
  vaultDocs: [],
  scholarships: [],
  chatHistory: []
};

function App() {
  const [view, setView] = useState<View>(View.ONBOARDING);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  
  // New state to handle reset password flow
  const [resetUser, setResetUser] = useState<string | null>(null);

  // Global Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentpocket_theme') === 'true';
  });

  const [data, setData] = useState<AppData>(INITIAL_DATA);

  // --- CRASH TRIGGER LOGIC ---
  // If the URL contains a trailing dash (e.g., domain.com/dashboard-), throw error
  useEffect(() => {
     if (window.location.pathname.endsWith('-') || window.location.hash.endsWith('-')) {
         throw new Error("Malformatted URL detected: Trailing Dash Security Exception");
     }
  }, []);

  // Helper to check verification status dynamically
  const isVerified = (() => {
    if (!currentUsername) return false;
    // Admin is always "verified" conceptually
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
    // --- GLOBAL REQUEST CLEANUP (30 DAYS) ---
    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) {
        try {
            const requests: ChangeRequest[] = JSON.parse(reqStr);
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            // Keep pending requests OR requests updated within 30 days
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
        // Ensure chatHistory exists for older data
        if (!parsed.chatHistory) parsed.chatHistory = [];
        // Ensure arrays exist for new fields
        if (parsed.user) {
             if (!parsed.user.experience) parsed.user.experience = [];
             if (!parsed.user.projects) parsed.user.projects = [];
        }
        
        // --- AUTO-DELETE TRASH LOGIC (30 DAYS) ---
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        
        // Filter out items that have been in trash for > 30 days
        if (parsed.notes) {
            parsed.notes = parsed.notes.filter((n: Note) => 
                !n.deletedAt || (now - n.deletedAt < thirtyDaysMs)
            );
        }
        if (parsed.vaultDocs) {
            parsed.vaultDocs = parsed.vaultDocs.filter((d: VaultDocument) => 
                !d.deletedAt || (now - d.deletedAt < thirtyDaysMs)
            );
        }
        // ------------------------------------

        setData(parsed);
        if (parsed.user) {
          setView(currentUsername === ADMIN_USERNAME ? View.ADMIN_DASHBOARD : View.DASHBOARD);
        } else {
          setView(View.ONBOARDING);
        }
      } else {
        // No data for this user yet
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

  // Sync Dark Mode with HTML element and LocalStorage
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
    setView(View.ONBOARDING); // Will render Login because currentUsername is null
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    setData(prev => ({ ...prev, user: updatedProfile }));
  };

  // 1. Authentication Check (Login Screen)
  if (!currentUsername) {
    return <Login user={null} onLogin={handleLogin} resetUser={resetUser} />;
  }

  // 2. Onboarding Check (If logged in but no profile data)
  if (!data.user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // 3. Main App Views
  const renderView = () => {
    const isAdmin = currentUsername === ADMIN_USERNAME;

    switch (view) {
      case View.DASHBOARD:
        return <Dashboard user={data.user} assignments={data.assignments} isVerified={isVerified} username={currentUsername} />;
      case View.PLANNER:
        return <StudyPlanner 
          assignments={data.assignments} 
          setAssignments={(a) => setData({...data, assignments: a})} 
          isAdmin={isAdmin}
        />;
      case View.NOTES:
        return <Notes 
          notes={data.notes} 
          setNotes={(n) => setData({...data, notes: n})} 
          isAdmin={isAdmin}
        />;
      case View.VAULT:
        return <Vault 
          user={data.user} 
          documents={data.vaultDocs} 
          saveDocuments={(d) => setData({...data, vaultDocs: d})} 
          isVerified={isVerified}
        />;
      case View.CV_BUILDER:
        return <CVBuilder 
          user={data.user} 
          isVerified={isVerified} 
          updateUser={handleUpdateUser}
        />;
      case View.SCHOLARSHIP:
        return <ScholarshipTracker
          scholarships={data.scholarships || []}
          setScholarships={(s) => setData({...data, scholarships: s})}
        />;
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
        return <ErrorPage type="404" onAction={() => setView(View.DASHBOARD)} actionLabel="Return to Dashboard" />;
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
