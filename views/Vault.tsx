
import React, { useState, useEffect } from 'react';
import { UserProfile, VaultDocument, ChangeRequest } from '../types';
import { Shield, Lock, FileText, Image as ImageIcon, Video, FolderPlus, Folder, ChevronRight, LayoutGrid, List as ListIcon, Search, HardDrive, Trash2, Download, Archive, RefreshCcw, Box, CloudUpload, ArrowUpCircle, Send, X } from 'lucide-react';

interface VaultProps {
  user: UserProfile;
  documents: VaultDocument[];
  saveDocuments: (docs: VaultDocument[]) => void;
  updateUser: (user: UserProfile) => void;
  isVerified?: boolean;
}

export const Vault: React.FC<VaultProps> = ({ user, documents, saveDocuments, updateUser, isVerified }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [keypadNumbers, setKeypadNumbers] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Upgrade Request State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [requestedGb, setRequestedGb] = useState('50');
  const [requestReason, setRequestReason] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const CORRECT_PIN = user.vaultPin || "1234"; 

  const shuffleKeypad = () => {
    setKeypadNumbers(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    shuffleKeypad();
  }, []);

  useEffect(() => {
    let interval: any;
    if (lockoutTime > Date.now()) {
        interval = setInterval(() => {
            const diff = Math.ceil((lockoutTime - Date.now()) / 1000);
            if (diff <= 0) {
                setLockoutTime(0);
                setFailedAttempts(0);
                setError('');
                shuffleKeypad();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  useEffect(() => {
    const activeDocs = documents.filter(d => !d.deletedAt);
    const usedBytes = activeDocs.reduce((acc, doc) => acc + (doc.size || 0), 0);
    if (user.storageUsedBytes !== usedBytes) {
      updateUser({ ...user, storageUsedBytes: usedBytes });
    }
  }, [documents]);

  const handleUnlock = () => {
    if (lockoutTime > Date.now()) return;
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      setError('');
      setFailedAttempts(0);
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setPin('');
      if (attempts >= 3) {
          setLockoutTime(Date.now() + 30000);
          setError("Too many failed attempts.");
      } else {
          setError(`Incorrect PIN. ${3 - attempts} attempts left.`);
          shuffleKeypad();
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSendRequest = () => {
    if (!requestedGb || !requestReason) return;
    setIsSendingRequest(true);
    
    const request: ChangeRequest = {
        id: Date.now().toString(),
        userId: user.email, // using email as id for now
        username: user.name,
        type: 'STORAGE',
        details: `Request ${requestedGb}GB upgrade. Reason: ${requestReason}`,
        status: 'PENDING',
        createdAt: Date.now()
    };
    
    const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    localStorage.setItem('studentpocket_requests', JSON.stringify([...existing, request]));
    
    setTimeout(() => {
        setIsSendingRequest(false);
        setShowUpgradeModal(false);
        alert("Signal Transmitted. Sushil will review your request in the Command Center.");
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const limitBytes = user.storageLimitGB * 1024 ** 3;
    if (user.storageUsedBytes + file.size > limitBytes) {
        alert("Node capacity reached. Transmission blocked. Request more GB from Sushil.");
        setShowUpgradeModal(true);
        return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      let type: VaultDocument['type'] = 'OTHER';
      if (file.type.startsWith('image/')) type = 'IMAGE';
      else if (file.type.startsWith('video/')) type = 'VIDEO';
      else if (file.type.includes('json') || file.type.includes('sql') || file.type.includes('csv')) type = 'DATA';

      const newDoc: VaultDocument = {
        id: Date.now().toString(),
        title: file.name,
        type,
        content: reader.result as string,
        parentId: currentFolderId,
        size: file.size,
        mimeType: file.type,
        createdAt: Date.now()
      };
      saveDocuments([...documents, newDoc]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const activeItems = documents.filter(doc => !doc.deletedAt);
  const trashItems = documents.filter(doc => doc.deletedAt);
  const displayedItems = showTrash ? trashItems : activeItems.filter(doc => {
      if (searchQuery) return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      return doc.parentId === currentFolderId;
  });

  const usedPercentage = Math.min((user.storageUsedBytes / (user.storageLimitGB * 1024 ** 3)) * 100, 100);

  if (!isUnlocked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center relative overflow-hidden border border-slate-100 dark:border-slate-800">
          {lockoutTime > Date.now() && (
              <div className="absolute inset-0 bg-red-600/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-8">
                  <Lock size={48} className="mb-6 animate-bounce" />
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Lockout Active</h3>
                  <p className="font-black text-5xl mb-4">{timeLeft}s</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Protection Enabled</p>
              </div>
          )}
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Encrypted Storage</h2>
          <p className="text-slate-400 mb-8 text-[10px] font-bold uppercase tracking-widest">Enter Node Access Code</p>
          <div className="flex justify-center space-x-5 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-indigo-600 scale-150 shadow-lg shadow-indigo-200' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {keypadNumbers.map(num => (
              <button key={num} onClick={() => setPin(prev => (prev.length < 4 ? prev + num : prev))} disabled={lockoutTime > Date.now()} className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90 shadow-sm disabled:opacity-50">{num}</button>
            ))}
            <button className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center" onClick={() => setPin('')}>Clear</button>
            <button onClick={handleUnlock} disabled={lockoutTime > Date.now() || pin.length < 4} className="col-span-2 h-16 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">Unlock Node</button>
          </div>
          {error && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in flex flex-col w-full max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {showUpgradeModal && (
          <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-scale-up border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Request Upgrade</h3>
                      <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-red-500"><X size={28} /></button>
                  </div>
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Requested Target (GB)</label>
                          <input type="number" value={requestedGb} onChange={e => setRequestedGb(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xl font-black dark:text-white" placeholder="e.g. 50" />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Reason for Capacity Increase</label>
                          <textarea value={requestReason} onChange={e => setRequestReason(e.target.value)} rows={3} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white resize-none" placeholder="Explain your storage needs to Sushil..." />
                      </div>
                      <button onClick={handleSendRequest} disabled={isSendingRequest || !requestReason} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all">
                          {isSendingRequest ? <RefreshCcw className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                          Transmit Signal to Admin
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Storage Hub */}
      <div className="mb-8 bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
             <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Box size={24} />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Personal Cloud Hub</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Storage Provider: SUSHIL</p>
                 </div>
             </div>
             <div className="flex items-center space-x-4">
                <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatSize(user.storageUsedBytes)} / {user.storageLimitGB} GB
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Managed Allocation</p>
                </div>
                <button onClick={() => setShowUpgradeModal(true)} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                    <ArrowUpCircle size={20} />
                </button>
             </div>
         </div>
         <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
             <div className={`h-full bg-indigo-500 transition-all duration-1000 ${usedPercentage > 90 ? 'bg-red-500' : ''}`} style={{ width: `${usedPercentage}%` }} />
         </div>
      </div>

      <div className="flex items-center space-x-3 mb-6 w-full">
         {!showTrash && (
            <div className="flex-1 flex items-center bg-white dark:bg-[#0f172a] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Search size={20} className="text-slate-400 ml-4" />
                <input className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-700 dark:text-slate-200" placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
         )}
         <button onClick={() => setViewMode(viewMode === 'GRID' ? 'LIST' : 'GRID')} className="p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
             {viewMode === 'GRID' ? <ListIcon size={20} /> : <LayoutGrid size={20} />}
         </button>
         <button onClick={() => { setShowTrash(!showTrash); setCurrentFolderId(null); }} className={`p-4 rounded-2xl transition-all shadow-sm ${showTrash ? 'bg-red-600 text-white' : 'bg-white dark:bg-[#0f172a] text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-red-500'}`}>
             <Archive size={20} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-10 no-scrollbar">
          {!showTrash && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button onClick={() => { const name = prompt("Name Folder:"); if(name) saveDocuments([...documents, { id: Date.now().toString(), title: name, type: 'FOLDER', parentId: currentFolderId, size: 0, createdAt: Date.now() }]) }} className="flex items-center justify-center space-x-3 bg-white dark:bg-[#0f172a] text-slate-500 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                    <FolderPlus size={24} />
                    <span className="font-black text-xs uppercase tracking-widest">New Folder</span>
                </button>
                <label className={`flex items-center justify-center space-x-3 p-6 rounded-[2.5rem] shadow-xl transition-all cursor-pointer active:scale-95 ${isUploading ? 'bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}>
                    <CloudUpload size={24} className={isUploading ? 'animate-bounce' : ''} />
                    <span className="font-black text-xs uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Upload File'}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/*,video/*,.pdf,.sql,.json,.csv" />
                </label>
            </div>
          )}

          {displayedItems.length === 0 ? (
              <div className="text-center py-24 opacity-20">
                  <Box size={80} className="mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">{showTrash ? "Trash is empty." : "Folder is empty."}</p>
              </div>
          ) : (
             <div className={viewMode === 'GRID' ? "grid grid-cols-2 lg:grid-cols-4 gap-4" : "flex flex-col space-y-3"}>
                 {displayedItems.map(item => (
                     <div key={item.id} onClick={() => { if (item.type === 'FOLDER' && !showTrash) setCurrentFolderId(item.id); }} className={`group relative bg-white dark:bg-[#0f172a] rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer ${viewMode === 'GRID' ? 'flex flex-col items-center text-center h-48 justify-center' : 'flex items-center'}`}>
                         <div className={`rounded-2xl flex items-center justify-center mb-4 ${viewMode === 'GRID' ? 'w-16 h-16' : 'w-12 h-12 mr-6'} ${item.type === 'FOLDER' ? 'bg-amber-50 text-amber-500' : item.type === 'IMAGE' ? 'bg-emerald-50 text-emerald-500' : item.type === 'VIDEO' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                             {item.type === 'IMAGE' ? <ImageIcon size={20} /> : item.type === 'VIDEO' ? <Video size={20} /> : item.type === 'FOLDER' ? <Folder size={20} fill="currentColor" /> : <FileText size={20} />}
                         </div>
                         <div className={`flex-1 min-w-0 ${viewMode === 'LIST' ? 'text-left' : ''}`}>
                             <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{item.title}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.type === 'FOLDER' ? 'Storage Box' : formatSize(item.size)}</p>
                         </div>
                     </div>
                 ))}
             </div>
          )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
          <span>Security Level 5 Active</span>
          <button onClick={() => setIsUnlocked(false)} className="flex items-center text-red-400 hover:text-red-500 transition-colors"><Lock size={12} className="mr-2" /> Session Lockout</button>
      </div>
    </div>
  );
};
