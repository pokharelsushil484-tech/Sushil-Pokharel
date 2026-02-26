
import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  Database, 
  LifeBuoy, 
  Settings, 
  ShieldAlert, 
  MapPin, 
  ClipboardList, 
  Trophy, 
  BookOpen, 
  HeartPulse,
  Sparkles,
  Target
} from 'lucide-react';
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
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Dashboard' },
    { view: View.MISSION_CONTROL, icon: Target, label: 'Missions' },
    { view: View.SECURITY_HEARTBEAT, icon: HeartPulse, label: 'Security' },
    { view: View.GROWTH_JOURNAL, icon: BookOpen, label: 'Journal' },
    { view: View.ACADEMIC_LEDGER, icon: Trophy, label: 'Ledger' },
    { view: View.ATTENDANCE_TRACKER, icon: ClipboardList, label: 'Attendance' },
    { view: View.CAMPUS_RADAR, icon: MapPin, label: 'Radar' },
    { view: View.FILE_HUB, icon: Database, label: 'Vault' },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'Support' },
  ];

  if (isAdmin) {
      navItems.push({ view: View.ADMIN_DASHBOARD, icon: ShieldAlert, label: 'Master' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-24 lg:w-72 bg-obsidian border-r border-white/5 h-full fixed left-0 top-0 z-[110] transition-all duration-500">
        <div className="p-8 flex items-center gap-4 h-24 border-b border-white/5">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-display italic font-bold shadow-lg shrink-0">
              SP
           </div>
           <div className="hidden lg:flex flex-col">
              <span className="text-sm font-display italic font-bold text-white leading-none">Elite Suite</span>
              <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest mt-1">v2.0 Active</span>
           </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-white text-black shadow-xl' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <motion.div 
                        layoutId="active-dot"
                        className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-black rounded-full"
                      />
                    )}
                </div>
                <span className="hidden lg:block ml-4 text-sm font-medium whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                    currentView === View.SETTINGS ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'
                }`}
            >
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="hidden lg:block ml-4 text-sm font-medium">Settings</span>
            </button>
            <div className="hidden lg:flex items-center justify-center gap-2 text-white/10 py-2">
                <Sparkles size={12} />
                <span className="text-[10px] font-medium uppercase tracking-widest">Sushil Pokharel</span>
            </div>
        </div>
      </div>

      {/* Mobile Dock */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[110]">
        <div className="bg-obsidian/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-2">
          <div className="flex justify-around items-center h-14 overflow-x-auto no-scrollbar px-2 gap-1">
            {navItems.slice(0, 5).map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center relative ${
                    isActive ? 'bg-white text-black shadow-lg -translate-y-2' : 'text-white/40'
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
            <button
                  onClick={() => setView(View.SETTINGS)}
                  className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center relative ${
                    currentView === View.SETTINGS ? 'bg-white text-black shadow-lg -translate-y-2' : 'text-white/40'
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

