
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, UserProfile, SubscriptionTier } from '../types';
import { BookOpen, Plus, Sparkles, Trash2, Calendar, Save, X, Smile, Target, CloudRain, PenTool } from 'lucide-react';
import { storageService } from '../services/storageService';

interface GrowthJournalProps {
  username: string;
  user: UserProfile;
  updateUser: (user: UserProfile) => void;
}

export const GrowthJournal: React.FC<GrowthJournalProps> = ({ username, user, updateUser }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'SMILE' });

  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;

  useEffect(() => { loadEntries(); }, [username]);

  const loadEntries = async () => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (stored?.journal) setEntries(stored.journal);
  };

  const saveEntry = async () => {
    if (!newEntry.content.trim()) return;
    const entry: JournalEntry = {
        id: Date.now().toString(),
        ...newEntry,
        timestamp: Date.now()
    };
    const stored = await storageService.getData(`architect_data_${username}`);
    const updated = [entry, ...(stored?.journal || [])];
    await storageService.setData(`architect_data_${username}`, { ...stored, journal: updated });
    setEntries(updated);
    setShowAdd(false);
    setNewEntry({ title: '', content: '', mood: 'SMILE' });
  };

  const deleteEntry = async (id: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    const updated = entries.filter(e => e.id !== id);
    await storageService.setData(`architect_data_${username}`, { ...stored, journal: updated });
    setEntries(updated);
  };

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
      <motion.div variants={item} className={`p-10 flex justify-between items-center ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
        <div>
            <h1 className={`text-3xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Growth Journal</h1>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mt-2 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Mindset & Soft Skills Mesh</p>
        </div>
        <button 
            onClick={() => setShowAdd(true)} 
            className={`w-14 h-14 flex items-center justify-center transition-all ${isPro ? 'rounded-2xl bg-amber-500 text-black hover:bg-amber-400 shadow-lg' : 'rounded-none bg-gray-400 text-gray-900 border-2 border-gray-500 hover:bg-gray-500'}`}
        >
            <Plus size={24} />
        </button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        {entries.length === 0 && (
            <div className={`py-40 text-center flex flex-col items-center ${isPro ? 'opacity-30' : 'opacity-50'}`}>
                <BookOpen size={64} className={isPro ? "mb-6 text-amber-100" : "mb-6 text-gray-500"} />
                <p className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-100/60' : 'text-gray-600'}`}>No reflections logged today</p>
            </div>
        )}
        <AnimatePresence>
            {entries.map(entry => (
                <motion.div 
                    key={entry.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-10 transition-all group ${isPro ? 'glass-card hover:border-amber-500/30 border-amber-500/10' : 'bg-gray-200 border-2 border-gray-500 rounded-none'}`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 border ${isPro ? 'rounded-xl bg-amber-950/20 text-amber-400 border-amber-500/20' : 'rounded-none bg-gray-400 text-gray-800 border-gray-500'}`}>
                                {entry.mood === 'SMILE' ? <Smile size={20}/> : entry.mood === 'RAIN' ? <CloudRain size={20}/> : <Target size={20}/>}
                            </div>
                            <div>
                                <h3 className={`text-xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{entry.title || 'Daily Reflection'}</h3>
                                <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest mt-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>
                                    <Calendar size={12} />
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteEntry(entry.id)} className={`opacity-0 group-hover:opacity-100 transition-all p-2 ${isPro ? 'text-white/20 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <p className={`text-sm leading-relaxed font-medium whitespace-pre-wrap ${isPro ? 'text-amber-100/80' : 'text-gray-800'}`}>{entry.content}</p>
                </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showAdd && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className={`w-full max-w-2xl p-12 space-y-8 shadow-2xl ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
                >
                    <div className="flex justify-between items-center">
                        <h2 className={`text-2xl ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Capture Moment</h2>
                        <button onClick={() => setShowAdd(false)} className={`transition-colors ${isPro ? 'text-white/40 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}><X size={24}/></button>
                    </div>
                    <div className="space-y-6">
                        <div className="relative">
                            <PenTool className={`absolute left-4 top-1/2 -translate-y-1/2 ${isPro ? 'text-white/40' : 'text-gray-500'}`} size={18} />
                            <input 
                                type="text" 
                                value={newEntry.title}
                                onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                                className={`w-full p-5 pl-12 font-medium text-sm outline-none transition-all ${isPro ? 'rounded-2xl bg-amber-950/20 border border-amber-500/20 text-amber-100 focus:border-amber-500/40 placeholder:text-amber-500/20' : 'rounded-none bg-gray-200 border-2 border-gray-500 text-gray-900 focus:border-gray-700 placeholder:text-gray-500'}`}
                                placeholder="Entry title identifier..."
                            />
                        </div>
                        <div className="flex gap-4">
                            {(['SMILE', 'RAIN', 'TARGET']).map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => setNewEntry({...newEntry, mood: m})}
                                    className={`flex-1 py-4 border transition-all ${newEntry.mood === m ? (isPro ? 'rounded-xl bg-amber-500 text-black border-amber-500 shadow-xl' : 'rounded-none bg-gray-600 text-white border-gray-600 shadow-none') : (isPro ? 'rounded-xl bg-amber-950/10 text-amber-500/40 border-amber-500/10 hover:bg-amber-950/20' : 'rounded-none bg-gray-300 text-gray-600 border-gray-400 hover:bg-gray-400')}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{m}</span>
                                </button>
                            ))}
                        </div>
                        <textarea 
                            rows={6}
                            value={newEntry.content}
                            onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                            className={`w-full p-5 font-medium text-sm outline-none resize-none transition-all ${isPro ? 'rounded-2xl bg-amber-950/20 border border-amber-500/20 text-amber-100 focus:border-amber-500/40 placeholder:text-amber-500/20' : 'rounded-none bg-gray-200 border-2 border-gray-500 text-gray-900 focus:border-gray-700 placeholder:text-gray-500'}`}
                            placeholder="Write your academic or personal thoughts here..."
                        />
                        <button onClick={saveEntry} className={`w-full py-4 text-xs font-bold uppercase tracking-widest ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'}`}>Commit Entry to Mesh</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
