
import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { ShieldCheck, Loader2, ArrowLeft, Zap, Upload, User, Video, MapPin, Phone, Mail, Globe } from 'lucide-react';

interface VerificationFormProps {
  user: UserProfile;
  username: string;
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, username, updateUser, onNavigate }) => {
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate Required Fields (Video is optional)
    if (!formData.fullName || !formData.email || !formData.phone || !formData.permAddress || !formData.tempAddress || !formData.country || !profileImage) {
        alert("Please complete all required fields and upload a profile picture.");
        return;
    }
    
    setSubmitting(true);
    
    // Construct Details Payload
    const finalDetails = {
        ...formData,
        _profileImage: profileImage,     
        _videoFile: videoFile || null,  // Optional
        _submissionTime: new Date().toISOString()
    };
    
    const request: ChangeRequest = {
      id: 'REQ-' + Date.now(),
      userId: username,
      username: username,
      type: 'VERIFICATION',
      details: JSON.stringify(finalDetails),
      status: 'PENDING',
      createdAt: Date.now()
    };

    const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    localStorage.setItem('studentpocket_requests', JSON.stringify([...existing, request]));

    setTimeout(() => {
      updateUser({ ...user, verificationStatus: 'PENDING_APPROVAL' });
      setSubmitting(false);
      
      // Post-submission Logic
      const linkId = Math.random().toString(36).substring(7);
      const message = `
      Professional Submission Complete.
      
      A secure verification link has been generated:
      https://studentpocket.app/verify/${linkId}
      
      This link has been sent to: ${formData.email}
      
      WARNING: For security, this link is valid for only 2 seconds.
      `;
      
      alert(message);
      onNavigate(View.DASHBOARD);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 font-black text-[10px] uppercase tracking-[0.3em] transition-all group bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-indigo-600/30">
        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> CANCEL
      </button>

      <div className="bg-white dark:bg-[#0f172a] rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-slate-100 dark:border-white/5 pb-10 relative z-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20 flex-shrink-0 p-4">
             <User size={32} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Student Application</h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em] mt-4">Official Submission</p>
          </div>
        </div>

        <div className="mb-12 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl flex items-start gap-4 relative z-10">
            <ShieldCheck className="text-blue-500 flex-shrink-0 mt-1" size={24} />
            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed uppercase tracking-wide">
                Please ensure all permanent information is accurate. An admin will review your submission via a secure timed link.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-6">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs">1</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Personal Information</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-xs uppercase tracking-widest dark:text-white" placeholder="ENTER NAME" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-xs uppercase tracking-widest dark:text-white" placeholder="ENTER EMAIL" required />
                    </div>
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-xs uppercase tracking-widest dark:text-white" placeholder="ENTER PHONE" required />
                    </div>
                 </div>
             </div>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-white/5"></div>

          {/* Section 2: Location */}
          <div className="space-y-6">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs">2</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Location Data</h3>
             </div>

             <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4">Permanent Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input name="permAddress" value={formData.permAddress} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-xs uppercase tracking-widest dark:text-white" placeholder="PERMANENT RESIDENCE" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4">Temporary Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input name="tempAddress" value={formData.tempAddress} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-xs uppercase tracking-widest dark:text-white" placeholder="CURRENT LOCATION" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4">Country</label>
                    <div className="relative">
                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input name="country" value={formData.country} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-xs uppercase tracking-widest dark:text-white" placeholder="COUNTRY OF RESIDENCE" required />
                    </div>
                 </div>
             </div>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-white/5"></div>

          {/* Section 3: Media */}
          <div className="space-y-6">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs">3</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Media Uploads</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Profile Picture (Required) */}
                 <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 text-center">
                     <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Profile Picture <span className="text-red-500">*</span></p>
                     
                     {profileImage ? (
                         <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl group mt-4">
                             <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                             <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload className="text-white" size={24} />
                                <input type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                             </label>
                         </div>
                     ) : (
                         <label className="cursor-pointer block mt-4">
                             <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                 <User size={24} className="text-slate-400 mb-2"/>
                                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Upload Photo</span>
                             </div>
                             <input type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                         </label>
                     )}
                 </div>

                 {/* Video (Optional) */}
                 <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 text-center">
                     <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Introduction Video <span className="text-slate-400 font-bold text-[9px]">(OPTIONAL)</span></p>
                     
                     {videoFile ? (
                         <div className="relative w-full h-32 mx-auto rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl group mt-4 flex items-center justify-center bg-black">
                             <p className="text-white text-[9px] font-black uppercase tracking-widest">Video Loaded</p>
                             <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload className="text-white" size={24} />
                                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                             </label>
                         </div>
                     ) : (
                         <label className="cursor-pointer block mt-4">
                             <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                 <Video size={24} className="text-slate-400 mb-2"/>
                                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Upload Video</span>
                             </div>
                             <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                         </label>
                     )}
                 </div>
             </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group mt-8"
          >
            {submitting ? <Loader2 className="animate-spin mr-4" /> : <Zap size={20} className="mr-4 group-hover:scale-125 transition-transform" />}
            {submitting ? 'GENERATING LINK...' : 'SUBMIT APPLICATION'}
          </button>
        </form>
      </div>
    </div>
  );
};
