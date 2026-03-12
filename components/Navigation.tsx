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
  Target,
  Lock,
  BrainCircuit
} from 'lucide-react';
import { View, SubscriptionTier } from '../types';
import { VERSION_BETA, VERSION_PRO } from '../constants';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin: boolean;
  isVerified: boolean;
  username: string;
  onLogout: () => void;
  subscriptionTier: SubscriptionTier;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isAdmin, subscriptionTier }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutGrid, label: 'Dashboard', isPro: false },
    { view: View.MISSION_CONTROL, icon: Target, label: 'Missions', isPro: true },
    { view: View.FOCUS_MATRIX, icon: BrainCircuit, label: 'Focus', isPro: true },
    { view: View.SECURITY_HEARTBEAT, icon: HeartPulse, label: 'Security', isPro: true },
    { view: View.GROWTH_JOURNAL, icon: BookOpen, label: 'Journal', isPro: false },
    { view: View.ACADEMIC_LEDGER, icon: Trophy, label: 'Ledger', isPro: false },
    { view: View.ATTENDANCE_TRACKER, icon: ClipboardList, label: 'Attendance', isPro: false },
    { view: View.CAMPUS_RADAR, icon: MapPin, label: 'Radar', isPro: true },
    { view: View.FILE_HUB, icon: Database, label: 'Vault', isPro: true },
    { view: View.SUPPORT, icon: LifeBuoy, label: 'Support', isPro: false },
  ];

  if (isAdmin) {
      navItems.push({ view: View.ADMIN_DASHBOARD, icon: ShieldAlert, label: 'Master', isPro: false });
  }

  const isProActive = subscriptionTier !== SubscriptionTier.LIGHT;
  const versionString = isProActive ? VERSION_PRO : VERSION_BETA;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-24 lg:w-72 bg-obsidian border-r border-white/5 h-full fixed left-0 top-0 z-[110] transition-all duration-500">
        <div className="p-8 flex items-center gap-4 h-24 border-b border-white/5">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-black font-display italic font-bold shadow-lg shrink-0 ${isProActive ? 'bg-amber-400' : 'bg-white'}`}>
              SP
           </div>
           <div className="hidden lg:flex flex-col">
              <span className="text-sm font-display italic font-bold text-white leading-none">Elite Suite</span>
              <span className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${isProActive ? 'text-amber-400' : 'text-white/20'}`}>
                {versionString}
              </span>
           </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const isLocked = item.isPro && !isProActive;
            
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`group flex items-center w-full p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? (isProActive ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/20' : 'bg-white text-black shadow-xl')
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
                    {isLocked && (
                      <div className="absolute -top-1 -right-1 bg-obsidian rounded-full p-0.5 border border-white/10">
                        <Lock size={8} className="text-amber-400" />
                      </div>
                    )}
                </div>
                <span className="hidden lg:block ml-4 text-sm font-medium whitespace-nowrap flex-1 text-left">{item.label}</span>
                {isLocked && <span className="hidden lg:block text-[9px] font-bold text-amber-400 uppercase tracking-widest ml-2">PRO</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
            <button
                onClick={() => setView(View.SETTINGS)}
                className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                    currentView === View.SETTINGS ? (isProActive ? 'bg-amber-500/10 text-amber-400' : 'bg-white/10 text-white') : 'text-white/20 hover:text-white'
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
                    isActive ? (isProActive ? 'bg-amber-500 text-black shadow-lg -translate-y-2' : 'bg-white text-black shadow-lg -translate-y-2') : 'text-white/40'
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
            <button
                  onClick={() => setView(View.SETTINGS)}
                  className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center relative ${
                    currentView === View.SETTINGS ? (isProActive ? 'bg-amber-500 text-black shadow-lg -translate-y-2' : 'bg-white text-black shadow-lg -translate-y-2') : 'text-white/40'
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
