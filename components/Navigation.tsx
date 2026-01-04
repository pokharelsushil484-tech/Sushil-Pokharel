
import React from 'react';
import { Settings, MessageCircle, LayoutGrid, ShieldCheck, Lock, Database, LifeBuoy, User } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
  isVerified: boolean;
  username?: string; // Add username prop to display in the bottom profile section
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin, isVerified, username }) => {
  // Main tools for the upper section
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Workbench' },
    { view: View.FILE_HUB, icon: Database, label: 'Repository' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'Assistant' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'Help Desk' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 h-full fixed left-0 top-0 z-[110] transition-all duration-300">
        
        {/* Brand Logo */}
        <div className="p-6 flex items-center space-x-3 h-24 border-b border-slate-50 dark:border-slate-800/50">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <img src="/logo.svg" className="w-4 h-4 object-contain filter brightness-0 invert" alt="Logo" />
           </div>
           <span className="hidden lg:block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Student<br/>Pocket</span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const disabled = !isVerified && !isAdmin && item.view !== View.DASHBOARD && item.view !== View.SUPPORT;
            
            return (
              <button
                key={item.view}
                onClick={() => !disabled && setView(item.view)}
                className={`group flex items-center w-full p-3.5 rounded-2xl transition-all duration-200 relative ${
                  disabled ? 'opacity-40 cursor-not-allowed' :
                  isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} strokeWidth={2} />
                <span className={`hidden lg:block ml-4 text-[11px] font-bold uppercase tracking-[0.15em] ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                
                {disabled && <Lock size={12} className="absolute right-4 text-slate-300 hidden lg:block" />}
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full hidden lg:block"></div>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800/50">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-3 rounded-2xl transition-all border ${
                    currentView === View.SETTINGS 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                    : 'bg-white dark:bg-transparent border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
            >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1.5">
                    <img src="/logo.svg" className="w-full h-full object-contain" alt="Profile" />
                </div>
                <div className="hidden lg:block ml-3 text-left overflow-hidden">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">{username || 'User'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">{isAdmin ? 'Administrator' : 'Student Identity'}</p>
                </div>
                {currentView === View.SETTINGS && <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse hidden lg:block"></div>}
            </button>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[110]">
        <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-slate-700 p-2">
          <div className="flex justify-between items-center px-2">
            {[...navItems, { view: View.SETTINGS, icon: User, label: 'Profile' }].map((item) => {
              const isActive = currentView === item.view;
              const disabled = !isVerified && !isAdmin && item.view !== View.DASHBOARD && item.view !== View.SUPPORT && item.view !== View.SETTINGS;
              
              return (
                <button
                  key={item.view}
                  onClick={() => !disabled && setView(item.view)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative ${
                    disabled ? 'opacity-30' :
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-2' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  <item.icon size={20} strokeWidth={2.5} />
                  {disabled && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
