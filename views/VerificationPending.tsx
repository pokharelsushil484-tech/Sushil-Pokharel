
import React from 'react';
import { ShieldAlert, Clock, Lock, FileText, LogOut } from 'lucide-react';
import { APP_NAME } from '../constants';

interface VerificationPendingProps {
  studentId?: string;
  onLogout: () => void;
}

export const VerificationPending: React.FC<VerificationPendingProps> = ({ studentId, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pulse Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative z-10 w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl text-center">
        
        <div className="w-24 h-24 mx-auto mb-8 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 relative">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <ShieldAlert size={40} className="text-indigo-400" />
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Verification In Progress</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">System Security Scan Active</p>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4 text-amber-400">
                <Clock size={18} />
                <span className="text-xs font-black uppercase tracking-wider">Est. Time: 1 - 2 Hours</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
                Your data is currently undergoing a strict privacy review. During this time, access to the dashboard is <span className="text-white font-bold">BLOCKED</span> to prevent unauthorized data leakage.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Reference ID</span>
                <span className="font-mono text-lg text-white font-bold tracking-wider">{studentId || 'PENDING-ID'}</span>
            </div>
        </div>

        <div className="space-y-4">
             <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <Lock size={12} />
                <span>Account Locked</span>
             </div>
             <button 
                onClick={onLogout}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center"
            >
                <LogOut size={14} className="mr-2"/> Sign Out & Wait
            </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
        {APP_NAME} Security Protocol
      </div>
    </div>
  );
};
