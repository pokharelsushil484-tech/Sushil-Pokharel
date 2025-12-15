
import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../constants';

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string; // Optional override
}

const LOADER_MESSAGES = [
  "Preparing your day...",
  "Syncing your tasks...",
  "Loading your space...",
  "Almost ready..."
];

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading, message }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    // Rotate messages every 1.5 seconds
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADER_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in transition-all duration-500">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        {/* Inner Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-full animate-pulse"></div>
      </div>
      
      <h3 className="font-bold text-gray-800 dark:text-white text-xl tracking-tight mb-2 animate-fade-in">
        {APP_NAME}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide animate-pulse">
        {message || LOADER_MESSAGES[msgIndex]}
      </p>
    </div>
  );
};
