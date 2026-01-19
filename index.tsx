
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutGrid, Calendar, Database, MessageSquare, 
  Settings as SettingsIcon, LifeBuoy, AlertCircle, 
  Heart, X, ArrowRight, ShieldCheck, Info
} from 'lucide-react';
import { 
  APP_NAME, CREATOR_NAME, COPYRIGHT_NOTICE, 
  LEGAL_TERMS, FOOTER_SIGNATURE, DEFAULT_USER 
} from './constants';
import { View, UserProfile } from './types';
import { Dashboard } from './views/Dashboard';
import { StudyPlanner } from './views/StudyPlanner';
import { Vault } from './views/Vault';
import { AIChat } from './views/AIChat';
import { Support } from './views/Support';
import { Settings } from './views/Settings';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [showSplash, setShowSplash] = useState(true);
  const [systemError, setSystemError] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (systemError) {
    return <ErrorPage type="MAINTENANCE" onAction={() => setSystemError(false)} />;
  }

  const renderContent = () => {
    switch (view) {
      case View.DASHBOARD: 
        return <Dashboard user={user} onNavigate={setView} />;
      case View.VERIFY_LINK: 
        return <StudyPlanner assignments={[]} setAssignments={() => {}} isAdmin={true} />;
      case View.FILE_HUB: 
        return <Vault user={user} documents={[]} saveDocuments={() => {}} updateUser={setUser} onNavigate={setView} />;
      case View.AI_CHAT: 
        return <AIChat chatHistory={[]} setChatHistory={() => {}} isVerified={true} username={user.name} />;
      case View.SUPPORT: 
        return <Support username={user.name} />;
      case View.SETTINGS: 
        return <Settings user={user} resetApp={() => {}} onLogout={() => {}} username={user.name} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />;
      default: 
        return <Dashboard user={user} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-obsidian/80 backdrop-blur-xl border-b border-glass-border flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView(View.DASHBOARD)}>
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-white/10">S</div>
          <span className="font-black text-lg tracking-tighter uppercase">{APP_NAME}</span>
        </div>
        <div className="hidden md:flex space-x-8">
          {[
            {v: View.DASHBOARD, l: "Home"},
            {v: View.VERIFY_LINK, l: "Plan"},
            {v: View.FILE_HUB, l: "Vault"},
            {v: View.AI_CHAT, l: "AI"}
          ].map(item => (
            <button 
              key={item.v}
              onClick={() => setView(item.v)}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${view === item.v ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
            >
              {item.l}
            </button>
          ))}
        </div>
        <button onClick={() => setView(View.SETTINGS)} className="p-2 hover:bg-glass rounded-xl transition-colors">
          <SettingsIcon size={20} className="text-slate-400" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-obsidian border-t border-glass-border py-16 px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">{APP_NAME}</h3>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-relaxed">
              Professional Academic Innovation Hub. Designed to streamline the student experience with precision and elegance.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Compliance</h4>
            <div className="flex flex-col space-y-2">
              <button onClick={() => setShowTerms(true)} className="text-left text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Terms & Conditions</button>
              <button className="text-left text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</button>
              <button className="text-left text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Student Protocol</button>
            </div>
          </div>

          <div className="space-y-4 md:text-right">
            <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">{FOOTER_SIGNATURE}</h4>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{COPYRIGHT_NOTICE}</p>
            <div className="flex md:justify-end space-x-4 pt-2">
              <ShieldCheck size={16} className="text-slate-700" />
              <div onClick={() => setSystemError(true)} className="cursor-help"><Info size={16} className="text-slate-700 hover:text-indigo-500 transition-colors" /></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="glass-card max-w-xl w-full p-10 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Legal Disclosure</h3>
              <button onClick={() => setShowTerms(false)}><X className="text-slate-500 hover:text-white" /></button>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{LEGAL_TERMS}</p>
            <button onClick={() => setShowTerms(false)} className="w-full py-4 btn-premium rounded-xl text-xs">Accept & Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
