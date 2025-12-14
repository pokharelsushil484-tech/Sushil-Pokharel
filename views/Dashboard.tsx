
import React, { useState, useEffect } from 'react';
import { UserProfile, Post, Comment, PostAttachment, Expense } from '../types';
import { Megaphone, Heart, MessageCircle, Send, Paperclip, Image as ImageIcon, FileText, Download, X, Crown, BadgeCheck, AlertTriangle, Sun, Cloud, CloudRain, Flame, Wallet, ListChecks, Calendar } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

interface DashboardProps {
  user: UserProfile;
  isVerified: boolean;
  username: string;
  expenses: Expense[];
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, isVerified, username, expenses, onNavigate }) => {
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [greeting, setGreeting] = useState('');
  const [weather, setWeather] = useState<{temp: number, condition: string}>({ temp: 24, condition: 'Sunny' });
  
  const isAdmin = username === ADMIN_USERNAME;

  useEffect(() => {
    // Set Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Simulate Weather (Randomized slightly for "Realism" without API)
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rain'];
    setWeather({
        temp: Math.floor(Math.random() * (30 - 15) + 15),
        condition: conditions[Math.floor(Math.random() * conditions.length)]
    });

    loadPosts();
  }, []);

  const loadPosts = () => {
    const postsStr = localStorage.getItem('studentpocket_global_posts');
    if (postsStr) {
        const loadedPosts: Post[] = JSON.parse(postsStr);
        setAnnouncements(loadedPosts.map(p => ({
            ...p,
            likes: p.likes || [],
            comments: p.comments || [],
            attachments: p.attachments || []
        })));
    }
  };

  const getWeatherIcon = () => {
      switch(weather.condition) {
          case 'Rain': return <CloudRain className="text-blue-400" size={28} />;
          case 'Cloudy': return <Cloud className="text-gray-400" size={28} />;
          default: return <Sun className="text-yellow-400" size={28} />;
      }
  };

  const balance = expenses.reduce((acc, curr) => curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount, 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* Daily Briefing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">{new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{greeting}, {user.name.split(' ')[0]}!</h1>
              
              <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                      {getWeatherIcon()}
                      <div className="ml-3">
                          <p className="font-bold text-xl dark:text-white">{weather.temp}°C</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{weather.condition}</p>
                      </div>
                  </div>
                  <div className="flex items-center">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full mr-2">
                          <Flame className="text-orange-500" size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-lg dark:text-white">{user.streak || 1} Day</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Daily Streak</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Quick Actions / Stats */}
          <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => onNavigate('EXPENSES')}
                className="bg-indigo-600 text-white p-5 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer hover:bg-indigo-700 transition-colors flex flex-col justify-between"
              >
                  <Wallet size={24} className="opacity-80"/>
                  <div>
                      <p className="text-indigo-100 text-xs font-bold uppercase mb-1">Balance</p>
                      <p className="font-bold text-xl truncate">NPR {balance.toLocaleString()}</p>
                  </div>
              </div>
              <div 
                onClick={() => onNavigate('PLANNER')}
                className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors flex flex-col justify-between"
              >
                  <ListChecks size={24} className="text-indigo-500"/>
                  <div>
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1">Tasks</p>
                      <p className="font-bold text-xl dark:text-white">View List</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Classroom Stream Feed (Existing Logic) */}
      <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Megaphone size={18} className="mr-2 text-indigo-500" /> Classroom Stream
              </h2>
          </div>
          
          <div className="space-y-4">
              {announcements.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-sm">No announcements yet.</p>
                  </div>
              ) : (
                  announcements.map(post => (
                       <div key={post.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden transition-all">
                          <div className="flex items-center mb-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs mr-3">
                                  {post.author.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-gray-800 dark:text-white">
                                      {post.author === ADMIN_USERNAME ? 'Teacher' : post.author}
                                  </p>
                                  <p className="text-[10px] text-gray-400">{new Date(post.date).toLocaleDateString()}</p>
                              </div>
                          </div>
                          
                          <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">{post.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{post.content}</p>
                       </div>
                   ))
              )}
          </div>
      </div>
    </div>
  );
};
