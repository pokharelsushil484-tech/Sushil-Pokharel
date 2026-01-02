
import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { ShieldCheck, Loader2, ArrowLeft, Send, Upload, User, Video, MapPin, Phone, Mail, Globe, FileText, CheckCircle } from 'lucide-react';
import { SYSTEM_DOMAIN } from '../constants';

interface VerificationFormProps {
  user: UserProfile;
  username: string;
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, username, updateUser, onNavigate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState<{ link: string; email: string } | null>(null);
  
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
      // Mock video storage (real video blob too large for localStorage typically)
      // in a real app, upload to cloud and store URL.
      setVideoFile("Video_Uploaded_Mock_Path"); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.permAddress || !formData.tempAddress || !formData.country || !profileImage) {
        alert("Compliance Error: All permanent fields and profile picture are required.");
        return;
    }
    
    setSubmitting(true);
    
    // Generate a secure unique ID
    const linkId = Math.random().toString(36).substring(7);

    const finalDetails = {
        ...formData,
        _profileImage: profileImage,     
        _videoFile: videoFile || null,
        _submissionTime: new Date().toISOString()
    };
    
    // Update existing request if pending, or create new
    const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    const pendingIndex = existing.findIndex((r: any) => r.username === username && r.status === 'PENDING');
    
    let request: ChangeRequest;

    if (pendingIndex !== -1) {
        // Update existing pending request
        request = existing[pendingIndex];
        request.details = JSON.stringify(finalDetails);
        request.createdAt = Date.now();
        
        // Archive old link ID if replacing
        if (request.linkId) {
             if (!request.previousLinkIds) request.previousLinkIds = [];
             request.previousLinkIds.push(request.linkId);
        }
        request.linkId = linkId;
        existing[pendingIndex] = request;
    } else {
        // Create new request
        request = {
            id: 'REQ-' + Date.now(),
            userId: username,
            username: username,
            type: 'VERIFICATION',
            details: JSON.stringify(finalDetails),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: linkId
        };
        existing.push(request);
    }

    localStorage.setItem('studentpocket_requests', JSON.stringify(existing));

    setTimeout(() => {
      updateUser({ ...user, verificationStatus: 'PENDING_APPROVAL' });
      setSubmitting(false);
      
      const link = `https://${SYSTEM_DOMAIN}/v/${linkId}`;
      
      // Instead of alert and redirect, show the Verification Box
      setSuccessState({ link, email: formData.email });
    }, 1500);
  };

  if (successState) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in pt-12 pb-24 px-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl border border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
             
             <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-xl shadow-emerald-500/10 animate-scale-up">
                 <CheckCircle size={48} strokeWidth={3} />
             </div>
             
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">Submission Success</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">System has received your data</p>
             
             <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-10 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Generated Secure Link
                 </div>
                 <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono break-all mb-6 select-all">{successState.link}</p>
                 
                 <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Loader2 size={12} className="animate-spin text-indigo-500" />
                        <span>Awaiting Admin Approval</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email: {successState.email}</p>
                 </div>
             </div>

             <button 
                onClick={() => onNavigate(View.DASHBOARD)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
             >
                Return to Dashboard
             </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-8">
          <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Return to Dashboard
          </button>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-8 md:p-10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                   <ShieldCheck size={32} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Identity Verification</h2>
                   <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-2">Official Student Submission Portal</p>
                </div>
            </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          
          {/* Permanent Info Section */}
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <span className="w-6 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span> Permanent Information
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all" placeholder="Legal Name" required />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all" placeholder="Student Email" required />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all" placeholder="Contact Number" required />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Country</label>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="country" value={formData.country} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all" placeholder="Country of Residence" required />
                    </div>
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Permanent Address</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="permAddress" value={formData.permAddress} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all" placeholder="Full Permanent Address" required />
                    </div>
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Temporary Address</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input name="tempAddress" value={formData.tempAddress} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-medium text-sm transition-all" placeholder="Current / Temporary Address" required />
                    </div>
                 </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Media Section */}
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                <span className="w-6 h-px bg-slate-300 dark:bg-slate-700 mr-3"></span> Media Uploads
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Profile Picture */}
                 <div className="space-y-4">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Profile Picture <span className="text-red-500">*</span></p>
                     <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative group">
                         {profileImage ? (
                             <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                                 <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                             </div>
                         ) : (
                             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                 <User size={24} />
                             </div>
                         )}
                         <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2">{profileImage ? 'Click to Change' : 'Upload Photo'}</p>
                         <input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required={!profileImage} />
                     </div>
                 </div>

                 {/* Video Upload */}
                 <div className="space-y-4">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Introduction Video <span className="text-slate-400">(Optional)</span></p>
                     <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative group h-full flex flex-col justify-center items-center">
                         {videoFile ? (
                             <div className="flex items-center justify-center text-emerald-600">
                                 <FileText size={32} className="mr-2"/>
                                 <span className="font-bold text-sm">Video Selected</span>
                             </div>
                         ) : (
                             <>
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                     <Video size={24} />
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload Video</p>
                             </>
                         )}
                         <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
                {submitting ? 'Generating Link...' : 'Submit & Generate Link'}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-4">
                Secure 2-Second Verification Protocol
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
