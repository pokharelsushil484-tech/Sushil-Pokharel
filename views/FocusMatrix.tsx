import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Zap, Target, Coffee, BrainCircuit } from 'lucide-react';
import { UserProfile } from '../types';

interface FocusMatrixProps {
  user: UserProfile;
}

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export const FocusMatrix: React.FC<FocusMatrixProps> = ({ user }) => {
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const modeConfig = {
    FOCUS: { time: 25 * 60, label: 'Deep Work', icon: BrainCircuit, color: 'text-amber-400', bg: 'bg-amber-500' },
    SHORT_BREAK: { time: 5 * 60, label: 'Short Rest', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    LONG_BREAK: { time: 15 * 60, label: 'System Reboot', icon: Coffee, color: 'text-indigo-400', bg: 'bg-indigo-500' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'FOCUS') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      if (newSessions % 4 === 0) {
        switchMode('LONG_BREAK');
      } else {
        switchMode('SHORT_BREAK');
      }
    } else {
      switchMode('FOCUS');
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(modeConfig[newMode].time);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeConfig[mode].time);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((modeConfig[mode].time - timeLeft) / modeConfig[mode].time) * 100;
  const CurrentIcon = modeConfig[mode].icon;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-24 max-w-4xl mx-auto"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-amber-500/20 pb-8">
        <div>
          <h1 className="text-4xl font-display italic tracking-tight text-amber-100">Focus Matrix</h1>
          <p className="text-[10px] text-amber-500/60 font-semibold uppercase tracking-widest mt-2">Neural Synchronization Protocol</p>
        </div>
        <div className="flex items-center gap-4 bg-amber-950/20 px-6 py-3 rounded-xl border border-amber-500/20">
          <Target size={20} className="text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500/60 uppercase tracking-widest font-bold">Sessions</span>
            <span className="text-lg font-display italic text-amber-100 leading-none">{sessionsCompleted}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card p-12 relative overflow-hidden border-amber-500/20 flex flex-col items-center justify-center min-h-[500px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        {/* Mode Selector */}
        <div className="flex gap-4 mb-12 relative z-10">
          {(Object.keys(modeConfig) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                mode === m 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-amber-950/20 text-amber-500/40 border border-amber-500/10 hover:bg-amber-500/10'
              }`}
            >
              {modeConfig[m].label}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-12 z-10">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="none"
              stroke="rgba(245, 158, 11, 0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={modeConfig[mode].color}
              initial={{ strokeDasharray: 2 * Math.PI * 150, strokeDashoffset: 2 * Math.PI * 150 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 150 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          <div className="flex flex-col items-center text-center">
            <CurrentIcon size={32} className={`${modeConfig[mode].color} mb-4 opacity-50`} />
            <span className="text-7xl font-display italic tracking-tighter text-amber-100">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/40 mt-4">
              {isActive ? 'Protocol Active' : 'Protocol Standby'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-center text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
          >
            <RotateCcw size={24} />
          </button>
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-3xl flex items-center justify-center text-black shadow-xl transition-all ${
              isActive ? 'bg-amber-400 shadow-amber-400/20' : 'bg-amber-500 shadow-amber-500/20 hover:scale-105'
            }`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
