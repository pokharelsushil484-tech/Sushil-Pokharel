
import React, { useState } from 'react';
import { UserProfile, VaultDocument, View } from '../types';
import { 
  FileText, Image as ImageIcon, Search, Lock, 
  Box, CloudUpload, Download, Trash2, 
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const isAdmin = localStorage.getItem('active_session_user') === 'admin'; 
  const isVerified = user.isVerified || isAdmin;

  if (!isVerified) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl max-w-lg w-full border border-slate-100 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
          <ShieldAlert size={64} className="text-amber-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 leading-tight">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8 uppercase tracking-[0.2em]">
            Authorized repository access is restricted to verified office identities.
          </p>
          <button 
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
            onClick={() => onNavigate(View.VERIFICATION_FORM)}
          >
            Request Access Node
          </button>
        </div>
      </div>
    );
  }

  const handleUnlock = () => {
    if (pin === (user.vaultPin || "1234")) {
      setIsUnlocked(true);
      setError('');
    } else {
      setPin('');
      setError("Unauthorized access token.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin && (user.storageUsedBytes + file.size > user.storageLimitGB * 1024 ** 3)) {
      alert("Cluster node capacity exceeded.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newDoc: VaultDocument = {
        id: 'SEG-' + Date.now(),
        title: file.name,
        type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'OTHER',
        content: reader.result as string,
        size: file.size,
        mimeType: file.type,
        createdAt: Date.now()
      };
      saveDocuments([...documents, newDoc]);
      updateUser({...user, storageUsedBytes: user.storageUsedBytes + file.size});
      
      // Log Upload Activity
      await storageService.logActivity({
        actor: user.name,
        targetUser: user.name,
        actionType: 'DATA',
        description: `Uploaded Segment: ${file.name}`,
        metadata: JSON.stringify({ size: file.size, type: file.type })
      });

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
    if (window.confirm("Purge segment permanently from repository?")) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        saveDocuments(documents.filter(d => d.id !== id));
        updateUser({...user, storageUsedBytes: Math.max(0, user.storageUsedBytes - doc.size)});
        
        // Log Delete Activity
        await storageService.logActivity({
            actor: user.name,
            targetUser: user.name,
            actionType: 'DATA',
            description: `Purged Segment: ${doc.title}`,
            metadata: JSON.stringify({ size: doc.size })
        });
      }
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl w-full max-w-sm text-center border border-slate-100 dark:border-white/5 relative">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-100 dark:border-indigo-900/30">
            <Lock className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Data Node Access</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-8">Verification Key Required</p>
          <input 
            type="password" 
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-center text-3xl font-black tracking-[0.8em] outline-none mb-8 border-2 border-transparent focus:border-indigo-500 transition-all dark:text-white"
            placeholder="••••"
            maxLength={4}
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase mb-6 tracking-widest animate-shake">{error}</p>}
          <button onClick={handleUnlock} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all">Initialize Node</button>
        </div>
      </div>
    );
  }

  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="pb-24 animate-fade-in max-w-7xl mx-auto w-full flex flex-col h-full px-4 sm:px-0">
      {/* HEADER CONTROLS */}
      <div className="mb-8 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-6 w-full md:w-auto">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20 flex-shrink-0"><Database size={32} /></div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Data<br/>Node</h2>
              </div>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
              <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mr-2">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={20}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}><List size={20}/></button>
              </div>
              <label className={`w-full md:w-auto p-4 md:px-8 bg-indigo-600 text-white rounded-[2rem] shadow-lg hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center space-x-3 ${isUploading ? 'opacity-70 cursor-wait' : ''}`}>
                 <CloudUpload size={20} className={isUploading ? 'animate-bounce' : ''} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isUploading ? 'Syncing...' : 'Upload'}</span>
                 <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm flex items-center mb-8 px-6">
          <Search className="text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Search segments..." 
            className="flex-1 bg-transparent px-4 text-base font-black uppercase tracking-widest outline-none dark:text-white placeholder:text-slate-300"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </div>

      <div className="flex-1 pb-10">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-24 opacity-20 flex flex-col items-center">
                  <Box size={80} className="mb-6" />
                  <p className="text-lg font-black uppercase tracking-[0.4em]">No segments.</p>
              </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all relative group h-64 flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between items-start">
                         <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-inner ${
                           doc.type === 'IMAGE' ? 'bg-emerald-50 text-emerald-600' : 
                           doc.type === 'VIDEO' ? 'bg-amber-50 text-amber-600' :
                           'bg-indigo-50 text-indigo-600'
                         }`}>
                            {doc.type === 'IMAGE' ? <ImageIcon size={24} /> : doc.type === 'VIDEO' ? <Video size={24} /> : <FileText size={24} />}
                         </div>
                         <div className="flex space-x-2">
                            <button onClick={() => downloadFile(doc)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"><Download size={18}/></button>
                            <button onClick={() => deleteFile(doc.id)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                         </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate mb-2" title={doc.title}>{doc.title}</h4>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-widest">
                           <span>{doc.type}</span>
                           <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
               {filteredDocs.map(doc => (
                 <div key={doc.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div className="flex items-center space-x-5 overflow-hidden">
                       <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                          {doc.type === 'IMAGE' ? <ImageIcon size={20} /> : doc.type === 'VIDEO' ? <Video size={20} /> : <FileText size={20} />}
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm truncate">{doc.title}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{(doc.size / 1024).toFixed(1)} KB</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-2 pl-4">
                       <button onClick={() => downloadFile(doc)} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={18}/></button>
                       <button onClick={() => deleteFile(doc.id)} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                 </div>
               ))}
            </div>
          )}
      </div>
    </div>
  );
};
