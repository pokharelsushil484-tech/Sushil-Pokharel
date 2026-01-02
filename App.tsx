
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
import { ShieldCheck, ShieldX, Globe, Terminal } from 'lucide-react';

import { View, UserProfile, VaultDocument, ChatMessage } from './types';
import { ADMIN_USERNAME, SYSTEM_UPGRADE_TOKEN, APP_NAME, ADMIN_EMAIL, SYSTEM_DOMAIN } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem('active_session_user'));
  const [isLoading, setIsLoading] = useState(false);
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
            setData(stored);
            if (stored.user?.acceptedTermsVersion !== SYSTEM_UPGRADE_TOKEN) {
              setShowTerms(true);
            }
          } else {
            // Data node missing or corrupted, force onboarding configuration
            setView(View.ONBOARDING);
            // Ensure data.user is null to trigger Onboarding render
            setData(prev => ({ ...prev, user: null }));
          }
        } catch (err) {
          console.error("Critical Sync Failure", err);
          // Fallback to onboarding if sync fails catastrophically
          setView(View.ONBOARDING);
        } finally {
          setIsLoading(false);
        }
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
    localStorage.setItem('active_session_user', username);
    setCurrentUsername(username);
    
    // Log the login event
    await storageService.logActivity({
      actor: username,
      actionType: 'AUTH',
      description: `Session Initiated: ${username}`,
      targetUser: username
    });
  };

  const handleLogout = async () => {
    // Log the logout event before clearing state
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

  // Render logic handling
  if (!currentUsername) {
    return <Login user={null} onLogin={handleLoginSuccess} />;
  }

  // Suspended Check
  if (data.user?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-red-950/20 p-16 rounded-[4rem] border border-red-500/30 shadow-2xl max-w-lg w-full">
          <ShieldX size={80} className="text-red-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Node Suspended</h1>
          <p className="text-red-100 text-sm font-bold leading-relaxed mb-10">{data.user.banReason}</p>
          <a href={`mailto:${ADMIN_EMAIL}`} className="block w-full bg-red-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl">Contact Architect</a>
          <button onClick={handleLogout} className="mt-8 text-slate-500 text-[10px] font-black uppercase underline">Terminate Session</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // If we are loading, we don't render content to avoid flickering or race conditions
    // The GlobalLoader will cover the screen.
    if (isLoading && !data.user) return null;

    if (!data.user) return <Onboarding onComplete={p => setData(prev => ({...prev, user: p}))} />;
    
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
      case View.FILE_HUB: return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={docs => setData(prev => ({...prev, vaultDocs: docs}))} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.AI_CHAT: return <AIChat chatHistory={data.chatHistory} setChatHistory={msgs => setData(prev => ({...prev, chatHistory: msgs}))} isVerified={data.user.isVerified} />;
      case View.VERIFICATION_FORM: return <VerificationForm user={data.user} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={u => setData(prev => ({...prev, user: u}))} />;
      case View.ADMIN_DASHBOARD: return currentUsername === ADMIN_USERNAME ? <AdminDashboard /> : null;
      default: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500 overflow-x-hidden">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={() => { if(data.user) setData(prev => ({...prev, user: { ...prev.user!, acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN } })); setShowTerms(false); }} />}
      
      {/* Only render layout if we have data or if we are not loading (e.g. Onboarding) */}
      {(!isLoading || data.user) && (
        <div className="md:ml-20 lg:ml-64 transition-all animate-fade-in">
          <header className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-[100] shadow-sm">
             <div className="flex items-center space-x-5">
                <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                  <Terminal size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.4em] leading-none mb-1">{APP_NAME}</span>
                  <div className="flex items-center text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <Globe size={10} className="mr-1.5" />
                    <span>{SYSTEM_DOMAIN}</span>
                  </div>
                </div>
             </div>
             <div className="flex items-center space-x-4">
                <span className="hidden sm:inline-block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Session: {currentUsername}</span>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-500 uppercase">
                  {currentUsername.charAt(0)}
                </div>
             </div>
          </header>
          <main className="max-w-7xl mx-auto p-6 lg:p-12 pb-24 lg:pb-16 min-h-[calc(100vh-80px)] w-full">{renderContent()}</main>
        </div>
      )}
      
      {/* Navigation should only appear if user data is loaded and valid */}
      {data.user && !isLoading && (
        <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={data.user?.isVerified || false} />
      )}
    </div>
  );
}

export default App;
