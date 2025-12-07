import React from 'react';
import { Home, Calendar, BookOpen, Shield, Briefcase, GraduationCap, Settings, LayoutDashboard, MessageCircle, Lock } from 'lucide-react';
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
    return [View.VAULT, View.CV_BUILDER, View.AI_CHAT].includes(view);
  };

  let navItems = [
    { view: View.DASHBOARD, icon: Home, label: 'Home' },
    { view: View.AI_CHAT, icon: MessageCircle, label: 'Ask AI' },
    { view: View.PLANNER, icon: Calendar, label: 'Plan' },
    { view: View.NOTES, icon: BookOpen, label: 'Notes' },
    { view: View.VAULT, icon: Shield, label: 'Vault' },
    { view: View.CV_BUILDER, icon: Briefcase, label: 'CV' },
    { view: View.SCHOLARSHIP, icon: GraduationCap, label: 'Apps' },
    { 
      view: View.SETTINGS, 
      icon: Settings, 
      label: 'Settings' 
    },
  ];

  if (isAdmin) {
    navItems = [
      { view: View.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Admin' },
      ...navItems
    ];
  }

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full fixed left-0 top-0 z-20 shadow-sm">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-gray-400 font-medium">Student Manager</p>
        </div>
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const locked = isLocked(item.view);
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex items-center w-full px-5 py-4 rounded-2xl transition-all justify-between text-base font-medium ${
                  currentView === item.view
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-6 h-6 mr-4 ${currentView === item.view ? 'stroke-2' : 'stroke-[1.5]'}`} />
                  {item.label}
                </div>
                {locked && <Lock size={16} className="text-gray-300" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Bar (hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-[72px] px-2">
          {/* Show top 5 items for mobile bottom bar, prioritizing Admin if admin */}
          {navItems.slice(0, 5).map((item) => {
            const locked = isLocked(item.view);
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative active:scale-95 transition-transform ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-indigo-50' : ''}`}>
                   <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-indigo-700' : ''}`}>{item.label}</span>
                {locked && (
                  <div className="absolute top-1 right-2 bg-gray-100 rounded-full p-0.5 border border-white shadow-sm">
                    <Lock size={10} className="text-gray-400" />
                  </div>
                )}
              </button>
            );
          })}
           {/* 'More' button to access Settings or others if list is long */}
           {!isAdmin && (
              <button
                onClick={() => setView(View.SETTINGS)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                    currentView === View.SETTINGS ? 'text-indigo-600' : 'text-gray-400'
                }`}
                >
                <div className={`p-1.5 rounded-xl ${currentView === View.SETTINGS ? 'bg-indigo-50' : ''}`}>
                    <Settings className={`w-6 h-6 ${currentView === View.SETTINGS ? 'stroke-2' : 'stroke-[1.5]'}`} />
                </div>
                <span className="text-xs font-medium">More</span>
             </button>
           )}
           {isAdmin && (
              <button
                onClick={() => setView(View.SETTINGS)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                    currentView === View.SETTINGS ? 'text-indigo-600' : 'text-gray-400'
                }`}
                >
                <div className={`p-1.5 rounded-xl ${currentView === View.SETTINGS ? 'bg-indigo-50' : ''}`}>
                    <Settings className={`w-6 h-6 ${currentView === View.SETTINGS ? 'stroke-2' : 'stroke-[1.5]'}`} />
                </div>
                <span className="text-xs font-medium">Settings</span>
             </button>
           )}
        </div>
      </div>
    </>
  );
};