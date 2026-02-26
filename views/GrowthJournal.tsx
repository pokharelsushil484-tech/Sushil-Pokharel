
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, UserProfile } from '../types';
import { BookOpen, Plus, Sparkles, Trash2, Calendar, Save, X, Smile, Target, CloudRain, PenTool } from 'lucide-react';
import { storageService } from '../services/storageService';
import { upgradeService } from '../services/upgradeService';

interface GrowthJournalProps {
  username: string;
  user: UserProfile;
  updateUser: (user: UserProfile) => void;
}

export const GrowthJournal: React.FC<GrowthJournalProps> = ({ username, user, updateUser }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'SMILE' });

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

    const updatedUser = await upgradeService.updateTaskProgress(user, username, 'JOURNAL');
    updateUser(updatedUser);
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
      <motion.div variants={item} className="flex justify-between items-center glass-card p-10">
        <div>
            <h1 className="text-3xl font-display italic tracking-tight text-white">Growth Journal</h1>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mt-2">Mindset & Soft Skills Mesh</p>
        </div>
        <button 
            onClick={() => setShowAdd(true)} 
            className="btn-premium w-14 h-14 rounded-2xl flex items-center justify-center"
        >
            <Plus size={24} />
        </button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        {entries.length === 0 && (
            <div className="py-40 text-center opacity-30 flex flex-col items-center">
                <BookOpen size={64} className="mb-6 text-white" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">No reflections logged today</p>
            </div>
        )}
        <AnimatePresence>
            {entries.map(entry => (
                <motion.div 
                    key={entry.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-10 hover:border-indigo-500/30 transition-all group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl text-indigo-400 border border-white/5">
                                {entry.mood === 'SMILE' ? <Smile size={20}/> : entry.mood === 'RAIN' ? <CloudRain size={20}/> : <Target size={20}/>}
                            </div>
                            <div>
                                <h3 className="text-xl font-display italic text-white tracking-tight">{entry.title || 'Daily Reflection'}</h3>
                                <div className="flex items-center gap-2 text-white/40 text-[10px] font-semibold uppercase tracking-widest mt-1">
                                    <Calendar size={12} />
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteEntry(entry.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{entry.content}</p>
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
                    className="glass-card w-full max-w-2xl p-12 space-y-8 shadow-2xl"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-display italic text-white">Capture Moment</h2>
                        <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
                    </div>
                    <div className="space-y-6">
                        <div className="relative">
                            <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input 
                                type="text" 
                                value={newEntry.title}
                                onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl text-white font-medium text-sm outline-none focus:border-white/20 placeholder:text-white/20 transition-all"
                                placeholder="Entry title identifier..."
                            />
                        </div>
                        <div className="flex gap-4">
                            {(['SMILE', 'RAIN', 'TARGET']).map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => setNewEntry({...newEntry, mood: m})}
                                    className={`flex-1 py-4 rounded-xl border transition-all ${newEntry.mood === m ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{m}</span>
                                </button>
                            ))}
                        </div>
                        <textarea 
                            rows={6}
                            value={newEntry.content}
                            onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-medium text-sm outline-none focus:border-white/20 resize-none placeholder:text-white/20 transition-all"
                            placeholder="Write your academic or personal thoughts here..."
                        />
                        <button onClick={saveEntry} className="btn-premium w-full py-4 text-xs">Commit Entry to Mesh</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
