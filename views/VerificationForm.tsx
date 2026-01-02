
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, VerificationQuestion, ChangeRequest, View } from '../types';
import { generateVerificationForm } from '../services/geminiService';
import { ShieldCheck, Loader2, ArrowLeft, Zap, ShieldAlert, Camera, RefreshCw, Upload, User, Image as ImageIcon } from 'lucide-react';

interface VerificationFormProps {
  user: UserProfile;
  username: string; // Critical for linking request to correct storage key
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, username, updateUser, onNavigate }) => {
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Camera State (Program Proof)
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Profile Upload State (White Background)
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchForm = async () => {
      const q = await generateVerificationForm(user);
      setQuestions(q);
      setLoading(false);
    };
    fetchForm();
    
    return () => {
        stopCamera();
    };
  }, [user]);

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
    } catch (err) {
        console.error("Camera Init Error", err);
        alert("Visual sensor access required for verification protocol.");
    }
  };

  const stopCamera = () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
  };

  const captureProof = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          // Set resolution for storage efficiency
          canvas.width = 800;
          canvas.height = (video.videoHeight / video.videoWidth) * 800;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress
              setProofImage(dataUrl);
              stopCamera();
          }
      }
  };

  const retakeProof = () => {
      setProofImage(null);
      startCamera();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage || !profileImage) return;
    
    setSubmitting(true);
    
    // Include images in details payload
    const finalDetails = {
        ...answers,
        _verificationImage: proofImage, // Program Proof
        _profileImage: profileImage     // White Background Photo
    };
    
    // Create request with the LOGIN ID (username), not the display name
    const request: ChangeRequest = {
      id: 'AUTH-' + Date.now(),
      userId: username,
      username: username, // This MUST match the key used in storageService (architect_data_USERNAME)
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
      
      // Simulate Email Notification
      alert(`Signal Transmitted.\n\nA verification confirmation has been sent to: ${user.email || 'linked email address'}\nReference: SBT-${Math.floor(Math.random() * 10000)}`);
      
      onNavigate(View.DASHBOARD);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse px-6 text-center">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Analyzing Data Nodes</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synthesizing Authorization Architecture...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 font-black text-[10px] uppercase tracking-[0.3em] transition-all group bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-indigo-600/30">
        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> CANCEL SIGNAL
      </button>

      <div className="bg-white dark:bg-[#0f172a] rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
        {/* Updated Background Image: Logo Watermark */}
        <img src="/logo.svg" className="absolute -top-10 -right-10 w-64 h-64 opacity-5 rotate-12 pointer-events-none" alt="Background" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-slate-100 dark:border-white/5 pb-10 relative z-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20 flex-shrink-0 p-4 overflow-hidden">
            <img src="/logo.svg" className="w-full h-full object-contain" alt="Identity" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Identity Verification</h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em] mt-4">Node: {username}</p>
          </div>
        </div>

        <div className="mb-12 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-4 relative z-10">
            <ShieldAlert className="text-amber-500 flex-shrink-0 mt-1" size={24} />
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase tracking-wide">
                Warning: Ensure all visual proofs are high-resolution. False data will cause node suspension.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          {/* 1. Questionnaire */}
          <div className="space-y-8">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs">1</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Security Questions</h3>
             </div>
             
             {questions.map((q) => (
                <div key={q.id} className="space-y-4">
                <label className="block text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-snug">
                    {q.question}
                </label>
                {q.type === 'text' ? (
                    <textarea
                    required
                    className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-transparent focus:border-indigo-600 outline-none transition-all dark:text-white font-bold text-sm placeholder:text-slate-300"
                    placeholder="INPUT ENCRYPTED RESPONSE..."
                    rows={2}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {q.options?.map((opt) => (
                        <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        className={`p-6 rounded-2xl border-2 text-left font-black text-[10px] transition-all uppercase tracking-[0.2em] ${
                            answers[q.id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                        >
                        {opt}
                        </button>
                    ))}
                    </div>
                )}
                </div>
            ))}
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-white/5"></div>

          {/* 2. Profile Photo Upload */}
          <div className="space-y-6">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs">2</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Identity Photo</h3>
             </div>
             
             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 text-center">
                 <div className="mb-6">
                     <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Upload Profile Picture</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Requirement: White Background Only</p>
                 </div>

                 {profileImage ? (
                     <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl group">
                         <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                         <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <RefreshCw className="text-white" size={24} />
                            <input type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                         </label>
                     </div>
                 ) : (
                     <label className="cursor-pointer block">
                         <div className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-600">
                                 <User size={28} />
                             </div>
                             <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg">Tap to Upload</span>
                         </div>
                         <input type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                     </label>
                 )}
             </div>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-white/5"></div>

          {/* 3. Visual Proof Capture */}
          <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs">3</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Program Visual Proof</h3>
             </div>

              <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative min-h-[300px] flex items-center justify-center border-2 border-slate-100 dark:border-white/10 group shadow-2xl">
                  {proofImage ? (
                      <div onClick={retakeProof} className="relative w-full h-full cursor-pointer min-h-[300px]">
                          <img src={proofImage} alt="Proof" className="w-full h-full object-cover absolute inset-0" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
                               <div className="bg-white/10 px-6 py-3 rounded-full border border-white/20 flex items-center">
                                  <RefreshCw size={16} className="text-white mr-2" />
                                  <span className="text-white font-black uppercase tracking-widest text-[10px]">Retake Photo</span>
                               </div>
                          </div>
                      </div>
                  ) : isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                      <div className="text-center p-8">
                          <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Student ID or Schedule</p>
                          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Camera Access Needed</p>
                      </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 pointer-events-none z-20">
                      {!proofImage && !isCameraActive && (
                          <button type="button" onClick={startCamera} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg pointer-events-auto hover:bg-indigo-700 transition-colors flex items-center">
                              <Camera size={16} className="mr-2" /> Activate Camera
                          </button>
                      )}
                      
                      {isCameraActive && (
                          <button type="button" onClick={captureProof} className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform pointer-events-auto">
                              <div className="w-12 h-12 bg-red-500 rounded-full border-2 border-white"></div>
                          </button>
                      )}
                  </div>
              </div>
          </div>

          <button
            type="submit"
            disabled={submitting || Object.keys(answers).length < questions.length || !proofImage || !profileImage}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group mt-8"
          >
            {submitting ? <Loader2 className="animate-spin mr-4" /> : <Zap size={20} className="mr-4 group-hover:scale-125 transition-transform" />}
            {submitting ? 'SYNC