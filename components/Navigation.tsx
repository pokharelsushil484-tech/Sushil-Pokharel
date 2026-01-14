
import React from 'react';
import { Settings, MessageCircle, LayoutGrid, Database, LifeBuoy, Calendar, FileText } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
  isVerified: boolean;
  username?: string;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, username }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Portfolio' },
    { view: View.VERIFY_LINK, icon: Calendar, label: 'Planner' },
    { view: View.FILE_HUB, icon: Database, label: 'Resources' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'AI Strategy' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'Support' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-[#020617] border-r border-slate-100 dark:border-slate-800 h-full fixed left-0 top-0 z-[110] transition-all duration-300">
        
        <div className="p-6 flex items-center space-x-3 h-20 border-b border-slate-50 dark:border-slate-800/50">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <span className="font-black text-xs">SP</span>
           </div>
           <span className="hidden lg:block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Sushil<br/>Portfolio</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-3 rounded-xl transition-all duration-200 relative ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} strokeWidth={2} />
                <span className={`hidden lg:block ml-3 text-[11px] font-bold uppercase tracking-[0.15em] ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-50 dark:border-slate-800/50">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-2 rounded-xl transition-all border ${
                    currentView === View.SETTINGS 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                    : 'bg-white dark:bg-transparent border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
            >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 p-0.5">
                    <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" alt="Profile" />
                </div>
                <div className="hidden lg:block ml-3 text-left overflow-hidden">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">{username || 'Sushil'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">Portfolio Identity</p>
                </div>
            </button>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[110]">
        <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-slate-700 p-2">
          <div className="flex justify-between items-center px-2">
            {[...navItems, { view: View.SETTINGS, icon: Settings, label: 'Settings' }].map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-2' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  <item.icon size={20} strokeWidth={2.5} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
