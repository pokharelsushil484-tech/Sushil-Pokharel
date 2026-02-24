
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';
import { Plus, Search, ChevronRight, Wand2, X, Lock, Trash2, RefreshCcw, Archive, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { summarizeNote } from '../services/geminiService';

interface NotesProps {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  isAdmin?: boolean;
}

export const Notes: React.FC<NotesProps> = ({ notes, setNotes, isAdmin }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  
  // New Note State
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');

  // 30 Days in MS
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  const handleSave = () => {
    if (!currentTitle) return;
    
    if (selectedNote) {
      // Update
      const updatedNotes = notes.map(n => n.id === selectedNote.id ? { 
          ...n, 
          title: currentTitle, 
          content: currentContent,
          status: isAdmin ? n.status : 'PENDING' // User edit resets status to pending
      } : n);
      setNotes(updatedNotes);
    } else {
      // Create
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentTitle,
        content: currentContent,
        date: new Date().toISOString(),
        tags: [],
        status: isAdmin ? 'COMPLETED' : 'PENDING', // Admin notes auto-complete
        author: isAdmin ? 'admin' : 'user'
      };
      setNotes([newNote, ...notes]);
    }
    closeEditor();
  };

  const softDeleteNote = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      
      const note = notes.find(n => n.id === id);
      // Allow deletion if Admin OR if the user is the author (assuming 'user' means current user here)
      if (!isAdmin && note?.author !== 'user') {
          alert("You can only delete your own notes.");
          return;
      }

      if(window.confirm("Move to Trash? It will be permanently deleted after 30 days.")) {
          setNotes(notes.map(n => n.id === id ? { ...n, deletedAt: Date.now() } : n));
      }
  };

  const restoreNote = (id: string) => {
      if (!isAdmin) return;
      setNotes(notes.map(n => n.id === id ? { ...n, deletedAt: undefined } : n));
  };

  const permanentDeleteNote = (id: string) => {
      if (!isAdmin) return;
      if(window.confirm("Permanently delete this note? This cannot be undone.")) {
          setNotes(notes.filter(n => n.id !== id));
      }
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setSelectedNote(note);
      setCurrentTitle(note.title);
      setCurrentContent(note.content);
    } else {
      // Allow users to create new notes
      setSelectedNote(null);
      setCurrentTitle('');
      setCurrentContent('');
    }
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleAISummary = async () => {
    if (!currentContent) return;
    setLoadingAI(true);
    const summary = await summarizeNote(currentContent);
    setCurrentContent(prev => `${prev}\n\n--- AI Summary ---\n${summary}`);
    setLoadingAI(false);
  };

  // Filter Notes
  const activeNotes = notes.filter(n => !n.deletedAt);
  const deletedNotes = notes.filter(n => n.deletedAt);

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
      className="pb-24 relative min-h-[600px] flex flex-col space-y-8"
    >
      <motion.div variants={item} className="flex justify-between items-center glass-card p-8">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
             <FileText className="text-white" size={24} />
           </div>
           <div>
             <h1 className="text-xl font-display italic tracking-tight flex items-center gap-2">
               {showTrash ? 'Trash Bin' : 'My Notes'}
             </h1>
             <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
               {showTrash ? 'Only Admin can manage trash' : `${activeNotes.length} notes found`}
             </p>
           </div>
        </div>
        
        <div className="flex space-x-2">
            {isAdmin && (
                <button 
                    onClick={() => setShowTrash(!showTrash)}
                    className={`p-3 rounded-xl transition-all border border-white/10 ${showTrash ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                    title={showTrash ? "Back to Notes" : "View Trash"}
                >
                    {showTrash ? <Archive size={20} /> : <Trash2 size={20} />}
                </button>
            )}
            
            {!showTrash && (
            <button onClick={() => openEditor()} className="btn-premium w-12 h-12 rounded-xl flex items-center justify-center">
                <Plus size={24} />
            </button>
            )}
        </div>
      </motion.div>

      {!showTrash && (
        <motion.div variants={item} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
            type="text" 
            placeholder="Search your notes..." 
            className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-xl border border-white/10 focus:border-white/20 outline-none text-sm text-white placeholder:text-white/20 transition-all backdrop-blur-sm"
            />
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(showTrash ? deletedNotes : activeNotes).length === 0 && (
             <div className="col-span-2 text-center py-24 opacity-30 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
                <FileText size={48} className="mb-4 text-white" />
                <p className="text-sm font-semibold uppercase tracking-widest text-white/60">{showTrash ? "Trash is empty." : "No notes created yet."}</p>
            </div>
        )}

        <AnimatePresence>
          {(showTrash ? deletedNotes : activeNotes).map(note => (
            <motion.div 
              key={note.id} 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => !showTrash && openEditor(note)}
              className={`p-6 rounded-2xl border flex flex-col h-64 relative group transition-all glass-card ${
                  showTrash 
                  ? 'border-red-500/20 bg-red-500/5 cursor-default' 
                  : 'hover:border-white/20 cursor-pointer hover:-translate-y-1'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                   <h3 className="font-display italic text-xl text-white line-clamp-1 leading-tight flex-1 pr-4">{note.title}</h3>
                   {!showTrash && (
                       <span className={`text-[9px] font-semibold px-2 py-1 rounded-md flex items-center border ${
                           note.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                       }`}>
                           {note.status === 'COMPLETED' ? <CheckCircle2 size={10} className="mr-1.5"/> : <Clock size={10} className="mr-1.5"/>}
                           {note.status === 'COMPLETED' ? 'Done' : 'Pending'}
                       </span>
                   )}
              </div>

              <p className="text-sm text-white/60 line-clamp-5 flex-1 font-medium leading-relaxed">{note.content}</p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                   <span className="text-[10px] text-white/20 font-semibold uppercase tracking-widest">
                       {showTrash ? `Deleted: ${new Date(note.deletedAt!).toLocaleDateString()}` : new Date(note.date).toLocaleDateString()}
                   </span>
                   
                   {showTrash ? (
                       isAdmin && (
                          <div className="flex space-x-2">
                               <button onClick={() => restoreNote(note.id)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors" title="Restore"><RefreshCcw size={14} /></button>
                               <button onClick={() => permanentDeleteNote(note.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors" title="Delete Forever"><Trash2 size={14} /></button>
                           </div>
                       )
                   ) : (
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           {/* Allow deletion for admin or note owner */}
                           {isAdmin || note.author === 'user' ? (
                              <button 
                                  onClick={(e) => softDeleteNote(note.id, e)} 
                                  className="bg-white/5 p-2 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                                  title="Delete Note"
                              >
                                  <Trash2 size={14} />
                              </button>
                           ) : (
                               <div title="Cannot delete system notes" className="bg-white/5 p-2 rounded-lg border border-white/10">
                                  <Lock size={12} className="text-white/20" />
                               </div>
                           )}
                           <div className="bg-white p-2 rounded-lg shadow-lg">
                              <ChevronRight size={14} className="text-black" />
                          </div>
                      </div>
                   )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-white/5">
                <button onClick={closeEditor} className="text-white/40 font-medium hover:text-white transition-colors flex items-center gap-2 text-sm">
                   <X size={16} /> Cancel
                </button>
                <div className="flex space-x-3 items-center">
                   <button 
                    onClick={handleAISummary} 
                    disabled={loadingAI}
                    className={`flex items-center text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${loadingAI ? 'opacity-50' : ''}`}
                  >
                    <Wand2 size={14} className="mr-2" />
                    {loadingAI ? 'Summarizing...' : 'AI Summarize'}
                  </button>
                  <button 
                      onClick={handleSave} 
                      className="btn-premium px-6 py-2 text-xs"
                  >
                      Save Note
                  </button>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col overflow-y-auto">
                <input 
                  type="text" 
                  placeholder="Title" 
                  className="text-4xl font-display italic outline-none mb-8 w-full bg-transparent placeholder:text-white/10 text-white"
                  value={currentTitle}
                  onChange={e => setCurrentTitle(e.target.value)}
                  autoFocus
                />
                <textarea 
                  placeholder="Start typing your notes here..." 
                  className="flex-1 w-full outline-none resize-none text-lg text-white/80 leading-relaxed bg-transparent placeholder:text-white/10 font-medium"
                  value={currentContent}
                  onChange={e => setCurrentContent(e.target.value)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
