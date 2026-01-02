
import React from 'react';
import { Settings, MessageCircle, LayoutGrid, FolderLock, ShieldCheck, Lock, Database } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
  isVerified: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin, isVerified }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Workbench' },
    { view: View.FILE_HUB, icon: Database, label: 'Repository' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'Assistant' },
    { view: View.SETTINGS, icon: Settings, label: 'Identity' },
  ];

  return (
    <>
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 h-full fixed left-0 top-0 z-[110]">
        <div className="p-6 flex items-center space-x-3 h-16 border-b border-slate-100 dark:border-slate-800">
           <ShieldCheck className="text-indigo-600" size={20} />
           <span className="hidden lg:block text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">System Core</span>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const disabled = !isVerified && !isAdmin && item.view !== View.DASHBOARD && item.view !== View.SETTINGS;
            
            return (
              <button
                key={item.view}
                onClick={() => !disabled && setView(item.view)}
                className={`group flex items-center w-full p-4 rounded-2xl transition-all relative ${
                  disabled ? 'opacity-30 cursor-not-allowed' :
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'
                }`}
              >
                <item.icon className={`w-5 h-5`} />
                <span className={`hidden lg:block ml-4 text-[13px] font-black uppercase tracking-[0.4em]`}>{item.label}</span>
                {disabled && <Lock size={12} className="absolute right-4" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[110]">
        <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 p-2">
          <div className="flex justify-between items-center px-2">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              const disabled = !isVerified && !isAdmin && item.view !== View.DASHBOARD && item.view !== View.SETTINGS;
              return (
                <button
                  key={item.view}
                  onClick={() => !disabled && setView(item.view)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                    disabled ? 'opacity-20' :
                    isActive ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
