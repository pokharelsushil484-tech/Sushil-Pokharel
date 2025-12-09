
import React, { useState } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Moon, Bell, LogOut, Globe, ShieldCheck, Trash2, Sun, Check, X, Edit2, UserMinus, BadgeCheck, AlertTriangle, Camera, CheckCircle2, Bug, Mail, Upload, ArrowRight, Loader2, Image as ImageIcon, Briefcase, HelpCircle } from 'lucide-react';
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
  const [showPinInput, setShowPinInput] = useState(false);
  const [newPin, setNewPin] = useState('');
  
  // New State for Profile Editing (User side)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<UserProfile>(user);
  
  // Verification Logic State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifStep, setVerifStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: ID Upload, 3: Success
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  
  // Support Ticket
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  // Crash Simulation State
  const [shouldCrash, setShouldCrash] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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

  // --- RATE LIMITING LOGIC ---
  const canSendRequest = (type: 'VERIFICATION_REQUEST' | 'OTHER') => {
      const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
      const reqs: ChangeRequest[] = JSON.parse(reqStr);
      const userReqs = reqs.filter(r => r.username === username);
      const now = Date.now();

      if (type === 'VERIFICATION_REQUEST') {
          // Check for ANY verification request in last 30 days
          const lastVerif = userReqs
              .filter(r => r.type === 'VERIFICATION_REQUEST')
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          
          if (lastVerif) {
              const diff = now - new Date(lastVerif.timestamp).getTime();
              const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
              if (diff < thirtyDaysMs) {
                  const daysLeft = Math.ceil((thirtyDaysMs - diff) / (24 * 60 * 60 * 1000));
                  showToast(`Verification cooldown active. Wait ${daysLeft} days.`, 'error');
                  return false;
              }
          }
      } else {
          // Check for ANY request in last 24 hours (for spam prevention)
          // "in 1 day only all request"
          const lastAny = userReqs
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          
          if (lastAny) {
              const diff = now - new Date(lastAny.timestamp).getTime();
              const oneDayMs = 24 * 60 * 60 * 1000;
              if (diff < oneDayMs) {
                  showToast("Limit reached: You can send 1 request per day.", 'error');
                  return false;
              }
          }
      }
      return true;
  };

  const handleStartVerification = () => {
    if (!canSendRequest('VERIFICATION_REQUEST')) return;

    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    const reqs = JSON.parse(reqStr);
    
    if(reqs.find((r:any) => r.username === username && r.type === 'VERIFICATION_REQUEST' && r.status === 'PENDING')) {
        showToast("Verification request already pending approval.", 'error');
        return;
    }
    setShowVerificationModal(true);
    setVerifStep(1);
    setOtp('');
    setEnteredOtp('');
    setIdCardImage(null);
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(code);
    
    const sent = await sendVerificationOTP(user.email, user.name, code);
    setIsSendingOtp(false);
    
    if (sent) {
        showToast("OTP sent to your email.", 'success');
    } else {
        showToast("Failed to send OTP. Try again.", 'error');
    }
  };

  const handleVerifyOtp = () => {
      if (enteredOtp === otp && otp !== '') {
          setVerifStep(2);
      } else {
          showToast("Invalid Verification Code.", 'error');
      }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setIdCardImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const submitVerificationRequest = () => {
      if (!idCardImage) {
          showToast("Please upload your Student ID.", 'error');
          return;
      }

      const request: ChangeRequest = {
         id: Date.now().toString(),
         username: username,
         type: 'VERIFICATION_REQUEST',
         payload: {
             idCardImage: idCardImage,
             emailVerified: true
         },
         status: 'PENDING',
         timestamp: new Date().toISOString()
     };
     
     const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
     const reqs = JSON.parse(reqStr);
     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     
     setShowVerificationModal(false);
     showToast("Verification request & ID sent to Admin.", 'success');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        if (username === ADMIN_USERNAME) {
           // Admin updates immediately
           const updated = { ...user, avatar: base64 };
           updateUser(updated);
           // Force update local storage for admin immediately
           const key = `studentpocket_data_${ADMIN_USERNAME}`;
           const stored = localStorage.getItem(key);
           if (stored) {
               const data = JSON.parse(stored);
               data.user = updated;
               localStorage.setItem(key, JSON.stringify(data));
           }
           showToast("Admin profile picture updated!", 'success');
        } else {
           if (!canSendRequest('OTHER')) return;

           // User sends request
           const request: ChangeRequest = {
               id: Date.now().toString(),
               username: username,
               type: 'PROFILE_UPDATE',
               payload: { ...user, avatar: base64 },
               status: 'PENDING',
               timestamp: new Date().toISOString()
           };
           
           const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
           const reqs = JSON.parse(reqStr);
           reqs.push(request);
           localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
           showToast("Profile picture change request sent.", 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sendProfileUpdateRequest = () => {
     if (!canSendRequest('OTHER')) return;

     const request: ChangeRequest = {
         id: Date.now().toString(),
         username: username,
         type: 'PROFILE_UPDATE',
         payload: editProfileData,
         status: 'PENDING',
         timestamp: new Date().toISOString()
     };
     
     const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
     const reqs = JSON.parse(reqStr);
     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     
     setIsEditingProfile(false);
     showToast("Profile update request sent.", 'success');
  };

  const submitSupportTicket = () => {
      if (!canSendRequest('OTHER')) return;
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
      
      setShowSupportModal(false);
      setSupportMessage('');
      showToast("Support ticket sent to Admin.", 'success');
  };

  const requestAccountDeletion = () => {
     if (!canSendRequest('OTHER')) return;
     if(!window.confirm("Are you sure you want to request account deletion? This will permanently delete all your data once approved by the Admin.")) return;

     const request: ChangeRequest = {
         id: Date.now().toString(),
         username: username,
         type: 'DELETE_ACCOUNT',
         status: 'PENDING',
         timestamp: new Date().toISOString()
     };
     
     const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
     const reqs = JSON.parse(reqStr);
     
     // Avoid duplicates
     if(reqs.find((r:any) => r.username === username && r.type === 'DELETE_ACCOUNT' && r.status === 'PENDING')) {
         showToast("Deletion request already pending.", 'error');
         return;
     }

     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     showToast("Deletion request sent to Admin.", 'success');
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

  const saveNewPin = () => {
    if (newPin.length < 4) {
      showToast("PIN must be at least 4 digits", 'error');
      return;
    }
    updateUser({ ...user, vaultPin: newPin });
    setShowPinInput(false);
    setNewPin('');
    showToast("Vault PIN updated successfully.", 'success');
  };

  return (
    <div className="pb-20 animate-fade-in relative">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl animate-fade-in">
           {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400 dark:text-green-600 mr-2" /> : <AlertTriangle size={18} className="text-red-400 dark:text-red-600 mr-2" />}
           <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scale-up border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold dark:text-white">Verify Account</h2>
                      <button onClick={() => setShowVerificationModal(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                  </div>

                  {verifStep === 1 && (
                      <div className="space-y-4">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center mb-2">
                              <Mail className="text-indigo-600 dark:text-indigo-400 mr-3" size={24} />
                              <div>
                                  <p className="font-bold text-sm dark:text-white">Step 1: Email Check</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">We'll send a code to {user.email}</p>
                              </div>
                          </div>
                          
                          {otp === '' ? (
                              <button 
                                onClick={handleSendOtp} 
                                disabled={isSendingOtp}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
                              >
                                  {isSendingOtp ? <Loader2 className="animate-spin mr-2"/> : <Mail className="mr-2" size={18}/>}
                                  {isSendingOtp ? 'Sending...' : 'Send Verification Code'}
                              </button>
                          ) : (
                              <div className="animate-fade-in">
                                  <input 
                                    type="text" 
                                    placeholder="Enter 6-digit code"
                                    className="w-full text-center text-2xl tracking-[0.5em] font-mono p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 dark:bg-gray-800 dark:text-white"
                                    value={enteredOtp}
                                    onChange={e => setEnteredOtp(e.target.value)}
                                    maxLength={6}
                                  />
                                  <button 
                                    onClick={handleVerifyOtp}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
                                  >
                                      Verify & Continue
                                  </button>
                              </div>
                          )}
                      </div>
                  )}

                  {verifStep === 2 && (
                       <div className="space-y-4 animate-fade-in">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center mb-2">
                              <ShieldCheck className="text-indigo-600 dark:text-indigo-400 mr-3" size={24} />
                              <div>
                                  <p className="font-bold text-sm dark:text-white">Step 2: Upload Student ID</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload a clear photo of your ID Card</p>
                              </div>
                          </div>

                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
                              {idCardImage ? (
                                  <div className="relative w-full h-48">
                                      <img src={idCardImage} className="w-full h-full object-contain rounded-lg" alt="ID Preview" />
                                      <button onClick={() => setIdCardImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button>
                                  </div>
                              ) : (
                                  <>
                                    <ImageIcon className="text-gray-400 mb-2" size={40} />
                                    <p className="text-sm font-bold text-gray-500">Tap to upload ID Card</p>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleIdUpload} />
                                  </>
                              )}
                          </div>

                          <button 
                            onClick={submitVerificationRequest}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                          >
                              Submit Request <ArrowRight className="ml-2" size={18}/>
                          </button>
                       </div>
                  )}
              </div>
          </div>
      )}
      
      {/* Support Ticket Modal */}
      {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scale-up border border-gray-200 dark:border-gray-700">
                   <h2 className="text-xl font-bold dark:text-white mb-4">Report a Problem</h2>
                   <textarea
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white h-32 text-sm mb-4"
                     placeholder="Describe your issue or question..."
                     value={supportMessage}
                     onChange={e => setSupportMessage(e.target.value)}
                   />
                   <div className="flex gap-2">
                       <button onClick={submitSupportTicket} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold">Submit Ticket</button>
                       <button onClick={() => setShowSupportModal(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                   </div>
               </div>
          </div>
      )}

      {/* Profile Card */}
      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        {isEditingProfile ? (
            <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-white mb-2">Edit Profile Request</h3>
                <input 
                  className="w-full p-3 rounded-xl text-gray-800 text-sm outline-none border-2 border-transparent focus:border-indigo-300"
                  value={editProfileData.name}
                  onChange={e => setEditProfileData({...editProfileData, name: e.target.value})}
                  placeholder="Full Name"
                />
                <input 
                  className="w-full p-3 rounded-xl text-gray-800 text-sm outline-none border-2 border-transparent focus:border-indigo-300"
                  value={editProfileData.profession || ''}
                  onChange={e => setEditProfileData({...editProfileData, profession: e.target.value})}
                  placeholder="Profession (e.g. Student, Engineer)"
                />
                <input 
                  className="w-full p-3 rounded-xl text-gray-800 text-sm outline-none border-2 border-transparent focus:border-indigo-300"
                  value={editProfileData.institution}
                  onChange={e => setEditProfileData({...editProfileData, institution: e.target.value})}
                  placeholder="Institution"
                />
                <div className="grid grid-cols-2 gap-2">
                   <input 
                    className="w-full p-3 rounded-xl text-gray-800 text-sm outline-none border-2 border-transparent focus:border-indigo-300"
                    value={editProfileData.phone}
                    onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})}
                    placeholder="Phone"
                  />
                  <input 
                    className="w-full p-3 rounded-xl text-gray-800 text-sm outline-none border-2 border-transparent focus:border-indigo-300"
                    value={editProfileData.country}
                    onChange={e => setEditProfileData({...editProfileData, country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
                <input 
                  className="w-full p-3 rounded-xl text-gray-800 text-sm outline-none border-2 border-transparent focus:border-indigo-300"
                  value={editProfileData.education}
                  onChange={e => setEditProfileData({...editProfileData, education: e.target.value})}
                  placeholder="Education"
                />
                <div className="flex space-x-2 pt-2">
                    <button onClick={sendProfileUpdateRequest} className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">Send Request</button>
                    <button onClick={() => setIsEditingProfile(false)} className="bg-indigo-800 hover:bg-indigo-900 text-white p-3 rounded-xl transition-colors"><X size={20}/></button>
                </div>
            </div>
        ) : (
            <div className="flex items-center space-x-4">
                <div className="relative group">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 backdrop-blur-sm">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold">{user.name.charAt(0)}</span>}
                    </div>
                    {/* Picture Upload Overlay */}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={20} className="text-white"/>
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                    </label>
                </div>
                <div className="flex-1">
                <h2 className="font-bold text-lg">{user.name}</h2>
                <p className="text-indigo-200 text-sm mb-1">{user.profession || user.email}</p>
                <div className="flex items-center">
                     <p className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-bold mr-2 uppercase tracking-wide">{username === ADMIN_USERNAME ? 'Admin' : 'Student'}</p>
                     {isVerified ? (
                        <span className="text-[10px] bg-green-400/20 px-2 py-0.5 rounded flex items-center text-green-100 border border-green-400/30"><BadgeCheck size={10} className="mr-1"/> Verified</span>
                     ) : (
                        <span className="text-[10px] bg-yellow-400/20 px-2 py-0.5 rounded flex items-center text-yellow-100 border border-yellow-400/30"><AlertTriangle size={10} className="mr-1"/> Unverified</span>
                     )}
                </div>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(true)} 
                  className="bg-white/20 p-2.5 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                    <Edit2 size={18} />
                </button>
            </div>
        )}
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
        <SettingItem icon={Globe} title="Language" value="English" subTitle="System language" />
        <SettingItem icon={Bell} title="Notifications" value="On" subTitle="Push alerts" />
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Security & Access</h3>
        
        {!isVerified && username !== ADMIN_USERNAME && (
             <SettingItem icon={BadgeCheck} title="Request Verification" subTitle="Unlock full features" onClick={handleStartVerification} />
        )}

        {!showPinInput ? (
           <SettingItem icon={ShieldCheck} title="Change Vault PIN" subTitle="Secure your documents" onClick={() => setShowPinInput(true)} />
        ) : (
           <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-800 mb-3 animate-slide-up">
              <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3">Set New 4-Digit PIN</label>
              <div className="flex space-x-2">
                 <input 
                   type="text" 
                   value={newPin}
                   onChange={e => setNewPin(e.target.value.replace(/\D/g,'').slice(0, 4))}
                   placeholder="0000"
                   className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-lg text-center tracking-[0.5em] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                   autoFocus
                 />
                 <button onClick={saveNewPin} className="bg-green-100 text-green-700 p-3 rounded-xl hover:bg-green-200 transition-colors">
                    <Check size={20} />
                 </button>
                 <button onClick={() => setShowPinInput(false)} className="bg-red-100 text-red-700 p-3 rounded-xl hover:bg-red-200 transition-colors">
                    <X size={20} />
                 </button>
              </div>
           </div>
        )}
      </div>

      <div>
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Account Actions</h3>
         <SettingItem icon={HelpCircle} title="Report a Problem" subTitle="Contact Admin for support" onClick={() => setShowSupportModal(true)} />
         <SettingItem icon={LogOut} title="Log Out" onClick={onLogout} />
         <SettingItem icon={UserMinus} title="Delete Account" subTitle="Request permanent deletion" danger onClick={requestAccountDeletion} />
         <SettingItem icon={Trash2} title="Factory Reset" subTitle="Clear local data on this device" danger onClick={() => {
           if(window.confirm('Are you sure you want to delete ONLY your data and reset?')) resetApp();
         }} />
         
         {/* Crash Simulator Button for Testing Error Page */}
         <SettingItem 
            icon={Bug} 
            title="Simulate Crash" 
            subTitle="Test the professional error page" 
            onClick={() => setShouldCrash(true)} 
         />
      </div>

      <div className="mt-12 text-center pb-8">
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 mx-auto rounded-full mb-4"></div>
        <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">{WATERMARK}</p>
        <p className="text-gray-300 dark:text-gray-600 text-[10px] mt-1 uppercase tracking-wider">Version 2.5.0 • Built with React</p>
      </div>
    </div>
  );
};
