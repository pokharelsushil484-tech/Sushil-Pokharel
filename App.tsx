
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { Vault } from './views/Vault';
import { VerificationForm } from './views/VerificationForm';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { TermsModal } from './components/TermsModal';
import { ShieldX, Globe, Terminal } from 'lucide-react';

import { View, UserProfile, VaultDocument, ChatMessage } from './types';
import { ADMIN_USERNAME, SYSTEM_UPGRADE_TOKEN, APP_NAME, ADMIN_EMAIL, SYSTEM_DOMAIN } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem('active_session_user'));
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('active_session_user'));
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('architect_theme') === 'true');
  
  const initialData = {
    user: null as UserProfile | null,
    chatHistory: [] as ChatMessage[],
    vaultDocs: [] as VaultDocument[]
  };

  const [data, setData] = useState(initialData);

  useEffect(() => {
    const sync = async () => {
      if (currentUsername) {
        setIsLoading(true);
        try {
          const stored = await storageService.getData(`architect_data_${currentUsername}`);
          if (stored && stored.user) {
            // FORCE ADMIN VERIFICATION
            if (currentUsername === ADMIN_USERNAME && !stored.user.isVerified) {
               stored.user.isVerified = true;
               stored.user.verificationStatus = 'VERIFIED';
               await storageService.setData(`architect_data_${currentUsername}`, stored);
            }
            setData(stored);
            if (stored.user?.acceptedTermsVersion !== SYSTEM_UPGRADE_TOKEN) {
              setShowTerms(true);
            }
          } else {
            setView(View.ONBOARDING);
            setData(prev => ({ ...prev, user: null }));
          }
        } catch (err) {
          console.error("Critical Sync Failure", err);
          setView(View.ONBOARDING);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    sync();
  }, [currentUsername]);

  useEffect(() => {
    if (currentUsername && data.user) {
      storageService.setData(`architect_data_${currentUsername}`, data);
    }
  }, [data, currentUsername]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  const handleLoginSuccess = async (username: string) => {
    setIsLoading(true);
    localStorage.setItem('active_session_user', username);
    setCurrentUsername(username);
    
    await storageService.logActivity({
      actor: username,
      actionType: 'AUTH',
      description: `Session Initiated: ${username}`,
      targetUser: username
    });
  };

  const handleLogout = async () => {
    if (currentUsername) {
      await storageService.logActivity({
        actor: currentUsername,
        actionType: 'AUTH',
        description: `Session Terminated: ${currentUsername}`,
        targetUser: currentUsername
      });
    }

    localStorage.removeItem('active_session_user');
    setCurrentUsername(null);
    setData(initialData);
    setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!currentUsername) {
    return <Login user={null} onLogin={handleLoginSuccess} />;
  }

  if (data.user?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-red-950/20 p-16 rounded-[2rem] border border-red-500/30 shadow-2xl max-w-lg w-full">
          <ShieldX size={64} className="text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Access Suspended</h1>
          <p className="text-red-200 text-sm mb-8">{data.user.banReason}</p>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest underline transition-colors">Sign Out</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading && !data.user) return null;

    if (!data.user) return (
      <Onboarding 
        onComplete={p => {
          const isPowerUser = currentUsername === ADMIN_USERNAME;
          const profile = {
             ...p,
             isVerified: isPowerUser ? true : p.isVerified,
             verificationStatus: isPowerUser ? 'VERIFIED' : p.verificationStatus
          };
          setData(prev => ({...prev, user: profile}));
          setView(View.DASHBOARD);
        }} 
      />
    );
    
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
      case View.FILE_HUB: return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={docs => setData(prev => ({...prev, vaultDocs: docs}))} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.AI_CHAT: return <AIChat chatHistory={data.chatHistory} setChatHistory={msgs => setData(prev => ({...prev, chatHistory: msgs}))} isVerified={data.user.isVerified} />;
      case View.VERIFICATION_FORM: return <VerificationForm user={data.user} username={currentUsername!} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={u => setData(prev => ({...prev, user: u}))} />;
      case View.ADMIN_DASHBOARD: return currentUsername === ADMIN_USERNAME ? <AdminDashboard /> : null;
      default: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-300 overflow-x-hidden pb-20 md:pb-0">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={() => { if(data.user) setData(prev => ({...prev, user: { ...prev.user!, acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN } })); setShowTerms(false); }} />}
      
      {(!isLoading || data.user) && (
        <div className="md:ml-20 lg:ml-64 transition-all animate-fade-in min-h-screen flex flex-col">
          <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-600/20">
                  <img src="/logo.svg" className="w-4 h-4 object-contain filter brightness-0 invert" alt="Logo" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none mb-0.5">StudentPocket</span>
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>{SYSTEM_DOMAIN}</span>
                  </div>
                </div>
             </div>
             <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Active</p>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{currentUsername}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-500 text-xs uppercase">
                  {currentUsername.charAt(0)}
                </div>
             </div>
          </header>
          
          <main className="flex-1 max-w-7xl mx-auto w-full pt-8 px-6">{renderContent()}</main>
        </div>
      )}
      
      {data.user && !isLoading && (
        <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={data.user?.isVerified || false} />
      )}
    </div>
  );
}

export default App;
