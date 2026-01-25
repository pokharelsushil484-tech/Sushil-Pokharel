import React from 'react';
import { ShieldCheck, ExternalLink, Mail, Globe, Lock, Cpu } from 'lucide-react';
import { APP_NAME, COPYRIGHT_NOTICE, LEGAL_TERMS, FOOTER_LINKS, ADMIN_EMAIL, CREATOR_NAME, SYSTEM_DOMAIN } from '../constants';
import { View } from '../types';

interface FooterProps {
  onNavigate: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-48 border-t border-white/5 pt-32 pb-20 animate-fade-in px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
          {/* Executive Branding */}
          <div className="md:col-span-1 space-y-10">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 transform -rotate-6 transition-transform hover:rotate-0">
                <ShieldCheck size={36} />
              </div>
              <div className="text-left">
                  <span className="block text-2xl font-black text-white uppercase tracking-tighter leading-none italic">{APP_NAME}</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mt-1 block">{SYSTEM_DOMAIN}</span>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-500 font-bold uppercase tracking-widest max-w-xs">
              Premier academic infrastructure for management and long-term data preservation.
            </p>
            <div className="flex items-center space-x-5">
              <a href={`mailto:${ADMIN_EMAIL}`} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-white transition-all border border-white/5 hover:border-indigo-500/40">
                <Mail size={22} />
              </a>
              <div className="p-5 bg-white/5 rounded-3xl text-slate-500 border border-white/5 opacity-50">
                <Lock size={22} />
              </div>
            </div>
          </div>

          {/* System Navigation */}
          <div>
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] mb-12">System Nodes</h4>
            <ul className="space-y-7">
              {FOOTER_LINKS.internal.map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => onNavigate(link.view as View)}
                    className="text-xs font-black text-slate-400 hover:text-white transition-all flex items-center group uppercase tracking-widest"
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-800 mr-5 group-hover:bg-indigo-500 transition-all"></div>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Resources */}
          <div>
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] mb-12">Academic Grid</h4>
            <ul className="space-y-7">
              {FOOTER_LINKS.academic.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-xs font-black text-slate-400 hover:text-white transition-all flex items-center justify-between group uppercase tracking-widest"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={16} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Security */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] mb-12">Compliance</h4>
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                <div className="flex items-center space-x-4 text-slate-500">
                    <Cpu size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quantum Encryption Node</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic border-l-2 border-indigo-600/30 pl-4">
                    {LEGAL_TERMS}
                </p>
            </div>
          </div>
        </div>

        {/* Modular Signature Section */}
        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left space-y-3">
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.8em]">Architectural Design & Maintenance</p>
              <p className="text-xl font-black text-white uppercase tracking-[0.3em] italic">{CREATOR_NAME}</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-4">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.5em]">{COPYRIGHT_NOTICE}</p>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-indigo-600/10 px-5 py-2 rounded-full border border-indigo-500/20">
                    <Globe size={12} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">Stable Release v9.2.0 • 2026 Production</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};