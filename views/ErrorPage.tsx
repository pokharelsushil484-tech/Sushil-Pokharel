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
        return { icon: FileQuestion, defaultTitle: "Page Not Found", defaultMessage: "This path does not exist.", action: "Return Home", accentColor: "indigo" };
      case 'MAINTENANCE':
        return { icon: RefreshCw, defaultTitle: "Maintenance", defaultMessage: "Upgrading systems.", action: "Refresh", accentColor: "blue" };
      default:
        return { icon: AlertTriangle, defaultTitle: "System Crash", defaultMessage: "A runtime error occurred.", action: "Restart App", accentColor: "red" };
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
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700"
  }[config.accentColor as 'indigo' | 'blue' | 'red'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-start sm:justify-center py-20 px-6 overflow-y-auto">
      <div className="max-w-md w-full animate-scale-up">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-10 text-center border-b border-slate-100 dark:border-slate-800">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ${accentClasses}`}>
              <Icon size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{title || config.defaultTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{message || config.defaultMessage}</p>
          </div>

          <div className="p-10 space-y-6">
            <button onClick={onAction || (() => window.location.reload())} className={`w-full text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center ${btnClasses}`}>
              {type === 'CRASH' ? <RefreshCw size={16} className="mr-2" /> : <Home size={16} className="mr-2" />}
              {actionLabel || config.action}
            </button>

            {errorDetails && (
              <div className="space-y-4">
                <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                  {showDetails ? 'Hide Details' : 'View Logs'}
                  {showDetails ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                </button>
                {showDetails && (
                  <div className="relative group animate-fade-in">
                    <pre className="text-[10px] bg-slate-950 text-slate-400 p-5 rounded-2xl overflow-x-auto font-mono border border-white/5 max-h-40 whitespace-pre-wrap leading-relaxed">
                      {errorDetails}
                    </pre>
                    <button onClick={copyError} className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 text-slate-500 rounded-lg transition-colors">
                      {copied ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {type === 'CRASH' && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center flex flex-col space-y-4">
                 <a href={`mailto:${ADMIN_EMAIL}`} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center hover:underline">
                    <Mail size={14} className="mr-2" /> Report to Architect
                 </a>
                 <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[9px] text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] font-black">
                     Factory Reset System
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};