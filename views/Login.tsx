
import React, { useState, useEffect } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Lock, ArrowRight, User, UserPlus, ArrowLeft, Mail, ShieldCheck, Send, KeyRound, CheckCircle2, Eye, EyeOff, Loader2, BadgeCheck, MessageSquarePlus } from 'lucide-react';
import { APP_NAME, ADMIN_EMAIL } from '../constants';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
  resetUser?: string | null; // Username passed if handling a valid reset link
}

type AuthView = 'LOGIN' | 'REGISTER' | 'VERIFY_CODE' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'LINK_SENT';

export const Login: React.FC<LoginProps> = ({ user, onLogin, resetUser }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Handle incoming reset request from App.tsx
  useEffect(() => {
    if (resetUser) {
      setView('RESET_PASSWORD');
      setUsername(resetUser); // Pre-fill username
    }
  }, [resetUser]);

  // Check verification status when username changes
  useEffect(() => {
    if (username) {
       try {
           const usersStr = localStorage.getItem('studentpocket_users');
           if (usersStr) {
               const users = JSON.parse(usersStr);
               if (users[username]?.verified) {
                   setIsVerified(true);
               } else {
                   setIsVerified(false);
               }
           }
       } catch(e) {
           setIsVerified(false);
       }
    } else {
        setIsVerified(false);
    }
  }, [username]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 1. Check Hardcoded Admin
    if (username === 'admin' && password === 'admin@123') {
      onLogin('admin');
      return;
    }

    // 2. Check Local Storage Users
    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[username];

    if (!userData) {
      setError('User not found');
      return;
    }

    // Handle legacy string format or new object format
    const storedPassword = typeof userData === 'string' ? userData : userData.password;

    if (storedPassword === password) {
      if (userData.verified === false) {
          // If password matches but not verified, send them to verify screen
          setView('VERIFY_CODE');
          setEmail(userData.email);
          setError('Please verify your email first.');
          return;
      }
      onLogin(username);
    } else {
      setError('Invalid password');
    }
  };

  const initiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !confirmPassword || !email) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (username === 'admin') {
      setError('Username "admin" is reserved.');
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (users[username]) {
      setError('Username already exists');
      return;
    }

    setIsSending(true);

    // Generate 6-Digit Verification Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send Email via Service
    const emailSent = await sendVerificationEmail(email, username, code);
    
    setIsSending(false);

    if (emailSent) {
      // Save User with verified: false ONLY if email sent successfully (or simulated success)
      users[username] = {
          password,
          email,
          verified: false,
          verificationCode: code
      };
      localStorage.setItem('studentpocket_users', JSON.stringify(users));

      // Switch to VERIFY_CODE view
      setView('VERIFY_CODE');
      setSuccessMsg(`Verification code sent to ${email}`);
    } else {
      setError("Could not send verification email. Try again.");
    }
  };

  const verifyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[username];

    if (!userData) {
      setError('User record missing. Please register again.');
      return;
    }

    if (userData.verificationCode === verificationCode) {
        // Success
        userData.verified = true;
        delete userData.verificationCode;
        users[username] = userData;
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        
        // Initialize user data storage
        const storageKey = `studentpocket_data_${username}`;
        if (!localStorage.getItem(storageKey)) {
          const initialData = {
              user: { 
                  name: username, // Default name to username 
                  email: userData.email, 
                  phone: "", 
                  education: "", 
                  institution: "", 
                  country: "Nepal", 
                  skills: [] 
              },
              assignments: [],
              notes: [],
              vaultDocs: [],
              scholarships: []
          };
          localStorage.setItem(storageKey, JSON.stringify(initialData));
        }

        alert("✅ Account Verified! Logging you in.");
        onLogin(username);
    } else {
        setError('Invalid code. Please check your email.');
    }
  };

  const requestAdminAction = (type: 'PASSWORD_RESET' | 'VERIFICATION_CODE') => {
    if (!username) {
        setError("Please enter your Username first.");
        return;
    }
    
    const request: ChangeRequest = {
        id: Date.now().toString(),
        username: username,
        type: type,
        status: 'PENDING',
        timestamp: new Date().toISOString()
    };

    const requestsStr = localStorage.getItem('studentpocket_requests') || '[]';
    const requests = JSON.parse(requestsStr);
    
    // Avoid duplicates for pending requests
    const exists = requests.find((r: ChangeRequest) => r.username === username && r.type === type && r.status === 'PENDING');
    if (exists) {
        alert("A request is already pending with the Admin.");
        return;
    }

    requests.push(request);
    localStorage.setItem('studentpocket_requests', JSON.stringify(requests));
    
    alert(`Request sent to Admin (${ADMIN_EMAIL}). Please wait for them to process it.`);
    if (type === 'PASSWORD_RESET') setView('LOGIN');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email) {
      setError('Please enter both Username and Email');
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const userData = users[username];

    if (!userData || (typeof userData === 'object' && userData.email !== email)) {
      setError('No account found with these details.');
      return;
    }

    setIsSending(true);

    // Generate Reset Token
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Save token to user
    users[username] = {
      ...userData,
      resetToken: resetToken
    };
    localStorage.setItem('studentpocket_users', JSON.stringify(users));

    // Generate Link
    const link = `${window.location.origin}${window.location.pathname}?mode=reset&user=${encodeURIComponent(username)}&token=${resetToken}`;

    // Send Email
    const emailSent = await sendPasswordResetEmail(email, username, link);
    setIsSending(false);

    if (emailSent) {
      setView('LINK_SENT');
      setSuccessMsg(`Password reset link sent to ${email}`);
    } else {
      setError("Failed to send reset email.");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    if (!usersStr) return;
    
    const users = JSON.parse(usersStr);
    const userData = users[username];

    if (userData) {
      // Update password and remove reset token
      users[username] = {
        ...userData,
        password: password
      };
      delete users[username].resetToken;
      
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
      
      alert("✅ Password updated successfully! Please login.");
      setView('LOGIN');
      setPassword('');
      setConfirmPassword('');
      // Clean URL if present
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-scale-up relative z-10 border border-white/50">
        
        {/* Header Icon */}
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 p-1 border-4 border-white shadow-lg overflow-hidden group relative">
            {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
                <span className="text-3xl font-bold text-indigo-600">
                  {view === 'LINK_SENT' ? <Mail size={40} /> : 
                   view === 'FORGOT_PASSWORD' ? <KeyRound size={40} /> :
                   view === 'RESET_PASSWORD' ? <ShieldCheck size={40} /> :
                   view === 'VERIFY_CODE' ? <CheckCircle2 size={40} /> :
                   (username ? username.charAt(0).toUpperCase() : 'S')}
                </span>
            )}
            {/* Badge on Login Screen if verified */}
            {view === 'LOGIN' && isVerified && (
               <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                 <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-50" />
               </div>
            )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {view === 'LOGIN' ? 'Welcome Back' : 
           view === 'REGISTER' ? 'Create Account' : 
           view === 'VERIFY_CODE' ? 'Verify Email' :
           view === 'FORGOT_PASSWORD' ? 'Recover Account' :
           view === 'RESET_PASSWORD' ? 'New Password' :
           'Check Your Inbox'}
        </h1>
        <p className="text-gray-500 mb-8 font-medium">
          {view === 'LOGIN' ? APP_NAME : 
           view === 'REGISTER' ? 'Join StudentPocket' : 
           view === 'VERIFY_CODE' ? `Code sent to ${email}` :
           view === 'FORGOT_PASSWORD' ? 'Enter details to reset password' :
           view === 'RESET_PASSWORD' ? `Resetting for ${username}` :
           successMsg}
        </p>

        {/* VERIFY CODE VIEW */}
        {view === 'VERIFY_CODE' && (
           <form onSubmit={verifyAccount} className="space-y-6">
              <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Enter 6-Digit Code</label>
                  <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="block w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800 mt-1"
                      placeholder="000000"
                  />
              </div>

              <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Verify Code
                </button>
                <a 
                    href="https://mail.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors"
                    title="Open Gmail"
                >
                    <Mail className="w-5 h-5" />
                </a>
              </div>
              
              <div className="mt-2 text-center">
                 <button 
                   type="button" 
                   onClick={() => requestAdminAction('VERIFICATION_CODE')}
                   className="text-xs text-orange-500 hover:text-orange-700 font-medium underline"
                 >
                   Didn't receive code? Ask Admin
                 </button>
                 <p className="text-[10px] text-gray-400 mt-1">Contact: {ADMIN_EMAIL}</p>
              </div>
              
              {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}

              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setError(''); }}
                className="w-full text-gray-500 text-sm py-2 hover:text-indigo-600 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
           </form>
        )}

        {/* LINK_SENT VIEW (Used for Password Reset Link) */}
        {view === 'LINK_SENT' && (
           <div className="space-y-6">
              <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-800">
                  <p className="mb-2 font-medium">Link Sent!</p>
                  <p className="text-xs text-indigo-500">
                    If using the live email service, check your inbox. If simulating, check the prompt/alert.
                  </p>
              </div>

              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setSuccessMsg(''); setError(''); }}
                className="w-full text-gray-500 text-sm py-2 hover:text-indigo-600 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
           </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'FORGOT_PASSWORD' && (
           <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 ml-1">Username (User ID)</label>
                  <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800 mt-1"
                      placeholder="Enter Username"
                  />
              </div>
              <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 ml-1">Email Address</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800 mt-1"
                      placeholder="Enter registered email"
                  />
              </div>
              
              {error && <p className="text-red-500 text-xs mt-1 text-left font-medium">{error}</p>}

              <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-5 h-5" />}
                  {isSending ? "Sending Link..." : "Send Reset Link"}
              </button>

              <div className="flex items-center justify-center">
                 <span className="text-gray-300 text-xs px-2">OR</span>
              </div>

              <button 
                type="button"
                onClick={() => requestAdminAction('PASSWORD_RESET')}
                className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-xl text-sm font-bold hover:bg-orange-100 transition-all flex items-center justify-center"
              >
                 <MessageSquarePlus className="mr-2 w-4 h-4" /> Ask Admin to Reset
              </button>
              
              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setError(''); }}
                className="w-full text-gray-500 text-sm py-2 hover:text-indigo-600 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
           </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {view === 'RESET_PASSWORD' && (
           <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-left">
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                      placeholder="New Password"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                      placeholder="Confirm New Password"
                  />
              </div>
              
              {error && <p className="text-red-500 text-xs mt-1 text-left font-medium">{error}</p>}

              <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-all flex items-center justify-center mt-4"
              >
                  <CheckCircle2 className="mr-2 w-5 h-5" /> Update Password
              </button>
           </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'REGISTER' && (
           <form onSubmit={initiateRegister} className="space-y-4">
              <div className="text-left">
                  <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                      placeholder="Username"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                      placeholder="Email Address"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                      placeholder="Password"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                      placeholder="Confirm Password"
                  />
              </div>
              
              {error && <p className="text-red-500 text-xs mt-1 text-left font-medium">{error}</p>}

              <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-5 h-5" />}
                  {isSending ? "Sending..." : "Send Code"}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setError(''); }}
                className="w-full text-gray-500 text-sm py-2 hover:text-indigo-600 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
           </form>
        )}

        {/* LOGIN VIEW */}
        {view === 'LOGIN' && (
           <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left">
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                              setUsername(e.target.value);
                              setError('');
                          }}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                          placeholder="Username"
                          autoCapitalize="none"
                      />
                  </div>
              </div>

              <div className="text-left">
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                              setPassword(e.target.value);
                              setError('');
                          }}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800"
                          placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                  </div>
                  <div className="text-right mt-1">
                    <button 
                      type="button"
                      onClick={() => { setView('FORGOT_PASSWORD'); setError(''); }}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
              </div>

              {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>{error}</p>}

              <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center group mt-4"
              >
                  <span>Login</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                type="button" 
                onClick={() => { setView('REGISTER'); setError(''); }}
                className="w-full text-indigo-600 text-sm font-medium py-2 hover:underline"
              >
                <UserPlus className="inline w-4 h-4 mr-1" /> Create New Account
              </button>
           </form>
        )}
      </div>
      
       <div className="mt-8 text-center">
        <p className="text-indigo-300 text-sm font-medium animate-pulse mb-2">{APP_NAME}</p>
        <button 
            onClick={() => {
                if(window.confirm("RESET ALL DATA? This will delete all users and data.")) {
                    localStorage.clear();
                    window.location.reload();
                }
            }}
            className="text-[10px] text-indigo-300/50 hover:text-indigo-300 underline"
        >
            Reset Application
        </button>
       </div>
    </div>
  );
};
