import React, { useState, useRef } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, Fingerprint, Activity, Terminal } from 'lucide-react';
import { COPYRIGHT_NOTICE, APP_NAME, SYSTEM_DOMAIN, APP_VERSION, BUILD_DATE } from '../constants';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [stage, setStage] = useState<'ENTRY' | 'CREDENTIALS' | 'SCAN'>('ENTRY');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startApplication = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('CREDENTIALS');
    }, 800);
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !password) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('SCAN');
      startIdentityScan();
    }, 1200);
  };

  const startIdentityScan = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.warn("Camera restricted. Terminal fallback active.");
    }
  };

  const finalizeAccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      onLogin(loginInput);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-slate-900/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)]">
          
          {stage === 'ENTRY' && (
            <div className="text-center space-y-10 animate-scale-in">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)] transform -rotate-6">
                <ShieldCheck size={48} className="text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{APP_NAME}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mt-4">{SYSTEM_DOMAIN}</p>
              </div>
              <button 
                onClick={startApplication}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-slate-200 flex items-center justify-center group"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Portal <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={18}/></>}
              </button>
            </div>
          )}

          {stage === 'CREDENTIALS' && (
            <div className="animate-slide-up">
              <div className="text-center mb-12">
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Security Node</h2>
                <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full mt-4 border border-white/5">
                  <Activity size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Authorized Session Layer</span>
                </div>
              </div>

              <form onSubmit={handleCredentialSubmit} className="space-y-8">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">Personnel ID</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="text" 
                      value={loginInput} 
                      onChange={e => setLoginInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-8 text-white font-bold text-sm outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                      placeholder="Username / Student ID"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">Access Token</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-16 text-white font-bold text-sm outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                      placeholder="Access Code"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-xl"
                >
                  {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Authorize Identity'}
                </button>
              </form>
            </div>
          )}

          {stage === 'SCAN' && (
            <div className="animate-scale-in text-center space-y-12">
              <div className="relative mx-auto w-60 h-60 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60 grayscale" />
                <div className="absolute inset-0 border-[20px] border-black/80"></div>
                <div className="absolute inset-x-0 top-0 h-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-[scan_2.5s_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint size={80} className="text-white opacity-10 animate-pulse" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Biometric Hash</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-2">Scanning Real-Time Personnel Frame</p>
              </div>

              <button 
                onClick={finalizeAccess}
                disabled={isProcessing}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/30 transition-all"
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Finalize Login'}
              </button>
            </div>
          )}

          {/* Detailed Version Section - Highly Visible */}
          <div className="mt-16 text-center border-t border-white/5 pt-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                {APP_VERSION}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white font-bold tracking-[0.3em] uppercase">{BUILD_DATE}</p>
                <p className="text-[8px] text-slate-600 font-bold tracking-[0.4em] uppercase">{COPYRIGHT_NOTICE}</p>
              </div>
            </div>
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