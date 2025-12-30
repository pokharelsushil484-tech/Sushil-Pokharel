
import React, { useState, useEffect } from 'react';
import { UserProfile, VaultDocument, ChangeRequest } from '../types';
import { Shield, Lock, FileText, Image as ImageIcon, Video, FolderPlus, Folder, Search, HardDrive, Archive, RefreshCcw, Box, CloudUpload, ArrowUpCircle, Send, X, AlertCircle, Infinity } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [requestedGb, setRequestedGb] = useState('50');
  const [requestReason, setRequestReason] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const isAdmin = user.email === "sushil@workspace.local"; // Consistent with Admin Identity
  const CORRECT_PIN = user.vaultPin || "1234"; 

  useEffect(() => {
    setKeypadNumbers(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    let interval: any;
    if (lockoutTime > Date.now()) {
        interval = setInterval(() => {
            const diff = Math.ceil((lockoutTime - Date.now()) / 1000);
            if (diff <= 0) setLockoutTime(0);
            else setTimeLeft(diff);
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
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      setError('');
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setPin('');
      if (attempts >= 3) {
          setLockoutTime(Date.now() + 30000);
          setError("Node Protection Enabled.");
      } else {
          setError(`Invalid Pin. ${3 - attempts} attempts remain.`);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // STRICT UPLOAD GUARD
    if (!isAdmin) {
      const limitBytes = user.storageLimitGB * 1024 ** 3;
      const remainingBytes = limitBytes - user.storageUsedBytes;
      
      if (file.size > remainingBytes) {
        alert(`NODE CAPACITY EXCEEDED\n\nTransmission Refused: File size (${formatSize(file.size)}) exceeds your remaining cluster capacity of ${formatSize(remainingBytes)}.\n\nPlease do not upload this file until the Architect increases your GBN grant.`);
        setShowUpgradeModal(true);
        return;
      }
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc: VaultDocument = {
        id: Date.now().toString(),
        title: file.name,
        type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'OTHER',
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

  const handleSendRequest = () => {
    if (!requestedGb || !requestReason) return;
    setIsSendingRequest(true);
    
    const request: ChangeRequest = {
        id: Date.now().toString(),
        userId: user.email,
        username: user.name,
        type: 'STORAGE',
        details: `Requesting node upgrade to ${requestedGb}GB. Justification: ${requestReason}`,
        status: 'PENDING',
        createdAt: Date.now()
    };
    
    const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    localStorage.setItem('studentpocket_requests', JSON.stringify([...existing, request]));
    
    setTimeout(() => {
        setIsSendingRequest(false);
        setShowUpgradeModal(false);
        alert("Signal Dispatched. The Architect will review your quota request.");
    }, 1500);
  };

  const usedPercentage = isAdmin ? 0 : Math.min((user.storageUsedBytes / (user.storageLimitGB * 1024 ** 3)) * 100, 100);
  const displayedItems = showTrash ? documents.filter(d => d.deletedAt) : documents.filter(d => !d.deletedAt && (searchQuery ? d.title.toLowerCase().includes(searchQuery.toLowerCase()) : d.parentId === currentFolderId));

  if (!isUnlocked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl w-full max-w-sm text-center relative overflow-hidden border border-slate-100 dark:border-slate-800">
          {lockoutTime > Date.now() && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-white p-8">
                  <Lock size={48} className="mb-6 text-indigo-500 animate-pulse" />
                  <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Protocol Stasis</h3>
                  <p className="font-black text-6xl mb-4 tracking-tighter">{timeLeft}s</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">Security Lock Engaged</p>
              </div>
          )}
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <Shield className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Node Vault</h2>
          <p className="text-slate-400 mb-10 text-[10px] font-black uppercase tracking-[0.4em]">Input Encryption Key</p>
          <div className="flex justify-center space-x-6 mb-12">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${i < pin.length ? 'bg-indigo-600 scale-125 shadow-xl shadow-indigo-400' : 'bg-slate-200 dark:bg-slate-800'}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {keypadNumbers.map(num => (
              <button key={num} onClick={() => setPin(prev => (prev.length < 4 ? prev + num : prev))} className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-2xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">{num}</button>
            ))}
            <button className="h-16 text-slate-400 font-black text-[9px] uppercase tracking-widest" onClick={() => setPin('')}>Clear</button>
            <button onClick={handleUnlock} disabled={pin.length < 4} className="col-span-2 h-16 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all">Unlock</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in flex flex-col w-full max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {/* PROFESSIONAL TELEMETRY HEADER */}
      <div className="mb-10 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
             <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                    <HardDrive size={32} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cluster Consumption</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">Status: Stable Interface • Managed By: SUSHIL</p>
                 </div>
             </div>
             <div className="flex items-center space-x-6">
                <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {isAdmin ? <div className="flex items-center">∞<span className="text-xs ml-2 text-indigo-500">Unlimited</span></div> : `${formatSize(user.storageUsedBytes)} / ${user.storageLimitGB} GB`}
                    </span>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">
                        {isAdmin ? 'Architectural Bypass Active' : `${usedPercentage.toFixed(1)}% Saturation`}
                    </p>
                </div>
                {!isAdmin && (
                  <button onClick={() => setShowUpgradeModal(true)} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all">
                      <ArrowUpCircle size={24} />
                  </button>
                )}
             </div>
         </div>
         <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex">
             <div className={`h-full transition-all duration-1000 ${usedPercentage > 90 ? 'bg-red-500' : usedPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: isAdmin ? '100%' : `${usedPercentage}%` }} />
         </div>
      </div>

      {/* UPLOAD & TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-4 space-y-4 md:space-y-0 mb-10">
         <div className="flex-1 w-full flex items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm px-8">
             <Search size={22} className="text-slate-400" />
             <input className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" placeholder="Search Node Segments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
         </div>
         <div className="flex space-x-4 w-full md:w-auto">
             <button onClick={() => setShowTrash(!showTrash)} className={`flex-1 md:flex-none p-5 rounded-2xl transition-all ${showTrash ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400'}`}><Archive size={24} /></button>
             <label className={`flex-1 md:flex-none p-5 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-3 ${isUploading ? 'bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                <CloudUpload size={24} className={isUploading ? 'animate-bounce' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Transmit Segment'}</span>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
             </label>
         </div>
      </div>

      {/* DOCUMENT GRID */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {displayedItems.length === 0 ? (
              <div className="text-center py-24 opacity-20">
                  <Box size={80} className="mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Data Segments Committed.</p>
              </div>
          ) : (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 {displayedItems.map(item => (
                     <div key={item.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-56 justify-between overflow-hidden relative">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.type === 'IMAGE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {item.type === 'IMAGE' ? <ImageIcon size={24} /> : <FileText size={24} />}
                         </div>
                         <div>
                             <p className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate">{item.title}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{formatSize(item.size)}</p>
                         </div>
                     </div>
                 ))}
             </div>
          )}
      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
          <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[4rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Signal Architect</h3>
                      <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-red-500"><X size={32} /></button>
                  </div>
                  <div className="space-y-8">
                      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/40 flex items-start space-x-4">
                          <AlertCircle className="text-red-600 shrink-0" size={24} />
                          <p className="text-[10px] text-red-600 font-bold uppercase leading-relaxed">Storage cluster full. Please request an infrastructure upgrade from Sushil.</p>
                      </div>
                      <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Requested Grant (GB)</label>
                          <input type="number" value={requestedGb} onChange={e => setRequestedGb(e.target.value)} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xl font-black dark:text-white outline-none border-none focus:ring-2 focus:ring-indigo-600" />
                      </div>
                      <textarea value={requestReason} onChange={e => setRequestReason(e.target.value)} rows={3} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold dark:text-white resize-none outline-none border-none" placeholder="Explain your storage needs..." />
                      <button onClick={handleSendRequest} disabled={isSendingRequest || !requestReason} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                          {isSendingRequest ? "Transmitting..." : "Transmit Quota Signal"}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
