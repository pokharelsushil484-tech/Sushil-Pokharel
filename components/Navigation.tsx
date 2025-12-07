import React from 'react';
import { Home, Calendar, BookOpen, Shield, Briefcase, GraduationCap, Settings, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { View } from '../types';
import { APP_NAME } from '../constants';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin }) => {
  let navItems = [
    { view: View.DASHBOARD, icon: Home, label: 'Home' },
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
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full fixed left-0 top-0 z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-600">{APP_NAME}</h1>
          <p className="text-xs text-gray-400">Student Manager</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                currentView === item.view
                  ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Bar (hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Show top 5 items for mobile bottom bar, prioritizing Admin if admin */}
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                currentView === item.view ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.view ? 'fill-current opacity-20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
           {/* 'More' button to access Settings or others if list is long */}
           {!isAdmin && (
              <button
                onClick={() => setView(View.SETTINGS)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                    currentView === View.SETTINGS ? 'text-indigo-600' : 'text-gray-400'
                }`}
                >
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-medium">More</span>
             </button>
           )}
           {isAdmin && (
              <button
                onClick={() => setView(View.SETTINGS)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                    currentView === View.SETTINGS ? 'text-indigo-600' : 'text-gray-400'
                }`}
                >
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-medium">Settings</span>
             </button>
           )}
        </div>
      </div>
    </>
  );
};
