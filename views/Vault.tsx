
import React, { useState, useEffect } from 'react';
import { UserProfile, VaultDocument } from '../types';
import { Shield, Lock, Unlock, FileText, Image as ImageIcon, Camera, AlertTriangle, FolderPlus, Folder, ChevronRight, Home, LayoutGrid, List as ListIcon, MoreVertical, Search, ArrowLeft, HardDrive, Trash2, Download, Archive, RefreshCcw } from 'lucide-react';

interface VaultProps {
  user: UserProfile;
  documents: VaultDocument[];
  saveDocuments: (docs: VaultDocument[]) => void;
  isVerified?: boolean;
}

export const Vault: React.FC<VaultProps> = ({ user, documents, saveDocuments, isVerified }) => {
  // Security State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [keypadNumbers, setKeypadNumbers] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // File Manager State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  const CORRECT_PIN = user.vaultPin || "1234"; 

  // Shuffle Keypad Helper
  const shuffleKeypad = () => {
    setKeypadNumbers(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // Initialize Keypad
  useEffect(() => {
    shuffleKeypad();
  }, []);

  // Lockout Timer Logic
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

  // Locked View for Unverified Users
  if (isVerified === false) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-6">
              <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl w-full max-w-sm text-center border-2 border-yellow-100">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Lock className="w-10 h-10 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Locked</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                      The Document Vault is for verified students only.
                  </p>
                  <button className="w-full bg-yellow-100 text-yellow-800 py-3 rounded-xl font-bold text-sm">Request Access</button>
              </div>
          </div>
      );
  }

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
          setLockoutTime(Date.now() + 30000); // 30 seconds
          setError("Too many failed attempts.");
      } else {
          setError(`Incorrect PIN. ${3 - attempts} attempts remaining.`);
          shuffleKeypad(); // Reshuffle on error to prevent pattern guessing
      }
    }
  };

  // --- FILE MANAGER LOGIC ---

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const createFolder = () => {
      const name = prompt("Enter folder name:");
      if (!name) return;
      const newFolder: VaultDocument = {
          id: Date.now().toString(),
          title: name,
          type: 'FOLDER',
          parentId: currentFolderId,
          createdAt: Date.now(),
          size: 0
      };
      saveDocuments([...documents, newFolder]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: VaultDocument = {
          id: Date.now().toString(),
          title: file.name,
          type: 'OTHER',
          content: reader.result as string,
          parentId: currentFolderId,
          size: file.size,
          mimeType: file.type,
          createdAt: Date.now()
        };
        saveDocuments([...documents, newDoc]);
      };
      reader.readAsDataURL(file);
    }
  };

  const softDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm("Move to Trash?")) {
           // Also soft delete children if folder
           saveDocuments(documents.map(d => 
               (d.id === id || d.parentId === id) ? { ...d, deletedAt: Date.now() } : d
           ));
      }
  };

  const restoreDoc = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      saveDocuments(documents.map(d => d.id === id ? { ...d, deletedAt: undefined } : d));
  };

  const permanentDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm("Permanently delete? Cannot undo.")) {
          saveDocuments(documents.filter(d => d.id !== id && d.parentId !== id));
      }
  };

  const handleDownload = (doc: VaultDocument, e: React.MouseEvent) => {
      e.stopPropagation();
      if (doc.type === 'FOLDER' || !doc.content) return;
      const link = document.createElement('a');
      link.href = doc.content;
      link.download = doc.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Filter items
  const activeItems = documents.filter(doc => !doc.deletedAt);
  const trashItems = documents.filter(doc => doc.deletedAt);

  const displayedItems = showTrash ? trashItems : activeItems.filter(doc => {
      if (searchQuery) return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      return doc.parentId === (currentFolderId || undefined) || doc.parentId === currentFolderId;
  });

  // Calculate Storage
  const usedSpace = activeItems.reduce((acc, doc) => acc + (doc.size || 0), 0);
  const totalSpace = 2 * 1024 * 1024 * 1024; // 2GB Limit
  const usedPercentage = Math.min((usedSpace / totalSpace) * 100, 100);

  // Breadcrumbs
  const getBreadcrumbs = () => {
      const path = [];
      let curr = currentFolderId;
      while (curr) {
          const folder = documents.find(d => d.id === curr);
          if (folder) {
              path.unshift(folder);
              curr = folder.parentId || null;
          } else {
              break;
          }
      }
      return path;
  };

  if (!isUnlocked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center relative overflow-hidden">
          
          {lockoutTime > Date.now() && (
              <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white">
                  <Lock size={48} className="mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold mb-2">Vault Locked</h3>
                  <p className="font-mono text-4xl font-bold">{timeLeft}s</p>
                  <p className="text-sm mt-2 opacity-80">Security Timeout</p>
              </div>
          )}

          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Secure Vault</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs">Enter your 4-digit PIN</p>
          
          <div className="flex justify-center space-x-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-indigo-600 scale-125' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {keypadNumbers.map(num => (
              <button 
                key={num}
                onClick={() => setPin(prev => (prev.length < 4 ? prev + num : prev))}
                disabled={lockoutTime > Date.now()}
                className="h-14 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-transform shadow-sm disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            
            <button className="h-14 text-red-500 font-bold text-xs uppercase tracking-wide flex items-center justify-center" onClick={() => setPin('')}>Clear</button>
            <button 
                onClick={handleUnlock} 
                disabled={lockoutTime > Date.now()}
                className="col-span-2 h-14 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
            >
                Unlock
            </button>
          </div>
          {error && <p className="text-red-500 text-xs font-bold mt-2 animate-shake">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header / Storage Info */}
      <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="flex justify-between items-center mb-3">
             <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                 <HardDrive size={20} />
                 <span className="font-bold text-sm">Cloud Storage</span>
             </div>
             <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                 {formatSize(usedSpace)} / 2 GB
             </span>
         </div>
         <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${usedPercentage}%` }} />
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar py-1">
         {currentFolderId && !showTrash && (
             <button onClick={() => setCurrentFolderId(null)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                 <Home size={20} />
             </button>
         )}
         
         {!showTrash && (
            <div className="flex-1 flex items-center bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <Search size={18} className="text-gray-400 ml-2" />
                <input 
                className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-gray-700 dark:text-gray-200" 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
         )}
         
         {showTrash && <div className="flex-1 font-bold text-red-500 text-lg ml-2">Trash Bin</div>}

         <button onClick={() => setViewMode(viewMode === 'GRID' ? 'LIST' : 'GRID')} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
             {viewMode === 'GRID' ? <ListIcon size={20} /> : <LayoutGrid size={20} />}
         </button>

         <button 
            onClick={() => { setShowTrash(!showTrash); setCurrentFolderId(null); }}
            className={`p-3 rounded-xl transition-colors ${showTrash ? 'bg-red-100 text-red-600' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-red-500'}`}
         >
             <Archive size={20} />
         </button>
      </div>

      {/* Breadcrumbs (only if not in trash) */}
      {!showTrash && (
        <div className="flex items-center space-x-1 mb-4 text-sm overflow-x-auto no-scrollbar whitespace-nowrap">
            <button 
                onClick={() => setCurrentFolderId(null)} 
                className={`font-medium ${!currentFolderId ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                Home
            </button>
            {getBreadcrumbs().map((folder) => (
                <div key={folder.id} className="flex items-center">
                    <ChevronRight size={14} className="text-gray-300 mx-1" />
                    <button 
                        onClick={() => setCurrentFolderId(folder.id)}
                        className={`font-medium ${currentFolderId === folder.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        {folder.title}
                    </button>
                </div>
            ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-20">
          
          {/* Action Buttons inside content area for empty states */}
          {!showTrash && (
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                    onClick={createFolder} 
                    className="flex items-center justify-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                    <FolderPlus size={20} />
                    <span className="font-bold text-sm">New Folder</span>
                </button>
                
                <label className="flex items-center justify-center space-x-2 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95">
                    <div className="flex items-center space-x-2">
                        <ImageIcon size={20} />
                        <span className="font-bold text-sm">Upload</span>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>
          )}

          {displayedItems.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                  <Folder size={48} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm font-medium">{showTrash ? "Trash is empty" : "This folder is empty"}</p>
              </div>
          ) : (
             <div className={viewMode === 'GRID' ? "grid grid-cols-2 gap-3" : "flex flex-col space-y-2"}>
                 {displayedItems.map(item => (
                     <div 
                        key={item.id}
                        onClick={() => {
                            if (item.type === 'FOLDER' && !showTrash) setCurrentFolderId(item.id);
                        }}
                        className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                            viewMode === 'GRID' ? 'flex flex-col items-center text-center h-32 justify-center' : 'flex items-center p-4'
                        } ${showTrash ? 'opacity-80 border-red-50 bg-red-50/10' : ''}`}
                     >
                         <div className={`rounded-full flex items-center justify-center mb-2 ${
                             viewMode === 'GRID' ? 'w-12 h-12' : 'w-10 h-10 mr-4 mb-0'
                         } ${
                             item.type === 'FOLDER' 
                             ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500' 
                             : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                         }`}>
                             {item.type === 'FOLDER' ? <Folder size={viewMode === 'GRID' ? 24 : 20} fill="currentColor" className="fill-current opacity-80" /> : <FileText size={viewMode === 'GRID' ? 24 : 20} />}
                         </div>
                         
                         <div className={`flex-1 min-w-0 ${viewMode === 'LIST' ? 'text-left' : ''}`}>
                             <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate w-full">{item.title}</p>
                             <p className="text-[10px] text-gray-400 mt-0.5">
                                 {showTrash ? 'Deleted' : (item.type === 'FOLDER' ? 'Folder' : `${formatSize(item.size)}`)}
                             </p>
                         </div>

                         {/* Quick Actions */}
                         <div className={`absolute ${viewMode === 'GRID' ? 'top-2 right-2' : 'right-4'} ${showTrash ? 'flex' : 'hidden group-hover:flex'} items-center space-x-1`}>
                             {showTrash ? (
                                <>
                                 <button onClick={(e) => restoreDoc(item.id, e)} className="p-1.5 bg-white text-green-600 rounded-lg shadow-sm hover:bg-green-50" title="Restore"><RefreshCcw size={14} /></button>
                                 <button onClick={(e) => permanentDelete(item.id, e)} className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50" title="Delete Forever"><Trash2 size={14} /></button>
                                </>
                             ) : (
                                <>
                                 {item.type !== 'FOLDER' && (
                                     <button onClick={(e) => handleDownload(item, e)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-600">
                                         <Download size={14} />
                                     </button>
                                 )}
                                 <button onClick={(e) => softDelete(item.id, e)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600">
                                     <Trash2 size={14} />
                                 </button>
                                </>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
          )}
      </div>

      <button 
         onClick={() => setIsUnlocked(false)} 
         className="mt-auto w-full py-4 text-gray-400 dark:text-gray-500 font-bold flex items-center justify-center hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-900/50 rounded-t-3xl border-t border-gray-100 dark:border-gray-800"
      >
        <Lock size={16} className="mr-2" /> Lock Vault
      </button>
    </div>
  );
};
