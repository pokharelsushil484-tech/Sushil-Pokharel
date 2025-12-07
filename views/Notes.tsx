import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Search, ChevronRight, Wand2, X, Lock } from 'lucide-react';
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
  
  // New Note State
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');

  const handleSave = () => {
    if (!currentTitle) return;
    
    if (selectedNote) {
      // Update
      const updatedNotes = notes.map(n => n.id === selectedNote.id ? { ...n, title: currentTitle, content: currentContent } : n);
      setNotes(updatedNotes);
    } else {
      // Create
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentTitle,
        content: currentContent,
        date: new Date().toISOString(),
        tags: []
      };
      setNotes([newNote, ...notes]);
    }
    closeEditor();
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setSelectedNote(note);
      setCurrentTitle(note.title);
      setCurrentContent(note.content);
    } else {
      // Only allow opening new note if admin
      if (!isAdmin) return;
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

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <button onClick={closeEditor} className="text-gray-500 font-medium hover:text-gray-800 p-2 -ml-2">
             {isAdmin ? 'Cancel' : 'Close'}
          </button>
          <div className="flex space-x-3 items-center">
             {!isAdmin && (
               <span className="text-xs text-gray-500 font-medium flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                 <Lock size={12} className="mr-1.5"/> Read Only
               </span>
             )}
             <button 
              onClick={handleAISummary} 
              disabled={loadingAI}
              className={`flex items-center text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full text-sm font-bold transition-colors ${loadingAI ? 'opacity-50' : ''}`}
            >
              <Wand2 size={16} className="mr-2" />
              {loadingAI ? 'Summarizing...' : 'AI Summarize'}
            </button>
            {isAdmin && (
              <button 
                onClick={handleSave} 
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Save
              </button>
            )}
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <input 
            type="text" 
            placeholder="Title" 
            className="text-4xl font-bold outline-none mb-6 w-full bg-transparent placeholder-gray-300 text-gray-800"
            value={currentTitle}
            onChange={e => setCurrentTitle(e.target.value)}
            readOnly={!isAdmin}
            autoFocus
          />
          <textarea 
            placeholder="Start typing your notes here..." 
            className="flex-1 w-full outline-none resize-none text-lg text-gray-600 leading-relaxed bg-transparent placeholder-gray-300"
            value={currentContent}
            onChange={e => setCurrentContent(e.target.value)}
            readOnly={!isAdmin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Notes</h1>
        {isAdmin && (
          <button onClick={() => openEditor()} className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center">
            <Plus size={28} />
          </button>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-4 text-indigo-300" size={24} />
        <input 
          type="text" 
          placeholder="Search your notes..." 
          className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl shadow-sm border-2 border-transparent focus:border-indigo-200 outline-none text-lg text-gray-700 placeholder-gray-300 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {notes.length === 0 && (
             <div className="col-span-2 text-center py-16 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-lg font-medium">No notes created yet.</p>
            </div>
        )}
        {notes.map(note => (
          <div 
            key={note.id} 
            onClick={() => openEditor(note)}
            className="bg-yellow-50 p-5 rounded-2xl shadow-sm border border-yellow-100 flex flex-col h-48 relative group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <h3 className="font-bold text-gray-800 mb-3 text-lg line-clamp-2 leading-tight">{note.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-4 flex-1 font-medium opacity-80">{note.content}</p>
            <div className="mt-3 pt-3 border-t border-yellow-100 flex justify-between items-center">
                 <span className="text-xs text-yellow-700 font-bold opacity-60">{new Date(note.date).toLocaleDateString()}</span>
                 <div className="bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <ChevronRight size={14} className="text-yellow-600" />
                 </div>
            </div>
          </div>
        ))}
        
        {isAdmin && (
          <button 
             onClick={() => openEditor()}
             className="bg-white p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-48 text-gray-400 hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-400 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
               <Plus size={24} />
            </div>
            <span className="font-bold">Create Note</span>
          </button>
        )}
      </div>
    </div>
  );
};