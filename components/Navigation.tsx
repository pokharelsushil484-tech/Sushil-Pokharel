
import React from 'react';
import { Layout, Settings, LayoutDashboard, MessageCircle, Lock, BookOpen } from 'lucide-react';
import { View } from '../types';
import { APP_NAME } from '../constants';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
  isVerified?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin, isVerified = false }) => {
  // Define which views are locked for unverified users
  const isLocked = (view: View) => {
    if (isAdmin) return false;
    if (isVerified) return false;
    return [View.AI_CHAT].includes(view);
  };

  let navItems = [
    { view: View.DASHBOARD, icon: Layout, label: 'Stream' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'AI Tutor' },
    { 
      view: View.SETTINGS, 
      icon: Settings, 
      label: 'Settings' 
    },
  ];

  if (isAdmin) {
    navItems = [
      { view: View.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Classroom Manager' },
      ...navItems
    ];
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full fixed left-0 top-0 z-20 transition-colors duration-300">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-3">
          <img src="/icon.png" alt="App Icon" className="w-10 h-10 rounded-xl shadow-md object-cover bg-indigo-50 dark:bg-gray-800" onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">{APP_NAME}</h1>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-1">Classroom</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const locked = isLocked(item.view);
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 justify-between text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'opacity-100' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </div>
                {locked && <Lock size={14} className="text-gray-300 dark:text-gray-600" />}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-center text-gray-300 dark:text-gray-700 font-medium">© 2025 Sushil Pokharel</p>
        </div>
      </div>

      {/* Mobile Bottom Bar (Glassmorphism) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 pb-safe">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
          <div className="flex justify-around items-center h-[72px] px-2">
            {navItems.map((item) => {
              const locked = isLocked(item.view);
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative active:scale-90 transition-transform duration-200 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  {locked && (
                    <div className="absolute top-1 right-3 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 border border-white dark:border-gray-700 shadow-sm">
                      <Lock size={8} className="text-gray-400" />
                    </div>
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
