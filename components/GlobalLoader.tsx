
import React from 'react';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
      
      <div className="text-center">
        <h3 className="text-white font-black text-[10px] uppercase tracking-[0.6em] animate-pulse">
          Synchronizing
        </h3>
        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.4em] mt-2">
          Secure Identity Commit
        </p>
      </div>
    </div>
  );
};
