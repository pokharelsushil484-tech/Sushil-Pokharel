
import React from 'react';
import { LayoutGrid, Database, LifeBuoy, Calendar, Settings, ShieldAlert, Zap, Globe, MapPin, ClipboardList, Trophy, BookOpen, HeartPulse } from 'lucide-react';
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
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'CONTROL CENTER' },
    { view: View.SECURITY_HEARTBEAT, icon: HeartPulse, label: 'MESH HEARTBEAT' },
    { view: View.GROWTH_JOURNAL, icon: BookOpen, label: 'GROWTH JOURNAL' },
    { view: View.ACADEMIC_LEDGER, icon: Trophy, label: 'PRECISION LEDGER' },
    { view: View.ATTENDANCE_TRACKER, icon: ClipboardList, label: 'ATTENDANCE SYNC' },
    { view: View.CAMPUS_RADAR, icon: MapPin, label: 'NEURAL RADAR' },
    { view: View.VERIFY_LINK, icon: Calendar, label: 'STRATEGIC MAP' },
    { view: View.FILE_HUB, icon: Database, label: 'DATA FORTRESS' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'COMMS RELAY' },
  ];

  if (isAdmin) {
      navItems.push({ view: View.ADMIN_DASHBOARD, icon: ShieldAlert, label: 'MASTER NODE' });
  }

  return (
    <>
      {/* Executive Desktop Sidebar - MacBook Optimized */}
      <div className="hidden md:flex flex-col w-24 lg:w-80 bg-[#060608] border-r border-white/5 h-full fixed left-0 top-0 z-[110] transition-all duration-700 shadow-[20px_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-10 flex items-center space-x-6 h-28 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-[0_20px_40px_rgba(255,255,255,0.15)] shrink-0">
              SP
           </div>
           <div className="hidden lg:flex flex-col">
              <span className="text-[12px] font-black text-white uppercase tracking-[0.4em] leading-none">Institutional</span>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2">v16.2.0 PULSE</span>
           </div>
        </div>

        <nav className="flex-1 px-6 py-10 space-y-4 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-4 rounded-[1.25rem] transition-all duration-700 transform ${
                  isActive 
                  ? 'bg-white text-black shadow-[0_25px_50px_rgba(255,255,255,0.1)] scale-[1.04]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                    <item.icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" strokeWidth={isActive ? 3 : 2} />
                    {isActive && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#4f46e5]"></div>}
                </div>
                <span className="hidden lg:block ml-6 text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl space-y-4">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-4 rounded-[1.25rem] transition-all group ${
                    currentView === View.SETTINGS ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner' : 'text-slate-600 hover:text-white'
                }`}
            >
                <Settings size={20} className="group-hover:rotate-180 transition-transform duration-[1.5s]" />
                <span className="hidden lg:block ml-6 text-[9px] font-black uppercase tracking-widest">CONFIGURATION</span>
            </button>
            <div className="hidden lg:flex items-center justify-center space-x-3 text-slate-800 py-2">
                <Globe size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Sushil Pokhrel Build 2026</span>
            </div>
        </div>
      </div>

      {/* Ergonomic Mobile Dock - iPhone & iPad Precision */}
      <div className="md:hidden fixed bottom-10 left-6 right-6 z-[110] animate-platinum">
        <div className="bg-[#0c0c0e]/95 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,1)] border border-white/10 p-2">
          <div className="flex justify-around items-center h-14 overflow-x-auto no-scrollbar px-2 gap-1">
            {navItems.slice(0, 5).map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`p-3.5 rounded-full transition-all duration-700 flex items-center justify-center relative active:scale-90 ${
                    isActive ? 'bg-white text-black shadow-2xl -translate-y-4' : 'text-slate-500'
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                </button>
              );
            })}
            <button
                  onClick={() => setView(View.SETTINGS)}
                  className={`p-3.5 rounded-full transition-all duration-700 flex items-center justify-center relative active:scale-90 ${
                    currentView === View.SETTINGS ? 'bg-white text-black shadow-2xl -translate-y-4' : 'text-slate-500'
                  }`}
                >
                  <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
