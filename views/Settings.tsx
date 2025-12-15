
import React, { useState, useEffect } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Moon, Bell, LogOut, Globe, Trash2, Sun, Edit2, UserMinus, BadgeCheck, AlertTriangle, Camera, CheckCircle2, Bug, Mail, ArrowRight, Loader2, Image as ImageIcon, HelpCircle, MessageSquare, Clock, X, Shield, Lock, Save, ShieldCheck } from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME } from '../constants';
import { sendVerificationOTP } from '../services/emailService';

interface SettingsProps {
  user: UserProfile;
  resetApp: () => void;
  onLogout: () => void;
  username: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  updateUser: (u: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, resetApp, onLogout, username, darkMode, toggleDarkMode, updateUser }) => {
  // New State for Profile Editing (User side)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<UserProfile>(user);
  
  // Support Ticket
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMode, setSupportMode] = useState<'NEW' | 'HISTORY'>('NEW');
  const [supportMessage, setSupportMessage] = useState('');
  const [myTickets, setMyTickets] = useState<ChangeRequest[]>([]);

  // Crash Simulation State
  const [shouldCrash, setShouldCrash] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (showSupportModal) {
      loadTickets();
    }
  }, [showSupportModal]);

  const loadTickets = () => {
    try {
      const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
      const allReqs: ChangeRequest[] = JSON.parse(reqStr);
      // Filter for this user and type SUPPORT_TICKET
      const tickets = allReqs
        .filter(r => r.username === username && r.type === 'SUPPORT_TICKET')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMyTickets(tickets);
    } catch (e) {
      console.error("Failed to load tickets", e);
    }
  };

  if (shouldCrash) {
    throw new Error("This is a simulated crash to demonstrate the Professional Error Page.");
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check verification status
  const isVerified = (() => {
      try {
          const usersStr = localStorage.getItem('studentpocket_users');
          if (usersStr) {
              const users = JSON.parse(usersStr);
              return users[username]?.verified === true;
          }
      } catch(e) { return false; }
      return false;
  })();

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        if (username === ADMIN_USERNAME) {
           const updated = { ...user, avatar: base64 };
           updateUser(updated);
           const key = `studentpocket_data_${ADMIN_USERNAME}`;
           const stored = localStorage.getItem(key);
           if (stored) {
               const data = JSON.parse(stored);
               data.user = updated;
               localStorage.setItem(key, JSON.stringify(data));
           }
           showToast("Profile picture updated!", 'success');
        } else {
             // For simplicity in this personal app version, allow direct updates
             const updated = { ...user, avatar: base64 };
             updateUser(updated);
             const key = `studentpocket_data_${username}`;
             const stored = localStorage.getItem(key);
             if (stored) {
                 const data = JSON.parse(stored);
                 data.user = updated;
                 localStorage.setItem(key, JSON.stringify(data));
             }
             showToast("Profile picture updated!", 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitSupportTicket = () => {
      if(!supportMessage.trim()) return;

      const request: ChangeRequest = {
          id: Date.now().toString(),
          username: username,
          type: 'SUPPORT_TICKET',
          payload: { 
              message: supportMessage,
              adminResponse: "We have received your request." 
          },
          status: 'PENDING',
          timestamp: new Date().toISOString()
      };

      const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
      const reqs = JSON.parse(reqStr);
      reqs.push(request);
      localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
      
      setSupportMessage('');
      setSupportMode('HISTORY');
      loadTickets(); // Refresh list
      showToast("Message sent.", 'success');
  };

  const SettingItem = ({ icon: Icon, title, value, onClick, danger, toggle, subTitle }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 mb-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md ${danger ? 'border-red-100 dark:border-red-900/30' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <Icon size={20} />
        </div>
        <div>
           <span className={`font-bold block text-sm ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{title}</span>
           {subTitle && <span className="text-[10px] text-gray-400">{subTitle}</span>}
        </div>
      </div>
      
      {toggle !== undefined ? (
        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${toggle ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
           <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${toggle ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      ) : (
        value && <span className="text-sm font-medium text-gray-400">{value}</span>
      )}
    </div>
  );

  return (
    <div className="pb-20 animate-fade-in relative">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl animate-fade-in z-[100]">
           {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400 dark:text-green-600 mr-2" /> : <AlertTriangle size={18} className="text-red-400 dark:text-red-600 mr-2" />}
           <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
      
      {/* Help & Support Modal */}
      {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] p-6 shadow-2xl animate-scale-up border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
                   <div className="flex justify-between items-center mb-6">
                       <h2 className="text-xl font-bold dark:text-white flex items-center">
                         <HelpCircle className="mr-2 text-indigo-600" /> Help & Support
                       </h2>
                       <button onClick={() => setShowSupportModal(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                   </div>
                    {/* Simplified Support for Personal App */}
                     <div className="flex-1 overflow-y-auto">
                        <textarea
                          className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white h-40 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Note down a bug or idea for yourself..."
                          value={supportMessage}
                          onChange={e => setSupportMessage(e.target.value)}
                        />
                        <button 
                          onClick={submitSupportTicket} 
                          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        >
                          <Save className="mr-2" size={18}/> Save Feedback
                        </button>
                     </div>
               </div>
          </div>
      )}

      {/* Profile Card */}
      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        <div className="flex items-center space-x-4">
            <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 backdrop-blur-sm">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold">{user.name.charAt(0)}</span>}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={20} className="text-white"/>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                </label>
            </div>
            <div className="flex-1">
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-indigo-200 text-sm mb-1">{user.profession || 'Personal Workspace'}</p>
            <div className="flex items-center">
                 <span className="text-[10px] bg-green-400/20 px-2 py-0.5 rounded flex items-center text-green-100 border border-green-400/30"><Shield size={10} className="mr-1"/> Private User</span>
            </div>
            </div>
        </div>
      </div>

      {/* Privacy & Verification Section (Mandatory) */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-indigo-50 dark:border-gray-700 shadow-sm">
         <div className="flex items-center mb-3 text-indigo-600 dark:text-indigo-400">
             <ShieldCheck size={20} className="mr-2" />
             <h3 className="font-bold text-sm uppercase tracking-wide">Privacy & Data Protection</h3>
         </div>
         <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
             This application is strictly for personal productivity. Your data is stored locally on this device and is not shared with third parties or advertisers.
         </p>
         <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
             <div className="flex items-start">
                 <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-2 shrink-0" />
                 <div>
                     <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Verification Request Confirmed</p>
                     <p className="text-[10px] text-gray-400 mt-1">
                         This app is verified for personal use. User data is securely stored and protected. Privacy is fully respected.
                     </p>
                 </div>
             </div>
         </div>
      </div>

      {/* Common Settings - Visible to everyone */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Preferences</h3>
        <SettingItem 
           icon={darkMode ? Sun : Moon} 
           title={darkMode ? "Light Mode" : "Dark Mode"} 
           subTitle="Adjust app appearance"
           toggle={darkMode} 
           onClick={toggleDarkMode} 
        />
        <SettingItem icon={Bell} title="Notifications" value="On" subTitle="Reminders & Alerts" />
      </div>

      <div>
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Data Management</h3>
         <SettingItem icon={HelpCircle} title="Feedback" subTitle="Log personal notes" onClick={() => setShowSupportModal(true)} />
         <SettingItem icon={LogOut} title="Log Out" onClick={onLogout} />
         <SettingItem icon={Trash2} title="Factory Reset" subTitle="Clear all local data" danger onClick={() => {
           if(window.confirm('Are you sure you want to delete ALL your data and reset the app?')) resetApp();
         }} />
         
         <SettingItem 
            icon={Bug} 
            title="Simulate Crash" 
            subTitle="Test error recovery" 
            onClick={() => setShouldCrash(true)} 
         />
      </div>

      <div className="mt-12 text-center pb-8">
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 mx-auto rounded-full mb-4"></div>
        <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">{WATERMARK}</p>
        <p className="text-gray-300 dark:text-gray-600 text-[10px] mt-1 uppercase tracking-wider">Personal Edition • Secure</p>
      </div>
    </div>
  );
};
