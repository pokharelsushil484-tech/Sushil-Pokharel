
import React from 'react';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500">
      <div className="relative w-24 h-24 mb-8">
        {/* Hardware accelerated spinning ring */}
        <div className="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
        <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        
        {/* Core pulse */}
        <div className="absolute inset-4 bg-indigo-500/20 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_15px_#4f46e5]"></div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-white font-black text-xs uppercase tracking-[0.6em] animate-pulse">
          Synchronizing Node
        </h3>
        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.4em]">
          Institutional Data Protocol V9.2.5
        </p>
      </div>
    </div>
  );
};
