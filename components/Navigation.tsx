import React from 'react';
import { LayoutGrid, Database, LifeBuoy, Calendar, Settings } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin?: boolean;
  isVerified: boolean;
  username?: string;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Home' },
    { view: View.VERIFY_LINK, icon: Calendar, label: 'Planner' },
    { view: View.FILE_HUB, icon: Database, label: 'Vault' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'Support' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-black border-r border-white/5 h-full fixed left-0 top-0 z-[110]">
        
        <div className="p-8 flex items-center space-x-3 h-20">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
              SP
           </div>
           <span className="hidden lg:block text-[10px] font-black text-white uppercase tracking-[0.2em]">StudentPocket</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:block ml-4 text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-3 rounded-2xl transition-all ${
                    currentView === View.SETTINGS ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
            >
                <Settings size={20} />
                <span className="hidden lg:block ml-4 text-[11px] font-bold uppercase tracking-widest">Settings</span>
            </button>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[110]">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-2">
          <div className="flex justify-between items-center px-2">
            {[...navItems, { view: View.SETTINGS, icon: Settings }].map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`p-4 rounded-2xl transition-all ${
                    isActive ? 'bg-white text-black' : 'text-slate-500'
                  }`}
                >
                  <item.icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};