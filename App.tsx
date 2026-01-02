
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
import { ShieldCheck, ShieldX } from 'lucide-react';

import { View, UserProfile, VaultDocument, ChatMessage } from './types';
import { ADMIN_USERNAME, SYSTEM_UPGRADE_TOKEN, APP_NAME, ADMIN_EMAIL } from './constants';
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
        const stored = await storageService.getData(`architect_data_${currentUsername}`);
        if (stored) {
          setData(stored);
          if (stored.user?.acceptedTermsVersion !== SYSTEM_UPGRADE_TOKEN) setShowTerms(true);
        } else {
          setView(View.ONBOARDING);
        }
        setIsLoading(false);
      }
    };
    sync();
  }, [currentUsername]);

  useEffect(() => {
    if (currentUsername && data.user) {
      storageService.setData(`architect_data_${currentUsername}`, data);
    }
  }, [data]);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (data.user?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-red-950/20 p-16 rounded-[4rem] border border-red-500/30 shadow-2xl max-w-lg w-full">
          <ShieldX size={80} className="text-red-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Node Suspended</h1>
          <p className="text-red-100 text-sm font-bold leading-relaxed mb-10">{data.user.banReason}</p>
          <a href={`mailto:${ADMIN_EMAIL}`} className="block w-full bg-red-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl">Professional Appeal</a>
          <button onClick={() => { setCurrentUsername(null); localStorage.removeItem('active_session_user'); window.location.reload(); }} className="mt-8 text-slate-500 text-[10px] font-black uppercase">Terminate Node</button>
        </div>
      </div>
    );
  }

  if (!currentUsername) {
    return <Login user={null} onLogin={setCurrentUsername} />;
  }

  const renderContent = () => {
    if (!data.user) return <Onboarding onComplete={p => setData(prev => ({...prev, user: p}))} />;
    
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
      case View.FILE_HUB: return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={docs => setData(prev => ({...prev, vaultDocs: docs}))} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.AI_CHAT: return <AIChat chatHistory={data.chatHistory} setChatHistory={msgs => setData(prev => ({...prev, chatHistory: msgs}))} isVerified={data.user.isVerified} />;
      case View.VERIFICATION_FORM: return <VerificationForm user={data.user} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={() => { setCurrentUsername(null); localStorage.removeItem('active_session_user'); window.location.reload(); }} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={u => setData(prev => ({...prev, user: u}))} />;
      case View.ADMIN_DASHBOARD: return currentUsername === ADMIN_USERNAME ? <AdminDashboard /> : null;
      default: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500 overflow-x-hidden">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={() => { if(data.user) setData(prev => ({...prev, user: { ...prev.user!, acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN } })); setShowTerms(false); }} />}
      
      <div className="md:ml-20 lg:ml-64 transition-all">
        <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-[100]">
           <div className="flex items-center space-x-4">
              <ShieldCheck className="text-indigo-600" size={18} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{APP_NAME}</span>
           </div>
           <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
             Node Sync: {currentUsername}
           </span>
        </header>
        <main className="max-w-7xl mx-auto p-6 lg:p-12 pb-24 lg:pb-16 min-h-[calc(100vh-64px)] w-full">{renderContent()}</main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={data.user?.isVerified || false} />
    </div>
  );
}

export default App;
