
import React from 'react';
import { ShieldCheck, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { APP_NAME, CURRENT_TERMS_VERSION } from '../constants';

interface TermsModalProps {
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-fade-in perspective-3d">
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden card-3d transform-gpu rotate-x-2">
        <div className="bg-indigo-600 p-10 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <ShieldCheck className="w-12 h-12 mb-6 animate-float" />
          <h2 className="text-3xl font-bold tracking-tight">Terms of Use</h2>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-2 opacity-80">Monthly Edition • {monthName}</p>
        </div>
        
        <div className="p-10 space-y-6 max-h-[40vh] overflow-y-auto no-scrollbar">
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <Info size={16} className="mr-2 text-indigo-500" /> Personal Usage
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {APP_NAME} is strictly for personal use. You agree to manage your daily activities, finances, and data responsibly within this private environment.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <ShieldCheck size={16} className="mr-2 text-indigo-500" /> Identity Verification
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              To access advanced 3D dashboards, users must submit an identity verification request. Verified status is granted at the administrator's discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <AlertCircle size={16} className="mr-2 text-indigo-500" /> New Monthly Updates
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              These terms are refreshed monthly to reflect new security standards and feature updates (Version: {CURRENT_TERMS_VERSION}).
            </p>
          </section>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onAccept}
            className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold text-lg shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center group"
          >
            I Accept & Continue <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
            Privacy Secured By 3D AI Embedding
          </p>
        </div>
      </div>
    </div>
  );
};
