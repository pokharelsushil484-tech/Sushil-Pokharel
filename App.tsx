
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
import { RefreshCw, Power, ArrowRight, ShieldCheck, Monitor, PartyPopper, X, ShieldX, AlertTriangle, CloudUpload } from 'lucide-react';

import { View, UserProfile, Database, ChatMessage, Expense, Note, VaultDocument, Assignment, ChangeRequest } from './types';
import { ADMIN_USERNAME, APP_VERSION, SYSTEM_UPGRADE_TOKEN, COPYRIGHT_NOTICE, APP_NAME, ADMIN_EMAIL } from './constants';
import { storageService } from './services/storageService';

const CURRENT_MONTH_NAME = new Date().toLocaleString('default', { month: 'long' });

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

  // 1. Mandatory Core Update Monitor
  useEffect(() => {
    const lastVersion = localStorage.getItem('system_last_known_version');
    if (lastVersion && lastVersion !== SYSTEM_UPGRADE_TOKEN) {
      setShowUpdatePrompt(true);
    }
  }, []);

  // 2. Automatic Ban Detection (Sentinel)
  useEffect(() => {
    const runSentinel = () => {
      if (currentUsername && currentUsername !== ADMIN_USERNAME) {
        // If user is trying to view admin views without proper token (simulated)
        if (view === View.ADMIN_DASHBOARD) {
          setData(prev => {
            if (!prev.user) return prev;
            return { ...prev, user: { ...prev.user, isBanned: true, banReason: "PROTOCOL_VIOLATION: Unauthorized architectural access attempt." } };
          });
        }
      }
    };
    runSentinel();
  }, [view, currentUsername]);

  // 3. Approval Tracker & Storage Sync
  useEffect(() => {
    const checkApprovals = async () => {
      if (currentUsername && data.user && !data.user.isBanned) {
        const requests: ChangeRequest[] = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
        const newlyApproved = requests.find(r => 
          r.userId === currentUsername && 
          r.status === 'APPROVED' && 
          !r.acknowledged
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
    
    const interval = setInterval(checkApprovals, 15000);
    checkApprovals();
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

  // Async Session Loading
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
          console.error("BOOT_LOAD_ERROR", e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadSession();
  }, [currentUsername]);

  // Data Persistence
  useEffect(() => {
    const persistData = async () => {
      if (currentUsername && data.user) {
        try {
          await storageService.setData(`architect_data_${currentUsername}`, data);
        } catch (e) {
          console.error("INFRASTRUCTURE_COMMIT_ERROR", e);
        }
      }
    };
    persistData();
  }, [data, currentUsername]);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('architect_theme', String(darkMode));
  }, [darkMode]);

  const handleSystemBoot = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsSystemActive(true);
      localStorage.setItem('system_boot_state', 'true');
      setIsLoading(false);
    }, 1500);
  };

  const handleSystemUpdate = () => {
    setIsLoading(true);
    localStorage.setItem('system_last_known_version', SYSTEM_UPGRADE_TOKEN);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleLogout = () => {
    setCurrentUsername(null);
    setData(initialData);
    localStorage.removeItem('active_session_user');
    setView(View.DASHBOARD);
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  // 4. Banned State Screen (Automated Enforcement)
  if (data.user?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-red-950/20 p-16 rounded-[4rem] border border-red-500/30 shadow-2xl max-w-lg">
          <ShieldX size={80} className="text-red-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Node Suspended</h1>
          <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-8">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2">Integrity Violation</p>
            <p className="text-red-200 text-sm font-bold leading-relaxed">{data.user.banReason}</p>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-10 leading-relaxed">
            Your access has been automatically terminated by the system core due to bad activity or protocol breaches. 
          </p>
          <a href={`mailto:${ADMIN_EMAIL}?subject=Node Appeal: ${currentUsername}`} className="block w-full bg-red-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl">
             Appeal to System Architect
          </a>
          <button onClick={handleLogout} className="mt-6 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Terminate Local Session</button>
        </div>
      </div>
    );
  }

  // 5. System Stasis
  if (!isSystemActive) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <GlobalLoader isLoading={isLoading} message="Initializing Encrypted Core..." />
        <div className="bg-slate-900/50 backdrop-blur-3xl p-14 rounded-[4rem] border border-slate-800 shadow-2xl max-w-md animate-scale-up">
          <Power size={48} className="text-indigo-500 animate-pulse mx-auto mb-10" />
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Workspace Dormant</h1>
          <p className="text-slate-400 mb-10 text-sm font-medium opacity-80">Manual authorization by Sushil Pokharel required.</p>
          <button onClick={handleSystemBoot} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest">Boot System Core</button>
        </div>
      </div>
    );
  }

  // 6. Mandatory Update Prompt
  if (showUpdatePrompt) {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md animate-scale-up">
          <CloudUpload size={64} className="animate-bounce mx-auto mb-10 text-indigo-400" />
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Update Required</h1>
          <p className="text-indigo-200 mb-10 text-lg font-bold">Please update now to synchronize security protocols and core features.</p>
          <button onClick={handleSystemUpdate} className="bg-white text-indigo-900 px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">Apply & Reload Workspace</button>
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
      case View.SETTINGS: return <Settings user={data.user} resetApp={() => { localStorage.clear(); window.location.reload(); }} onLogout={handleLogout} username={currentUsername} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} updateUser={(u) => setData(prev => ({...prev, user: u}))} />;
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
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-96 z-[250] animate-fade-in shadow-2xl">
          <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] relative border border-emerald-400">
            <button onClick={acknowledgeApproval} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"><X size={20}/></button>
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <PartyPopper size={28} className="text-white" />
              <h4 className="text-lg font-black uppercase tracking-tight">Access Granted!</h4>
            </div>
            <p className="text-sm font-bold relative z-10 leading-relaxed">
              Congratulations, you have received <span className="font-black underline">{approvalNotice.amount} GB</span> of additional storage nodes.
            </p>
            <button onClick={acknowledgeApproval} className="mt-6 w-full py-4 bg-white text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all">Acknowledge Grant</button>
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
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl">{currentUsername}</span>
           </div>
        </header>
        <main className="max-w-7xl mx-auto p-6 lg:p-12 pb-24 lg:pb-16 min-h-[calc(100vh-64px)] w-full">{renderContent()}</main>
      </div>
      <Navigation currentView={view} setView={setView} isAdmin={currentUsername === ADMIN_USERNAME} isVerified={true} />
    </div>
  );
}

export default App;
