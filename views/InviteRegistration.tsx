import React, { useState } from 'react';
import { View, UserProfile } from '../types';
import { ShieldCheck, User, Lock, Mail, Send, Loader2, ArrowLeft } from 'lucide-react';
import { DEFAULT_USER, SYSTEM_UPGRADE_TOKEN } from '../constants';
import { storageService } from '../services/storageService';

interface InviteRegistrationProps {
  onRegister: (username: string) => void;
  onNavigate: (view: View) => void;
}

export const InviteRegistration: React.FC<InviteRegistrationProps> = ({ onRegister, onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    inviteCode: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate validation and registration
    setTimeout(async () => {
      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      if (users[formData.username]) {
        alert("Username already exists.");
        setSubmitting(false);
        return;
      }

      users[formData.username] = {
        password: formData.password,
        email: formData.email,
        name: formData.fullName,
        verified: true
      };
      localStorage.setItem('studentpocket_users', JSON.stringify(users));

      const profile: UserProfile = {
        ...DEFAULT_USER,
        name: formData.fullName,
        email: formData.email,
        isVerified: true,
        verificationStatus: 'VERIFIED',
        acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN
      };

      await storageService.setData(`architect_data_${formData.username}`, {
        user: profile,
        chatHistory: [],
        vaultDocs: []
      });

      setSubmitting(false);
      onRegister(formData.username);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-start sm:justify-center py-20 px-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
        <div className="p-10 md:p-12 text-center bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-white/5">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Invite</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Create Your Student Node</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-6">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="FULL NAME" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold text-xs tracking-widest"
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required
            />
            <input 
              type="text" 
              placeholder="USERNAME" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold text-xs tracking-widest"
              onChange={e => setFormData({...formData, username: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="SECRET CODE" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold text-xs tracking-widest"
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold text-xs tracking-widest"
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Initialize Registration'}
          </button>
          
          <button type="button" onClick={() => window.location.href = '/'} className="w-full text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-500">
             Already have an account? Login
          </button>
        </form>
      </div>
    </div>
  );
};