
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2, ShieldCheck, Key, Monitor, Mail, ShieldAlert, HelpCircle, X, Smartphone } from 'lucide-react';
import { APP_NAME, ADMIN_USERNAME, WATERMARK, ADMIN_SECRET } from '../constants';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'TOTP_AUTH' | 'DEVICE_APPROVAL';

export const Login: React.FC<LoginProps> = ({ user, onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

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
      const dataKey = `architect_data_${username}`;
      const dataStr = localStorage.getItem(dataKey);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.user?.totpEnabled) {
          setView('TOTP_AUTH');
          return;
        }
      }
      
      setIsSending(true);
      setTimeout(() => { onLogin(username); setIsSending(false); }, 1200);
    } else {
      setError('Access Denied. Invalid Secret Key.');
    }
  };

  const handleTotpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulated TOTP validation
    if (totpCode.length === 6) {
      setIsSending(true);
      setTimeout(() => { onLogin(username); setIsSending(false); }, 1000);
    } else {
      setError('Invalid 6-digit synchronization code.');
    }
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
        onLogin(username);
        setIsSending(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 transition-colors duration-500 relative">
      <button 
        onClick={() => setShowHelp(true)}
        className="absolute top-6 right-6 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
      >
        <HelpCircle size={24} />
      </button>

      <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl w-full max-w-sm p-10 text-center animate-scale-up border border-slate-100 dark:border-slate-800">
        
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 p-1 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-300">
              {username ? username.charAt(0).toUpperCase() : 'S'}
            </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
          {view === 'LOGIN' ? 'Entry Hub' : 
           view === 'TOTP_AUTH' ? 'Node Auth' : 'New Identity'}
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

        {view === 'TOTP_AUTH' && (
            <div className="space-y-6 animate-scale-up text-center">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 dark:border-indigo-800">
                    <Smartphone size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Authenticator Key</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                    Input the 6-digit synchronization code from your Google Authenticator app.
                </p>
                <form onSubmit={handleTotpVerify} className="space-y-6">
                    <input 
                      type="text" 
                      value={totpCode} 
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      className="w-full text-center text-3xl font-black tracking-[0.4em] p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-none dark:text-white"
                      placeholder="000000"
                    />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                    <button 
                        type="submit"
                        disabled={isSending || totpCode.length < 6}
                        className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="animate-spin mr-2" /> : "Verify Synchronization"}
                    </button>
                </form>
                <button type="button" onClick={() => setView('LOGIN')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Back to Entry</button>
            </div>
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

      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Hub</h3>
                <button onClick={() => setShowHelp(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
             </div>
             <div className="space-y-4">
                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                   <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Administrator Access</p>
                   <p className="text-xs font-bold dark:text-slate-200">Username: <span className="text-indigo-600">admin</span></p>
                   <p className="text-xs font-bold dark:text-slate-200">Password: <span className="text-indigo-600">{ADMIN_SECRET}</span></p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Authenticator</p>
                   <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                     If TOTP is active, use your linked app to generate a 6-digit sync code.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">{WATERMARK}</p>
    </div>
  );
};
