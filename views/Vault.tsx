import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, VaultDocument, View } from '../types';
import { 
  FileText, Search, Lock, 
  Box, UploadCloud, Download, Trash2, 
  LayoutGrid, List, Database, Video,
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface VaultProps {
  user: UserProfile;
  documents: VaultDocument[];
  saveDocuments: (docs: VaultDocument[]) => void;
  updateUser: (user: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const Vault: React.FC<VaultProps> = ({ user, documents, saveDocuments, updateUser }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeUser = sessionStorage.getItem('active_session_user') || 'Unknown';

  const handleUnlock = async () => {
    if (pin === (user.vaultPin || "1234")) {
      setIsUnlocked(true);
      setError('');
    } else {
      setPin('');
      setError("Authorization Denied.");
      await storageService.recordViolation(activeUser, "PIN_FAILURE", "Unauthorized Vault Access: Invalid Security PIN");
      const stored = await storageService.getData(`architect_data_${activeUser}`);
      if (stored && stored.user) {
          updateUser(stored.user);
          if (stored.user.isBanned) window.location.reload();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (user.storageUsedBytes + file.size > user.storageLimitGB * 1024 ** 3) {
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

  if (!isUnlocked) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 w-full max-w-md text-center relative overflow-hidden border-amber-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-20 h-20 bg-amber-950/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
            <Lock size={32} className="text-amber-400" />
          </div>
          <h2 className="text-3xl font-display italic mb-2 text-amber-100">Quantum Vault</h2>
          <p className="text-[10px] text-amber-500/60 font-semibold uppercase tracking-widest mb-12">Security Signature Required</p>
          
          <div className="space-y-6">
            <input 
              type="password" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full p-6 bg-amber-950/20 border border-amber-500/20 focus:border-amber-500/40 rounded-2xl text-center text-4xl font-display tracking-[0.5em] outline-none text-amber-100 shadow-inner placeholder:text-amber-500/20"
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                  <Zap size={12} className={user.integrityScore < 50 ? 'text-red-500' : 'text-emerald-500'} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/40">Integrity: {user.integrityScore}%</span>
              </div>
              <div className="w-full h-1 bg-amber-950/20 rounded-full overflow-hidden">
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${user.integrityScore}%` }}
                      className={`h-full ${user.integrityScore > 70 ? 'bg-emerald-500' : user.integrityScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 0 }}
                  className="text-red-400 text-[10px] font-semibold uppercase tracking-widest"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button onClick={handleUnlock} className="w-full py-5 bg-amber-500 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              Authorize Access
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <motion.div variants={item} className="glass-card p-8 flex flex-col lg:flex-row justify-between items-center gap-8 border-amber-500/20">
          <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="w-16 h-16 bg-amber-400 text-black rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                <Database size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-display italic leading-none text-amber-100">Secure<br/><span className="text-amber-500/40 not-italic">Asset Vault</span></h2>
              </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="hidden sm:flex bg-amber-950/20 p-1 rounded-xl border border-amber-500/20">
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-black' : 'text-amber-500/40'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-black' : 'text-amber-500/40'}`}><List size={18}/></button>
              </div>
              <label className={`flex-1 lg:flex-none py-4 px-8 cursor-pointer flex items-center justify-center gap-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                 <UploadCloud size={18} className={isUploading ? 'animate-bounce' : ''} />
                 <span className="text-xs font-bold uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Upload Asset'}</span>
                 <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
          </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="glass-card p-2 flex items-center px-6 border-amber-500/20">
          <Search className="text-amber-500/40" size={20} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none text-amber-100 placeholder:text-amber-500/20"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </motion.div>

      {/* Content */}
      <motion.div variants={item} className="min-h-[400px]">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-32 opacity-20 flex flex-col items-center justify-center">
                  <Box size={80} className="mb-6 text-amber-500" />
                  <p className="text-lg font-display italic text-amber-100">Vault is empty</p>
              </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <motion.div 
                    key={doc.id} 
                    layout
                    className="glass-card p-5 group flex flex-col hover:border-amber-500/40 transition-all border-amber-500/10"
                  >
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-5 bg-amber-950/20 flex items-center justify-center relative border border-amber-500/10">
                           {doc.type === 'IMAGE' ? (
                               <img src={doc.content} alt={doc.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           ) : (
                               <div className="text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
                                   {doc.type === 'VIDEO' ? <Video size={48} /> : <FileText size={48} />}
                               </div>
                           )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-4">
                         <div>
                             <h4 className="text-sm font-medium text-amber-100 truncate mb-2">{doc.title}</h4>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/40 px-2 py-0.5 bg-amber-950/20 rounded border border-amber-500/10">{doc.type}</span>
                                <span className="text-[10px] font-semibold text-amber-500/40">{(doc.size / 1024).toFixed(1)} KB</span>
                             </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => downloadFile(doc)} className="flex-1 p-3 bg-amber-950/20 rounded-xl text-amber-500/40 hover:text-amber-100 hover:bg-amber-500/20 transition-all border border-amber-500/10 flex items-center justify-center"><Download size={16}/></button>
                            <button onClick={() => deleteFile(doc.id)} className="flex-1 p-3 bg-amber-950/20 rounded-xl text-amber-500/40 hover:text-red-400 hover:bg-red-400/10 transition-all border border-amber-500/10 flex items-center justify-center"><Trash2 size={16}/></button>
                         </div>
                      </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="space-y-3">
               {filteredDocs.map(doc => (
                 <motion.div 
                    key={doc.id} 
                    layout
                    className="glass-card p-4 flex items-center justify-between group hover:bg-amber-950/10 transition-all border-amber-500/10 hover:border-amber-500/30"
                 >
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className="w-12 h-12 bg-amber-950/20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-amber-500/10">
                          {doc.type === 'IMAGE' ? (
                              <img src={doc.content} className="w-full h-full object-cover" alt="" />
                          ) : (
                              doc.type === 'VIDEO' ? <Video size={20} className="text-amber-500/40"/> : <FileText size={20} className="text-amber-500/40"/>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="font-medium text-amber-100 text-sm truncate">{doc.title}</p>
                          <p className="text-[10px] text-amber-500/40 font-semibold uppercase tracking-widest">{(doc.size / 1024).toFixed(1)} KB • {doc.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => downloadFile(doc)} className="p-3 text-amber-500/40 hover:text-amber-100 transition-colors"><Download size={18}/></button>
                       <button onClick={() => deleteFile(doc.id)} className="p-3 text-amber-500/40 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
          )}
      </motion.div>
    </motion.div>
  );
};
