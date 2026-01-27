import React, { useState, useRef, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, Fingerprint, ShieldAlert, UserPlus, Server } from 'lucide-react';
import { APP_NAME, SYSTEM_DOMAIN, APP_VERSION, BUILD_DATE, MAX_LOGIN_ATTEMPTS, ADMIN_USERNAME, ADMIN_SECRET, PRE_SEEDED_USERS, DEFAULT_USER } from '../constants';
import { storageService } from '../services/storageService';

interface LoginProps {
  onLogin: (username: string) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [stage, setStage] = useState<'WELCOME' | 'CREDENTIALS' | 'BIOMETRIC'>('WELCOME');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [systemError, setSystemError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const seedSystem = async () => {
        const usersStr = localStorage.getItem('studentpocket_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        
        let changed = false;
        // 1. Ensure Admin exists
        if (!users[ADMIN_USERNAME]) {
            users[ADMIN_USERNAME] = { password: ADMIN_SECRET, name: 'Lead Architect', email: `admin@${SYSTEM_DOMAIN}`, verified: true };
            changed = true;
        }
        
        // 2. Seed 10 Storage Users if they don't exist
        for (const u of PRE_SEEDED_USERS) {
            if (!users[u.username]) {
                users[u.username] = { password: u.password, name: u.name, email: u.email, verified: false };
                changed = true;
                
                // Initialize their data node too
                const profile = { ...DEFAULT_USER, name: u.name, email: u.email, studentId: `STP-NODE-${u.username.toUpperCase()}` };
                await storageService.setData(`architect_data_${u.username}`, { user: profile, vaultDocs: [], assignments: [] });
            }
        }
        
        if (changed) localStorage.setItem('studentpocket_users', JSON.stringify(users));
    };
    seedSystem();
  }, []);

  const initializeTerminal = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('CREDENTIALS');
    }, 800);
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) return;
    setLoading(true);
    setSystemError('');

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[userId];

    if (!userData || (typeof userData === 'string' ? userData !== token : userData.password !== token)) {
        const newCount = await storageService.recordFailedLogin(userId);
        setAttempts(newCount);
        setSystemError(`ACCESS DENIED. ATTEMPT ${newCount}/${MAX_LOGIN_ATTEMPTS}`);
        setLoading(false);
        return;
    }

    setTimeout(() => {
      setLoading(false);
      setStage('BIOMETRIC');
      startBiometricSim();
    }, 1000);
  };

  const startBiometricSim = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.warn("Hardware Bypass: Protocol engaged.");
    }
  };

  const grantAccess = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin(userId);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-950/20 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/30 rounded-full blur-[160px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-platinum">
        <div className="master-box p-12 md:p-16 border border-white/10">
          
          {stage === 'WELCOME' && (
            <div className="text-center space-y-12">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(255,255,255,0.1)] transform -rotate-3">
                <ShieldCheck size={48} className="text-black" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{APP_NAME}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.7em]">MULTI-NODE ARCHITECTURE ACTIVE</p>
              </div>
              <div className="space-y-4">
                <button onClick={initializeTerminal} disabled={loading} className="btn-platinum w-full py-6">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Portal <ArrowRight className="ml-3" size={18}/></>}
                </button>
                <div className="pt-4 flex items-center justify-center space-x-2 opacity-30">
                    <Server size={14} className="text-white" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Storage Registry: 10 Nodes Connected</span>
                </div>
              </div>
            </div>
          )}

          {stage === 'CREDENTIALS' && (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Identity Validation</h2>
                {attempts > 0 && (
                    <div className="inline-flex items-center space-x-2 bg-red-500/10 px-4 py-1.5 rounded-full mt-5 border border-red-500/20">
                        <ShieldAlert size={12} className="text-red-500 animate-pulse" />
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.3em]">Warning {attempts}/{MAX_LOGIN_ATTEMPTS}</span>
                    </div>
                )}
              </div>

              <form onSubmit={handleCredentialSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Node Identity</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-white" size={18} />
                    <input 
                      type="text" 
                      value={userId} 
                      onChange={e => setUserId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-white font-bold text-sm outline-none focus:border-white/30 transition-all placeholder:text-slate-700"
                      placeholder="Student ID / Alias"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Security Token</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-white" size={18} />
                    <input 
                      type={showToken ? "text" : "password"} 
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-16 text-white font-bold text-sm outline-none focus:border-white/30 transition-all placeholder:text-slate-700"
                      placeholder="Encrypted Hash"
                      autoComplete="off"
                    />
                    <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                      {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {systemError && <p className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest">{systemError}</p>}

                <button type="submit" disabled={loading} className="btn-platinum w-full py-6">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Authorize Node'}
                </button>
              </form>
            </div>
          )}

          {stage === 'BIOMETRIC' && (
            <div className="text-center space-y-12">
              <div className="relative mx-auto w-64 h-64 rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl bg-black group">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-40 grayscale group-hover:opacity-60 transition-opacity" />
                <div className="absolute inset-0 border-[24px] border-black/80"></div>
                <div className="absolute inset-x-0 top-0 h-0.5 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[scan_3s_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint size={100} className="text-white opacity-5 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Biometric Integrity</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.6em] mt-3">Validating Signal</p>
              </div>
              <button onClick={grantAccess} disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/30 transition-all hover:bg-indigo-500">
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Finalize Sync'}
              </button>
            </div>
          )}

          <div className="mt-16 text-center border-t border-white/5 pt-10 space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <span className="stark-badge">{APP_VERSION}</span>
              <p className="text-[9px] text-white font-black tracking-[0.5em] uppercase">{BUILD_DATE}</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes scan { 0%, 100% { top: 0%; opacity: 0.5; } 50% { top: 100%; opacity: 1; } }`}</style>
    </div>
  );
};