
import React from 'react';
import { Layout, Settings, LayoutDashboard, MessageCircle, Lock, BookOpen, Database, LayoutList, ShieldCheck, ChevronRight, Menu, AppWindow } from 'lucide-react';
import { View } from '../types';
import { APP_NAME, CREATOR_NAME } from '../constants';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
  isVerified?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin, isVerified = false }) => {
  const isLocked = (view: View) => {
    if (isAdmin) return false;
    if (isVerified) return false;
    return [View.AI_CHAT, View.DATABASE_MANAGER, View.VAULT].includes(view);
  };

  let navItems = [
    { view: View.DASHBOARD, icon: AppWindow, label: 'Workbench' },
    { view: View.DATABASE_MANAGER, icon: Database, label: 'Architect' },
    { view: View.NOTES, icon: BookOpen, label: 'Documentation' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'AI Engine' },
    { view: View.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  if (isAdmin) {
    navItems = [
      { view: View.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Authority' },
      ...navItems.slice(1)
    ];
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 h-full fixed left-0 top-0 z-[110] transition-all">
        <div className="p-6 flex items-center space-x-3 h-14 border-b border-slate-100 dark:border-slate-800">
           <div className="w-4 h-4 rounded bg-indigo-600 shadow-lg shadow-indigo-600/20"></div>
           <span className="hidden lg:block text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">System Core</span>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1">
          {navItems.map((item) => {
            const locked = isLocked(item.view);
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-3 rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-slate-50 dark:bg-slate-800 text-indigo-600 nav-active'
                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'
                }`}
              >
                <div className="flex items-center justify-center min-w-[32px]">
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                </div>
                <span className={`hidden lg:block ml-4 text-[13px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                
                {locked && (
                   <div className="absolute right-3">
                       <Lock size={12} className="text-slate-300 opacity-50" />
                   </div>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
            <div className="lg:flex flex-col hidden space-y-1 opacity-50">
                <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Architecture</span>
                <span className="text-[8px] font-bold text-slate-500 truncate">By {CREATOR_NAME}</span>
            </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[110]">
        <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-1.5">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const locked = isLocked(item.view);
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all ${
                    isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
