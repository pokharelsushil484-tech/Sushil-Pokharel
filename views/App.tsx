
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
import { VerificationPending } from './views/VerificationPending';
import { LinkVerification } from './views/LinkVerification';
import { InviteRegistration } from './views/InviteRegistration';
import { AccessRecovery } from './views/AccessRecovery';
import { Support } from './views/Support';
import { ErrorPage } from './views/ErrorPage';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { TermsModal } from './components/TermsModal';
import { ShieldX, Globe, CheckCircle, XCircle, X } from 'lucide-react';

import { View, UserProfile, VaultDocument, ChatMessage } from './types';
import { ADMIN_USERNAME, SYSTEM_UPGRADE_TOKEN, APP_NAME, SYSTEM_DOMAIN, CREATOR_NAME } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem('active_session_user'));
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('active_session_user'));
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('architect_theme') === 'true');
  const [verifyLinkId, setVerifyLinkId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  const initialData = {
    user: null as UserProfile | null,
    chatHistory: [] as ChatMessage[],
    vaultDocs: [] as VaultDocument[]
  };

  const [data, setData] = useState(initialData);

  // Verification Polling Logic
  useEffect(() => {
    let pollInterval: any;
    if (currentUsername && data.user && data.user.verificationStatus === 'PENDING_APPROVAL') {
      pollInterval = setInterval(async () => {
        const stored = await storageService.getData(`architect_data_${currentUsername}`);
        if (stored && stored.user) {
          if (stored.user.verificationStatus !== data.user!.verificationStatus) {
             // Status Changed!
             const newStatus = stored.user.verificationStatus;
             setData(prev => ({ ...prev, user: stored.user })); // Update local state
             
             if (newStatus === 'VERIFIED') {
                 setNotification({
                     message: 'Identity Verified! Full access granted.',
                     type: 'success'
                 });
             } else if (newStatus === 'REJECTED') {
                 setNotification({
                     message: 'Verification Failed. Please check dashboard for details.',
                     type: 'error'
                 });
             }
          }
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(pollInterval);
  }, [currentUsername, data.user]);

  useEffect(() => {
    const path = window.location.pathname;
    
    // Check for verification link: /v/{id}
    const verifyMatch = path.match(/^\/v\/([a-zA-Z0-9]+)\/?$/i);
    if (verifyMatch) {
        setVerifyLinkId(verifyMatch[1]);
        setView(View.VERIFY_LINK);
        setShowSplash(false); 
        setIsLoading(false);
        return;
    }

    // Check for request link: /r/{id}
    const requestMatch = path.match(/^\/r\/([a-zA-Z0-9]+)\/?$/i);
    if (requestMatch) {
        setVerifyLinkId(requestMatch[1]); // Reuse LinkVerification for requests
        setView(View.VERIFY_LINK);
        setShowSplash(false); 
        setIsLoading(false);
        return;
    }

    // Check for recovery link: /recovery/{id}
    const recoveryMatch = path.match(/^\/recovery\/([a-zA-Z0-9]+)\/?$/i);
    if (recoveryMatch) {
        setRecoveryId(recoveryMatch[1]);
        setView(View.ACCESS_RECOVERY);
        setShowSplash(false);
        setIsLoading(false);
        return;
    }

    // Check for registration invite link
    const inviteMatch = path.match(/^\/register\/([a-zA-Z0-9]+)\/?$/i);
    if (inviteMatch) {
        setInviteCode(inviteMatch[1]);
        setView(View.INVITE_REGISTRATION);
        setShowSplash(false);
        setIsLoading(false);
        return;
    }

  }, []);

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
               stored.user.level = 3; // Max level for admin
               await storageService.setData(`architect_data_${currentUsername}`, stored);
            }
            setData(stored);
            if (stored.user?.acceptedTermsVersion !== SYSTEM_UPGRADE_TOKEN) {
              setShowTerms(true);
            }
          } else {
            if (view !== View.VERIFY_LINK && view !== View.INVITE_REGISTRATION && view !== View.ACCESS_RECOVERY) {
                setView(View.ONBOARDING);
            }
            setData(prev => ({ ...prev, user: null }));
          }
        } catch (err) {
          console.error("Critical Sync Failure", err);
          if (view !== View.VERIFY_LINK && view !== View.INVITE_REGISTRATION && view !== View.ACCESS_RECOVERY) setView(View.ONBOARDING);
        } finally {
          setIsLoading(false);
        }
      } else {
          setIsLoading(false);
      }
    };
    if (view !== View.VERIFY_LINK && view !== View.INVITE_REGISTRATION && view !== View.ACCESS_RECOVERY) {
        sync();
    }
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
    
    // Clear special modes if active
    if (inviteCode || verifyLinkId || recoveryId) {
        setInviteCode(null);
        setVerifyLinkId(null);
        setRecoveryId(null);
        // Clean URL without refresh
        window.history.pushState({}, '', '/');
    }

    // Redirect based on role
    if (username === ADMIN_USERNAME) {
        setView(View.ADMIN_DASHBOARD);
    } else {
        setView(View.DASHBOARD);
    }

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

  if (view === View.VERIFY_LINK && verifyLinkId) {
      return <LinkVerification linkId={verifyLinkId} onNavigate={(v) => { setView(v); setVerifyLinkId(null); window.history.pushState({}, '', '/'); }} currentUser={currentUsername} />;
  }

  if (view === View.INVITE_REGISTRATION && inviteCode) {
      return <InviteRegistration inviteCode={inviteCode} onNavigate={(v) => { setView(v); setInviteCode(null); window.history.pushState({}, '', '/'); }} onRegister={handleLoginSuccess} />;
  }

  if (view === View.ACCESS_RECOVERY) {
     return <AccessRecovery onNavigate={(v) => { setView(v); setRecoveryId(null); window.history.pushState({}, '', '/'); }} initialRecoveryId={recoveryId} />;
  }

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!currentUsername) {
    return <Login user={null} onLogin={handleLoginSuccess} onNavigate={setView} />;
  }

  if (data.user?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-red-950/20 p-16 rounded-[2rem] border border-red-500/30 shadow-2xl max-w-lg w-full">
          <ShieldX size={64} className="text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Access Suspended</h1>
          <p className="text-red-200 text-sm mb-8">{data.user.banReason}</p>
          <div className="space-y-4">
              <button 
                onClick={() => { handleLogout(); setView(View.ACCESS_RECOVERY); }} 
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg"
              >
                Request Recovery
              </button>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest underline transition-colors">Sign Out</button>
          </div>
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
             verificationStatus: isPowerUser ? 'VERIFIED' : p.verificationStatus,
             level: isPowerUser ? 3 : 0
          };
          setData(prev => ({...prev, user: profile}));
          // If admin, go to admin dashboard
          if (isPowerUser) {
              setView(View.ADMIN_DASHBOARD);
          } else {
              setView(View.DASHBOARD);
          }
        }} 
      />
    );
    
    // STRICT SECURITY GATE: Block access if pending verification
    if (data.user.verificationStatus === 'PENDING_APPROVAL' && view !== View.SUPPORT) {
        return <VerificationPending studentId={data.user.studentId} onLogout={handleLogout} />;
    }
    
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
      case View.FILE_HUB: return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={docs => setData(prev => ({...prev, vaultDocs: docs}))} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.AI_CHAT: return <AIChat chatHistory={data.chatHistory} setChatHistory={msgs => setData(prev => ({...prev, chatHistory: msgs}))} isVerified={data.user.isVerified} username={currentUsername || undefined} />;
      case View.VERIFICATION_FORM: return <VerificationForm user={data.user} username={currentUsername!} updateUser={u => setData(prev => ({...prev, user: u}))} onNavigate={setView} />;
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={u => setData(prev => ({...prev, user: u}))} />;
      case View.SUPPORT: return <Support username={currentUsername} />;
      case View.ADMIN_DASHBOARD: return currentUsername === ADMIN_USERNAME ? <AdminDashboard /> : <ErrorPage type="404" title="Access Denied" message="You do not have permission to view this page." />;
      case View.ERROR: return <ErrorPage type="404" title="Page Not Found" message="The command you entered does not map to a valid module." />;
      default: return <Dashboard user={data.user} username={currentUsername} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-300 overflow-x-hidden pb-24 md:pb-0">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={() => { if(data.user) setData(prev => ({...prev, user: { ...prev.user!, acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN } })); setShowTerms(false); }} />}
      
      {/* Toast Notification */}
      {notification && (
          <div className="fixed top-24 right-4 z-[200] animate-slide-left">
              <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 max-w-sm backdrop-blur-xl ${
                  notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-white' : 
                  notification.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-white' :
                  'bg-indigo-900/90 border-indigo-500/50 text-white'
              }`}>
                  {notification.type === 'success' ? <CheckCircle className="text-emerald-400" size={24} /> : 
                   notification.type === 'error' ? <XCircle className="text-red-400" size={24} /> :
                   <Globe className="text-indigo-400" size={24} />}
                  <div className="flex-1">
                      <p className="font-bold text-sm mb-1">{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Attention' : 'Info'}</p>
                      <p className="text-xs opacity-90 leading-relaxed">{notification.message}</p>
                  </div>
                  <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16}/></button>
              </div>
          </div>
      )}

      {(!isLoading || data.user) && data.user?.verificationStatus !== 'PENDING_APPROVAL' && (
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
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1.5">
                  <img src="/logo.svg" className="w-full h-full object-contain" alt="User" />
                </div>
             </div>
          </header>
          
          <main className="flex-1 max-w-7xl mx-auto w-full pt-8 px-6">{renderContent()}</main>
        </div>
      )}
      
      {/* If pending, render content directly (which is the VerificationPending component) without wrapper */}
      {data.user && data.user.verificationStatus === 'PENDING_APPROVAL' && (
         <main className="w-full h-full">{renderContent()}</main>
      )}
      
      {data.user && !isLoading && data.user.verificationStatus !== 'PENDING_APPROVAL' && (
        <Navigation 
            currentView={view} 
            setView={setView} 
            isAdmin={currentUsername === ADMIN_USERNAME} 
            isVerified={data.user?.isVerified || false}
            username={currentUsername || undefined} 
            onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
