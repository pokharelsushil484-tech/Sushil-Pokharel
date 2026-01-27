import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { ShieldCheck, Loader2, ArrowLeft, Send, User, Lock, Copy, Check } from 'lucide-react';
import { storageService } from '../services/storageService';
import { SYSTEM_DOMAIN } from '../constants';

interface VerificationFormProps {
  user: UserProfile;
  username: string;
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, username, updateUser, onNavigate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState<{ studentId: string; linkId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      permAddress: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = (link: string) => {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !profileImage) {
        alert("Institutional Requirement: Profile Node Image and Full Signature are mandatory.");
        return;
    }
    
    setSubmitting(true);
    const linkId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const generatedStudentId = `SP-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(async () => {
      const existingStr = localStorage.getItem('studentpocket_requests');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      const request: ChangeRequest = {
          id: 'REQ-' + Date.now(),
          userId: username,
          username: username,
          type: 'VERIFICATION',
          details: JSON.stringify({ ...formData, _profileImage: profileImage }),
          status: 'PENDING',
          createdAt: Date.now(),
          linkId: linkId,
          generatedStudentId: generatedStudentId
      };
      existing.push(request);
      localStorage.setItem('studentpocket_requests', JSON.stringify(existing));

      const updatedProfile: UserProfile = { 
          ...user, 
          verificationStatus: 'PENDING_APPROVAL',
          studentId: generatedStudentId,
          level: 0,
          isVerified: false // Explicitly false until admin action
      };
      
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey);
      await storageService.setData(dataKey, { ...stored, user: updatedProfile });
      
      updateUser(updatedProfile);
      setSuccessState({ studentId: generatedStudentId, linkId });
      setSubmitting(false);
    }, 1500);
  };

  if (successState) {
    const fullLink = `https://www.${SYSTEM_DOMAIN}/v/${successState.linkId}`;
    return (
      <div className="max-w-xl mx-auto pt-16 animate-platinum pb-40">
        <div className="master-box p-12 text-center border border-indigo-500/30">
             <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 text-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                 <Lock size={44} />
             </div>
             <h2 className="text-3xl font-black text-white uppercase mb-2 italic tracking-tighter">Protocol Engaged</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mb-12">Administration Review Active</p>
             
             <div className="space-y-6">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-left">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">Permanent Node Identity</p>
                    <p className="font-mono text-3xl text-white font-bold tracking-widest">{successState.studentId}</p>
                </div>

                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-left">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">Institutional Verification Link</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-black rounded-xl text-[10px] text-slate-400 font-mono break-all border border-white/5 shadow-inner">
                            {fullLink}
                        </div>
                        <button onClick={() => handleCopyLink(fullLink)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-white">
                            {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20}/>}
                        </button>
                    </div>
                </div>
             </div>

             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-10 leading-relaxed">
                 Warning: Your node will remain unverified until the administrator uses the link above to authorize your data.
             </p>

             <button onClick={() => window.location.reload()} className="btn-platinum w-full py-6 mt-10">Return to Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-40 animate-platinum">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest mb-10 transition-all group">
        <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Cancel Protocol
      </button>

      <div className="master-box border border-white/10 overflow-hidden">
        <div className="bg-white/[0.03] border-b border-white/10 p-12 flex items-center gap-8">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-black shadow-2xl">
               <ShieldCheck size={40} />
            </div>
            <div>
               <h2 className="text-4xl font-black text-white italic uppercase leading-none">Identity Intake</h2>
               <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em] mt-2">Institutional Node Registration</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Signature Name</label>
                    <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 outline-none font-bold text-white placeholder:text-slate-800" placeholder="LEGAL NAME" required />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Digital Mail Node</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 outline-none font-bold text-white placeholder:text-slate-800" placeholder="EMAIL" required />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Communication Link</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 outline-none font-bold text-white placeholder:text-slate-800" placeholder="+977-PHONE" required />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Biometric Profile Node</label>
                <div className="h-full border-2 border-dashed border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center relative group hover:bg-white/5 transition-all">
                    {profileImage ? (
                        <img src={profileImage} className="w-32 h-32 rounded-full object-cover border-2 border-white mb-4" alt="Profile" />
                    ) : (
                        <User size={48} className="text-white/20 mb-4" />
                    )}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Capture</span>
                    <input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 opacity-0 cursor-pointer" required />
                </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-platinum w-full py-6 text-xs">
            {submitting ? <Loader2 className="animate-spin mr-3" /> : <Send className="mr-3" />}
            Commit Node Submission
          </button>
        </form>
      </div>
    </div>
  );
};