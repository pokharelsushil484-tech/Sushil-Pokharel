import React from 'react';
import { UserProfile, View } from '../types';
import { GraduationCap, Sparkles, Facebook, Mail, Phone, Bot, Calendar, ArrowRight, Award, Briefcase, Code, ExternalLink, Globe } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  username: string;
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-12 animate-fade-in w-full max-w-5xl mx-auto pb-20">
      {/* Portfolio Hero */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 text-white shadow-2xl p-10 md:p-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="text-center md:text-left flex-1">
                  <div className="inline-flex items-center space-x-2 bg-indigo-500/20 px-4 py-1.5 rounded-full mb-8 border border-indigo-500/30">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Sushil Pokharel - Student</span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.85] uppercase">
                    My<br/>Port<span className="text-indigo-500">folio</span>
                  </h1>
                  <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed mb-10">
                    Bridging the gap between Business Management and Modern Technology. Specialist in Strategic Management and Digital Ethics.
                  </p>
                  
                  {/* Social Links Bar */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <a href="https://www.facebook.com/Susilpokrel09" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white flex items-center gap-3">
                          <Facebook size={20} />
                          <span className="text-xs font-bold uppercase tracking-widest">Connect</span>
                      </a>
                      <a href="mailto:support@sushilpokharel00.com.np" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white flex items-center gap-3">
                          <Mail size={20} />
                          <span className="text-xs font-bold uppercase tracking-widest">Email</span>
                      </a>
                      <a href="tel:9765226385" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white flex items-center gap-3">
                          <Phone size={20} />
                          <span className="text-xs font-bold uppercase tracking-widest">9765226385</span>
                      </a>
                  </div>
              </div>
              <div className="shrink-0 relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-75"></div>
                  <div className="w-56 h-56 md:w-64 md:h-64 rounded-[4rem] border-8 border-white/5 p-3 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 bg-slate-800">
                    <img 
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop" 
                        className="w-full h-full object-cover rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700" 
                        alt="Sushil Pokharel" 
                    />
                  </div>
              </div>
          </div>
      </div>

      {/* Interest Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Code size={120} />
              </div>
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                  <Award size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Innovation First</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  Dedicated to researching AI strategies in management. Currently exploring market analytics and business automation trends.
              </p>
              <div className="flex flex-wrap gap-2">
                  {["Market Research", "AI Strategy", "Digital Assets"].map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500">{tag}</span>
                  ))}
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Globe size={120} />
              </div>
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-8">
                  <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Academic Journey</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  Bachelor of Business Studies (BBS) Student with a solid foundation in Computer Science and Quantitative Analysis.
              </p>
              <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-lg">BBS 2026</span>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500">Grad 12 (CS)</span>
              </div>
          </div>
      </div>

      {/* Secondary Navigation CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Bot, title: "AI Assistant", desc: "Technical Research Tool", view: View.AI_CHAT },
            { icon: Calendar, title: "Study Planner", desc: "BBS Module Tracking", view: View.VERIFY_LINK },
            { icon: Briefcase, title: "Identity Hub", desc: "Data & File Management", view: View.FILE_HUB }
          ].map((tool, idx) => (
            <div key={idx} onClick={() => onNavigate(tool.view)} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center mb-6 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <tool.icon size={24} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{tool.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tool.desc}</p>
                <div className="mt-6 flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Node <ArrowRight size={14} className="ml-2" />
                </div>
            </div>
          ))}
      </div>
    </div>
  );
};
