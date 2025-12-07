import React, { useState } from 'react';
import { UserProfile, VaultDocument } from '../types';
import { Shield, Lock, Unlock, FileText, Image as ImageIcon, Camera, AlertTriangle } from 'lucide-react';

interface VaultProps {
  user: UserProfile;
  documents: VaultDocument[];
  saveDocuments: (docs: VaultDocument[]) => void;
  isVerified?: boolean;
}

export const Vault: React.FC<VaultProps> = ({ user, documents, saveDocuments, isVerified }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const CORRECT_PIN = user.vaultPin || "1234"; 
  
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
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
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
          content: reader.result as string
        };
        saveDocuments([...documents, newDoc]);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Check</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Enter PIN to access vault.</p>
          
          <div className="flex justify-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-indigo-600 scale-110' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                onClick={() => setPin(prev => (prev.length < 4 ? prev + num : prev))}
                className="h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl font-bold text-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-transform shadow-sm"
              >
                {num}
              </button>
            ))}
            <button className="h-16 text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-wide" onClick={() => setPin('')}>Clear</button>
            <button 
              onClick={() => setPin(prev => (prev.length < 4 ? prev + '0' : prev))}
              className="h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl font-bold text-2xl text-gray-700 dark:text-gray-200 shadow-sm active:scale-95 transition-transform"
            >
              0
            </button>
            <button onClick={handleUnlock} className="h-16 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wide">Enter</button>
          </div>
          {error && <p className="text-red-500 font-bold mt-4 animate-shake">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 -mx-4 md:-mx-8 -mt-8 p-10 rounded-b-[3rem] text-white mb-8 shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="flex justify-between items-start">
          <div>
             <h1 className="text-3xl font-bold mb-2">My Vault</h1>
             <p className="text-indigo-100 font-medium opacity-90 flex items-center">
                <Shield size={16} className="mr-2" />
                Secure Storage
             </p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
             <Unlock className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Upload Card */}
        <label className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 transition-all group">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400">
            <ImageIcon size={28} />
          </div>
          <span className="text-base font-bold text-gray-700 dark:text-gray-200">Upload File</span>
          <span className="text-xs text-gray-400 mt-1">Images or PDF</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
        </label>

        {/* Camera Scan Card */}
        <label className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 transition-all group">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400">
            <Camera size={28} />
          </div>
          <span className="text-base font-bold text-gray-700 dark:text-gray-200">Scan Doc</span>
          <span className="text-xs text-gray-400 mt-1">Use Camera</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" capture="environment" />
        </label>

        {documents.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-48 justify-between hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-500 dark:text-orange-400 mb-2 group-hover:bg-orange-100 transition-colors">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white text-base truncate mb-1">{doc.title}</h4>
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide">{doc.type}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button 
         onClick={() => setIsUnlocked(false)} 
         className="mt-10 w-full py-4 text-gray-400 dark:text-gray-500 font-bold flex items-center justify-center hover:text-red-500 transition-colors"
      >
        <Lock size={18} className="mr-2" /> Lock Vault Now
      </button>
    </div>
  );
};