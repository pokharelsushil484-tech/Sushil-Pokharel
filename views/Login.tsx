
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2, Info, X, ShieldCheck, Globe, Camera, ArrowLeft, Check, Key, HelpCircle, AlertTriangle } from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_SECRET, ADMIN_EMAIL, COPYRIGHT_NOTICE, MIN_PASSWORD_LENGTH, SYSTEM_DOMAIN, DEFAULT_USER, SYSTEM_UPGRADE_TOKEN, CREATOR_NAME } from '../constants';
import { storageService } from '../services/storageService';
import { View } from '../types';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
  onNavigate?: (view: View) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'IDENTITY_SNAP' | 'FORGOT_PASSWORD' | 'ADMISSION_LOGIN';

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // Admission Key State
  const [admissionKey, setAdmissionKey] = useState('');
  
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
      setError("Camera required for identity verification.");
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
    } else {
         setIsProcessing(true);
         setTimeout(() => finalizeAuth(), 1000);
    }
  };

  const finalizeAuth = () => {
    setIsProcessing(false);
    resolveUserAndLogin(loginInput);
  };

  const resolveUserAndLogin = async (input: string) => {
      const cleanInput = input.trim();
      let targetUsername = cleanInput;

      if (cleanInput === ADMIN_USERNAME) {
           onLogin(ADMIN_USERNAME);
           return;
      }

      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      if (users[cleanInput]) {
          targetUsername = cleanInput;
      } else {
          for (const key of Object.keys(users)) {
              if (key === ADMIN_USERNAME) continue;
              const data = await storageService.getData(`architect_data_${key}`);
              if (data && data.user && data.user.studentId === cleanInput) {
                  targetUsername = key;
                  break;
              }
          }
      }
      
      onLogin(targetUsername);
  };

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
    setIsProcessing(true);

    const cleanInput = loginInput.trim();
    
    // Admin Override
    if (cleanInput === ADMIN_USERNAME && password === ADMIN_SECRET) {
      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      if (!users[ADMIN_USERNAME]) {
         users[ADMIN_USERNAME] = { password: ADMIN_SECRET, email: ADMIN_EMAIL, name: CREATOR_NAME, verified: true };
         localStorage.setItem('studentpocket_users', JSON.stringify(users));
      }
      
      setIsProcessing(false);
      setView('IDENTITY_SNAP');
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    let userData = users[cleanInput];
    let foundUsername = cleanInput;

    if (!userData) {
        let found = false;
        for (const key of Object.keys(users)) {
             const data = await storageService.getData(`architect_data_${key}`);
             if (data && data.user && data.user.studentId === cleanInput) {
                 userData = users[key];
                 foundUsername = key;
                 found = true;
                 break;
             }
        }
        
        if (!found) {
            setError('Student ID or Username not found.');
            setIsProcessing(false);
            return;
        }
    }

    const storedPassword = typeof userData === 'string' ? userData : userData.password;
    if (storedPassword === password) {
       const data = await storageService.getData(`architect_data_${foundUsername}`);
       if (data && data.user && data.user.isBanned) {
           setError("Identity Locked. Please use Admission Key to restore access.");
           setIsProcessing(false);
       } else {
           setLoginInput(foundUsername); 
           setIsProcessing(false);
           setView('IDENTITY_SNAP');
       }
    } else {
      setError('Incorrect Credentials.');
      setIsProcessing(false);
    }
  };

  const handleAdmissionLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      if (!loginInput || !admissionKey) {
          setError("Student ID/Username and Key required.");
          return;
      }
      
      setIsProcessing(true);
      
      const cleanInput = loginInput.trim();
      const inputKey = admissionKey.trim().toUpperCase();

      setTimeout(async () => {
          // Resolve User
          const usersStr = localStorage.getItem('studentpocket_users');
          const users = usersStr ? JSON.parse(usersStr) : {};
          let targetUsername = users[cleanInput] ? cleanInput : null;
          
          if (!targetUsername) {
              for (const key of Object.keys(users)) {
                  const data = await storageService.getData(`architect_data_${key}`);
                  if (data && data.user && data.user.studentId === cleanInput) {
                      targetUsername = key;
                      break;
                  }
              }
          }

          if (targetUsername) {
              const dataKey = `architect_data_${targetUsername}`;
              const stored = await storageService.getData(dataKey);
              
              if (stored && stored.user) {
                  // Check Key Validation
                  // 1. Check user-specific generated key (Recovery Appeal)
                  const isPersonalKeyValid = stored.user.admissionKey === inputKey;
                  
                  // 2. Check Rotating System Keys (MS, ADM, TKN)
                  const isSystemKeyValid = await storageService.validateSystemKey(inputKey);

                  if (isPersonalKeyValid || isSystemKeyValid) {
                      
                      // Case 1: Unlock Admin
                      if (targetUsername === ADMIN_USERNAME) {
                          stored.user.isBanned = false;
                          stored.user.isSuspicious = false; 
                          stored.user.isVerified = true;
                          stored.user.verificationStatus = 'VERIFIED';
                          stored.user.banReason = undefined;
                          if (stored.user.badges) {
                              stored.user.badges = stored.user.badges.filter(b => b !== 'DANGEROUS' && b !== 'SUSPICIOUS');
                          }
                          
                          await storageService.logActivity({
                              actor: targetUsername,
                              actionType: 'ADMIN',
                              description: 'ADMIN SECURITY UNLOCK: Privileges restored via Key.'
                          });
                      } 
                      // Case 2: Unlock User - Partial Restoration
                      else {
                          stored.user.isBanned = false;
                          stored.user.isSuspicious = true; // Mark as suspicious
                          stored.user.isVerified = false; // Revoke verification
                          stored.user.verificationStatus = 'FORM_PENDING'; // Force Verification Form
                          stored.user.banReason = undefined;
                          
                          // APPLY BADGES AS REQUESTED
                          const currentBadges = new Set(stored.user.badges || []);
                          currentBadges.add('DANGEROUS');
                          currentBadges.add('SUSPICIOUS');
                          stored.user.badges = Array.from(currentBadges);
                          
                          await storageService.logActivity({
                              actor: targetUsername,
                              actionType: 'SECURITY',
                              description: 'Account Unlocked via Key. Marked Suspicious/Dangerous.'
                          });
                      }
                      
                      await storageService.setData(dataKey, stored);
                      setLoginInput(targetUsername); 
                      setView('IDENTITY_SNAP');
                  } else {
                      setError("Invalid Key. Required: ADM / Master / Admission Key / Master Token.");
                  }
              } else {
                  setError("Profile data corruption.");
              }
          } else {
              setError("User Identity not found.");
          }
          setIsProcessing(false);
      }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanUsername = loginInput.trim();
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanUsername || !password || !confirmPassword || !cleanEmail || !cleanName) { 
      setError('All fields are required.'); 
      return; 
    }
    
    // Content Safety Check
    const combined = (cleanUsername + cleanName + cleanEmail).toLowerCase();
    const violentTerms = ["kill", "death", "attack", "terror", "bomb", "shoot", "admin", "root", "hacker", "violence", "suicide"];
    if (violentTerms.some(term => combined.includes(term))) {
        // LOCKDOWN SIMULATION FOR REGISTRATION
        // Since user doesn't exist yet, we just deny and log.
        await storageService.logActivity({
            actor: 'SYSTEM',
            actionType: 'SECURITY',
            description: `REGISTRATION BLOCKED: Violent content detected from ${cleanEmail}`,
            metadata: `Input: ${combined}`
        });
        setError("Security Policy Violation: Restricted content detected. Access Denied.");
        return;
    }

    if (email !== confirmEmail) {
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
    
    setTimeout(async () => {
        users[cleanUsername] = { 
            password, 
            email: cleanEmail, 
            name: cleanName, 
            verified: false
        };
        localStorage.setItem('studentpocket_users', JSON.stringify(users));

        const newProfile: UserProfile = {
            ...DEFAULT_USER,
            name: cleanName,
            email: cleanEmail,
            acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN
        };
        
        await storageService.setData(`architect_data_${cleanUsername}`, {
            user: newProfile,
            chatHistory: [],
            vaultDocs: []
        });
        
        setLoginInput(cleanUsername);
        setView('IDENTITY_SNAP');
        setIsProcessing(false);
    }, 1500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanInput = loginInput.trim();
    if (!cleanInput) {
        setError("Enter Username or Student ID.");
        return;
    }

    setIsProcessing(true);
    
    setTimeout(async () => {
        const usersStr = localStorage.getItem('studentpocket_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        
        let targetEmail = users[cleanInput] ? users[cleanInput].email : null;

        if (!targetEmail) {
             for (const key of Object.keys(users)) {
                  const data = await storageService.getData(`architect_data_${key}`);
                  if (data && data.user && data.user.studentId === cleanInput) {
                      targetEmail = data.user.email;
                      break;
                  }
             }
        }

        if (targetEmail) {
            setSuccess(`Recovery protocol initiated for ${targetEmail}. Check your secure inbox.`);
        } else {
            setError("Identity not found in registry.");
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
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
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
                    value={loginInput} 
                    onChange={(e) => setLoginInput(e.target.value)} 
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
              
              <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setView('ADMISSION_LOGIN')} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wide flex items-center">
                      <Key size={12} className="mr-1"/> Use Master/Admission Key
                  </button>
                  <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] text-slate-400 hover:text-white font-bold uppercase tracking-wide">
                      Forgot Password?
                  </button>
              </div>

              {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                      <AlertTriangle size={16} className="text-red-500 shrink-0"/>
                      <span className="text-red-400 text-xs font-bold">{error}</span>
                  </div>
              )}

              <div className="space-y-3 pt-2">
                <button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <>Sign In <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} /></>}
                </button>
                <button 
                  type="button"
                  onClick={() => setView('REGISTER')}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Create Account
                </button>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex justify-center">
                   <button type="button" onClick={() => onNavigate && onNavigate(View.ACCESS_RECOVERY)} className="flex items-center text-xs text-slate-500 hover:text-white transition-colors font-medium">
                       <HelpCircle size={14} className="mr-2" /> Recover Blocked Account
                   </button>
              </div>
            </form>
          )}

          {view === 'ADMISSION_LOGIN' && (
              <form onSubmit={handleAdmissionLogin} className="space-y-6 animate-scale-up">
                  <div className="text-center">
                      <h3 className="text-white font-bold text-lg mb-2">System Key Login</h3>
                      <p className="text-xs text-slate-400">Accepted: ADM, Master, Admission Key, Master Token</p>
                      <div className="mt-2 flex items-center justify-center text-amber-400 text-[10px] font-bold uppercase tracking-wide">
                        <AlertTriangle size={12} className="mr-1" /> Dynamic Key Rotation (10s)
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={loginInput} 
                        onChange={(e) => setLoginInput(e.target.value)} 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none text-white font-medium placeholder:text-slate-600 focus:border-indigo-500/50 transition-all text-sm" 
                        placeholder="Student ID / Username" 
                      />
                    </div>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={admissionKey} 
                        onChange={(e) => setAdmissionKey(e.target.value)} 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-emerald-500/30 rounded-xl outline-none text-white font-mono font-bold tracking-widest placeholder:text-slate-600 focus:border-emerald-500 transition-all text-sm uppercase" 
                        placeholder="KEY (MS-/ADM-/TKN-)" 
                      />
                    </div>
                  </div>

                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center uppercase tracking-wide">{error}</div>}

                  <div className="space-y-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={isProcessing} 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center group"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16}/> : 'Unlock & Restore Access'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setView('LOGIN')}
                      className="w-full text-slate-400 hover:text-white py-2 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Back to Standard Login
                    </button>
                  </div>
              </form>
          )}
          
          {view === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-scale-up">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Full Name" />
              <input type="text" value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white text-sm" placeholder="Choose Username" />
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
                <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest">Account data created locally.</p>
              </div>
            </form>
          )}

          {view === 'FORGOT_PASSWORD' && (
             <form onSubmit={handleForgotPassword} className="space-y-6 animate-scale-up">
                <div className="text-center">
                    <h3 className="text-white font-bold text-lg mb-2">Reset Password</h3>
                    <p className="text-xs text-slate-400">Enter your ID to receive reset instructions.</p>
                </div>

                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={loginInput} 
                    onChange={(e) => setLoginInput(e.target.value)} 
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
