
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2, ShieldCheck, Key } from 'lucide-react';
import { APP_NAME, ADMIN_USERNAME, WATERMARK } from '../constants';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'TWO_FACTOR';

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
        } else setAvatarPreview(null);
    } catch(e) { setAvatarPreview(null); }
  }, [username]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username === ADMIN_USERNAME && password === 'Sushil@Admin') {
      onLogin(ADMIN_USERNAME);
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[username];

    if (!userData) { setError('Identity not found.'); return; }

    const storedPassword = typeof userData === 'string' ? userData : userData.password;
    if (storedPassword === password) {
      // Check for 2FA
      const dataKey = `architect_data_${username}`;
      const dataStr = localStorage.getItem(dataKey);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.user?.twoFactorEnabled) {
          setView('TWO_FACTOR');
          return;
        }
      }
      
      setIsSending(true);
      setTimeout(() => { onLogin(username); setIsSending(false); }, 500);
    } else {
      setError('Invalid credentials.');
    }
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const dataKey = `architect_data_${username}`;
    const dataStr = localStorage.getItem(dataKey);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      if (data.user?.backupCodes.includes(twoFactorCode)) {
        setIsSending(true);
        setTimeout(() => { onLogin(username); setIsSending(false); }, 500);
      } else {
        setError('Invalid backup code.');
      }
    }
  };

  const initiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password || !confirmPassword || !email) { setError('All fields required.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    
    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (users[username]) { setError('Identity exists.'); return; }

    setIsSending(true);
    setTimeout(() => {
        users[username] = { password, email, verified: true };
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        onLogin(username);
        setIsSending(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-[3rem] shadow-2xl w-full max-w-sm p-10 text-center animate-scale-up border border-slate-100 dark:border-slate-800">
        
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 p-1 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative">
            {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover animate-fade-in" />
            ) : (
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-300">
                  {username ? username.charAt(0).toUpperCase() : 'W'}
                </span>
            )}
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
          {view === 'LOGIN' ? 'Entry Hub' : view === 'TWO_FACTOR' ? 'Security Phase' : 'Join Node'}
        </h1>
        <p className="text-[10px] text-slate-400 mb-8 font-black uppercase tracking-[0.4em]">{APP_NAME}</p>

        {view === 'LOGIN' && (
           <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-left relative">
                  <User className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none outline-none text-sm font-bold dark:text-white" placeholder="Username" />
              </div>
              <div className="text-left relative">
                  <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none outline-none text-sm font-bold dark:text-white" placeholder="Secret Key" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button type="submit" disabled={isSending} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center group">
                  {isSending ? <Loader2 className="animate-spin" /> : <>Authorize Hub <ArrowRight className="ml-2" /></>}
              </button>
              <button type="button" onClick={() => setView('REGISTER')} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest hover:underline">Provision New Hub</button>
           </form>
        )}

        {view === 'TWO_FACTOR' && (
           <form onSubmit={handle2FA} className="space-y-5">
              <div className="text-left relative">
                  <Key className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none outline-none text-sm font-black dark:text-white tracking-widest" placeholder="BACKUP CODE" />
              </div>
              <p className="text-[9px] text-slate-400 font-bold leading-tight">Enter one of the backup keys generated during setup.</p>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center">
                  {isSending ? <Loader2 className="animate-spin" /> : <>Verify Cluster Key <ShieldCheck className="ml-2" size={18}/></>}
              </button>
              <button type="button" onClick={() => setView('LOGIN')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Back to Login</button>
           </form>
        )}

        {view === 'REGISTER' && (
           <form onSubmit={initiateRegister} className="space-y-4">
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Hub Identity" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Email Contact" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Secret Key" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white text-sm" placeholder="Confirm Key" />
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button type="submit" disabled={isSending} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-lg">Initialize Node</button>
              <button type="button" onClick={() => setView('LOGIN')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Back to Hub</button>
           </form>
        )}
      </div>
      <p className="mt-8 text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">{WATERMARK}</p>
    </div>
  );
};
