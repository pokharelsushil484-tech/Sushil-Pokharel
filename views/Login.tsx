
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2, Info, X, ShieldCheck, Globe, Camera } from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, COPYRIGHT_NOTICE, MIN_PASSWORD_LENGTH, SYSTEM_DOMAIN } from '../constants';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'IDENTITY_SNAP';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (view === 'IDENTITY_SNAP') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [view]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera access failed", err);
      setError("Visual sensor error. Proceeding without snap.");
      setTimeout(() => finalizeAuth(), 2000);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 400, 300);
        setIsProcessing(true);
        setTimeout(() => finalizeAuth(), 1200);
      }
    }
  };

  const finalizeAuth = () => {
    setIsProcessing(false);
    onLogin(username);
  };

  const validatePasswordStrength = (pw: string) => {
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    return pw.length >= MIN_PASSWORD_LENGTH && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = username.trim();
    
    // ADMIN AUTO-VERIFY LOGIC
    if (cleanUsername === ADMIN_USERNAME && password === ADMIN_SECRET) {
      // Create admin user entry if it doesn't exist
      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      if (!users[ADMIN_USERNAME]) {
         users[ADMIN_USERNAME] = { password: ADMIN_SECRET, email: 'admin@system.local', name: 'System Architect', verified: true };
         localStorage.setItem('studentpocket_users', JSON.stringify(users));
      }

      setView('IDENTITY_SNAP');
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[cleanUsername];

    if (!userData) { 
      setError('Access Denied: Node ID not provisioned.'); 
      return; 
    }

    const storedPassword = typeof userData === 'string' ? userData : userData.password;
    if (storedPassword === password) {
      setView('IDENTITY_SNAP');
    } else {
      setError('Incorrect master security key.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Trim inputs
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanConfirmEmail = confirmEmail.trim();

    if (!cleanUsername || !password || !confirmPassword || !cleanEmail || !cleanConfirmEmail || !name) { 
      setError('All protocol fields are mandatory.'); 
      return; 
    }
    if (cleanEmail !== cleanConfirmEmail) {
      setError('Master email mismatch.');
      return;
    }
    if (!validatePasswordStrength(password)) {
      setShowReqs(true);
      setError('Security key standards not met.');
      return;
    }
    if (password !== confirmPassword) { 
      setError('Security key verification mismatch.'); 
      return; 
    }
    
    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (users[cleanUsername]) { 
      setError('Node ID already provisioned on this cluster.'); 
      return; 
    }

    setIsProcessing(true);
    setTimeout(() => {
        // Auto-verify if username is admin (though uncommon to register admin here, it's a fallback)
        const isAutoVerified = cleanUsername === ADMIN_USERNAME;
        
        users[cleanUsername] = { 
            password, 
            email: cleanEmail, 
            name, 
            verified: isAutoVerified 
        };
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        
        setUsername(cleanUsername);
        setView('IDENTITY_SNAP');
        setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden font-sans">
      <div className="absolute inset-0 opacity-10 pointer-events-none fixed">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <div className="grid grid-cols-12 h-full w-full opacity-5">
           {Array.from({length: 144}).map((_, i) => <div key={i} className="border-[0.5px] border-white/10"></div>)}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl my-auto">
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 lg:p-16 border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.9)]">
          
          <div className="flex justify-between items-start mb-10 md:mb-14">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.svg" className="w-4 h-4 object-contain" alt="Logo" />
                <span className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.6em]">Gateway Stable</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">
                {view === 'LOGIN' ? 'Session' : view === 'IDENTITY_SNAP' ? 'Visual' : 'Node'} <br/>
                <span className="text-indigo-500">{view === 'REGISTER' ? 'Provisioning' : 'Access'}</span>
              </h1>
            </div>
          </div>

          <div className="mb-10 flex items-center space-x-3 bg-indigo-600/20 px-6 py-3.5 rounded-2xl border border-indigo-500/30 w-fit">
              <Globe size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{SYSTEM_DOMAIN}</span>
          </div>

          {view === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] outline-none text-white font-bold placeholder:text-slate-700 focus:border-indigo-500/50 transition-all uppercase tracking-widest text-xs" 
                    placeholder="ENTER NODE ID" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-[2rem] outline-none text-white font-bold placeholder:text-slate-700 focus:border-indigo-500/50 transition-all tracking-widest text-xs" 
                    placeholder="ENTER SECURITY KEY" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-[9px] font-black uppercase tracking-[0.3em] text-center animate-shake py-4 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</p>}

              <div className="space-y-4 pt-4">
                <button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center group transition-all"
                >
                  Commence Session <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                  type="button"
                  onClick={() => setView('REGISTER')}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/5"
                >
                  Provision New Node
                </button>
              </div>
            </form>
          )}
          
          {/* Register and Identity Snap views remain mostly the same but ensure Admin creation sets verified */}
          {view === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-5 animate-scale-up">
              <div className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold uppercase text-[10px] tracking-widest" placeholder="IDENTITY NAME" />
                
                <div className="grid grid-cols-1 gap-4">
                   <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold text-[10px] uppercase tracking-widest" placeholder="PRIMARY EMAIL" />
                   <input type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold text-[10px] uppercase tracking-widest" placeholder="VERIFY EMAIL" />
                </div>

                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold uppercase text-[10px] tracking-widest" placeholder="UNIQUE NODE IDENTIFIER" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative">
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold tracking-widest text-[10px]" placeholder="SECURITY KEY" />
                      <button type="button" onClick={() => setShowReqs(true)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"><Info size={16}/></button>
                   </div>
                   <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold tracking-widest text-[10px]" placeholder="CONFIRM KEY" />
                </div>
              </div>
              
              {error && <p className="text-red-400 text-[9px] font-black uppercase tracking-widest text-center py-2">{error}</p>}
              
              <div className="pt-2 space-y-3">
                <button type="submit" disabled={isProcessing} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">Commit Provision</button>
                <button type="button" onClick={() => setView('LOGIN')} className="w-full text-slate-500 py-3 font-black text-[9px] uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Login</button>
              </div>
            </form>
          )}

          {view === 'IDENTITY_SNAP' && (
            <div className="space-y-10 animate-scale-up text-center">
              <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_80px_rgba(79,70,229,0.3)] group">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-125 transition-all duration-1000 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_50%,_rgba(2,6,23,0.8)_100%)]"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-full h-[1px] bg-indigo-500/60 animate-scan shadow-[0_0_15px_indigo]"></div>
                </div>
                <canvas ref={canvasRef} width="400" height="300" className="hidden" />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Calibration</h3>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] leading-relaxed px-4">
                  Maintain visual contact with sensor.
                </p>
              </div>

              <button 
                onClick={captureSnap}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center space-x-4 hover:bg-indigo-700 transition-all"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><Camera size={20} /> <span>CALIBRATE</span></>}
              </button>
            </div>
          )}

          <div className="mt-12 text-center border-t border-white/5 pt-8">
             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">{COPYRIGHT_NOTICE}</p>
          </div>
        </div>
      </div>
      
      {showReqs && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 border border-white/10 shadow-3xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                   <Info className="text-indigo-500" size={20} />
                   <h3 className="text-lg font-black text-white uppercase tracking-tight">Key Standards</h3>
                </div>
                <button onClick={() => setShowReqs(false)} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl"><X size={18}/></button>
             </div>
             
             <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                   <ul className="space-y-3">
                      <li className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-3"></div> Min 16 Characters</li>
                      <li className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-3"></div> Uppercase & Lowercase</li>
                      <li className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-3"></div> Numbers & Symbols</li>
                   </ul>
                </div>
                <button onClick={() => setShowReqs(false)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest">Acknowledge</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100px); opacity: 0.1; }
          50% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0.1; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
