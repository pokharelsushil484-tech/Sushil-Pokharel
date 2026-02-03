
import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { ShieldCheck, Loader2, ArrowLeft, Send, User, Lock, Copy, Check, Globe, Cpu, Mail, Phone } from 'lucide-react';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
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
          isVerified: false 
      };
      
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey);
      await storageService.setData(dataKey, { ...stored, user: updatedProfile });
      
      updateUser(updatedProfile);
      setSuccessState({ studentId: generatedStudentId, linkId });
      
      // Dispatch verification link TO THE ADMIN with the student's username
      await emailService.sendInstitutionalMail(formData.email, linkId, 'VERIFY', username);
      
      setSubmitting(false);
    }, 2000);
  };

  if (successState) {
    const fullLink = `${window.location.origin}/?v=${successState.linkId}`;
    return (
      <div className="max-w-2xl mx-auto pt-16 animate-platinum pb-40">
        <div className="master-box p-12 sm:p-16 text-center border border-indigo-500/30 bg-black/40">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-black shadow-[0_0_60px_rgba(255,255,255,0.15)] transform -rotate-12">
                 <ShieldCheck size={44} />
             </div>
             <h2 className="text-4xl font-black text-white uppercase mb-2 italic tracking-tighter">Identity Submission</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.6em] mb-16">Institutional Audit Mode Active</p>
             
             <div className="space-y-8">
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cpu size={100} />
                    </div>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">Assigned Node Identity</p>
                    <p className="font-mono text-4xl text-white font-bold tracking-widest">{successState.studentId}</p>
                </div>

                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 text-left">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">Authority Authorization Link</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-5 bg-black rounded-2xl text-[10px] text-slate-400 font-mono break-all border border-white/5 shadow-inner">
                            {fullLink}
                        </div>
                        <button onClick={() => handleCopyLink(fullLink)} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-white shadow-xl">
                            {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20}/>}
                        </button>
                    </div>
                </div>
             </div>

             <div className="mt-16 flex items-center justify-center space-x-3 text-red-500 opacity-60">
                 <Globe size={14} />
                 <p className="text-[9px] font-black uppercase tracking-[0.3em]">Administrator Action Required for Clearance</p>
             </div>

             <button onClick={() => window.location.href = '/'} className="btn-platinum w-full py-6 mt-12 text-sm">Return to Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-40 animate-platinum">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest mb-10 transition-all group">
        <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Cancel Onboarding
      </button>

      <div className="master-box border border-white/10 overflow-hidden bg-black/40">
        <div className="bg-white/[0.03] border-b border-white/10 p-12 flex items-center gap-8">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-black shadow-2xl">
               <ShieldCheck size={40} />
            </div>
            <div>
               <h2 className="text-4xl font-black text-white italic uppercase leading-none">Identity Intake</h2>
               <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em] mt-2">Generate Institutional Verification Link</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Full Legal Identity</label>
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                        <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white uppercase tracking-wider text-xs" placeholder="SIGNATURE NAME" required />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Communication Node</label>
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white text-xs" placeholder="EMAIL" required />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Biometric Node Capture</label>
                <div className="h-full border-2 border-dashed border-white/10 rounded-[4rem] p-12 flex flex-col items-center justify-center relative group hover:bg-white/5 transition-all shadow-inner">
                    {profileImage ? (
                        <div className="relative">
                            <img src={profileImage} className="w-40 h-40 rounded-[3rem] object-cover border-2 border-white shadow-2xl" alt="Capture" />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-xl shadow-lg">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-700">
                                <User size={48} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initialize Capture</span>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 opacity-0 cursor-pointer" required />
                </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-platinum w-full py-6 text-xs flex items-center justify-center gap-4">
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            Commit Node Submission
          </button>
        </form>
      </div>
    </div>
  );
};
