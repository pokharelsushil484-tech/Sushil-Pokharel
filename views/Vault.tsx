import React, { useState } from 'react';
import { UserProfile, VaultDocument, View } from '../types';
import { 
  FileText, Search, Lock, 
  Box, UploadCloud, Download, Trash2, 
  ShieldAlert, LayoutGrid, List, Database, Video
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface VaultProps {
  user: UserProfile;
  documents: VaultDocument[];
  saveDocuments: (docs: VaultDocument[]) => void;
  updateUser: (user: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const Vault: React.FC<VaultProps> = ({ user, documents, saveDocuments, updateUser, onNavigate }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAdmin = localStorage.getItem('active_session_user') === 'admin'; 
  const activeUser = localStorage.getItem('active_session_user') || 'Unknown';

  const handleUnlock = async () => {
    if (pin === (user.vaultPin || "1234")) {
      setIsUnlocked(true);
      setError('');
    } else {
      setPin('');
      setError("AUTHORIZATION DENIED.");
      
      // PUNISHMENT SYSTEM INTEGRATION
      await storageService.recordViolation(activeUser, "Unauthorized Vault Access Attempt: Invalid Security PIN");
      
      // Sync local state immediately to check if strike 3 was reached
      const stored = await storageService.getData(`architect_data_${activeUser}`);
      if (stored && stored.user) {
          updateUser(stored.user);
          // If banned, the App component will automatically swap to ErrorPage via state refresh
          if (stored.user.isBanned) window.location.reload();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin && (user.storageUsedBytes + file.size > user.storageLimitGB * 1024 ** 3)) {
      alert("Storage space is full.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newDoc: VaultDocument = {
        id: 'FILE-' + Date.now(),
        title: file.name,
        type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'OTHER',
        content: reader.result as string,
        size: file.size,
        mimeType: file.type,
        createdAt: Date.now()
      };
      saveDocuments([...documents, newDoc]);
      updateUser({...user, storageUsedBytes: user.storageUsedBytes + file.size});
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (doc: VaultDocument) => {
    const link = document.createElement('a');
    link.href = doc.content;
    link.download = doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFile = async (id: string) => {
    if (window.confirm("Purge this data node?")) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        saveDocuments(documents.filter(d => d.id !== id));
        updateUser({...user, storageUsedBytes: Math.max(0, user.storageUsedBytes - doc.size)});
      }
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl w-full max-w-sm text-center border border-white/10 relative">
          <div className="w-20 h-20 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
            <Lock size={36} className="text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Quantum Vault</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-10">Access Token Required</p>
          <input 
            type="password" 
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full p-6 bg-black border-2 border-transparent focus:border-indigo-500 rounded-[2rem] text-center text-3xl font-black tracking-[0.8em] outline-none mb-10 text-white shadow-inner"
            placeholder="••••"
            maxLength={4}
            autoFocus
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase mb-6 tracking-widest animate-shake">{error}</p>}
          <button onClick={handleUnlock} className="w-full bg-white text-black py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-200 transition-all">Unlock Node</button>
        </div>
      </div>
    );
  }

  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-fade-in max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
      <div className="bg-slate-900/50 p-8 rounded-[3.5rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white text-black rounded-[2rem] flex items-center justify-center shadow-xl flex-shrink-0"><Database size={32} /></div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Master<br/>Vault</h2>
              </div>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="hidden sm:flex bg-white/5 p-1 rounded-2xl mr-2 border border-white/5">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-slate-500'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500'}`}><List size={18}/></button>
              </div>
              <label className={`flex-1 md:flex-none p-5 bg-indigo-600 text-white rounded-[2rem] shadow-xl hover:bg-indigo-500 transition-all cursor-pointer flex items-center justify-center space-x-3 ${isUploading ? 'opacity-70 cursor-wait' : ''}`}>
                 <UploadCloud size={20} className={isUploading ? 'animate-bounce' : ''} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Upload Node'}</span>
                 <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
          </div>
      </div>

      <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 flex items-center px-8">
          <Search className="text-slate-500" size={24} />
          <input 
            type="text" 
            placeholder="IDENTIFY DATA NODE..." 
            className="flex-1 bg-transparent px-6 text-sm font-black uppercase tracking-widest outline-none text-white placeholder:text-slate-800"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </div>

      <div className="scroll-box flex-1 min-h-[500px]">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-32 opacity-20 flex flex-col items-center justify-center">
                  <Box size={100} className="mb-8" />
                  <p className="text-xl font-black uppercase tracking-[0.5em]">No Data Discovered</p>
              </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="master-box p-6 rounded-[3rem] hover:border-white/30 transition-all group h-80 flex flex-col">
                      <div className="w-full h-36 rounded-[2rem] overflow-hidden mb-6 bg-black flex items-center justify-center relative shadow-inner">
                           {doc.type === 'IMAGE' ? (
                               <img src={doc.content} alt={doc.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                           ) : (
                               <div className="text-indigo-500 opacity-40">
                                   {doc.type === 'VIDEO' ? <Video size={48} /> : <FileText size={48} />}
                               </div>
                           )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                         <div className="space-y-1">
                             <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">{doc.title}</h4>
                             <div className="flex items-center gap-3">
                                <span className="stark-label text-[8px] py-0.5">{doc.type}</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{(doc.size / 1024).toFixed(1)} KB</span>
                             </div>
                         </div>
                         <div className="flex gap-3 mt-4">
                            <button onClick={() => downloadFile(doc)} className="flex-1 p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"><Download size={16} className="mx-auto"/></button>
                            <button onClick={() => deleteFile(doc.id)} className="flex-1 p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-white/5"><Trash2 size={16} className="mx-auto"/></button>
                         </div>
                      </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
               {filteredDocs.map(doc => (
                 <div key={doc.id} className="master-box p-5 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
                    <div className="flex items-center space-x-6 overflow-hidden">
                       <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                          {doc.type === 'IMAGE' ? (
                              <img src={doc.content} className="w-full h-full object-cover" alt="" />
                          ) : (
                              doc.type === 'VIDEO' ? <Video size={24} className="text-indigo-500 opacity-40"/> : <FileText size={24} className="text-slate-500"/>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-white uppercase tracking-widest text-sm truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-600 font-black uppercase">{(doc.size / 1024).toFixed(1)} KB • {doc.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-2 pl-4">
                       <button onClick={() => downloadFile(doc)} className="p-4 text-slate-500 hover:text-white transition-colors"><Download size={20}/></button>
                       <button onClick={() => deleteFile(doc.id)} className="p-4 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                    </div>
                 </div>
               ))}
            </div>
          )}
      </div>
    </div>
  );
};