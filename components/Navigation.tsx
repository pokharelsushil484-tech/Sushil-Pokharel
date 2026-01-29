import React from 'react';
import { LayoutGrid, Database, LifeBuoy, Calendar, Settings, ShieldAlert, Cpu, Terminal } from 'lucide-react';
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
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'CONTROL' },
    { view: View.VERIFY_LINK, icon: Calendar, label: 'ROADMAP' },
    { view: View.FILE_HUB, icon: Database, label: 'FORTRESS' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'SUPPORT' },
  ];

  if (isAdmin) {
      navItems.push({ view: View.ADMIN_DASHBOARD, icon: ShieldAlert, label: 'OVERRIDE' });
  }

  return (
    <>
      {/* Premium Desktop & MacBook Sidebar */}
      <div className="hidden md:flex flex-col w-24 lg:w-72 bg-[#080808] border-r border-white/5 h-full fixed left-0 top-0 z-[110] transition-all duration-500 shadow-2xl overflow-hidden">
        <div className="p-8 flex items-center space-x-5 h-24 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-2xl shrink-0">
              SP
           </div>
           <div className="hidden lg:flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Executive</span>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Build 9.2.5</span>
           </div>
        </div>

        <nav className="flex-1 px-5 py-12 space-y-4">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-500 transform ${
                  isActive 
                  ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] scale-[1.05]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 3 : 2} />
                <span className="hidden lg:block ml-6 text-[10px] font-black uppercase tracking-[0.25em] whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-4 rounded-2xl transition-all group ${
                    currentView === View.SETTINGS ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-600 hover:text-white'
                }`}
            >
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-700" />
                <span className="hidden lg:block ml-6 text-[10px] font-black uppercase tracking-widest">SETTINGS</span>
            </button>
        </div>
      </div>

      {/* Ergonomic Mobile Dock - iPhone & iPad Optimized */}
      <div className="md:hidden fixed bottom-8 left-6 right-6 z-[110] animate-slide-up">
        <div className="bg-[#0f0f0f]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,1)] border border-white/10 p-2">
          <div className="flex justify-around items-center h-16">
            {[...navItems, { view: View.SETTINGS, icon: Settings }].map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`p-4 rounded-2xl transition-all duration-500 flex items-center justify-center relative active:scale-90 ${
                    isActive ? 'bg-white text-black shadow-xl -translate-y-4' : 'text-slate-600'
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                  {isActive && <div className="absolute -bottom-1.5 w-1 h-1 bg-black rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};