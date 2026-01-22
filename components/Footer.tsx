import React from 'react';
import { ShieldCheck, ExternalLink, Mail, Info, FileText } from 'lucide-react';
import { APP_NAME, COPYRIGHT_NOTICE, LEGAL_TERMS, FOOTER_SIGNATURE, FOOTER_LINKS, ADMIN_EMAIL } from '../constants';
import { View } from '../types';

interface FooterProps {
  onNavigate: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-white/5 pt-12 pb-8 animate-fade">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Branding & Legal */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <ShieldCheck size={20} />
            </div>
            <span className="text-sm font-black text-white uppercase tracking-widest">{APP_NAME}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
            <Info size={12} className="inline mr-1 text-indigo-500" />
            {LEGAL_TERMS}
          </p>
          <div className="flex items-center space-x-4">
            <a href={`mailto:${ADMIN_EMAIL}`} className="text-slate-400 hover:text-white transition-colors">
              <Mail size={18} />
            </a>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{COPYRIGHT_NOTICE}</span>
          </div>
        </div>

        {/* Internal Navigation */}
        <div>
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Quick Navigation</h4>
          <ul className="space-y-4">
            {FOOTER_LINKS.internal.map((link, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => onNavigate(link.view as View)}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-3 group-hover:bg-indigo-500 transition-colors"></span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Academic Resources */}
        <div>
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">External Resources</h4>
          <ul className="space-y-4">
            {FOOTER_LINKS.academic.map((link, idx) => (
              <li key={idx}>
                <a 
                  href={link.href}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </a>
              </li>
            ))}
            <li className="pt-4 border-t border-white/5">
              <div className="flex items-center space-x-2 text-slate-500">
                <FileText size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Student ID: Verified</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Signature */}
      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Institutional Privacy Standard</p>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-500">{FOOTER_SIGNATURE}</span>
          <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
          <span className="text-[10px] font-bold text-indigo-500/50 uppercase tracking-widest">V{process.env.APP_VERSION || '8.0.1'}</span>
        </div>
      </div>
    </footer>
  );
};