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
        <div className="flex justify-between items-center p-4 border-b">
          <button onClick={closeEditor} className="text-gray-500">
             {isAdmin ? 'Cancel' : 'Close'}
          </button>
          <div className="flex space-x-3 items-center">
             {!isAdmin && (
               <span className="text-xs text-gray-400 flex items-center bg-gray-100 px-2 py-1 rounded-full">
                 <Lock size={10} className="mr-1"/> Read Only
               </span>
             )}
             <button 
              onClick={handleAISummary} 
              disabled={loadingAI}
              className={`flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium ${loadingAI ? 'opacity-50' : ''}`}
            >
              <Wand2 size={14} className="mr-1" />
              {loadingAI ? 'Summarizing...' : 'AI Summarize'}
            </button>
            {isAdmin && <button onClick={handleSave} className="font-bold text-indigo-600">Save</button>}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <input 
            type="text" 
            placeholder="Title" 
            className="text-2xl font-bold outline-none mb-4 w-full bg-transparent"
            value={currentTitle}
            onChange={e => setCurrentTitle(e.target.value)}
            readOnly={!isAdmin}
          />
          <textarea 
            placeholder="Start typing notes..." 
            className="flex-1 w-full outline-none resize-none text-gray-700 leading-relaxed bg-transparent"
            value={currentContent}
            onChange={e => setCurrentContent(e.target.value)}
            readOnly={!isAdmin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        {isAdmin && (
          <button onClick={() => openEditor()} className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search notes..." 
          className="w-full bg-white py-3 pl-10 pr-4 rounded-xl shadow-sm border-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {notes.length === 0 && (
             <div className="col-span-2 text-center p-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                <p>No notes available.</p>
            </div>
        )}
        {notes.map(note => (
          <div 
            key={note.id} 
            onClick={() => openEditor(note)}
            className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col h-40 relative group cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{note.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-4 flex-1">{note.content}</p>
            <span className="text-[10px] text-gray-400 mt-2 block">{new Date(note.date).toLocaleDateString()}</span>
          </div>
        ))}
        
        {isAdmin && (
          <button 
             onClick={() => openEditor()}
             className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-40 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <Plus size={32} className="mb-2" />
            <span className="text-sm">New Note</span>
          </button>
        )}
      </div>
    </div>
  );
};