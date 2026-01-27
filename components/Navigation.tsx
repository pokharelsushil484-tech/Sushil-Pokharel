import React from 'react';
import { LayoutGrid, Database, LifeBuoy, Calendar, Settings, ShieldAlert } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin: boolean;
  isVerified: boolean;
  username: string;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Home' },
    { view: View.VERIFY_LINK, icon: Calendar, label: 'Planner' },
    { view: View.FILE_HUB, icon: Database, label: 'Vault' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'Support' },
  ];

  if (isAdmin) {
      navItems.push({ view: View.ADMIN_DASHBOARD, icon: ShieldAlert, label: 'Admin' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 bg-black border-r border-white/5 h-full fixed left-0 top-0 z-[110]">
        
        <div className="p-8 flex items-center space-x-3 h-20 border-b border-white/5">
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black text-xs shadow-lg shadow-white/5">
              SP
           </div>
           <span className="hidden lg:block text-[10px] font-black text-white uppercase tracking-[0.4em]">Platinum Hub</span>
        </div>

        <nav className="flex-1 px-4 py-10 space-y-3">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-white text-black shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:block ml-4 text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-4 rounded-2xl transition-all ${
                    currentView === View.SETTINGS ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
            >
                <Settings size={20} />
                <span className="hidden lg:block ml-4 text-[10px] font-black uppercase tracking-widest">Config</span>
            </button>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[110]">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-2">
          <div className="flex justify-between items-center px-2">
            {[...navItems, { view: View.SETTINGS, icon: Settings }].map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`p-4 rounded-[1.5rem] transition-all duration-500 ${
                    isActive ? 'bg-white text-black shadow-xl scale-110' : 'text-slate-500'
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