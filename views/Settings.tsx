
import React, { useState, useEffect } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Moon, Bell, LogOut, Globe, Trash2, Sun, Edit2, UserMinus, BadgeCheck, AlertTriangle, Camera, CheckCircle2, Bug, Mail, ArrowRight, Loader2, Image as ImageIcon, HelpCircle, MessageSquare, Clock, X, Shield, Lock, Save, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<UserProfile>(user);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [myTickets, setMyTickets] = useState<ChangeRequest[]>([]);
  const [shouldCrash, setShouldCrash] = useState(false);
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
      const tickets = allReqs
        .filter(r => r.username === username && r.type === 'SUPPORT_TICKET')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMyTickets(tickets);
    } catch (e) {
      console.error("Failed to load tickets", e);
    }
  };

  if (shouldCrash) {
    throw new Error("Simulated app error for testing.");
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const requestVerification = () => {
      if (isVerified) return;
      
      const newProfession = prompt("Enter your Professional Title (e.g. Civil Engineer):", user.profession || "");
      if (!newProfession) return;

      const request: ChangeRequest = {
          id: Date.now().toString(),
          username: username,
          type: 'PROFILE_UPDATE',
          payload: { ...user, profession: newProfession },
          status: 'PENDING',
          timestamp: new Date().toISOString()
      };

      const requestsStr = localStorage.getItem('studentpocket_requests') || '[]';
      const requests = JSON.parse(requestsStr);
      requests.push(request);
      localStorage.setItem('studentpocket_requests', JSON.stringify(requests));
      
      showToast("Verification request sent to Admin.", 'success');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updated = { ...user, avatar: base64 };
        updateUser(updated);
        const key = `studentpocket_data_${username}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            const data = JSON.parse(stored);
            data.user = updated;
            localStorage.setItem(key, JSON.stringify(data));
        }
        showToast("Profile image updated locally.");
      };
      reader.readAsDataURL(file);
    }
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Config & Profile</h1>
      
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl animate-fade-in z-[100]">
           {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400 dark:text-green-600 mr-2" /> : <AlertTriangle size={18} className="text-red-400 dark:text-red-600 mr-2" />}
           <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
      
      {/* Profile Card */}
      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="flex items-center space-x-4 relative z-10">
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 backdrop-blur-md shadow-lg">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold">{user.name.charAt(0)}</span>}
                </div>
                <label className="absolute -bottom-1 -right-1 flex items-center justify-center bg-white text-indigo-600 w-6 h-6 rounded-lg shadow-md cursor-pointer hover:scale-110 transition-transform">
                    <Camera size={12}/>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                </label>
            </div>
            <div className="flex-1">
                <div className="flex items-center">
                    <h2 className="font-bold text-lg">{user.name}</h2>
                    {isVerified && <BadgeCheck size={16} className="ml-1 text-blue-200 fill-blue-500 shadow-sm" />}
                </div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">{user.profession || 'Personal Edition'}</p>
                <div className="mt-2 inline-flex items-center bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                    <Shield size={10} className="mr-1 text-green-300"/>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{isVerified ? 'Elite Account' : 'Guest Member'}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Verification Promotion */}
      {!isVerified && (
          <div className="mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none text-white relative overflow-hidden">
              <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-3">
                      <Sparkles size={18} className="text-yellow-300"/>
                      <h3 className="font-bold text-sm uppercase tracking-widest">Get Professional Verification</h3>
                  </div>
                  <p className="text-xs text-indigo-100 mb-5 leading-relaxed opacity-90">
                      Unlock advanced AI capabilities, professional CV tools, and priority support. Set your professional title and get approved by the admin.
                  </p>
                  <button 
                    onClick={requestVerification}
                    className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                  >
                      <UserCheck size={18} className="mr-2"/> Request Professional Status
                  </button>
              </div>
          </div>
      )}

      {/* Main Settings List */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Account Preferences</h3>
        <SettingItem 
           icon={darkMode ? Sun : Moon} 
           title={darkMode ? "Brighter Interface" : "Deep Dark Mode"} 
           subTitle="Switch visual appearance"
           toggle={darkMode} 
           onClick={toggleDarkMode} 
        />
        <SettingItem icon={Bell} title="System Alerts" value="On" subTitle="Manage your notifications" />
      </div>

      <div className="mb-8">
         <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">System Support</h3>
         <SettingItem icon={HelpCircle} title="Contact Hub" subTitle="Log requests or ideas" onClick={() => setShowSupportModal(true)} />
         <SettingItem icon={LogOut} title="Secure Logout" onClick={onLogout} />
         <SettingItem icon={Trash2} title="Master Reset" subTitle="Wipe all local records" danger onClick={() => {
           if(window.confirm('Delete all local data?')) resetApp();
         }} />
      </div>

      <div className="mt-12 text-center pb-8 opacity-40">
        <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">{WATERMARK}</p>
      </div>

      {/* Help Modal */}
      {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl animate-scale-up border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
                   <div className="flex justify-between items-center mb-6">
                       <h2 className="text-xl font-bold dark:text-white flex items-center">
                         <MessageSquare className="mr-3 text-indigo-600" /> Help Desk
                       </h2>
                       <button onClick={() => setShowSupportModal(false)} className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 p-2 rounded-full"><X size={20}/></button>
                   </div>
                   <div className="flex-1 overflow-y-auto">
                        <textarea
                          className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white h-48 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Describe your issue or feedback..."
                          value={supportMessage}
                          onChange={e => setSupportMessage(e.target.value)}
                        />
                        <button 
                          onClick={() => {
                            if(!supportMessage.trim()) return;
                            const request: ChangeRequest = {
                                id: Date.now().toString(),
                                username: username,
                                type: 'SUPPORT_TICKET',
                                payload: { message: supportMessage },
                                status: 'PENDING',
                                timestamp: new Date().toISOString()
                            };
                            const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
                            const reqs = JSON.parse(reqStr);
                            reqs.push(request);
                            localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
                            setSupportMessage('');
                            setShowSupportModal(false);
                            showToast("Message sent to Admin Console.", 'success');
                          }} 
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]"
                        >
                          Submit Request
                        </button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
};
