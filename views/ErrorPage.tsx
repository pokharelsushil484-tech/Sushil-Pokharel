
import React, { useState } from 'react';
import { AlertTriangle, Home, RefreshCw, FileQuestion, ChevronDown, ChevronUp, Copy, Check, Mail, Send } from 'lucide-react';
import { ADMIN_EMAIL, APP_NAME } from '../constants';

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
  const [reportSent, setReportSent] = useState(false);
  
  const handleReportError = () => {
    const subject = encodeURIComponent(`NODE CRASH REPORT: ${APP_NAME}`);
    const body = encodeURIComponent(`INSTITUTIONAL FAILURE LOG\n\nERROR: ${errorDetails || 'Unspecified'}\n\nREPORTER ACTION: Awaiting Admin Punishment/Resolution.`);
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
    setReportSent(true);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-20 px-6">
      <div className="max-w-xl w-full animate-scale-up">
        <div className="master-box p-12 text-center border-white/10 bg-slate-900/40 backdrop-blur-3xl">
          <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-4 italic italic">{title || 'System Fault'}</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-12">{message || 'Critical Node Instability Detected'}</p>

          <div className="space-y-6">
            <button onClick={onAction || (() => window.location.reload())} className="btn-platinum py-5 text-xs">
              {actionLabel || 'Reset Node'}
            </button>

            <button 
                onClick={handleReportError}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center"
            >
                <Send size={16} className="mr-3" />
                {reportSent ? 'Dispatch Logged' : 'Report Error to Architect'}
            </button>
          </div>

          {errorDetails && (
            <div className="mt-12 pt-12 border-t border-white/5">
                <button onClick={() => setShowDetails(!showDetails)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                    {showDetails ? 'Hide Registry Logs' : 'View Fault Data'}
                </button>
                {showDetails && (
                    <pre className="mt-6 p-6 bg-black rounded-2xl text-[10px] text-red-400 font-mono text-left overflow-x-auto border border-red-500/10">
                        {errorDetails}
                    </pre>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
