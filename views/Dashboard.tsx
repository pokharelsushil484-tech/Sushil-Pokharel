
import React, { useState, useEffect } from 'react';
import { UserProfile, Post, Expense } from '../types';
import { Megaphone, Flame, Wallet, ListChecks, Sun, Cloud, CloudRain, CheckCircle2, Circle, ShieldCheck, Moon, Coffee, ArrowRight, Zap, BadgeCheck, Sparkles } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  isVerified: boolean;
  username: string;
  expenses: Expense[];
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, isVerified, username, expenses, onNavigate }) => {
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [weather, setWeather] = useState<{temp: number, condition: string}>({ temp: 24, condition: 'Sunny' });
  
  const [habits, setHabits] = useState<{id: string, name: string, done: boolean}[]>([
      { id: '1', name: 'Drink Water (2L)', done: false },
      { id: '2', name: 'Read for 15 mins', done: false },
      { id: '3', name: 'Focus Session', done: false }
  ]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
        setGreeting('Good Morning');
        setTimeOfDay('MORNING');
    } else if (hour < 18) {
        setGreeting('Good Afternoon');
        setTimeOfDay('AFTERNOON');
    } else {
        setGreeting('Good Evening');
        setTimeOfDay('EVENING');
    }

    setWeather({
        temp: Math.floor(Math.random() * (28 - 18) + 18),
        condition: ['Sunny', 'Cloudy', 'Clear'][Math.floor(Math.random() * 3)]
    });
  }, []);

  const toggleHabit = (id: string) => {
      setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done } : h));
  };

  const balance = expenses.reduce((acc, curr) => curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount, 0);

  // Dynamic Background based on time
  const getHeaderGradient = () => {
      switch(timeOfDay) {
          case 'MORNING': return 'from-orange-400 to-rose-500';
          case 'AFTERNOON': return 'from-blue-400 to-indigo-500';
          case 'EVENING': return 'from-indigo-600 to-purple-800';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* V2.0 Dynamic Header with Professional Status */}
      <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${getHeaderGradient()} shadow-xl shadow-indigo-200/50 dark:shadow-none p-8 text-white`}>
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>

          <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <p className="text-white/80 font-medium text-sm tracking-wide uppercase mb-1">
                          {new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}
                      </p>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 flex items-center">
                          {greeting}, <br/>
                          <span className="opacity-90">{user.name.split(' ')[0]}</span>
                          {isVerified && (
                              <BadgeCheck className="ml-2 text-blue-200 fill-white/20 animate-pulse-slow shrink-0" size={32} />
                          )}
                      </h1>
                      {isVerified && user.profession && (
                          <div className="flex items-center space-x-2 text-indigo-100/80 font-bold uppercase tracking-widest text-[10px]">
                              <Sparkles size={12}/>
                              <span>Verified {user.profession}</span>
                          </div>
                      )}
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl flex flex-col items-center min-w-[80px] border border-white/30">
                      {timeOfDay === 'MORNING' ? <Sun className="mb-1 text-yellow-300" /> : 
                       timeOfDay === 'AFTERNOON' ? <Cloud className="mb-1 text-white" /> : 
                       <Moon className="mb-1 text-indigo-200" />}
                      <span className="font-bold text-lg">{weather.temp}°</span>
                  </div>
              </div>

              <div className="flex gap-3">
                  <div className="flex items-center bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shadow-inner">
                      <Flame size={16} className="text-orange-300 mr-2" />
                      <span className="font-bold text-[11px] uppercase tracking-wide">{user.streak || 0} Day Streak</span>
                  </div>
                  <div className="flex items-center bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shadow-inner">
                      <ShieldCheck size={16} className={`${isVerified ? 'text-green-300' : 'text-gray-300'} mr-2`} />
                      <span className="font-bold text-[11px] uppercase tracking-wide">{isVerified ? 'Elite Profile' : 'Standard Account'}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Productivity Widget */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-64 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap size={100} className="text-indigo-500" />
              </div>
              
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center">
                          <Coffee size={18} className="mr-2 text-indigo-500" /> Daily Habits
                      </h2>
                  </div>
                  <div className="space-y-3">
                      {habits.map(habit => (
                          <div 
                            key={habit.id} 
                            onClick={() => toggleHabit(habit.id)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
                          >
                              <div className="flex items-center space-x-3">
                                  {habit.done ? (
                                      <CheckCircle2 className="text-green-500" size={20} />
                                  ) : (
                                      <Circle className="text-gray-300" size={20} />
                                  )}
                                  <span className={`text-sm font-medium ${habit.done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                      {habit.name}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                    style={{width: `${(habits.filter(h => h.done).length / habits.length) * 100}%`}}
                  ></div>
              </div>
          </div>

          {/* Stats & Navigation Grid */}
          <div className="grid grid-cols-2 gap-4 h-64">
              
              <div 
                onClick={() => onNavigate('EXPENSES')}
                className="bg-gray-900 dark:bg-black p-5 rounded-[2rem] shadow-lg text-white cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between border border-white/5"
              >
                  <div className="bg-white/10 w-10 h-10 rounded-2xl flex items-center justify-center">
                      <Wallet size={20} />
                  </div>
                  <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Financial Power</p>
                      <p className="font-bold text-xl truncate">NPR {balance.toLocaleString()}</p>
                  </div>
              </div>

              <div 
                onClick={() => onNavigate('PLANNER')}
                className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-between"
              >
                  <div className="bg-indigo-100 dark:bg-indigo-800 w-10 h-10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                      <ListChecks size={20} />
                  </div>
                  <div>
                      <p className="text-indigo-400 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Task Force</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">My Planner</p>
                  </div>
              </div>

              <div className="col-span-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-[2rem] p-5 text-white flex justify-between items-center cursor-pointer shadow-lg shadow-purple-200 dark:shadow-none hover:shadow-xl transition-all active:scale-[0.98]" onClick={() => onNavigate('AI_CHAT')}>
                   <div className="flex items-center space-x-3">
                       <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                           <Sparkles size={20} />
                       </div>
                       <div>
                           <p className="font-bold text-lg tracking-tight">Personal AI Expert</p>
                           <p className="text-purple-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Online & Ready</p>
                       </div>
                   </div>
                   <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                       <ArrowRight size={20} />
                   </div>
              </div>
          </div>
      </div>

      <div className="text-center pt-8 pb-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] opacity-60">Master Edition • StudentPocket v2.0</p>
      </div>
    </div>
  );
};
