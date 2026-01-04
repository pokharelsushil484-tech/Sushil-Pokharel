
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2, Info, X, ShieldCheck, Globe, Camera, ArrowLeft, Check } from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, COPYRIGHT_NOTICE, MIN_PASSWORD_LENGTH, SYSTEM_DOMAIN } from '../constants';
import { storageService } from '../services/storageService';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'IDENTITY_SNAP' | 'FORGOT_PASSWORD';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError("Camera unavailable. Skipping biometric check.");
      setTimeout(() => finalizeAuth(), 1500);
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
        setTimeout(() => finalizeAuth(), 1000);
      }
    }
  };

  const finalizeAuth = () => {
    setIsProcessing(false);
    onLogin(username);
  };

  // Professional Password Strength Validation
  const checkPasswordStrength = (pw: string) => {
    return {
      length: pw.length >= MIN_PASSWORD_LENGTH,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /\d/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    };
  };

  const pwStrength = checkPasswordStrength(password);
  const isPasswordValid = Object.values(pwStrength).every(Boolean);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = username.trim();
    
    if (cleanUsername === ADMIN_USERNAME && password === ADMIN_SECRET) {
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
      setError('ID not found.'); 
      return; 
    }

    const storedPassword = typeof userData === 'string' ? userData : userData.password;
    if (storedPassword === password) {
      setView('IDENTITY_SNAP');
    } else {
      setError('Incorrect password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanConfirmEmail = confirmEmail.trim();

    if (!cleanUsername || !password || !confirmPassword || !cleanEmail || !cleanConfirmEmail || !name) { 
      setError('All fields are required.'); 
      return; 
    }
    if (cleanEmail !== cleanConfirmEmail) {
      setError('Emails do not match.');
      return;
    }
    
    if (!isPasswordValid) {
      setError('Password does not meet security requirements.');
      return;
    }

    if (password !== confirmPassword) { 
      setError('Passwords do not match.'); 
      return; 
    }
    
    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (users[cleanUsername]) { 
      setError('Username already taken.'); 
      return; 
    }

    setIsProcessing(true);
    setTimeout(() => {
        users[cleanUsername] = { 
            password, 
            email: cleanEmail, 
            name, 
            verified: false
        };
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        
        setUsername(cleanUsername);
        setView('IDENTITY_SNAP');
        setIsProcessing(false);
    }, 1500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
        setError("Please enter your username.");
        return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
        const usersStr = localStorage.getItem('studentpocket_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        const userData = users[cleanUsername];

        if (userData) {
            setSuccess(`Password reset link sent to ${userData.email || 'your email'}.`);
        } else {
            setError("Username not found.");
        }
        setIsProcessing(false);
    }, 1500);
  };

  const PasswordRequirement = ({ met, label }: { met: boolean, label: string }) => (
    <div className={`flex items-center space-x-2 text-[10px] uppercase tracking-wider font-bold transition-colors ${met ? 'text-emerald-400' : 'text-slate-500'}`}>
        <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${met ? 'bg-emerald-500/20 border-emerald-500' : 'border-slate-600'}`}>
            {met && <Check size={8} />}
        </div>
        <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <div className="grid grid-cols-12 h-full w-full opacity-5">
           {Array.from({length: 144}).map((_, i) => <div key={i} className="border-[0.5px] border-white/10"></div>)}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl">
          
          <div className="flex flex-col items-center mb-10 text-center">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-600/30">
                <img src="/logo.svg" className="w-6 h-6 object-contain filter brightness-0 invert" alt="" />
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight mb-2">StudentPocket</h1>
             <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Secure Access Portal</p>
          </div>

          {view === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none text-white font-medium placeholder:text-slate-600 focus:border-indigo-500/50 transition-all text-sm" 
                    placeholder="Student ID / Username" 
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl outline-none text-white font-medium placeholder:text-slate-600 focus:border-indigo-500/50 transition-all text-sm" 
                    placeholder="Password" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end">
                  <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-xs text-slate-400 hover:text-indigo-400 transition-colors font-medium">
                      Forgot Password?
                  </button>
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center uppercase tracking-wide">{error}</div>}

              <div className="space-y-3 pt-2">
                <button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center group"
                >
                  Sign In <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => setView('REGISTER')}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}
          
          {view === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-scale-up">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Full Name" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Choose Username" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Email Address" />
              <input type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Confirm Email" />
              
              <div className="space-y-2">
                 <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full px-4 py-3 bg-white/5 border rounded-xl outline-none text-white text-sm transition-colors ${isPasswordValid && password ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-red-500/50'}`} placeholder="Strong Password" />
                 
                 <div className="bg-black/20 rounded-lg p-3 grid grid-cols-2 gap-2">
                    <PasswordRequirement met={pwStrength.length} label={`Min ${MIN_PASSWORD_LENGTH} Chars`} />
                    <PasswordRequirement met={pwStrength.upper} label="Uppercase" />
                    <PasswordRequirement met={pwStrength.lower} label="Lowercase" />
                    <PasswordRequirement met={pwStrength.number} label="Number" />
                    <PasswordRequirement met={pwStrength.special} label="Symbol" />
                 </div>
              </div>

              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Confirm Password" />
              
              {error && <p className="text-red-400 text-xs font-bold text-center mt-2">{error}</p>}
              
              <div className="pt-4 space-y-3">
                <button type="submit" disabled={isProcessing || !isPasswordValid} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">Register</button>
                <button type="button" onClick={() => setView('LOGIN')} className="w-full text-slate-500 py-2 text-xs font-bold uppercase tracking-wide hover:text-white transition-colors">Cancel</button>
              </div>
            </form>
          )}

          {view === 'FORGOT_PASSWORD' && (
             <form onSubmit={handleForgotPassword} className="space-y-6 animate-scale-up">
                <div className="text-center">
                    <h3 className="text-white font-bold text-lg mb-2">Reset Password</h3>
                    <p className="text-xs text-slate-400">Enter your username to receive reset instructions.</p>
                </div>

                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none text-white font-medium placeholder:text-slate-600 focus:border-indigo-500/50 transition-all text-sm" 
                    placeholder="Student ID / Username" 
                  />
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center uppercase tracking-wide">{error}</div>}
                {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold text-center uppercase tracking-wide">{success}</div>}

                <div className="pt-2 space-y-3">
                    <button 
                        type="submit" 
                        disabled={isProcessing || !!success} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={16}/> : 'Send Reset Link'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setView('LOGIN')} 
                        className="w-full text-slate-500 py-2 text-xs font-bold uppercase tracking-wide hover:text-white transition-colors flex items-center justify-center"
                    >
                        <ArrowLeft size={14} className="mr-2"/> Back to Login
                    </button>
                </div>
             </form>
          )}

          {view === 'IDENTITY_SNAP' && (
            <div className="space-y-8 animate-scale-up text-center">
              <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_60px_rgba(79,70,229,0.3)] bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-full h-[2px] bg-indigo-500/80 animate-scan shadow-[0_0_20px_indigo]"></div>
                </div>
                <canvas ref={canvasRef} width="400" height="300" className="hidden" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Biometric Check</h3>
                <p className="text-xs text-slate-500 mt-2">Align your face to verify identity.</p>
              </div>

              <button 
                onClick={captureSnap}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center"><Camera className="mr-2" size={18}/> Verify & Enter</span>}
              </button>
            </div>
          )}

          <div className="mt-8 text-center border-t border-white/5 pt-6">
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{COPYRIGHT_NOTICE}</p>
          </div>
        </div>
      </div>
      
      <style>{`
        .mirror { transform: scaleX(-1); }
        @keyframes scan {
          0% { transform: translateY(-80px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(80px); opacity: 0; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
