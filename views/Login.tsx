import React, { useState, useRef } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, Fingerprint, Activity } from 'lucide-react';
import { COPYRIGHT_NOTICE, APP_NAME, SYSTEM_DOMAIN, APP_VERSION } from '../constants';

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
      console.warn("Camera fallback active.");
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
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Real-time Atmospheric Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] p-12 md:p-20 border border-white/5 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)]">
          
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40 transform -rotate-3 transition-transform hover:rotate-0">
                <ShieldCheck size={44} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-3 uppercase italic">
              {APP_NAME}
            </h1>
            <div className="inline-flex items-center space-x-3 bg-white/5 px-5 py-2 rounded-full border border-white/10">
                <Activity className="text-emerald-500 animate-pulse" size={14} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{SYSTEM_DOMAIN} • SECURE ENTRY</span>
            </div>
          </div>

          {view === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialSubmit} className="space-y-10 animate-scale-up">
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 mb-3 block">Personnel Identifier</label>
                  <div className="relative">
                    <User className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={loginInput} 
                      onChange={(e) => setLoginInput(e.target.value)} 
                      className="w-full pl-16 pr-8 py-6 bg-black/40 border border-white/5 rounded-[2rem] outline-none text-white font-bold text-base focus:border-indigo-500/50 focus:bg-black/60 transition-all" 
                      placeholder="Username" 
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 mb-3 block">Security Token</label>
                  <div className="relative">
                    <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-16 pr-20 py-6 bg-black/40 border border-white/5 rounded-[2rem] outline-none text-white font-bold text-base focus:border-indigo-500/50 focus:bg-black/60 transition-all" 
                      placeholder="Access Code" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing} 
                className="w-full bg-white text-slate-950 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-xl"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Session <ArrowRight className="ml-4" size={18}/></>}
              </button>
            </form>
          ) : (
            <div className="space-y-12 animate-scale-up text-center">
              <div className="relative mx-auto w-64 h-64 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black group">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-50 grayscale scale-110" />
                <div className="absolute inset-0 bg-indigo-600/10 pointer-events-none"></div>
                <div className="absolute inset-0 border-[24px] border-black/60 pointer-events-none"></div>
                
                {/* Scanner Interface */}
                <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Fingerprint size={80} className="text-indigo-400 opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Identity Verification</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Confirming Biometric Hash for 2026 Year</p>
              </div>

              <button 
                onClick={completeAccess}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/40"
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Finalize Authentication"}
              </button>
            </div>
          )}

          <div className="mt-16 text-center border-t border-white/5 pt-12">
             <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-2">{COPYRIGHT_NOTICE}</p>
             <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.2em] italic">{APP_VERSION}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};