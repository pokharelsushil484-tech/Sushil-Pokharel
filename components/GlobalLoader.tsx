
import React from 'react';
import { Loader2 } from 'lucide-react';
import { APP_NAME } from '../constants';

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h3 className="mt-4 font-bold text-gray-800 dark:text-white text-lg animate-pulse">{APP_NAME}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{message}</p>
    </div>
  );
};
