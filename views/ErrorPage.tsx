
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
        return {
          icon: FileQuestion,
          defaultTitle: "Page Not Found",
          defaultMessage: "We couldn't find the page you're looking for. It might have been moved or deleted.",
          action: "Return Home",
          accentColor: "indigo"
        };
      case 'MAINTENANCE':
        return {
          icon: RefreshCw,
          defaultTitle: "System Maintenance",
          defaultMessage: "We're currently updating the StudentPocket system. Please check back shortly.",
          action: "Refresh Page",
          accentColor: "blue"
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: "Application Error",
          defaultMessage: "An unexpected error has occurred. Our team has been notified.",
          action: "Try Again",
          accentColor: "red"
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const colorClasses = {
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100"
  }[config.accentColor as 'indigo' | 'blue' | 'red'];

  const btnClasses = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700"
  }[config.accentColor as 'indigo' | 'blue' | 'red'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden animate-scale-up">
          <div className="p-8 text-center border-b border-gray-100 dark:border-gray-800">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${colorClasses}`}>
              <Icon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {title || config.defaultTitle}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {message || config.defaultMessage}
            </p>
          </div>

          <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              onClick={onAction || (() => window.location.reload())}
              className={`w-full text-white py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center ${btnClasses}`}
            >
              {type === 'CRASH' ? <RefreshCw size={18} className="mr-2" /> : <Home size={18} className="mr-2" />}
              {actionLabel || config.action}
            </button>

            {errorDetails && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-center text-xs font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-widest"
                >
                  {showDetails ? 'Hide Details' : 'View System Logs'}
                  {showDetails ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                </button>

                {showDetails && (
                  <div className="mt-4 relative group animate-fade-in">
                    <pre className="text-[10px] bg-gray-900 text-gray-300 p-4 rounded-xl overflow-x-auto font-mono border border-gray-800 max-h-40 no-scrollbar whitespace-pre-wrap">
                      {errorDetails}
                    </pre>
                    <button onClick={copyError} className="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-400 rounded-md">
                      {copied ? <Check size={12} className="text-green-400"/> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {type === 'CRASH' && (
              <div className="mt-8 text-center flex flex-col space-y-4">
                 <a href={`mailto:${ADMIN_EMAIL}`} className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center">
                    <Mail size={14} className="mr-2" /> Report to Architect
                 </a>
                 <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] text-gray-400 hover:text-red-500 underline uppercase tracking-widest font-black">
                     Perform Factory Reset
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
