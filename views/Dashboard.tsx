import React from 'react';
import { UserProfile, View } from '../types';
import { GraduationCap, Sparkles, Database, Bot, Calendar, ArrowRight, Award, Briefcase, Code } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in w-full max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl p-8 md:p-14">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="text-center md:text-left">
                  <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full mb-6 border border-white/5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Available for Opportunities</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
                    Namaste, I'm <span className="text-indigo-400">Sushil</span>
                  </h1>
                  <p className="text-lg text-slate-400 font-medium max-w-lg leading-relaxed">
                    A dedicated business student bridging the gap between management and technology.
                  </p>
              </div>
              <div className="shrink-0">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] border-4 border-white/10 p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img 
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop" 
                        className="w-full h-full object-cover rounded-[2.2rem]" 
                        alt="Sushil Pokharel" 
                    />
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Tools */}
          <div onClick={() => onNavigate(View.AI_CHAT)} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">AI Assistant</h3>
              <p className="text-xs text-slate-500">Smart academic research tool.</p>
          </div>

          <div onClick={() => onNavigate(View.VERIFY_LINK)} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Study Planner</h3>
              <p className="text-xs text-slate-500">Track BBS modules and goals.</p>
          </div>

          <div onClick={() => onNavigate(View.FILE_HUB)} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Database size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Resource Hub</h3>
              <p className="text-xs text-slate-500">Secure storage for academic files.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Education Timeline */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                      <GraduationCap size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Academic Profile</h2>
              </div>

              <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-md"></div>
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Bachelor of Business Studies</h3>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">Currently Running</p>
                          </div>
                          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 rounded-md">BBS</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                          Focused on strategic management, financial analysis, and modern business logistics.
                      </p>
                  </div>

                  <div className="relative pl-10 opacity-70">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900"></div>
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Grade 12</h3>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Completed</p>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">CS</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                          Specialized in Computer Science. Core foundation in algorithmic thinking and programming.
                      </p>
                  </div>
              </div>
          </div>

          {/* Interests & Expertise */}
          <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                          <Sparkles size={24} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Core Interests</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                      {[
                        { icon: Award, label: "Market Research" },
                        { icon: Code, label: "Business Tech" },
                        { icon: Briefcase, label: "Strategy" },
                        { icon: Bot, label: "AI in Finance" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                            <item.icon size={14} className="text-indigo-500" />
                            <span>{item.label}</span>
                        </div>
                      ))}
                  </div>
              </div>

              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-between group cursor-pointer overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-lg font-black uppercase tracking-widest mb-1">Get in Touch</h3>
                      <p className="text-xs text-indigo-100 font-medium">Collaborate on research projects.</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:translate-x-2 transition-transform">
                      <ArrowRight size={24} />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
