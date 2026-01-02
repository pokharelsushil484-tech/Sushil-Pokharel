
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChat } from './views/AIChat';
import { ErrorPage } from './views/ErrorPage';
import { DatabaseManager } from './views/DatabaseManager';
import { Notes } from './views/Notes';
import { Vault } from './views/Vault';
import { ExpenseTracker } from './views/ExpenseTracker';
import { StudyPlanner } from './views/StudyPlanner';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { TermsModal } from './components/TermsModal';
import { RefreshCw, Power, ArrowRight, ShieldCheck, Monitor, PartyPopper, X, ShieldX, AlertTriangle, CloudUpload, Info } from 'lucide-react';

import { View, UserProfile, Database, ChatMessage, Expense, Note, VaultDocument, Assignment, ChangeRequest } from './types';
import { ADMIN_USERNAME, APP_VERSION, SYSTEM_UPGRADE_TOKEN, COPYRIGHT_NOTICE, APP_NAME, ADMIN_EMAIL } from './constants';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem('active_session_user'));
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(() => localStorage.getItem('system_boot_state') === 'true');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('architect_theme') === 'true');
  const [approvalNotice, setApprovalNotice] = useState<{ amount: number, id: string } | null>(null);
  
  const initialData = {
    user: null as UserProfile | null,
    databases: [] as Database[],
    chatHistory: [] as ChatMessage[],
    expenses: [] as Expense[],
    notes: [] as Note[],
    vaultDocs: [] as VaultDocument[],
    assignments: [] as Assignment[],
    requests: [] as ChangeRequest[]
  };

  const [data, setData] = useState(initialData);

  // 1. Sentinel System - Detect Unauthorized Activity
  useEffect(() => {
    if (currentUsername && currentUsername !== ADMIN_USERNAME) {
      if (view === View.ADMIN_DASHBOARD) {
        // Automatically ban user for attempting to access admin nodes
        const autoBan = async () => {
          const updatedUser = { ...data.user!, isBanned: true, banReason: "PROTOCOL_VIOLATION: Attempted unauthorized core access." };
          setData(prev => ({ ...prev, user: updatedUser }));
          await storageService.setData(`architect_data_${currentUsername}`, { ...data, user: updatedUser });
          // Log violation in global requests for admin review
          const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
          const alert = {
            id: 'Violation-' + Date.now(),
            userId: currentUsername!,
            username: currentUsername!,
            type: 'OTHER',
            details: "AUTOMATED ALERT: User attempted unauthorized access to Architect Console.",
            status: 'REJECTED',
            createdAt: Date.now()
          };
          localStorage.setItem('studentpocket_requests', JSON.stringify([...existing, alert]));
        };
        autoBan();
      }
    }
  }, [view, currentUsername]);

  // 2. Core Update Synchronization
  useEffect(() => {
    const lastVersion = localStorage.getItem('system_last_known_version');
    if (lastVersion && lastVersion !== SYSTEM_UPGRADE_TOKEN) {
      setShowUpdatePrompt(true);
    }
  }, []);

  // 3. Approval Polling & Notification
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUsername && data.user && !data.user.isBanned) {
        const requests: ChangeRequest[] = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
        const newlyApproved = requests.find(r => 
          r.userId === currentUsername && 
          r.status === 'APPROVED' && 
          !r.acknowledged &&
          r.type === 'STORAGE'
        );

        if (newlyApproved) {
          const stored = await storageService.getData(`architect_data_${currentUsername}`);
          if (stored?.user) {
            setData(prev => ({ ...prev, user: stored.user }));
            setApprovalNotice({ 
              amount: newlyApproved.amountRequested || 0, 
              id: newlyApproved.id 
            });
          }
        }
      }
    };
    
    const interval = setInterval(checkStatus, 20000);
    checkStatus();
    return () => clearInterval(interval);
  }, [currentUsername, data.user]);

  const acknowledgeApproval = () => {
    if (approvalNotice) {
      const requests: ChangeRequest[] = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
      const updated = requests.map(r => r.id === approvalNotice.id ? { ...r, acknowledged: true } : r);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updated));
      setApprovalNotice(null);
    }
  };

  // Session Management
  useEffect(() => {
    const loadSession = async () => {
      if (currentUsername) {
        setIsLoading(true);
        localStorage.setItem('active_session_user', currentUsername);
        try {
          const stored = await storageService.getData(`architect_data_${currentUsername}`);
          if (stored) {
            setData({ ...initialData, ...stored });
            if (stored.user && stored.user.acceptedTermsVersion !== SYSTEM_UPGRADE_TOKEN) {
              setShowTerms(true);
            }
          } else {
            setData(initialData);
            setView(View.ONBOARDING);
          }
        } catch (e) {
          console.error("SESSION_LOAD_ERROR", e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadSession();
  }, [currentUsername]);

  useEffect(() => {
    const persist = async () => {
      if (currentUsername && data.user) {
        await storageService.setData(`architect_data_${currentUsername}`, data);
      }
    };
    persist();
  }, [data, currentUsername]);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  const handleSystemUpdate = () => {
    setIsLoading(true);
    localStorage.setItem('system_last_known_version', SYSTEM_UPGRADE_TOKEN);
    setTimeout(() => { window.location.reload(); }, 1500);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  // Update Screen Logic
  if (showUpdatePrompt) {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md animate-scale-up">
          <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/20">
            <RefreshCw size={48} className="animate-spin" />
          </div>
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">System Patch Ready</h1>
          <p className="text-indigo-200 mb-10 text-lg font-bold leading-relaxed">
            Please update now to synchronize security protocols and architectural core features. Access is restricted until sync is complete.
          </p>
          <button 
            onClick={handleSystemUpdate}
            className="w-full bg-white text-indigo-900 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
          >
            Apply & Update Hub
          </button>
        </div>
      </div>
    );
  }

  // Ban Screen Logic
  if (data.user?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in font-sans">
        <div className="bg-red-950/20 p-16 rounded-[4rem] border border-red-500/30 shadow-2xl max-w-lg w-full">
          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/40">
            <ShieldX size={60} className="text-red-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Node Suspended</h1>
          <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-10">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-center">
              <AlertTriangle size={14} className="mr-2" /> Protocol Failure
            </p>
            <p className="text-red-100 text-sm font-bold leading-relaxed">{data.user.banReason || "Manual suspension active."}</p>
          </div>
          <a href={`mailto:${ADMIN_EMAIL}?subject=Appeal: ${currentUsername}`} className="block w-full bg-red-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:bg-red-700">
             Submit Professional Appeal
          </a>
          <button 
            onClick={() => { setCurrentUsername(null); localStorage.removeItem('active_session_user'); window.location.reload(); }} 
            className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white"
          >
            Terminate Session
          </button>
        </div>
      </div>
    );
  }

  if (!isSystemActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900/50 backdrop-blur-3xl p-14 rounded-[4rem] border border-slate-800 shadow-2xl max-w-md animate-scale-up">
          <Power size={48} className="text-indigo-500 animate-pulse mx-auto mb-10" />
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Workspace Dormant</h1>
          <button 
            onClick={() => { setIsSystemActive(true); localStorage.setItem('system_boot_state', 'true'); }} 
            className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest"
          >
            Boot System Core
          </button>
        </div>
      </div>
    );
  }

  if (!currentUsername) {
    return <Login user={null} onLogin={(u) => { setIsLoading(true); setTimeout(() => { setCurrentUsername(u); setIsLoading(false); }, 800); }} />;
  }

  const renderContent = () => {
    if (!data.user) return <Onboarding onComplete={(p) => { setData(prev => ({...prev, user: p})); setView(View.DASHBOARD); }} />;
    const isAdmin = currentUsername === ADMIN_USERNAME;
    
    switch (view) {
      case View.DASHBOARD: return <Dashboard user={data.user} isVerified={true} username={currentUsername} expenses={data.expenses} databases={data.databases} onNavigate={setView} />;
      case View.EXPENSES: return <ExpenseTracker expenses={data.expenses} setExpenses={(e) => setData(prev => ({...prev, expenses: e}))} />;
      case View.DATABASE_MANAGER: return <DatabaseManager databases={data.databases} setDatabases={(d) => setData(prev => ({...prev, databases: d}))} isVerified={true} />;
      case View.NOTES: return <Notes notes={data.notes} setNotes={(n) => setData(prev => ({...prev, notes: n}))} isAdmin={isAdmin} />;
      case View.VAULT: return <Vault user={data.user} documents={data.vaultDocs} saveDocuments={(d) => setData(prev => ({...prev, vaultDocs: d}))} updateUser={(u) => setData(prev => ({...prev, user: u}))} isVerified={true} />;
      case View.PLANNER: return <StudyPlanner assignments={data.assignments || []} setAssignments={(a) => setData(prev => ({...prev, assignments: a}))} isAdmin={true} />;
      case View.AI_CHAT: return <AIChat chatHistory={data.chatHistory} setChatHistory={(msg) => setData(prev => ({...prev, chatHistory: msg}))} isVerified={true} />;
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={() => { setCurrentUsername(null); localStorage.removeItem('active_session_user'); setView(View.DASHBOARD); }} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={(u) => setData(prev => ({...prev, user: u}))} />;
      case View.ADMIN_DASHBOARD: return isAdmin ? <AdminDashboard resetApp={() => { localStorage.clear(); window.location.reload(); }} /> : null;
      default: return <Dashboard user={data.user} isVerified={true} username={currentUsername} expenses={data.expenses} databases={data.databases} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500 overflow-x-hidden">
      <GlobalLoader isLoading={isLoading} />
      {showTerms && <TermsModal onAccept={() => { if(data.user) setData(prev => ({...prev, user: { ...prev.user!, acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN } })); setShowTerms(false); }} />}
      
      {/* CONGRATULATIONS NOTIFICATION */}
      {approvalNotice && (
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-96 z-[250] animate-bounce-in shadow-2xl">
          <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] relative border-4 border-emerald-400 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <button onClick={acknowledgeApproval} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"><X size={20}/></button>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <PartyPopper size={28} className="text-white" />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight">Grant Approved!</h4>
            </div>
            <p className="text-sm font-bold relative z-10 leading-relaxed mb-6">
              Congratulations, you have received <span className="font-black underline decoration-white decoration-2">{approvalNotice.amount} GB</span> of additional storage nodes.
            </p>
            <button 
              onClick={acknowledgeApproval} 
              className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Acknowledge Expansion
            </button>
          </div>
        </div>
      )}

      <div className="md:ml-20 lg:ml-64 transition-all">
        <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-[100]">
           <div className="flex items-center space-x-4">
              <ShieldCheck size={18} className="text-indigo-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hidden sm:block">{APP_NAME}</span>
           </div>
           <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 mr-4 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Network Synced</span>
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                {currentUsername}
              </span>
           </div>
        </header>
        <main className="max-w-7xl mx-auto p-6 lg:p-12 pb-24 lg:pb-16 min-h-[calc(100vh-64px)] w-full">{renderContent()}</main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={true} />
    </div>
  );
}

export default App;
