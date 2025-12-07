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
import { View, UserProfile, Assignment, Note, VaultDocument, Scholarship, ChatMessage } from './types';
import { DEFAULT_USER } from './constants';

interface AppData {
  user: UserProfile | null;
  assignments: Assignment[];
  notes: Note[];
  vaultDocs: VaultDocument[];
  scholarships?: Scholarship[];
  chatHistory?: ChatMessage[];
  darkMode?: boolean;
}

const DEFAULT_DATA: AppData = {
  user: null,
  assignments: [],
  notes: [],
  vaultDocs: [],
  scholarships: [],
  chatHistory: [],
  darkMode: false
};

function App() {
  const [view, setView] = useState<View>(View.ONBOARDING);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  
  // New state to handle reset password flow
  const [resetUser, setResetUser] = useState<string | null>(null);

  const [data, setData] = useState<AppData>(DEFAULT_DATA);

  // Helper to check verification status dynamically
  const isVerified = (() => {
    if (!currentUsername) return false;
    // Admin is always "verified" conceptually
    if (currentUsername === 'admin') return true; 

    try {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (!usersStr) return false;
      const users = JSON.parse(usersStr);
      return users[currentUsername]?.verified === true;
    } catch (e) {
      return false;
    }
  })();

  // Handle URL Verification or Reset Links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const user = params.get('user');
    const token = params.get('token');

    if (user && token) {
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const userData = users[user];

        if (mode === 'reset') {
          // *** PASSWORD RESET FLOW ***
          if (userData && userData.resetToken === token) {
             setResetUser(user);
          } else {
             alert("❌ Invalid or expired reset link.");
          }
        }
      }
    }
  }, []);

  // Load data when username changes
  useEffect(() => {
    if (currentUsername) {
      const storageKey = `studentpocket_data_${currentUsername}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure chatHistory exists for older data
        if (!parsed.chatHistory) parsed.chatHistory = [];
        setData(parsed);
        if (parsed.user) {
          setView(currentUsername === 'admin' ? View.ADMIN_DASHBOARD : View.DASHBOARD);
        } else {
          setView(View.ONBOARDING);
        }
      } else {
        // No data for this user yet
        setData(DEFAULT_DATA);
        setView(View.ONBOARDING);
      }
    } else {
      setData(DEFAULT_DATA);
    }
  }, [currentUsername]);

  // Save data on change
  useEffect(() => {
    if (currentUsername && data.user) {
      const storageKey = `studentpocket_data_${currentUsername}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [data, currentUsername]);

  // Sync Dark Mode with HTML element
  useEffect(() => {
    if (data.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.darkMode]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setData(prev => ({ ...prev, user: profile }));
    setView(currentUsername === 'admin' ? View.ADMIN_DASHBOARD : View.DASHBOARD);
  };

  const handleReset = () => {
    if (currentUsername) {
       const storageKey = `studentpocket_data_${currentUsername}`;
       localStorage.removeItem(storageKey);
       setData(DEFAULT_DATA);
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

  const toggleDarkMode = () => {
    setData(prev => ({ ...prev, darkMode: !prev.darkMode }));
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
    const isAdmin = currentUsername === 'admin';

    switch (view) {
      case View.DASHBOARD:
        return <Dashboard user={data.user} assignments={data.assignments} isVerified={isVerified} />;
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
        return <CVBuilder user={data.user} isVerified={isVerified} />;
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
          darkMode={!!data.darkMode}
          toggleDarkMode={toggleDarkMode}
          updateUser={handleUpdateUser}
        />;
      case View.ADMIN_DASHBOARD:
        return isAdmin ? <AdminDashboard resetApp={handleFactoryReset} /> : <div className="text-red-500">Access Denied</div>;
      default:
        return <div className="p-8 text-center text-gray-500">Coming Soon: {view}</div>;
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
          isAdmin={currentUsername === 'admin'} 
          isVerified={isVerified}
        />
      </div>
    </div>
  );
}

export default App;