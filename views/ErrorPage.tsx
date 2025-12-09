
import React from 'react';
import { AlertTriangle, Home, RefreshCw, FileQuestion } from 'lucide-react';

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
  
  const getDefaults = () => {
    switch(type) {
      case '404':
        return {
          icon: FileQuestion,
          title: "Page Not Found",
          message: "The page you are looking for doesn't exist or has been moved.",
          action: "Go Home",
          color: "text-indigo-500",
          bg: "bg-indigo-50 dark:bg-indigo-900/20"
        };
      case 'CRASH':
      default:
        return {
          icon: AlertTriangle,
          title: "Something Went Wrong",
          message: "We encountered an unexpected error. The application has stopped to protect your data.",
          action: "Reload Application",
          color: "text-red-500",
          bg: "bg-red-50 dark:bg-red-900/20"
        };
    }
  };

  const config = getDefaults();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl p-8 md:p-12 max-w-md w-full border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className={`w-24 h-24 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-up`}>
          <Icon className={`w-12 h-12 ${config.color}`} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          {title || config.title}
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed font-medium">
          {message || config.message}
        </p>

        <div className="space-y-3">
          <button
            onClick={onAction || (() => window.location.reload())}
            className="w-full bg-gray-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-[0.98]"
          >
            {type === 'CRASH' ? <RefreshCw size={18} className="mr-2" /> : <Home size={18} className="mr-2" />}
            {actionLabel || config.action}
          </button>
          
          {type === 'CRASH' && (
             <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full text-gray-400 hover:text-red-500 py-2 text-xs font-bold transition-colors"
              >
                 Reset App Data (Emergency)
              </button>
          )}
        </div>

        {errorDetails && (
          <div className="mt-8 text-left bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Technical Details</p>
            <code className="text-[10px] text-red-500 font-mono break-all block leading-tight">
              {errorDetails}
            </code>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-gray-400 text-xs font-medium">
        StudentPocket &copy; Sushil Pokharel
      </div>
    </div>
  );
};
