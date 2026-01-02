
import React, { useState } from 'react';
import { UserProfile, VaultDocument, View } from '../types';
import { 
  Shield, Lock, FileText, Image as ImageIcon, Search, HardDrive, 
  Box, CloudUpload, X, Download, Trash2, 
  ShieldAlert, MoreVertical, LayoutGrid, List, Database
} from 'lucide-react';

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
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl max-w-lg border border-slate-100 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          <ShieldAlert size={80} className="text-amber-500 mx-auto mb-10 animate-pulse" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 leading-tight">Access Restricted</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-12 uppercase tracking-[0.2em] px-4">
            Authorized repository access is restricted to verified office identities. Submit your authorization request via the System Dashboard.
          </p>
          <button 
            className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all"
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
    reader.onloadend = () => {
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

  const deleteFile = (id: string) => {
    if (window.confirm("Purge segment permanently from repository?")) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        saveDocuments(documents.filter(d => d.id !== id));
        updateUser({...user, storageUsedBytes: Math.max(0, user.storageUsedBytes - doc.size)});
      }
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl w-full max-w-sm text-center border border-slate-100 dark:border-white/5 relative">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-indigo-100 dark:border-indigo-900/30">
            <Lock className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Data Node Access</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mb-10">Verification Key Required</p>
          <input 
            type="password" 
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-center text-4xl font-black tracking-[0.8em] outline-none mb-10 border-2 border-transparent focus:border-indigo-500 transition-all"
            placeholder="••••"
            maxLength={4}
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase mb-8 tracking-widest">{error}</p>}
          <button onClick={handleUnlock} className="w-full bg-indigo-600 text-white py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl">Initialize Node</button>
        </div>
      </div>
    );
  }

  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="pb-24 animate-fade-in max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-140px)]">
      {/* HEADER CONTROLS */}
      <div className="mb-10 bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center space-x-8">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/20"><Database size={40} /></div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Professional <br/>Data Node</h2>
                <div className="flex items-center space-x-3 mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Protocol: High Fidelity Encryption</p>
                </div>
              </div>
          </div>
          <div className="flex items-center space-x-6">
              <div className="hidden lg:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mr-4">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={20}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}><List size={20}/></button>
              </div>
              <label className="p-6 bg-indigo-600 text-white rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all cursor-pointer flex items-center space-x-4">
                 <CloudUpload size={24} className={isUploading ? 'animate-bounce' : ''} />
                 <span className="text-[11px] font-black uppercase tracking-[0.3em]">{isUploading ? 'Syncing...' : 'Provision Segment'}</span>
                 <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex items-center mb-10 px-10">
          <Search className="text-slate-400" size={28} />
          <input 
            type="text" 
            placeholder="Search local data segments..." 
            className="flex-1 bg-transparent px-8 text-lg font-black uppercase tracking-widest outline-none dark:text-white placeholder:text-slate-200"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-32 opacity-10 flex flex-col items-center">
                  <Box size={100} className="mb-10" />
                  <p className="text-xl font-black uppercase tracking-[0.6em]">No data segments discovered.</p>
              </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all relative group h-72 flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between items-start">
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${doc.type === 'IMAGE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {doc.type === 'IMAGE' ? <ImageIcon size={32} /> : <FileText size={32} />}
                         </div>
                         <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => downloadFile(doc)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"><Download size={20}/></button>
                            <button onClick={() => deleteFile(doc.id)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                         </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight truncate mb-2">{doc.title}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                           <span>NODE_ASSET</span>
                           <span>{(doc.size / 1024).toFixed(1) === '0.0' ? (doc.size).toFixed(0) + ' B' : (doc.size / 1024).toFixed(1) + ' KB'}</span>
                        </div>
                      </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
               {filteredDocs.map(doc => (
                 <div key={doc.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:shadow-xl transition-all">
                    <div className="flex items-center space-x-6">
                       <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600">
                          {doc.type === 'IMAGE' ? <ImageIcon size={20} /> : <FileText size={20} />}
                       </div>
                       <div>
                          <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{doc.title}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Metadata Segment | {(doc.size / 1024).toFixed(1)} KB</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-4">
                       <button onClick={() => downloadFile(doc)} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={20}/></button>
                       <button onClick={() => deleteFile(doc.id)} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                    </div>
                 </div>
               ))}
            </div>
          )}
      </div>
    </div>
  );
};
