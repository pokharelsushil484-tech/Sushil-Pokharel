import React, { useState, useRef } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, Camera } from 'lucide-react';
import { COPYRIGHT_NOTICE } from '../constants';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'CREDENTIALS' | 'BIOMETRIC'>('CREDENTIALS');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startIdentityScan = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      alert("Camera access is required for identity verification.");
    }
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !password) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setView('BIOMETRIC');
      startIdentityScan();
    }, 1200);
  };

  const completeAccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      onLogin(loginInput);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[3rem] p-10 md:p-12 shadow-2xl border-white/5">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">StudentPocket</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Access Management Portal</p>
          </div>

          {view === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="text" 
                    value={loginInput} 
                    onChange={(e) => setLoginInput(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold text-sm focus:border-indigo-500 transition-all" 
                    placeholder="Username / Student ID" 
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold text-sm focus:border-indigo-500 transition-all" 
                    placeholder="Access Code" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing} 
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <>Verify Identity <ArrowRight className="ml-2" size={16}/></>}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-fade text-center">
              <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-600/30 shadow-2xl bg-slate-900">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-80" />
                <div className="absolute inset-0 border-[16px] border-black/20 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-500/50 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Security Scanning</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Verifying Physical Authorization</p>
              </div>
              <button 
                onClick={completeAccess}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Grant Full Access"}
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{COPYRIGHT_NOTICE}</p>
          </div>
        </div>
      </div>
    </div>
  );
};