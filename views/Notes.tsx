
import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Search, ChevronRight, Wand2, X, Lock, Trash2, RefreshCcw, Archive, CheckCircle2, Clock } from 'lucide-react';
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
          status: isAdmin ? n.status : 'PENDING' // Reset to pending on edit if user
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
      // Only Admin can delete items not in trash yet
      if (!isAdmin) return; 

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

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <button onClick={closeEditor} className="text-gray-500 font-medium hover:text-gray-800 p-2 -ml-2">
             Cancel
          </button>
          <div className="flex space-x-3 items-center">
             <button 
              onClick={handleAISummary} 
              disabled={loadingAI}
              className={`flex items-center text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full text-sm font-bold transition-colors ${loadingAI ? 'opacity-50' : ''}`}
            >
              <Wand2 size={16} className="mr-2" />
              {loadingAI ? 'Summarizing...' : 'AI Summarize'}
            </button>
            <button 
                onClick={handleSave} 
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
                Save Note
            </button>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <input 
            type="text" 
            placeholder="Title" 
            className="text-4xl font-bold outline-none mb-6 w-full bg-transparent placeholder-gray-300 text-gray-800"
            value={currentTitle}
            onChange={e => setCurrentTitle(e.target.value)}
            autoFocus
          />
          <textarea 
            placeholder="Start typing your notes here..." 
            className="flex-1 w-full outline-none resize-none text-lg text-gray-600 leading-relaxed bg-transparent placeholder-gray-300"
            value={currentContent}
            onChange={e => setCurrentContent(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
             {showTrash ? 'Trash Bin' : 'My Notes'}
           </h1>
           {showTrash ? (
               <p className="text-xs text-gray-400 mt-1">Only Admin can manage trash.</p>
           ) : (
               <p className="text-xs text-gray-400 mt-1">{activeNotes.length} notes found</p>
           )}
        </div>
        
        <div className="flex space-x-2">
            {isAdmin && (
                <button 
                    onClick={() => setShowTrash(!showTrash)}
                    className={`p-3 rounded-2xl transition-all ${showTrash ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    title={showTrash ? "Back to Notes" : "View Trash"}
                >
                    {showTrash ? <Archive size={24} /> : <Trash2 size={24} />}
                </button>
            )}
            
            {!showTrash && (
            <button onClick={() => openEditor()} className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center">
                <Plus size={28} />
            </button>
            )}
        </div>
      </div>

      {!showTrash && (
        <div className="relative mb-8">
            <Search className="absolute left-4 top-4 text-indigo-300" size={24} />
            <input 
            type="text" 
            placeholder="Search your notes..." 
            className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl shadow-sm border-2 border-transparent focus:border-indigo-200 outline-none text-lg text-gray-700 placeholder-gray-300 transition-all"
            />
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        {(showTrash ? deletedNotes : activeNotes).length === 0 && (
             <div className="col-span-2 text-center py-16 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-lg font-medium">{showTrash ? "Trash is empty." : "No notes created yet."}</p>
            </div>
        )}

        {(showTrash ? deletedNotes : activeNotes).map(note => (
          <div 
            key={note.id} 
            onClick={() => !showTrash && openEditor(note)}
            className={`p-5 rounded-2xl shadow-sm border flex flex-col h-56 relative group transition-all ${
                showTrash 
                ? 'bg-red-50 border-red-100 cursor-default opacity-80' 
                : 'bg-yellow-50 border-yellow-100 cursor-pointer hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-gray-800 text-lg line-clamp-1 leading-tight flex-1">{note.title}</h3>
                 {!showTrash && (
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center ${
                         note.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                     }`}>
                         {note.status === 'COMPLETED' ? <CheckCircle2 size={10} className="mr-1"/> : <Clock size={10} className="mr-1"/>}
                         {note.status === 'COMPLETED' ? 'Done' : 'Pending'}
                     </span>
                 )}
            </div>

            <p className="text-sm text-gray-600 line-clamp-4 flex-1 font-medium opacity-80">{note.content}</p>
            
            <div className="mt-3 pt-3 border-t border-gray-200/20 flex justify-between items-center">
                 <span className="text-xs text-gray-500 font-bold opacity-60">
                     {showTrash ? `Deleted: ${new Date(note.deletedAt!).toLocaleDateString()}` : new Date(note.date).toLocaleDateString()}
                 </span>
                 
                 {showTrash ? (
                     isAdmin && (
                        <div className="flex space-x-2">
                             <button onClick={() => restoreNote(note.id)} className="p-1.5 bg-white text-green-600 rounded-lg shadow-sm hover:bg-green-50" title="Restore"><RefreshCcw size={14} /></button>
                             <button onClick={() => permanentDeleteNote(note.id)} className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50" title="Delete Forever"><Trash2 size={14} /></button>
                         </div>
                     )
                 ) : (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isAdmin && (
                            <button 
                                onClick={(e) => softDeleteNote(note.id, e)} 
                                className="bg-white p-1.5 rounded-full shadow-sm text-red-400 hover:text-red-600"
                                title="Admin Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                         )}
                         <div className="bg-white p-1.5 rounded-full shadow-sm">
                            <ChevronRight size={14} className="text-yellow-600" />
                        </div>
                    </div>
                 )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
