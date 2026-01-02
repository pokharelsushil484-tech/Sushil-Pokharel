
import React, { useState } from 'react';
import { View, UserProfile } from '../types';
import { ShieldCheck, ArrowLeft, Send, Loader2, User, Lock, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { DEFAULT_USER, SYSTEM_UPGRADE_TOKEN } from '../constants';
import { storageService } from '../services/storageService';

interface InviteRegistrationProps {
  inviteCode: string;
  onNavigate: (view: View) => void;
  onRegister: (username: string) => void;
}

export const InviteRegistration: React.FC<InviteRegistrationProps> = ({ inviteCode, onNavigate, onRegister }) => {
  const [submitting, setSubmitting] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState({
      fullName: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      permAddress: '',
      tempAddress: '',
      country: '',
      education: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.username || !formData.password || !formData.email) {
        alert("Please fill in all required fields.");
        return;
    }

    setSubmitting(true);
    
    // Simulate Processing
    setTimeout(async () => {
       const cleanUsername = formData.username.trim();
       
       // 1. Create User Auth
       const usersStr = localStorage.getItem('studentpocket_users');
       const users = usersStr ? JSON.parse(usersStr) : {};
       
       if (users[cleanUsername]) {
           alert("Username already taken. Please choose another.");
           setSubmitting(false);
           return;
       }
       
       users[cleanUsername] = {
           password: formData.password,
           email: formData.email,
           name: formData.fullName,
           verified: true // Pre-verified via invite
       };
       localStorage.setItem('studentpocket_users', JSON.stringify(users));

       // 2. Create User Profile Data
       const profile: UserProfile = {
           ...DEFAULT_USER,
           name: formData.fullName,
           email: formData.email,
           phone: formData.phone,
           education: formData.education,
           isVerified: true,
           verificationStatus: 'VERIFIED',
           acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN
       };

       await storageService.setData(`architect_data_${cleanUsername}`, {
           user: profile,
           chatHistory: [],
           vaultDocs: []
       });
       
       // 3. Log Activity
       await storageService.logActivity({
           actor: cleanUsername,
           targetUser: cleanUsername,
           actionType: 'AUTH',
           description: `Invited User Registered: ${cleanUsername}`,
           metadata: `InviteCode: ${inviteCode}`
       });

       setSubmitting(false);
       onRegister(cleanUsername);

    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24 pt-10 px-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-8 md:p-10 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 mx-auto mb-6">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">StudentPocket Invitation</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-2">Secure Registration Portal</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Code: {inviteCode}
            </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          
          {/* Account Credentials */}
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <span className="w-6 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span> Account Setup
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Username <span className="text-red-500">*</span></label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="username" value={formData.username} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Choose a username" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Password <span className="text-red-500">*</span></label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="password" type="password" value={formData.password} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Secure password" required />
                    </div>
                 </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Profile Info */}
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <span className="w-6 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span> Personal Details
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name <span className="text-red-500">*</span></label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Legal Name" required />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Student Email" required />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Contact Number" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Country</label>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="country" value={formData.country} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Country of Residence" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Education</label>
                    <input name="education" value={formData.education} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Degree / Major" />
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Address</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="permAddress" value={formData.permAddress} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Full Address" />
                    </div>
                 </div>
             </div>
          </div>

          <div className="pt-6">
            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center"
            >
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
                {submitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-4">
                By registering, you agree to our Terms & Data Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
