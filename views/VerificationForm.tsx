
import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { ShieldCheck, Loader2, ArrowLeft, Send, Upload, User, Video, MapPin, Phone, Mail, Globe, FileText, CheckCircle, Copy, Check, Info, KeyRound, LogIn, Lock } from 'lucide-react';
import { storageService } from '../services/storageService';

interface VerificationFormProps {
  user: UserProfile;
  username: string;
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, username, updateUser, onNavigate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState<{ id: string; studentId: string; link: string } | null>(null);
  
  // Permanent Fields State
  const [formData, setFormData] = useState({
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      permAddress: '',
      tempAddress: '',
      country: ''
  });

  // Media State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile("Video_Uploaded_Mock_Path"); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.permAddress || !formData.tempAddress || !formData.country || !profileImage) {
        alert("Compliance Error: All permanent fields and profile picture are required.");
        return;
    }
    
    setSubmitting(true);
    
    // Generate Secure Link ID & Student ID
    const linkId = Math.random().toString(36).substring(7);
    const generatedStudentId = `STU-${Math.floor(100000 + Math.random() * 900000)}`;

    const finalDetails = {
        ...formData,
        generatedStudentId: generatedStudentId,
        _profileImage: profileImage,     
        _videoFile: videoFile || null,
        _submissionTime: new Date().toISOString()
    };

    // --- AUTOMATED DETECTION SYSTEM ---
    let autoFlagged = false;
    let autoFlagReason = "";

    if (formData.fullName.length < 3) {
        autoFlagged = true;
        autoFlagReason += "Name too short. ";
    }
    if (!formData.email.includes("@")) {
        autoFlagged = true;
        autoFlagReason += "Invalid Email Format. ";
    }
    if (formData.phone.length < 5) {
        autoFlagged = true;
        autoFlagReason += "Invalid Phone. ";
    }
    // ----------------------------------
    
    // Save request to LocalStorage (persistence for admin)
    const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    // Cancel old pending requests
    const pendingIndex = existing.findIndex((r: any) => r.username === username && r.status === 'PENDING');
    
    let request: ChangeRequest;

    if (pendingIndex !== -1) {
        request = existing[pendingIndex];
        request.details = JSON.stringify(finalDetails);
        request.createdAt = Date.now();
        request.linkId = linkId;
        request.generatedStudentId = generatedStudentId;
        request.autoFlagged = autoFlagged;
        request.autoFlagReason = autoFlagReason;
        existing[pendingIndex] = request;
    } else {
        request = {
            id: 'REQ-' + Date.now(),
            userId: username,
            username: username,
            type: 'VERIFICATION',
            details: JSON.stringify(finalDetails),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: linkId,
            generatedStudentId: generatedStudentId,
            autoFlagged: autoFlagged,
            autoFlagReason: autoFlagReason
        };
        existing.push(request);
    }

    localStorage.setItem('studentpocket_requests', JSON.stringify(existing));

    setTimeout(async () => {
      // Create a new user profile object with the generated ID for redundancy
      const updatedProfile: UserProfile = { 
          ...user, 
          verificationStatus: 'PENDING_APPROVAL',
          studentId: generatedStudentId,
          // If automatically flagged, we might not want to wipe previous level immediately, but for security we reset to 0
          level: 0 
      };
      
      // Update local state
      updateUser(updatedProfile);
      
      // Update database persistence immediately
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey) || {};
      await storageService.setData(dataKey, { ...stored, user: updatedProfile });

      setSubmitting(false);
      const origin = window.location.origin;
      const link = `${origin}/v/${linkId}`;
      setSuccessState({ id: linkId, studentId: generatedStudentId, link });
      
      // IMPORTANT: Trigger app reload to enforce the "VerificationPending" view lockout
      // In a real SPA we might use a context state update, but reload ensures auth state is checked fresh
      setTimeout(() => {
         window.location.href = '/'; 
      }, 5000); // Give user 5 seconds to copy the link before kicking them out

    }, 1500);
  };

  if (successState) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in pt-12 pb-24 px-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 shadow-2xl border border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden">
             
             <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-xl shadow-amber-500/10 animate-scale-up">
                 <Lock size={40} strokeWidth={3} />
             </div>
             
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Security Lock Enabled</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Access Restricted during Verification</p>
             
             <div className="bg-indigo-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800 mb-8 relative group text-left">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Your Student ID
                 </div>
                 <div className="text-center mt-2">
                     <p className="text-3xl font-black text-indigo-700 dark:text-indigo-400 tracking-widest font-mono">{successState.studentId}</p>
                     <p className="text-[10px] text-slate-500 mt-2 font-medium">Save this ID. You will need it if you use the Master Key.</p>
                 </div>
             </div>
             
             <div className="space-y-4">
                 <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Verification Link (Save this!)</p>
                     <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-2 truncate bg-white dark:bg-black p-2 rounded border border-slate-100 dark:border-slate-800 select-all">{successState.link}</p>
                 </div>

                 <p className="text-xs text-red-500 font-bold mt-4 animate-pulse">
                     You will be logged out in 5 seconds for security screening.
                 </p>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-8">
          <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Cancel
          </button>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                   <ShieldCheck size={28} />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Identity Verification</h2>
                   <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Official Student Submission</p>
                </div>
            </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Permanent Info Section */}
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <span className="w-4 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span> Basic Details
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Legal Name" required />
                 </div>
                 
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Student Email" required />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number</label>
                    <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Contact Number" required />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Country</label>
                    <input name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Country of Residence" required />
                 </div>

                 <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Permanent Address</label>
                    <input name="permAddress" value={formData.permAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Full Permanent Address" required />
                 </div>

                 <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Temporary Address</label>
                    <input name="tempAddress" value={formData.tempAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all dark:text-white" placeholder="Current / Temporary Address" required />
                 </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Media Section */}
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <span className="w-4 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span> Documents
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Profile Picture */}
                 <div className="space-y-2">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Profile Picture <span className="text-red-500">*</span></p>
                     <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative group">
                         {profileImage ? (
                             <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white shadow-lg">
                                 <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                             </div>
                         ) : (
                             <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden p-6">
                                 <User size={32} />
                             </div>
                         )}
                         <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2">{profileImage ? 'Click to Change' : 'Upload Photo'}</p>
                         <input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required={!profileImage} />
                     </div>
                 </div>

                 {/* Video Upload */}
                 <div className="space-y-2">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Intro Video <span className="text-slate-400">(Optional)</span></p>
                     <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative group h-full flex flex-col justify-center items-center">
                         {videoFile ? (
                             <div className="flex items-center justify-center text-emerald-600">
                                 <FileText size={32} className="mr-2"/>
                                 <span className="font-bold text-sm">Selected</span>
                             </div>
                         ) : (
                             <>
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                     <Video size={20} />
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload Video</p>
                             </>
                         )}
                         <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     </div>
                 </div>
             </div>
          </div>

          <div className="pt-4">
            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center"
            >
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
                {submitting ? 'Generating...' : 'Submit & Start Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
