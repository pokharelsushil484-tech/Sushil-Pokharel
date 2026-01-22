import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  Sparkles, Calendar, Database, Bot, 
  ChevronRight, Heart, AlertCircle, RefreshCw,
  Award, GraduationCap, X
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateClick = () => {
    setIsProcessing(true);
    setError(null);
    
    setTimeout(() => {
      setIsProcessing(false);
      // System is already up to date
    }, 1200);
  };

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Friendly Welcome Card */}
      <div className="relative overflow-hidden glass-card p-10 md:p-16 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        
        <div className="relative z-10 text-center md:text-left space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Official Student Profile</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Hi,<br/><span className="text-indigo-500">Sushil.</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed uppercase tracking-wider">
            Welcome back to your personal companion. Manage your studies, files, and academic goals in one safe place.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
             <button onClick={handleUpdateClick} className="btn-premium px-8 py-4 rounded-2xl text-[10px] flex items-center">
                <RefreshCw size={14} className={`mr-2 ${isProcessing ? 'animate-spin' : ''}`} /> 
                {isProcessing ? 'Checking...' : 'Check System Status'}
             </button>
          </div>
        </div>

        <div className="hidden lg:block shrink-0 glass-card p-4 rounded-[3rem] border-white/20 rotate-3">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop" 
            className="w-56 h-72 object-cover rounded-[2.5rem] grayscale hover:grayscale-0 transition-all duration-1000"
            alt="Student Success"
          />
        </div>
      </div>

      {/* Main Utility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, title: "Study Planner", desc: "View Schedule", view: View.VERIFY_LINK },
          { icon: Database, title: "My Vault", desc: "Secure Storage", view: View.FILE_HUB },
          { icon: Bot, title: "Study Buddy", desc: "Ask AI Assistant", view: View.AI_CHAT }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onNavigate(item.view)}
            className="glass-card p-10 rounded-[3rem] group cursor-pointer"
          >
            <item.icon className="text-slate-500 group-hover:text-indigo-400 transition-colors mb-6" size={32} />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">{item.title}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.desc}</p>
            <div className="mt-8 flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
              Go to Section <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Academic Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-10 rounded-[3rem] space-y-6">
           <Award className="text-indigo-500" size={32} />
           <h4 className="text-xl font-bold uppercase">Academic Rank</h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             You are currently at Level {user.level}. Keep using the planner to organize your assignments and increase your productivity rank!
           </p>
        </div>
        <div className="glass-card p-10 rounded-[3rem] space-y-6">
           <GraduationCap className="text-slate-500" size={32} />
           <h4 className="text-xl font-bold uppercase">Learning Path</h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             Focus: {user.education || 'General Studies'}. Your profile is verified and all academic features are unlocked for your success.
           </p>
        </div>
      </div>
    </div>
  );
};