
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
          className="glass-card p-12 w-full max-w-md text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-display italic mb-2">Quantum Vault</h2>
          <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-12">Security Signature Required</p>
          
          <div className="space-y-6">
            <input 
              type="password" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full p-6 bg-white/5 border border-white/10 focus:border-white/20 rounded-2xl text-center text-4xl font-display tracking-[0.5em] outline-none text-white shadow-inner"
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                  <Zap size={12} className={user.integrityScore < 50 ? 'text-red-500' : 'text-emerald-500'} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Integrity: {user.integrityScore}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
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
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-[10px] font-semibold uppercase tracking-widest"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button onClick={handleUnlock} className="btn-premium w-full py-5">
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
      <motion.div variants={item} className="glass-card p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                <Database size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-display italic leading-none">Secure<br/><span className="text-white/40 not-italic">Asset Vault</span></h2>
              </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/40'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/40'}`}><List size={18}/></button>
              </div>
              <label className={`flex-1 lg:flex-none btn-premium py-4 px-8 cursor-pointer flex items-center justify-center gap-3 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                 <UploadCloud size={18} className={isUploading ? 'animate-bounce' : ''} />
                 <span className="text-xs font-semibold">{isUploading ? 'Syncing...' : 'Upload Asset'}</span>
                 <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
          </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="glass-card p-2 flex items-center px-6">
          <Search className="text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none text-white placeholder:text-white/20"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </motion.div>

      {/* Content */}
      <motion.div variants={item} className="min-h-[400px]">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-32 opacity-20 flex flex-col items-center justify-center">
                  <Box size={80} className="mb-6" />
                  <p className="text-lg font-display italic">Vault is empty</p>
              </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <motion.div 
                    key={doc.id} 
                    layout
                    className="glass-card p-5 group flex flex-col hover:bg-white/5 transition-all"
                  >
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-5 bg-white/5 flex items-center justify-center relative border border-white/5">
                           {doc.type === 'IMAGE' ? (
                               <img src={doc.content} alt={doc.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           ) : (
                               <div className="text-white/20 group-hover:text-white/40 transition-colors">
                                   {doc.type === 'VIDEO' ? <Video size={48} /> : <FileText size={48} />}
                               </div>
                           )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-4">
                         <div>
                             <h4 className="text-sm font-medium text-white truncate mb-2">{doc.title}</h4>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-2 py-0.5 bg-white/5 rounded border border-white/5">{doc.type}</span>
                                <span className="text-[10px] font-semibold text-white/20">{(doc.size / 1024).toFixed(1)} KB</span>
                             </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => downloadFile(doc)} className="flex-1 p-3 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center"><Download size={16}/></button>
                            <button onClick={() => deleteFile(doc.id)} className="flex-1 p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5 flex items-center justify-center"><Trash2 size={16}/></button>
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
                    className="glass-card p-4 flex items-center justify-between group hover:bg-white/5 transition-all"
                 >
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/5">
                          {doc.type === 'IMAGE' ? (
                              <img src={doc.content} className="w-full h-full object-cover" alt="" />
                          ) : (
                              doc.type === 'VIDEO' ? <Video size={20} className="text-white/20"/> : <FileText size={20} className="text-white/20"/>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate">{doc.title}</p>
                          <p className="text-[10px] text-white/20 font-semibold uppercase tracking-widest">{(doc.size / 1024).toFixed(1)} KB • {doc.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => downloadFile(doc)} className="p-3 text-white/20 hover:text-white transition-colors"><Download size={18}/></button>
                       <button onClick={() => deleteFile(doc.id)} className="p-3 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
          )}
      </motion.div>
    </motion.div>
  );
};

