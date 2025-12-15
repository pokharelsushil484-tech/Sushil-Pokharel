
import React from 'react';
import { APP_NAME } from '../constants';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Automatically finish after animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // 2.5 seconds splash time
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[200] bg-indigo-50 dark:bg-gray-950 flex flex-col items-center justify-center transition-colors duration-500">
      <div className="flex flex-col items-center animate-scale-up">
        {/* Logo Container */}
        <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl shadow-indigo-200 dark:shadow-none flex items-center justify-center mb-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20"></div>
           <img 
              src="/icon.png" 
              alt="Logo" 
              className="w-14 h-14 object-cover rounded-xl z-10" 
              onError={(e) => {
                  // Fallback if no image
                  e.currentTarget.style.display = 'none';
              }} 
           />
           {/* Fallback Icon if image fails/missing */}
           <div className="absolute z-0 w-12 h-12 bg-indigo-600 rounded-xl rotate-45 opacity-20"></div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {APP_NAME}
        </h1>

        {/* Tagline */}
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wider uppercase mb-12">
          Organize your day, your way
        </p>

        {/* Loader Line */}
        <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      {/* Privacy Badge */}
      <div className="absolute bottom-8 flex items-center text-[10px] text-gray-400 dark:text-gray-600 font-medium">
         <ShieldCheck size={12} className="mr-1.5" />
         <span>Secure • Private • Personal</span>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 100%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};
