
import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { BookOpen, Plus, Sparkles, Trash2, Calendar, Save, X, Smile, Target, CloudRain } from 'lucide-react';
import { storageService } from '../services/storageService';

export const GrowthJournal: React.FC<{ username: string }> = ({ username }) => {
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
  };

  const deleteEntry = async (id: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    const updated = entries.filter(e => e.id !== id);
    await storageService.setData(`architect_data_${username}`, { ...stored, journal: updated });
    setEntries(updated);
  };

  return (
    <div className="space-y-10 animate-platinum pb-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white/5 p-10 rounded-[3rem] border border-white/10">
        <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Growth Journal</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.5em] mt-2">Mindset & Soft Skills Mesh</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-2xl">
            <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {entries.length === 0 && (
            <div className="py-40 text-center opacity-20 flex flex-col items-center">
                <BookOpen size={64} className="mb-6" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">No reflections logged today</p>
            </div>
        )}
        {entries.map(entry => (
            <div key={entry.id} className="master-box p-10 bg-slate-900/40 hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl text-indigo-400">
                            {entry.mood === 'SMILE' ? <Smile size={20}/> : entry.mood === 'RAIN' ? <CloudRain size={20}/> : <Target size={20}/>}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{entry.title || 'DAILY REFLECTION'}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                                <Calendar size={10} />
                                {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => deleteEntry(entry.id)} className="text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{entry.content}</p>
            </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
            <div className="master-box w-full max-w-2xl bg-slate-900 p-12 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white uppercase italic">Capture Moment</h2>
                    <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white"><X size={32}/></button>
                </div>
                <div className="space-y-6">
                    <input 
                        type="text" 
                        value={newEntry.title}
                        onChange={e => setNewEntry({...newEntry, title: e.target.value.toUpperCase()})}
                        className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold text-xs uppercase outline-none focus:border-indigo-500"
                        placeholder="ENTRY TITLE IDENTIFIER..."
                    />
                    <div className="flex gap-4">
                        {(['SMILE', 'RAIN', 'TARGET']).map(m => (
                            <button 
                                key={m} 
                                onClick={() => setNewEntry({...newEntry, mood: m})}
                                className={`flex-1 py-4 rounded-xl border transition-all ${newEntry.mood === m ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-slate-500 border-white/5'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                            </button>
                        ))}
                    </div>
                    <textarea 
                        rows={6}
                        value={newEntry.content}
                        onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                        className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-medium text-sm outline-none focus:border-indigo-500 resize-none"
                        placeholder="Write your academic or personal thoughts here..."
                    />
                    <button onClick={saveEntry} className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl">Commit Entry to Mesh</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
