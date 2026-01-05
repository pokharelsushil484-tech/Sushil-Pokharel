
import React from 'react';
import { APP_NAME, CREATOR_NAME } from '../constants';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  React.useEffect(() => {
    // Increased duration to 4.5 seconds as requested
    const timer = setTimeout(onFinish, 4500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[300] bg-white dark:bg-[#020617] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center animate-scale-up text-center">
        {/* Custom Spiral Line Loader */}
        <div className="mb-12 relative w-32 h-32">
           {/* Added rotation to the upper loader elements */}
           <svg className="w-full h-full text-indigo-600 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
             <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="150" 
                strokeDashoffset="75" 
                strokeLinecap="round"
             />
             <path 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                d="M 50,50 m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0"
                strokeDasharray="60"
                strokeDashoffset="30"
                className="opacity-30"
             />
             <path 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                strokeLinecap="round" 
                d="M 50,50 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0"
                strokeDasharray="30"
                className="opacity-20"
             />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
           </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
          {APP_NAME.split(' by ')[0]}
        </h1>
        <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.6em] mb-12">
          By {CREATOR_NAME}
        </p>

        <div className="w-64 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            {/* Slowed down loading bar animation to match longer duration */}
            <div className="h-full bg-indigo-600 rounded-full w-1/2 animate-[loading_3s_infinite]"></div>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] space-y-2">
         <div className="flex items-center">
            <ShieldCheck size={14} className="mr-2 text-indigo-600" />
            <span>Encrypted Node Management</span>
         </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
