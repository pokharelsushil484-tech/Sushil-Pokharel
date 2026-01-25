import React from 'react';
import { ShieldCheck, ExternalLink, Mail, Globe, Lock, Cpu } from 'lucide-react';
import { APP_NAME, COPYRIGHT_NOTICE, LEGAL_TERMS, FOOTER_LINKS, ADMIN_EMAIL, CREATOR_NAME, SYSTEM_DOMAIN, APP_VERSION } from '../constants';
import { View } from '../types';

interface FooterProps {
  onNavigate: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-40 border-t border-white/10 pt-24 pb-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
          {/* Institutional Brand */}
          <div className="md:col-span-1 space-y-8">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-white/5 transform -rotate-6">
                <ShieldCheck size={32} />
              </div>
              <div className="text-left">
                  <span className="block text-2xl font-black text-white uppercase tracking-tighter leading-none italic">{APP_NAME}</span>
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] leading-none mt-1">{SYSTEM_DOMAIN}</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 font-bold uppercase tracking-widest max-w-xs">
              The premier executive suite for academic command and long-term data preservation.
            </p>
            {/* Version Display - Stark Contrast */}
            <div className="inline-block px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg">
                Version Details: {APP_VERSION}
            </div>
            <div className="flex items-center space-x-4">
              <a href={`mailto:${ADMIN_EMAIL}`} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5">
                <Mail size={20} />
              </a>
              <div className="p-4 bg-white/5 rounded-2xl text-slate-500 border border-white/5 opacity-40">
                <Lock size={20} />
              </div>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div>
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-10">Access Nodes</h4>
            <ul className="space-y-6">
              {FOOTER_LINKS.internal.map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => onNavigate(link.view as View)}
                    className="text-xs font-black text-slate-400 hover:text-white transition-all flex items-center group uppercase tracking-widest"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-4 group-hover:bg-indigo-500 transition-all"></div>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Resource Matrix */}
          <div>
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-10">Academic Grid</h4>
            <ul className="space-y-6">
              {FOOTER_LINKS.academic.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-xs font-black text-slate-400 hover:text-white transition-all flex items-center justify-between group uppercase tracking-widest"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={14} className="text-slate-700 group-hover:text-white transition-colors" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance Matrix */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-10">Compliance</h4>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex items-center space-x-3 text-slate-500">
                    <Cpu size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Build Layer 2026</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                    {LEGAL_TERMS}
                </p>
            </div>
          </div>
        </div>

        {/* Bottom Detailed Signature */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left space-y-2">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em]">Architecture Design & Systems</p>
              <p className="text-lg font-black text-white uppercase tracking-[0.2em] italic">{CREATOR_NAME}</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">{COPYRIGHT_NOTICE}</p>
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    <Globe size={10} className="text-white" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Institutional Release Protocol Alpha 9.2.5</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};