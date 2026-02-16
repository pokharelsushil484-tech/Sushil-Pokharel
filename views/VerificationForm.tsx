
import React, { useState } from 'react';
import { UserProfile, ChangeRequest, View } from '../types';
import { ShieldCheck, Loader2, ArrowLeft, Send, User, Lock, Copy, Check, Globe, Cpu, Mail, Phone, Fingerprint, AtSign } from 'lucide-react';
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
      identityKey: user.studentId || '',
      institutionalTier: 'EXECUTIVE',
      academicDomain: ''
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
    if (!formData.fullName || !profileImage || !formData.identityKey) {
        alert("CRITICAL ERROR: BIOMETRIC NODE CAPTURE AND IDENTITY KEY ARE REQUIRED FOR V19 MESH.");
        return;
    }
    
    setSubmitting(true);
    const linkId = Math.random().toString(36).substring(2, 9).toUpperCase();

    setTimeout(async () => {
      const existingStr = localStorage.getItem('studentpocket_requests');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      const request: ChangeRequest = {
          id: 'NODE-REQ-' + Date.now(),
          userId: username,
          username: username,
          type: 'VERIFICATION',
          details: JSON.stringify({ ...formData, _profileImage: profileImage, timestamp: Date.now() }),
          status: 'PENDING',
          createdAt: Date.now(),
          linkId: linkId,
          generatedStudentId: formData.identityKey
      };
      existing.push(request);
      localStorage.setItem('studentpocket_requests', JSON.stringify(existing));

      const updatedProfile: UserProfile = { 
          ...user, 
          verificationStatus: 'PENDING_AUDIT',
          studentId: formData.identityKey,
          isVerified: false 
      };
      
      const dataKey = `architect_data_${username}`;
      const stored = await storageService.getData(dataKey);
      await storageService.setData(dataKey, { ...stored, user: updatedProfile });
      
      updateUser(updatedProfile);
      setSuccessState({ studentId: formData.identityKey, linkId });
      
      await emailService.sendInstitutionalMail(formData.email, linkId, 'VERIFY_REQUEST', username);
      setSubmitting(false);
    }, 2000);
  };

  if (successState) {
    const fullLink = `${window.location.origin}/?v=${successState.linkId}`;
    return (
      <div className="max-w-2xl mx-auto pt-16 animate-platinum pb-40 uppercase">
        <div className="master-box p-12 sm:p-16 text-center border-indigo-500/30 bg-black/60 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-black shadow-2xl transform rotate-12">
                 <ShieldCheck size={44} />
             </div>
             <h2 className="text-4xl font-black text-white uppercase mb-2 italic tracking-tighter">Identity Logged</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.6em] mb-16">Supreme Audit Node Dispatched</p>
             
             <div className="space-y-8">
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 text-left">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">Personnel Node ID</p>
                    <p className="font-mono text-3xl text-white font-bold tracking-[0.3em]">{successState.studentId}</p>
                </div>

                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 text-left">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-4">Official Verification Portal</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-5 bg-black rounded-2xl text-[10px] text-slate-400 font-mono break-all border border-white/5">
                            {fullLink}
                        </div>
                        <button onClick={() => handleCopyLink(fullLink)} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-white">
                            {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20}/>}
                        </button>
                    </div>
                    <p className="mt-4 text-[8px] text-slate-600 font-bold uppercase tracking-widest">Share this link with Sushil for node authorization.</p>
                </div>
             </div>

             <button onClick={() => window.location.href = '/'} className="btn-platinum w-full py-6 mt-12 text-sm">Return to Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-40 animate-platinum uppercase">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest mb-10 transition-all group">
        <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Abort Onboarding
      </button>

      <div className="master-box border border-white/10 overflow-hidden bg-black/60 shadow-2xl">
        <div className="bg-white/[0.03] border-b border-white/10 p-12 flex items-center gap-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
               <Fingerprint size={40} />
            </div>
            <div>
               <h2 className="text-4xl font-black text-white italic uppercase leading-none">Identity Intake V19</h2>
               <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em] mt-2">Provision Personnel Node Registry</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Full Legal Node Identity</label>
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                        <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})} className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-black text-white tracking-widest text-xs" placeholder="LEGAL SIGNATURE" required />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Identity Key / Node Number</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                        <input value={formData.identityKey} onChange={e => setFormData({...formData, identityKey: e.target.value.toUpperCase()})} className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-black text-white tracking-widest text-xs" placeholder="UNIQUE NODE IDENTIFIER" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Institutional Tier</label>
                        <select value={formData.institutionalTier} onChange={e => setFormData({...formData, institutionalTier: e.target.value})} className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-2xl text-indigo-500 font-black text-[10px] tracking-widest uppercase appearance-none">
                            <option value="EXECUTIVE">EXECUTIVE</option>
                            <option value="PREMIUM">PREMIUM</option>
                            <option value="ELITE">ELITE</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Academic Domain</label>
                        <input type="text" value={formData.academicDomain} onChange={e => setFormData({...formData, academicDomain: e.target.value.toUpperCase()})} className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] tracking-widest uppercase outline-none focus:border-indigo-500" placeholder="e.g. SCIENCE" required />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Biometric Node Capture</label>
                <div className="h-[400px] border-2 border-dashed border-white/10 rounded-[4rem] p-12 flex flex-col items-center justify-center relative group hover:bg-white/[0.02] transition-all overflow-hidden bg-black/20">
                    {profileImage ? (
                        <div className="relative animate-scale-up h-full w-full flex items-center justify-center">
                            <img src={profileImage} className="w-64 h-64 rounded-[3.5rem] object-cover border-2 border-white shadow-[0_0_60px_rgba(255,255,255,0.1)]" alt="Capture" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/20 rounded-[4rem] animate-pulse"></div>
                            <div className="absolute bottom-10 right-10 bg-emerald-500 text-black p-3 rounded-xl shadow-2xl">
                                <Check size={24} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-700 shadow-inner">
                                <User size={48} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Initialize Scanner</span>
                            <p className="text-[8px] text-slate-700 font-bold uppercase">PNG / JPG / WEBP • MAX 5MB</p>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 opacity-0 cursor-pointer" required />
                </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-platinum w-full py-7 text-sm flex items-center justify-center gap-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] hover:scale-[1.01] transition-all">
            {submitting ? <Loader2 className="animate-spin" size={28} /> : <ShieldCheck size={28} />}
            Synchronize Personnel Node Intake
          </button>
        </form>
      </div>
    </div>
  );
};
