
import React, { useState, useEffect } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Lock, ArrowRight, User, UserPlus, ArrowLeft, Mail, ShieldCheck, Send, KeyRound, CheckCircle2, Eye, EyeOff, Loader2, BadgeCheck, MessageSquarePlus, AlertTriangle } from 'lucide-react';
import { APP_NAME, ADMIN_EMAIL, ADMIN_USERNAME } from '../constants';
import { sendPasswordResetEmail } from '../services/emailService';

interface LoginProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
  resetUser?: string | null; // Username passed if handling a valid reset link
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'LINK_SENT';

export const Login: React.FC<LoginProps> = ({ user, onLogin, resetUser }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
    if (username === ADMIN_USERNAME && password === 'Sushil@#$%123') {
      // Ensure Admin exists in local storage and is VERIFIED
      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      // Auto-create or Auto-update admin to be verified
      if (!users[ADMIN_USERNAME] || !users[ADMIN_USERNAME].verified) {
          users[ADMIN_USERNAME] = {
              password: 'Sushil@#$%123', // Sync password
              email: ADMIN_EMAIL,
              verified: true // FORCE VERIFY
          };
          localStorage.setItem('studentpocket_users', JSON.stringify(users));
          
          // Ensure Admin Data Profile Exists
          const dataKey = `studentpocket_data_${ADMIN_USERNAME}`;
          if (!localStorage.getItem(dataKey)) {
              const initialData = {
                user: { 
                    name: "Sushil Pokharel", 
                    email: ADMIN_EMAIL, 
                    phone: "9800000000", 
                    education: "Administrator", 
                    institution: "System", 
                    country: "Nepal", 
                    skills: ["System Admin"],
                    badges: ["👑 System Admin"] 
                },
                assignments: [],
                notes: [],
                vaultDocs: [],
                scholarships: []
            };
            localStorage.setItem(dataKey, JSON.stringify(initialData));
          }
      }

      onLogin(ADMIN_USERNAME);
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
      // Login successful regardless of verification status
      // App.tsx handles feature locking based on isVerified
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

    if (username === ADMIN_USERNAME) {
      setError(`Username "${ADMIN_USERNAME}" is reserved.`);
      return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (users[username]) {
      setError('Username already exists');
      return;
    }

    setIsSending(true);

    // Simulate small delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSending(false);

    // Create User (Unverified by default) - NO VERIFICATION CODE
    users[username] = {
        password,
        email,
        verified: false, // Default to false
    };
    localStorage.setItem('studentpocket_users', JSON.stringify(users));

    // Initialize user data storage
    const storageKey = `studentpocket_data_${username}`;
    const initialData = {
        user: { 
            name: username, 
            email: email, 
            phone: "", 
            education: "", 
            institution: "", 
            country: "Nepal", 
            skills: [],
            badges: ["🌱 New Member"] // Automatically assign new member badge
        },
        assignments: [],
        notes: [],
        vaultDocs: [],
        scholarships: []
    };
    localStorage.setItem(storageKey, JSON.stringify(initialData));

    alert("✅ Account Created! You are in Limited Mode. Please request verification from the Dashboard to unlock all features.");
    onLogin(username);
  };

  const requestAdminAction = (type: 'PASSWORD_RESET') => {
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
    <div className="min-h-screen bg-indigo-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-scale-up relative z-10 border border-white/50 dark:border-gray-700 transition-colors duration-300">
        
        {/* Header Icon */}
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6 p-1 border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden group relative">
            {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                  {view === 'LINK_SENT' ? <Mail size={40} /> : 
                   view === 'FORGOT_PASSWORD' ? <KeyRound size={40} /> :
                   view === 'RESET_PASSWORD' ? <ShieldCheck size={40} /> :
                   (username ? username.charAt(0).toUpperCase() : 'S')}
                </span>
            )}
            {/* Badge on Login Screen if verified */}
            {view === 'LOGIN' && isVerified && (
               <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                 <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-50 dark:fill-blue-900" />
               </div>
            )}
             {view === 'LOGIN' && username && !isVerified && username !== ADMIN_USERNAME && (
               <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                 <AlertTriangle className="w-6 h-6 text-yellow-500 fill-yellow-50 dark:fill-yellow-900" />
               </div>
            )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          {view === 'LOGIN' ? 'Welcome Back' : 
           view === 'REGISTER' ? 'Create Account' : 
           view === 'FORGOT_PASSWORD' ? 'Recover Account' :
           view === 'RESET_PASSWORD' ? 'New Password' :
           'Check Your Inbox'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          {view === 'LOGIN' ? APP_NAME : 
           view === 'REGISTER' ? 'Join StudentPocket' : 
           view === 'FORGOT_PASSWORD' ? 'Enter details to reset password' :
           view === 'RESET_PASSWORD' ? `Resetting for ${username}` :
           successMsg}
        </p>

        {/* LINK_SENT VIEW */}
        {view === 'LINK_SENT' && (
           <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-200">
                  <p className="mb-2 font-medium">Link Sent!</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-300">
                    Check your email inbox to reset your password.
                  </p>
              </div>

              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setSuccessMsg(''); setError(''); }}
                className="w-full text-gray-500 dark:text-gray-400 text-sm py-2 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>
           </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'FORGOT_PASSWORD' && (
           <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Username (User ID)</label>
                  <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white mt-1"
                      placeholder="Enter Username"
                  />
              </div>
              <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white mt-1"
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
                 <span className="text-gray-300 dark:text-gray-600 text-xs px-2">OR</span>
              </div>

              <button 
                type="button"
                onClick={() => requestAdminAction('PASSWORD_RESET')}
                className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 py-2 rounded-xl text-sm font-bold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all flex items-center justify-center"
              >
                 <MessageSquarePlus className="mr-2 w-4 h-4" /> Ask Admin to Reset
              </button>
              
              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setError(''); }}
                className="w-full text-gray-500 dark:text-gray-400 text-sm py-2 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center"
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
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="New Password"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
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
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Username"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Email Address"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Password"
                  />
              </div>
              <div className="text-left">
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Confirm Password"
                  />
              </div>
              
              {error && <p className="text-red-500 text-xs mt-1 text-left font-medium">{error}</p>}

              <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isSending ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 w-5 h-5" />}
                  {isSending ? "Creating Account..." : "Sign Up"}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setView('LOGIN'); setError(''); }}
                className="w-full text-gray-500 dark:text-gray-400 text-sm py-2 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center"
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
                          <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                              setUsername(e.target.value);
                              setError('');
                          }}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                          placeholder="Username"
                          autoCapitalize="none"
                      />
                  </div>
              </div>

              <div className="text-left">
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                              setPassword(e.target.value);
                              setError('');
                          }}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-800 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                          placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                  </div>
                  <div className="text-right mt-1">
                    <button 
                      type="button"
                      onClick={() => { setView('FORGOT_PASSWORD'); setError(''); }}
                      className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
              </div>

              {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>{error}</p>}

              <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 active:scale-[0.98] transition-all flex items-center justify-center group mt-4"
              >
                  <span>Login</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                type="button" 
                onClick={() => { setView('REGISTER'); setError(''); }}
                className="w-full text-indigo-600 dark:text-indigo-400 text-sm font-medium py-2 hover:underline"
              >
                <UserPlus className="inline w-4 h-4 mr-1" /> Create New Account
              </button>
           </form>
        )}
      </div>
      
       <div className="mt-8 text-center">
        <p className="text-indigo-300 dark:text-indigo-500 text-sm font-medium animate-pulse mb-2">{APP_NAME}</p>
        <button 
            onClick={() => {
                if(window.confirm("RESET ALL DATA? This will delete all users and data.")) {
                    localStorage.clear();
                    window.location.reload();
                }
            }}
            className="text-[10px] text-indigo-300/50 dark:text-gray-600 hover:text-indigo-300 dark:hover:text-gray-400 underline"
        >
            Reset Application
        </button>
       </div>
    </div>
  );
};
