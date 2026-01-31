import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Vault } from './views/Vault';
import { Support } from './views/Support';
import { StudyPlanner } from './views/StudyPlanner';
import { AdminDashboard } from './views/AdminDashboard';
import { GlobalLoader } from './components/GlobalLoader';
import { SplashScreen } from './components/SplashScreen';
import { ErrorPage } from './views/ErrorPage';
import { Footer } from './components/Footer';
import { VerificationForm } from './views/VerificationForm';
import { VerificationPending } from './views/VerificationPending';
import { AccessRecovery } from './views/AccessRecovery';
import { View, UserProfile, VaultDocument, Assignment } from './types';
import { DEFAULT_USER, APP_NAME, SYSTEM_DOMAIN, ADMIN_USERNAME } from './constants';
import { storageService } from './services/storageService';
import { ShieldCheck, Lock, Terminal, Eye, EyeOff, LogIn, UserPlus, Mail, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    sessionStorage.removeItem('active_session_user');
  }, []);

  const loadUserData = async (username: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    
    if (username.toLowerCase() === ADMIN_USERNAME) {
        const adminProfile: UserProfile = {
            ...DEFAULT_USER,
            name: "Lead Architect",
            isVerified: true,
            level: 3,
            verificationStatus: 'VERIFIED'
        };
        setUser(adminProfile);
    } else if (stored && stored.user) {
        setUser(stored.user);
        if (stored.vaultDocs) setVaultDocs(stored.vaultDocs);
        if (stored.assignments) setAssignments(stored.assignments);
    }
  };

  const registerLocally = async () => {
    const inputId = userId.toLowerCase();
    const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
    if (localUsers[inputId]) {
      setAuthError('NODE_ID_TAKEN');
      return false;
    }
    localUsers[inputId] = { password, email, name: fullName, verified: false };
    localStorage.setItem('studentpocket_users', JSON.stringify(localUsers));

    const profile: UserProfile = {
      ...DEFAULT_USER,
      name: fullName || inputId,
      email: email || `node@${SYSTEM_DOMAIN}`,
      isVerified: false,
      verificationStatus: 'NONE',
      level: 1,
      studentId: `SP-${Math.floor(100000 + Math.random() * 900000)}`
    };
    await storageService.setData(`architect_data_${inputId}`, { user: profile, vaultDocs: [], assignments: [] });
    setRegistrationSuccess(true);
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    const inputId = userId.toLowerCase();

    try {
        if (authMode === 'LOGIN') {
            // Special case for hardcoded admin if backend is unreachable
            if (inputId === 'admin' && password === 'admin123') {
                sessionStorage.setItem('active_session_user', inputId);
                setActiveUser(inputId);
                setIsLoggedIn(true);
                await loadUserData(inputId);
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'AUTHORIZE_IDENTITY', identity: inputId, hash: password })
                });
                
                const data = await res.json();
                if (data.status === 'SUCCESS') {
                    sessionStorage.setItem('active_session_user', inputId);
                    setActiveUser(inputId);
                    setIsLoggedIn(true);
                    await loadUserData(inputId);
                    setIsLoading(false);
                    return;
                }
            } catch (netErr) {
                console.warn("Central Registry Offline. Checking Local Node.");
            }
            
            // Check local registry fallback
            const localUsers = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
            const localUser = localUsers[inputId];
            if (localUser && localUser.password === password) {
                sessionStorage.setItem('active_session_user', inputId);
                setActiveUser(inputId);
                setIsLoggedIn(true);
                await loadUserData(inputId);
            } else {
                setAuthError('AUTHORIZATION_DENIED');
            }
        } else {
            // SIGNUP MODE
            try {
                const res = await fetch('/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'REGISTER_IDENTITY', identity: inputId, email: email })
                });

                const data = await res.json();
                if (data.status === 'SUCCESS') {
                    await registerLocally();
                } else {
                    setAuthError('REGISTRATION_DENIED');
                }
            } catch (netErr) {
                // Procedural fallback for registration if PHP node is not found
                await registerLocally();
            }
        }
    } catch (err) {
        setAuthError("CRITICAL_SYSTEM_FAULT");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
      sessionStorage.removeItem('active_session_user');
      window.location.reload();
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-950/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        </div>
        
        <