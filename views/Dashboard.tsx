import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  ShieldCheck, Calendar, Database, 
  ChevronRight, RefreshCw,
  Award, GraduationCap, CheckCircle2, Loader2
} from 'lucide-react';
import { APP_VERSION } from '../constants';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [updateState, setUpdateState] = useState<'IDLE' | 'CHECKING' | 'RESULT'>('IDLE');

  const handleCheckUpdates = () => {
    setUpdateState('CHECKING');
    // Simulate check against server
    setTimeout(() => {
      setUpdateState('RESULT');
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade">
      {/* Executive Welcome Card */}
      <div className="relative overflow-hidden glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/10 to-transparent border-white/10">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <ShieldCheck size={12} className="text-indigo-400" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Verified Student Access</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Hello, <span className="text-indigo-500">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-sm text-sm leading-relaxed">
            Welcome back to your personal academic pocket. Your files and schedule are fully synchronized.
          </p>
          <div className="pt-2">
             <button 
              onClick={handleCheckUpdates}
              className="px-6 py-3 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center hover:bg-slate-100 transition-colors"
             >
                <RefreshCw size={14} className="mr-2" /> Check for Updates
             </button>
          </div>
        </div>
      </div>

      {/* Main Utility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Calendar, title: "My Planner", desc: "Deadlines & Schedule", view: View.VERIFY_LINK },
          { icon: Database, title: "My Vault", desc: "Secure Storage", view: View.FILE_HUB }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className="glass-card p-8 rounded-[2rem] group cursor-pointer hover:border-indigo-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400">
                <item.icon size={24} />
              </div>
              <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-3xl flex items-center space-x-4">
           <Award className="text-amber-500" size={32} />
           <div>
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academic Level</h4>
             <p className="text-sm font-bold text-white">Level {user.level} Student</p>
           </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center space-x-4">
           <GraduationCap className="text-indigo-400" size={32} />
           <div>
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Center</h4>
             <p className="text-sm font-bold text-white truncate">{user.education || 'Academic Hub'}</p>
           </div>
        </div>
      </div>

      {/* Update Result Modal */}
      {updateState !== 'IDLE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-card rounded-[2.5rem] p-10 text-center relative animate-fade">
             {updateState === 'CHECKING' ? (
               <>
                 <Loader2 size={48} className="mx-auto text-indigo-500 animate-spin mb-6" />
                 <h3 className="text-xl font-bold text-white mb-2">Connecting</h3>
                 <p className="text-xs text-slate-400">Verifying system integrity and build status...</p>
               </>
             ) : (
               <>
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Up to Date</h3>
                 <p className="text-xs text-slate-400 mb-6">Build {APP_VERSION} is current. No action required.</p>
                 <button 
                  onClick={() => setUpdateState('IDLE')}
                  className="w-full py-4 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                 >
                   Continue
                 </button>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};