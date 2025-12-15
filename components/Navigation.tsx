
import React from 'react';
import { Layout, Settings, LayoutDashboard, MessageCircle, Lock, BookOpen, Wallet, ListChecks, CheckSquare, Briefcase, GraduationCap } from 'lucide-react';
import { View } from '../types';
import { APP_NAME } from '../constants';

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
    return [View.AI_CHAT, View.EXPENSES].includes(view);
  };

  let navItems = [
    { view: View.DASHBOARD, icon: Layout, label: 'Home' },
    { view: View.PLANNER, icon: CheckSquare, label: 'Tasks' },
    { view: View.NOTES, icon: BookOpen, label: 'Notes' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'AI' },
    { view: View.SETTINGS, icon: Settings, label: 'Config' },
  ];

  if (isAdmin) {
    navItems = [
      { view: View.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Admin' },
      ...navItems.slice(1) // Remove Home for admin to save space or keep it if needed
    ];
  }

  return (
    <>
      {/* Desktop Sidebar (Left) */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full fixed left-0 top-0 z-30 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start lg:space-x-3 h-24">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white font-bold text-xl">
             S
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">{APP_NAME}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">v2.0</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const locked = isLocked(item.view);
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-3 rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span className={`hidden lg:block ml-3 text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                
                {locked && (
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 lg:block hidden">
                       <Lock size={12} className="text-gray-400" />
                   </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-gray-900/90 dark:bg-black/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-2">
          <div className="flex justify-between items-center px-2">
            {navItems.map((item) => {
              const locked = isLocked(item.view);
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`relative p-3 rounded-full transition-all duration-300 ${
                    isActive 
                    ? 'bg-indigo-500 text-white transform -translate-y-2 shadow-lg shadow-indigo-500/40' 
                    : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {locked && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-gray-500 rounded-full border-2 border-gray-900"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
