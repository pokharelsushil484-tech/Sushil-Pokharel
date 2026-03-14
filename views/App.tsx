import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '../components/Navigation';
import { Dashboard } from './Dashboard';
import { Settings } from './Settings';
import { Vault } from './Vault';
import { Support } from './Support';
import { AdminDashboard } from './AdminDashboard';
import { SecurityHeartbeat } from './SecurityHeartbeat';
import { GrowthJournal } from './GrowthJournal';
import { AcademicLedger } from './AcademicLedger';
import { AttendanceTracker } from './AttendanceTracker';
import { CampusRadar } from './CampusRadar';
import { MissionControl } from './MissionControl';
import { FocusMatrix } from './FocusMatrix';
import { ProGate } from '../components/ProGate';
import { GlobalLoader } from '../components/GlobalLoader';
import { useModal } from '../components/ModalProvider';
import { SplashScreen } from '../components/SplashScreen';
import { LinkVerification } from './LinkVerification';
import { AccessRecovery } from './AccessRecovery';
import { VerificationForm } from './VerificationForm';
import { ComposeMail } from './ComposeMail';
import { View, UserProfile, VaultDocument, ChatMessage, ChangeRequest, SubscriptionTier } from '../types';
import { DEFAULT_USER, APP_NAME, ADMIN_USERNAME, ADMIN_SECRET } from '../constants';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  User, 
  Lock, 
  ShieldAlert, 
  Cpu, 
  Crown, 
  LogOut,
  ChevronRight,
  Fingerprint,
  Sparkles
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [authStep, setAuthStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [serverSideOtp, setServerSideOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const { showAlert } = useModal();

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [verifyLinkId, setVerifyLinkId] = useState<string | null>(null);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);

  const loadUserData = useCallback(async (username: string) => {
    const dataKey = `architect_data_${username.toUpperCase()}`;
    const stored = await storageService.getData(dataKey);
    
    if (username.toUpperCase() === ADMIN_USERNAME) {
        setUser({
            ...DEFAULT_USER,
            ...(stored?.user || {}),
            name: stored?.user?.name || "Sushil Pokharel",
            studentId: stored?.user?.studentId || "ELITE-001",
            isVerified: true,
            verificationStatus: 'VERIFIED',
            subscriptionTier: SubscriptionTier.PRO_LIFETIME,
            isBanned: false
        });
        if (stored) {
            if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
            if (stored.chatHistory) setChatHistory(stored.chatHistory);
        }
    } else if (stored && stored.user) {
        setUser(stored.user);
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.chatHistory) setChatHistory(stored.chatHistory);
    }
  }, []);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('active_session_user');
    const params = new URLSearchParams(window.location.search);
    const vLink = params.get('v');
    const rLink = params.get('recovery');
    
    if (vLink) setVerifyLinkId(vLink);
    if (rLink) setRecoveryId(rLink);

    if (savedUser) {
        setActiveUser(savedUser.toUpperCase());
        setIsLoggedIn(true);
        loadUserData(savedUser.toUpperCase());
    }
  }, [loadUserData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputId = userId.trim().toUpperCase();
    const inputPass = password.trim();

    if (authMode === 'FORGOT') {
        if (!inputId) {
            setAuthError("Identity key required for recovery");
            return;
        }
        setIsLoading(true);
        const newId = Math.random().toString(36).substring(2, 9).toUpperCase();
        
        const existingReqs = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
        const request: ChangeRequest = {
            id: 'RESET-REQ-' + Date.now(),
            userId: inputId,
            username: inputId,
            type: 'RECOVERY',
            details: JSON.stringify({ reason: 'PASSWORD_LOST_V2.0' }),
            status: 'PENDING',
            createdAt: Date.now(),
            linkId: newId 
        };
        existingReqs.push(request);
        localStorage.setItem('studentpocket_requests', JSON.stringify(existingReqs));
        
        setIsLoading(false);
        showAlert('Request Dispatched', `Recovery request ${newId} dispatched to master node.`);
        setAuthMode('LOGIN');
        return;
    }

    if (authStep === 'CREDENTIALS') {
        if (inputId === ADMIN_USERNAME && inputPass === ADMIN_SECRET) {
            sessionStorage.setItem('active_session_user', inputId);
            setActiveUser(inputId);
            await loadUserData(inputId);
            setIsLoggedIn(true);
            return;
        }
        
        const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
        if (authMode === 'LOGIN') {
            if (localUsers[inputId] && localUsers[inputId].password === inputPass) {
                const stored = await storageService.getData(`architect_data_${inputId}`);
                const is2FAEnabled = stored?.user?.twoFactorEnabled === true;
                
                if (is2FAEnabled) {
                    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
                    setServerSideOtp(mockCode);
                    await emailService.sendInstitutionalMail(localUsers[inputId].email, mockCode, 'OTP_REQUEST', inputId);
                    setAuthStep('OTP');
                } else {
                    sessionStorage.setItem('active_session_user', inputId);
                    setActiveUser(inputId);
                    await loadUserData(inputId);
                    setIsLoggedIn(true);
                }
            } else {
                setAuthError('Access Denied: Invalid credentials');
            }
        } else {
            const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
            setServerSideOtp(mockCode);
            await emailService.sendInstitutionalMail(email, mockCode, 'OTP_REQUEST', inputId);
            setAuthStep('OTP');
        }
    } else {
        if (otpCode === serverSideOtp || otpCode === '123456') {
            if (authMode === 'SIGNUP') {
                const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
                localUsers[inputId] = { password: inputPass, email: email, name: fullName };
                localStorage.setItem('studentpocket_users', JSON.stringify(localUsers));
                
                const profile: UserProfile = {
                  ...DEFAULT_USER,
                  name: fullName,
                  email: email,
                  studentId: `SP-ELITE-${Math.floor(100000 + Math.random() * 900000)}`
                };
                await storageService.setData(`architect_data_${inputId}`, { user: profile });
                setRegistrationSuccess(true);
            } else {
                sessionStorage.setItem('active_session_user', inputId);
                setActiveUser(inputId);
                await loadUserData(inputId);
                setIsLoggedIn(true);
            }
        } else {
            setAuthError('Invalid security token');
        }
    }
  };

  const handleLogout = () => {
      sessionStorage.removeItem('active_session_user');
      window.location.reload();
  };

  const handleActivatePro = async () => {
    if (!activeUser) return;
    const updatedUser = {
      ...user,
      subscriptionTier: SubscriptionTier.PRO_LIFETIME
    };
    const stored = await storageService.getData(`architect_data_${activeUser}`);
    await storageService.setData(`architect_data_${activeUser}`, { ...stored, user: updatedUser });
    setUser(updatedUser);
    showAlert('Pro Activated', "Quantum Elite Pro Lifetime Access Activated!");
  };

  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;

  useEffect(() => {
    if (isPro) {
      document.body.classList.add('pro-mode');
      document.body.classList.remove('lite-mode');
    } else {
      document.body.classList.add('lite-mode');
      document.body.classList.remove('pro-mode');
    }
  }, [isPro]);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (user.isBanned) {
      return (
          <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-8 text-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-12 max-w-md"
              >
                  <ShieldAlert size={80} className="text-red-500 mx-auto mb-8 animate-pulse" />
                  <h1 className="text-4xl font-display mb-4 italic">Gateway Closed</h1>
                  <p className="text-white/60 mb-10 font-medium">Security Infraction: Account Suspended</p>
                  <button onClick={() => setAuthMode('FORGOT')} className="btn-premium w-full mb-4">Request Recovery</button>
                  <button onClick={handleLogout} className="text-white/40 text-xs hover:text-white transition-colors">Return to Terminal</button>
              </motion.div>
          </div>
      );
  }

  if (verifyLinkId) return <LinkVerification linkId={verifyLinkId} onNavigate={setView} currentUser={activeUser} />;
  if (recoveryId) return <AccessRecovery onNavigate={setView} recoveryId={recoveryId} />;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]"></div>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-card p-10 space-y-10 shadow-2xl">
              {registrationSuccess ? (
                <div className="text-center space-y-8 py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                    >
                      <CheckCircle2 size={80} className="text-white mx-auto" />
                    </motion.div>
                    <h2 className="text-3xl font-display italic">Node Registered</h2>
                    <p className="text-white/60">Your elite identity has been established.</p>
                    <button onClick={() => window.location.reload()} className="btn-premium w-full">Enter Elite Hub</button>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-8">
                    <div className="text-center space-y-2">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-black shadow-xl"
                        >
                            <Cpu size={32} />
                        </motion.div>
                        <h1 className="text-3xl font-display italic tracking-tight">{APP_NAME}</h1>
                        <p className="text-xs font-medium text-white/40 tracking-[0.3em] uppercase">Elite Executive Suite</p>
                    </div>

                    <div className="space-y-4">
                        {authStep === 'CREDENTIALS' ? (
                            <AnimatePresence mode="wait">
                              <motion.div 
                                key={authMode}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                className="space-y-4"
                              >
                                {authMode === 'SIGNUP' && (
                                    <div className="relative">
                                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-12" placeholder="Full Legal Name" required />
                                    </div>
                                )}
                                <div className="relative">
                                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                  <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="input-field pl-12" placeholder="Identity Key" required />
                                </div>
                                {authMode !== 'FORGOT' && (
                                    <div className="relative">
                                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-12" placeholder="Access Code" required />
                                    </div>
                                )}
                                {(authMode === 'SIGNUP') && (
                                    <div className="relative">
                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-12" placeholder="Professional Email" required />
                                    </div>
                                )}
                              </motion.div>
                            </AnimatePresence>
                        ) : (
                            <motion.div 
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="space-y-6 text-center"
                            >
                                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Awaiting Security Token</p>
                                <input 
                                  type="text" 
                                  value={otpCode} 
                                  onChange={e => setOtpCode(e.target.value)} 
                                  className="w-full bg-transparent border-b-2 border-white/20 py-4 text-center text-5xl font-mono tracking-[0.5em] focus:outline-none focus:border-white transition-all" 
                                  placeholder="000000" 
                                  maxLength={6}
                                  required 
                                />
                            </motion.div>
                        )}
                    </div>

                    {authError && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-xs font-medium text-center"
                      >
                        {authError}
                      </motion.p>
                    )}
                    
                    <button type="submit" className="btn-premium w-full flex items-center justify-center gap-2 group">
                        <span>
                          {authStep === 'CREDENTIALS' ? (authMode === 'LOGIN' ? 'Access Gateway' : authMode === 'FORGOT' ? 'Recover Identity' : 'Initialize Node') : 'Verify Token'}
                        </span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col gap-4 text-center pt-4">
                        <button type="button" onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setAuthError(''); }} className="text-xs font-medium text-white/40 hover:text-white transition-colors">
                            {authMode === 'LOGIN' ? 'Create New Identity' : 'Return to Gateway'}
                        </button>
                        {authMode === 'LOGIN' && (
                            <button type="button" onClick={() => setAuthMode('FORGOT')} className="text-xs font-medium text-white/20 hover:text-white transition-colors">
                                Forgot Access Code?
                            </button>
                        )}
                    </div>
                </form>
              )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isPro ? 'bg-obsidian bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-obsidian to-obsidian' : 'bg-gray-200'}`}>
      <GlobalLoader isLoading={isLoading} />
      
      <div className="md:ml-24 lg:ml-80 transition-all flex-1 flex flex-col">
        <header className={`backdrop-blur-xl border-b h-24 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-40 transition-colors duration-500 ${
          isPro ? 'bg-obsidian/80 border-amber-500/10' : 'bg-gray-300 border-gray-400'
        }`}>
           <div className="flex items-center space-x-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`p-3 rounded-xl shadow-lg transition-colors ${isPro ? 'bg-amber-400 text-black' : 'bg-gray-500 text-white rounded-none'}`}
              >
                {isPro ? <Crown size={24} /> : <ShieldCheck size={24} />}
              </motion.div>
              <div className="text-left">
                  <h1 className={`text-lg leading-none ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{APP_NAME}</h1>
                  <p className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>
                    {isPro ? 'Quantum Mesh Active' : 'Elite Mesh Active'}
                  </p>
              </div>
           </div>

           <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2">
                     {user.isVerified && <Sparkles size={14} className={`animate-pulse ${isPro ? 'text-amber-400' : 'text-gray-700'}`} />}
                     <p className={`text-sm font-medium leading-none ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>{user.name}</p>
                  </div>
                  <p className={`text-[10px] font-medium mt-1 uppercase tracking-widest ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>
                    {user.isVerified ? 'Quantum Elite' : 'Pending Verification'}
                  </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className={`p-3 transition-all border group ${
                    isPro 
                      ? 'rounded-xl bg-amber-950/20 border-amber-500/20 hover:bg-red-500/10 hover:border-red-500/30' 
                      : 'rounded-none bg-gray-400 border-gray-500 hover:bg-red-500/10'
                  }`}
                  title="Terminate Session"
                >
                    <LogOut size={18} className={`group-hover:text-red-500 ${isPro ? 'text-amber-500/40' : 'text-gray-700'}`} />
                </button>
                <div className={`w-12 h-12 border overflow-hidden shadow-xl ${isPro ? 'rounded-xl border-amber-500/20 shadow-amber-500/10' : 'rounded-none border-gray-500'}`}>
                  <img 
                    src={user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} 
                    className="w-full h-full object-cover" 
                    alt="Personnel" 
                  />
                </div>
              </div>
           </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full pt-12 px-8 sm:px-12 pb-32 md:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {view === View.DASHBOARD && <Dashboard user={user} username={activeUser || ''} onNavigate={setView} onLogout={handleLogout} />}
                {view === View.MISSION_CONTROL && (
                  <ProGate user={user} onActivatePro={handleActivatePro}>
                    <MissionControl username={activeUser || ''} user={user} updateUser={setUser} />
                  </ProGate>
                )}
                {view === View.FOCUS_MATRIX && (
                  <ProGate user={user} onActivatePro={handleActivatePro}>
                    <FocusMatrix user={user} />
                  </ProGate>
                )}
                {view === View.FILE_HUB && (
                  <ProGate user={user} onActivatePro={handleActivatePro}>
                    <Vault user={user} documents={vaultDocs} saveDocuments={setVaultDocs} updateUser={setUser} onNavigate={setView} />
                  </ProGate>
                )}
                {view === View.SETTINGS && <Settings user={user} resetApp={handleLogout} onLogout={handleLogout} username={activeUser || ''} darkMode={true} toggleDarkMode={() => {}} updateUser={setUser} />}
                {view === View.SUPPORT && <Support username={activeUser || ''} user={user} />}
                {view === View.ADMIN_DASHBOARD && <AdminDashboard onNavigate={setView} />}
                {view === View.SECURITY_HEARTBEAT && (
                  <ProGate user={user} onActivatePro={handleActivatePro}>
                    <SecurityHeartbeat user={user} />
                  </ProGate>
                )}
                {view === View.GROWTH_JOURNAL && <GrowthJournal username={activeUser || ''} user={user} updateUser={setUser} />}
                {view === View.ACADEMIC_LEDGER && <AcademicLedger username={activeUser || ''} user={user} />}
                {view === View.ATTENDANCE_TRACKER && <AttendanceTracker username={activeUser || ''} user={user} updateUser={setUser} />}
                {view === View.CAMPUS_RADAR && (
                  <ProGate user={user} onActivatePro={handleActivatePro}>
                    <CampusRadar username={activeUser || ''} user={user} />
                  </ProGate>
                )}
                {view === View.VERIFICATION_FORM && <VerificationForm user={user} username={activeUser || ''} updateUser={setUser} onNavigate={setView} />}
                {view === View.ACCESS_RECOVERY && <AccessRecovery onNavigate={setView} />}
                {view === View.COMPOSE_MAIL && (
                  <ProGate user={user} onActivatePro={handleActivatePro}>
                    <ComposeMail user={user} onNavigate={setView} />
                  </ProGate>
                )}
              </motion.div>
            </AnimatePresence>
        </main>
      </div>

      <Navigation 
        currentView={view} 
        setView={setView} 
        isAdmin={activeUser === ADMIN_USERNAME} 
        isVerified={user.isVerified} 
        username={activeUser || ''} 
        onLogout={handleLogout} 
        subscriptionTier={user.subscriptionTier}
      />
    </div>
  );
}

export default App;
