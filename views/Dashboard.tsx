
import React, { useState } from 'react';
import { UserProfile, View } from '../types';
import { 
  Sparkles, Calendar, Database, Bot, 
  ChevronRight, Heart, AlertCircle, RefreshCw,
  Clock, Award, Briefcase, LayoutGrid, X
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, username, onNavigate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSponsorClick = () => {
    setIsProcessing(true);
    setError(null);
    
    // Explicit user-input error simulation
    setTimeout(() => {
      setIsProcessing(false);
      setError("Network Timeout: The transaction node could not be established. Please verify your connection and try again.");
    }, 1800);
  };

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Executive Welcome Card */}
      <div className="relative overflow-hidden glass-card p-10 md:p-16 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent"></div>
        
        <div className="relative z-10 text-center md:text-left space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Identity Verified</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Node<br/><span className="text-indigo-500">Overview.</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed uppercase tracking-wider">
            Optimizing academic workflows for {user.name}. Centralized management for modern students.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
             <button onClick={handleSponsorClick} className="btn-premium px-8 py-4 rounded-2xl text-[10px] flex items-center">
                <Heart size={14} className="mr-2 fill-current" /> Sponsor Dev
             </button>
          </div>
        </div>

        <div className="hidden lg:block shrink-0 glass-card p-4 rounded-[3rem] border-white/20 rotate-3">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" 
            className="w-56 h-72 object-cover rounded-[2.5rem] grayscale hover:grayscale-0 transition-all duration-1000"
            alt="User Profile"
          />
        </div>
      </div>

      {/* Interaction Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-center gap-6 animate-pulse">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle size={24} className="text-white" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest">Transaction Interaction Failed</h4>
            <p className="text-xs text-slate-300 font-medium">{error}</p>
          </div>
          {/* Use imported X icon for close button */}
          <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-white/5 rounded-lg"><X size={16} /></button>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center space-x-4 py-8 text-indigo-400">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Payment Tunnel...</span>
        </div>
      )}

      {/* Main Grid Utility */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, title: "Planner", desc: "Course Strategy", view: View.VERIFY_LINK },
          { icon: Database, title: "Vault", desc: "Data Archival", view: View.FILE_HUB },
          { icon: Bot, title: "AI Node", desc: "Logical Assistant", view: View.AI_CHAT }
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
              Initialize <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-10 rounded-[3rem] space-y-6">
           <Award className="text-indigo-500" size={32} />
           <h4 className="text-xl font-bold uppercase">Executive Status</h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             Level {user.level} account active. You have full administrative privileges over this node instance. Academic integrity score: 100%.
           </p>
        </div>
        <div className="glass-card p-10 rounded-[3rem] space-y-6">
           <Briefcase className="text-slate-500" size={32} />
           <h4 className="text-xl font-bold uppercase">Curriculum Hub</h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             Active Major: {user.education}. Strategize your graduation path with the automated study planning module.
           </p>
        </div>
      </div>
    </div>
  );
};
