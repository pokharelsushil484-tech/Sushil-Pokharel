import React, { useState } from 'react';
import { AlertTriangle, Home, RefreshCw, FileQuestion, ChevronDown, ChevronUp, Copy, Check, Mail } from 'lucide-react';
import { ADMIN_EMAIL } from '../constants';

interface ErrorPageProps {
  type?: '404' | 'CRASH' | 'MAINTENANCE';
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
  errorDetails?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  type = 'CRASH', 
  title, 
  message, 
  onAction, 
  actionLabel,
  errorDetails
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyError = () => {
    if (errorDetails) {
      navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const getConfig = () => {
    switch(type) {
      case '404':
        return { icon: FileQuestion, defaultTitle: "Page Not Found", defaultMessage: "This path does not exist in the node.", action: "Return Home", accentColor: "indigo" };
      case 'MAINTENANCE':
        return { icon: RefreshCw, defaultTitle: "Maintenance", defaultMessage: "Upgrading core systems.", action: "Refresh Node", accentColor: "blue" };
      default:
        return { icon: AlertTriangle, defaultTitle: "System Crash", defaultMessage: "A runtime error occurred in the box.", action: "Reset System", accentColor: "red" };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const accentClasses = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    red: "text-red-600 bg-red-50 border-red-100"
  }[config.accentColor as 'indigo' | 'blue' | 'red'];

  const btnClasses = {
    indigo: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
    blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    red: "bg-red-600 hover:bg-red-700 shadow-red-200"
  }[config.accentColor as 'indigo' | 'blue' | 'red'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-start sm:justify-center py-20 px-6 overflow-y-auto">
      <div className="max-w-xl w-full animate-scale-up pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-12 sm:p-16 text-center border-b border-slate-100 dark:border-slate-800">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner ${accentClasses}`}>
              <Icon size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight leading-none">{title || config.defaultTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">{message || config.defaultMessage}</p>
          </div>

          <div className="p-12 sm:p-16 space-y-8">
            <button onClick={onAction || (() => window.location.reload())} className={`w-full text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center ${btnClasses}`}>
              {type === 'CRASH' ? <RefreshCw size={18} className="mr-3" /> : <Home size={18} className="mr-3" />}
              {actionLabel || config.action}
            </button>

            {errorDetails && (
              <div className="space-y-6">
                <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                  {showDetails ? 'Hide Node Logs' : 'Investigate Logs'}
                  {showDetails ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                </button>
                {showDetails && (
                  <div className="relative group animate-fade-in">
                    <pre className="text-[11px] bg-slate-950 text-slate-400 p-6 rounded-[2rem] overflow-x-auto font-mono border border-white/5 max-h-56 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {errorDetails}
                    </pre>
                    <button onClick={copyError} className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 text-slate-500 rounded-xl transition-all border border-white/10">
                      {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} />}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {type === 'CRASH' && (
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center flex flex-col space-y-6">
                 <a href={`mailto:${ADMIN_EMAIL}`} className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center justify-center hover:opacity-80 transition-opacity">
                    <Mail size={16} className="mr-3" /> Report Node Failure
                 </a>
                 <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] text-slate-400 hover:text-red-500 uppercase tracking-[0.3em] font-black transition-colors">
                     Full Factory Node Reset
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};