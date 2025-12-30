
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2, ShieldCheck, Key, Monitor, Mail, ShieldAlert, CheckCircle } from 'lucide-react';
import { APP_NAME, ADMIN_USERNAME, WATERMARK, ADMIN_SECRET } from '../constants';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'TWO_FACTOR' | 'DEVICE_APPROVAL' | 'GMAIL_AUTH';

export const Login: React.FC<LoginProps> = ({ user, onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!username) { setAvatarPreview(null); return; }
    try {
        const dataKey = `architect_data_${username}`;
        const dataStr = localStorage.getItem(dataKey);
        if (dataStr) {
            const data = JSON.parse(dataStr);
            if (data.user?.avatar) setAvatarPreview(data.user.avatar);
            else setAvatarPreview(null);
        }
    } catch(e) { setAvatarPreview(null); }
  }, [username]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check Admin Credentials
    if (username === ADMIN_USERNAME && password === ADMIN_SECRET) {
      onLogin(ADMIN_USERNAME);
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[username];

    if (!userData) { setError('Identity node not found.'); return; }

    const storedPassword = typeof userData === 'string' ? userData : userData.password;
    if (storedPassword === password) {
      // Simulate multi-device detection
      const knownDevice = localStorage.getItem(`authorized_device_${username}`);
      if (!knownDevice && username !== ADMIN_USERNAME) {
        setView('DEVICE_APPROVAL');
        return;
      }

      // Check for 2FA
      const dataKey = `architect_data_${username}`;
      const dataStr = localStorage.getItem(dataKey);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.user?.twoFactorEnabled) {
          setView('GMAIL_AUTH');
          return;
        }
      }
      
      setIsSending(true);
      setTimeout(() => { onLogin(username); setIsSending(false); }, 1200);
    } else {
      setError('Access Denied. Invalid Secret Key.');
    }
  };

  const simulateGmailCode = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setView('TWO_FACTOR');
    }, 1500);
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const dataKey = `architect_data_${username}`;
    const dataStr = localStorage.getItem(dataKey);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      // Accept any backup code or a simulated Gmail OTP (123456)
      if (data.user?.backupCodes.includes(twoFactorCode) || twoFactorCode === "123456") {
        setIsSending(true);
        localStorage.setItem(`authorized_device_${username}`, 'TRUE');
        setTimeout(() => { onLogin(username); setIsSending(false); }, 1000);
      } else {
        setError('Verification key rejected.');
      }
    }
  };

  const handleDeviceApproval = () => {
    setIsSending(true);
    setTimeout(() => {
        // Mock Admin Pop-up approval
        setView('GMAIL_AUTH');
        setIsSending(false);
    }, 2000);
  };

  const initiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password || !confirmPassword || !email) { setError('All segments required.'); return; }
    if (password !== confirmPassword) { setError('Key mismatch.'); return; }
    
    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (users[username]) { setError('Identity exists.'); return; }

    setIsSending(true);
    setTimeout(() => {
        users[username] = { password, email, verified: true };
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        localStorage.setItem(`authorized_device_${username}`, 'TRUE');
        onLogin(username);
        setIsSending(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl w-full max-w-sm p-10 text-center animate-scale-up border border-slate-100 dark:border-slate-800">
        
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 p-1 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative">
            {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover animate-fade-in" />
            ) : (
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-300">
                  {username ? username.charAt(0).toUpperCase() : 'S'}
                </span>
            )}
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
          {view === 'LOGIN' ? 'Entry Hub' : 
           view === 'TWO_FACTOR' ? 'Auth Verification' : 
           view === 'GMAIL_AUTH' ? 'Gmail Protocol' :
           view === 'DEVICE_APPROVAL' ? 'Admin Gateway' : 'New Identity'}
        </h1>
        <p className="text-[10px] text-slate-400 mb-8 font-black uppercase tracking-[0.4em]">{APP_NAME}</p>

        {view === 'LOGIN' && (
           <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-left relative">
                  <User className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none outline-none text-sm font-bold dark:text-white" placeholder="Identity Node" />
              </div>
              <div className="text-left relative">
                  <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none outline-none text-sm font-bold dark:text-white" placeholder="Secret Key" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button type="submit" disabled={isSending} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center group active:scale-95 transition-all">
                  {isSending ? <Loader2 className="animate-spin" /> : <>Unlock Hub <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
              </button>
              <button type="button" onClick={() => setView('REGISTER')} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest hover:underline">New Identity Segment</button>
           </form>
        )}

        {view === 'DEVICE_APPROVAL' && (
           <div className="space-y-6 animate-scale-up text-center">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100 dark:border-amber-800 shadow-inner">
                <Monitor size={32} />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Security Alert: New Node</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  A connection from an unrecognized device has been detected. Sushil's Admin pop-up approval is required.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldAlert size={24} /></div>
                  <p className="text-[9px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest">Administrator notification has been pushed to the primary device.</p>
              </div>
              <button 
                onClick={handleDeviceApproval}
                disabled={isSending}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
              >
                  {isSending ? <Loader2 className="animate-spin mr-2" /> : "Request Admin Approval"}
              </button>
           </div>
        )}

        {view === 'GMAIL_AUTH' && (
            <div className="space-y-6 animate-scale-up text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-100 dark:border-red-800">
                    <Mail size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Gmail 2FA Handshake</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                    The 2FA system will send a secure OTP to your registered Gmail address.
                </p>
                <button 
                    onClick={simulateGmailCode}
                    disabled={isSending}
                    className="w-full bg-red-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center active:scale-95 transition-all"
                >
                    {isSending ? <Loader2 className="animate-spin mr-2" /> : "Dispatch Gmail OTP"}
                </button>
                <button type="button" onClick={() => setView('LOGIN')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Back to Entry</button>
            </div>
        )}

        {view === 'TWO_FACTOR' && (
           <form onSubmit={handle2FA} className="space-y-5">
              <div className="text-left relative">
                  <Key className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none outline-none text-sm font-black dark:text-white tracking-[0.4em]" placeholder="GMAIL OTP" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-widest">Enter the code sent to your Gmail or a recovery cluster key.</p>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center active:scale-95 transition-all">
                  {isSending ? <Loader2 className="animate-spin mr-2" /> : <>Finalize Identity <ShieldCheck className="ml-2" size={18}/></>}
              </button>
              <button type="button" onClick={() => setView('LOGIN')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cancel Handshake</button>
           </form>
        )}

        {view === 'REGISTER' && (
           <form onSubmit={initiateRegister} className="space-y-4">
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Hub Name" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Gmail Address" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Secret Key" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Confirm Secret" />
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button type="submit" disabled={isSending} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Provision Hub</button>
              <button type="button" onClick={() => setView('LOGIN')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Return to Entry</button>
           </form>
        )}
      </div>
      <p className="mt-8 text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">{WATERMARK}</p>
    </div>
  );
};
