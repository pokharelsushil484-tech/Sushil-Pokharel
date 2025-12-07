
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

  // Default PIN for simulation if not set in profile
  const CORRECT_PIN = user.vaultPin || "1234"; 
  
  // LOCK FOR UNVERIFIED USERS
  if (isVerified === false) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-yellow-200">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Feature Locked</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                      The Document Vault is restricted to verified students only. Please request verification from your Dashboard.
                  </p>
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
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Student Vault Locked</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Enter PIN to access your certificates and IDs.</p>
          
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < pin.length ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                onClick={() => setPin(prev => (prev.length < 4 ? prev + num : prev))}
                className="h-14 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200"
              >
                {num}
              </button>
            ))}
            <button className="h-14 text-gray-500 dark:text-gray-400 font-medium" onClick={() => setPin('')}>Clear</button>
            <button 
              onClick={() => setPin(prev => (prev.length < 4 ? prev + '0' : prev))}
              className="h-14 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold text-xl text-gray-700 dark:text-gray-200"
            >
              0
            </button>
            <button onClick={handleUnlock} className="h-14 text-indigo-600 dark:text-indigo-400 font-bold">Enter</button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-fade-in">
      <div className="bg-indigo-600 dark:bg-indigo-800 -mx-4 -mt-4 p-8 rounded-b-3xl text-white mb-6 shadow-lg shadow-indigo-200 dark:shadow-none">
        <div className="flex justify-between items-start">
          <div>
             <h1 className="text-2xl font-bold">Document Vault</h1>
             <p className="text-indigo-100 text-sm opacity-80">Secure storage for {user.name}</p>
          </div>
          <Shield className="w-8 h-8 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Upload Card */}
        <label className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
            <ImageIcon className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Upload File</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
        </label>

        {/* Camera Scan Card */}
        <label className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
            <Camera className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Scan Doc</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" capture="environment" />
        </label>

        {documents.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-40 justify-between">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{doc.title}</h4>
              <p className="text-xs text-gray-400 uppercase">{doc.type}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={() => setIsUnlocked(false)} className="mt-8 w-full py-3 text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center hover:text-indigo-500">
        <Lock size={14} className="mr-1" /> Lock Vault
      </button>
    </div>
  );
};
