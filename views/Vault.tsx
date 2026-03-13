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
import { useModal } from '../components/ModalProvider';
import { ADMIN_USERNAME } from '../constants';

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
  const { showAlert, showConfirm } = useModal();
  
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
          const updatedUser = { ...stored.user, isBanned: activeUser === ADMIN_USERNAME ? false : stored.user.isBanned };
          updateUser(updatedUser);
          if (updatedUser.isBanned) window.location.reload();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (user.storageUsedBytes + file.size > user.storageLimitGB * 1024 ** 3) {
      showAlert('Storage Full', "Storage space is full.");
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
      const updatedDocs = [...documents, newDoc];
      const updatedUser = {...user, storageUsedBytes: user.storageUsedBytes + file.size};
      saveDocuments(updatedDocs);
      updateUser(updatedUser);
      const stored = await storageService.getData(`architect_data_${activeUser}`);
      await storageService.setData(`architect_data_${activeUser}`, { ...stored, user: updatedUser, vaultDocs: updatedDocs });
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
    showConfirm('Purge Data', "Purge this data node?", async () => {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        const updatedDocs = documents.filter(d => d.id !== id);
        const updatedUser = {...user, storageUsedBytes: Math.max(0, user.storageUsedBytes - doc.size)};
        saveDocuments(updatedDocs);
        updateUser(updatedUser);
        const stored = await storageService.getData(`architect_data_${activeUser}`);
        await storageService.setData(`architect_data_${activeUser}`, { ...stored, user: updatedUser, vaultDocs: updatedDocs });
      }
    });
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

  const isPro = user.subscriptionTier !== 'LIGHT';

  if (!isUnlocked) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-12 w-full max-w-md text-center relative overflow-hidden ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
        >
          {isPro && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>}
          <div className={`w-20 h-20 flex items-center justify-center mx-auto mb-8 ${isPro ? 'bg-amber-950/20 rounded-2xl border border-amber-500/20' : 'bg-gray-400 rounded-none border-2 border-gray-500'}`}>
            <Lock size={32} className={isPro ? "text-amber-400" : "text-gray-800"} />
          </div>
          <h2 className={`text-3xl mb-2 ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Quantum Vault</h2>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-12 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Security Signature Required</p>
          
          <div className="space-y-6">
            <input 
              type="password" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              className={`w-full p-6 text-center text-4xl font-display tracking-[0.5em] outline-none shadow-inner ${isPro ? 'bg-amber-950/20 border border-amber-500/20 focus:border-amber-500/40 rounded-2xl text-amber-100 placeholder:text-amber-500/20' : 'bg-gray-200 border-2 border-gray-500 focus:border-gray-700 rounded-none text-gray-900 placeholder:text-gray-500'}`}
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                  <Zap size={12} className={user.integrityScore < 50 ? 'text-red-500' : (isPro ? 'text-emerald-500' : 'text-green-600')} />
                  <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Integrity: {user.integrityScore}%</span>
              </div>
              <div className={`w-full h-1 overflow-hidden ${isPro ? 'bg-amber-950/20 rounded-full' : 'bg-gray-400 rounded-none'}`}>
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${user.integrityScore}%` }}
                      className={`h-full ${user.integrityScore > 70 ? (isPro ? 'bg-emerald-500' : 'bg-green-600') : user.integrityScore > 40 ? (isPro ? 'bg-amber-500' : 'bg-gray-600') : 'bg-red-500'}`} 
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

            <button onClick={handleUnlock} className={`w-full py-5 font-bold uppercase tracking-widest transition-all ${isPro ? 'bg-amber-500 text-black rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'bg-gray-500 text-white rounded-none hover:bg-gray-600 border-2 border-gray-600'}`}>
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
      <motion.div variants={item} className={`p-8 flex flex-col lg:flex-row justify-between items-center gap-8 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
          <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className={`w-16 h-16 flex items-center justify-center shrink-0 ${isPro ? 'bg-amber-400 text-black rounded-2xl shadow-xl' : 'bg-gray-400 text-gray-800 rounded-none border-2 border-gray-500'}`}>
                <Database size={28} />
              </div>
              <div>
                <h2 className={`text-3xl leading-none ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Secure<br/><span className={isPro ? "text-amber-500/40 not-italic" : "text-gray-600"}>Asset Vault</span></h2>
              </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className={`hidden sm:flex p-1 ${isPro ? 'bg-amber-950/20 rounded-xl border border-amber-500/20' : 'bg-gray-400 rounded-none border-2 border-gray-500'}`}>
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-all ${isPro ? 'rounded-lg' : 'rounded-none'} ${viewMode === 'grid' ? (isPro ? 'bg-amber-500 text-black' : 'bg-gray-600 text-white') : (isPro ? 'text-amber-500/40' : 'text-gray-700')}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-2.5 transition-all ${isPro ? 'rounded-lg' : 'rounded-none'} ${viewMode === 'list' ? (isPro ? 'bg-amber-500 text-black' : 'bg-gray-600 text-white') : (isPro ? 'text-amber-500/40' : 'text-gray-700')}`}><List size={18}/></button>
              </div>
              <label className={`flex-1 lg:flex-none py-4 px-8 cursor-pointer flex items-center justify-center gap-3 transition-all ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'} ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                 <UploadCloud size={18} className={isUploading ? 'animate-bounce' : ''} />
                 <span className="text-xs font-bold uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Upload Asset'}</span>
                 <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
          </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className={`p-2 flex items-center px-6 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
          <Search className={isPro ? "text-amber-500/40" : "text-gray-600"} size={20} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className={`flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none ${isPro ? 'text-amber-100 placeholder:text-amber-500/20' : 'text-gray-900 placeholder:text-gray-600'}`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
      </motion.div>

      {/* Content */}
      <motion.div variants={item} className="min-h-[400px]">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-32 opacity-20 flex flex-col items-center justify-center">
                  <Box size={80} className={`mb-6 ${isPro ? 'text-amber-500' : 'text-gray-600'}`} />
                  <p className={`text-lg ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-600'}`}>Vault is empty</p>
              </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <motion.div 
                    key={doc.id} 
                    layout
                    className={`p-5 group flex flex-col transition-all ${isPro ? 'glass-card hover:border-amber-500/40 border-amber-500/10 rounded-2xl' : 'bg-gray-300 border-4 border-gray-500 rounded-none hover:bg-gray-400'}`}
                  >
                      <div className={`w-full h-40 overflow-hidden mb-5 flex items-center justify-center relative ${isPro ? 'bg-amber-950/20 rounded-xl border border-amber-500/10' : 'bg-gray-400 rounded-none border-2 border-gray-500'}`}>
                           {doc.type === 'IMAGE' ? (
                               <img src={doc.content} alt={doc.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           ) : (
                               <div className={`transition-colors ${isPro ? 'text-amber-500/20 group-hover:text-amber-500/40' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                   {doc.type === 'VIDEO' ? <Video size={48} /> : <FileText size={48} />}
                               </div>
                           )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-4">
                         <div>
                             <h4 className={`text-sm font-medium truncate mb-2 ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>{doc.title}</h4>
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 ${isPro ? 'text-amber-500/40 bg-amber-950/20 rounded border border-amber-500/10' : 'text-gray-800 bg-gray-400 rounded-none border border-gray-500'}`}>{doc.type}</span>
                                <span className={`text-[10px] font-semibold ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>{(doc.size / 1024).toFixed(1)} KB</span>
                             </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => downloadFile(doc)} className={`flex-1 p-3 transition-all flex items-center justify-center ${isPro ? 'bg-amber-950/20 rounded-xl text-amber-500/40 hover:text-amber-100 hover:bg-amber-500/20 border border-amber-500/10' : 'bg-gray-400 rounded-none text-gray-800 hover:bg-gray-500 border-2 border-gray-500'}`}><Download size={16}/></button>
                            <button onClick={() => deleteFile(doc.id)} className={`flex-1 p-3 transition-all flex items-center justify-center ${isPro ? 'bg-amber-950/20 rounded-xl text-amber-500/40 hover:text-red-400 hover:bg-red-400/10 border border-amber-500/10' : 'bg-gray-400 rounded-none text-gray-800 hover:bg-red-400 border-2 border-gray-500'}`}><Trash2 size={16}/></button>
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
                    className={`p-4 flex items-center justify-between group transition-all ${isPro ? 'glass-card hover:bg-amber-950/10 border-amber-500/10 hover:border-amber-500/30 rounded-2xl' : 'bg-gray-300 border-4 border-gray-500 rounded-none hover:bg-gray-400'}`}
                 >
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className={`w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden ${isPro ? 'bg-amber-950/20 rounded-xl border border-amber-500/10' : 'bg-gray-400 rounded-none border-2 border-gray-500'}`}>
                          {doc.type === 'IMAGE' ? (
                              <img src={doc.content} className="w-full h-full object-cover" alt="" />
                          ) : (
                              doc.type === 'VIDEO' ? <Video size={20} className={isPro ? "text-amber-500/40" : "text-gray-600"}/> : <FileText size={20} className={isPro ? "text-amber-500/40" : "text-gray-600"}/>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className={`font-medium text-sm truncate ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>{doc.title}</p>
                          <p className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>{(doc.size / 1024).toFixed(1)} KB • {doc.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => downloadFile(doc)} className={`p-3 transition-colors ${isPro ? 'text-amber-500/40 hover:text-amber-100' : 'text-gray-600 hover:text-gray-900'}`}><Download size={18}/></button>
                       <button onClick={() => deleteFile(doc.id)} className={`p-3 transition-colors ${isPro ? 'text-amber-500/40 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}><Trash2 size={18}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
          )}
      </motion.div>
    </motion.div>
  );
};
