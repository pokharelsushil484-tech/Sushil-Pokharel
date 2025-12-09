
import React, { useState } from 'react';
import { UserProfile, ChangeRequest } from '../types';
import { Moon, Bell, LogOut, Globe, ShieldCheck, Trash2, Sun, Check, X, Edit2, UserMinus, BadgeCheck, AlertTriangle, Camera } from 'lucide-react';
import { WATERMARK, ADMIN_USERNAME } from '../constants';

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

  const requestVerification = () => {
     const request: ChangeRequest = {
         id: Date.now().toString(),
         username: username,
         type: 'VERIFICATION_REQUEST',
         status: 'PENDING',
         timestamp: new Date().toISOString()
     };
     
     const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
     const reqs = JSON.parse(reqStr);
     
     if(reqs.find((r:any) => r.username === username && r.type === 'VERIFICATION_REQUEST' && r.status === 'PENDING')) {
         alert("Verification request already pending.");
         return;
     }

     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     alert("Verification request sent to Admin.");
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
           alert("Admin profile picture updated!");
        } else {
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
           alert("Profile picture change request sent to Admin.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sendProfileUpdateRequest = () => {
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
     alert("Profile update request sent to Admin.");
  };

  const requestAccountDeletion = () => {
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
         alert("Deletion request already pending.");
         return;
     }

     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     alert("Deletion request sent to Admin.");
  };

  const SettingItem = ({ icon: Icon, title, value, onClick, danger, toggle }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 mb-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-95 transition-transform ${danger ? 'border-red-100 dark:border-red-900/30' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-lg ${danger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <Icon size={20} />
        </div>
        <span className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{title}</span>
      </div>
      
      {toggle !== undefined ? (
        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${toggle ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
           <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${toggle ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      ) : (
        value && <span className="text-sm text-gray-400">{value}</span>
      )}
    </div>
  );

  const saveNewPin = () => {
    if (newPin.length < 4) {
      alert("PIN must be at least 4 digits");
      return;
    }
    updateUser({ ...user, vaultPin: newPin });
    setShowPinInput(false);
    setNewPin('');
    alert("Vault PIN updated successfully.");
  };

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      {/* Profile Card */}
      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        {isEditingProfile ? (
            <div className="space-y-3 animate-fade-in">
                <h3 className="font-bold text-white mb-2">Edit Profile Request</h3>
                <input 
                  className="w-full p-2 rounded-lg text-gray-800 text-sm"
                  value={editProfileData.name}
                  onChange={e => setEditProfileData({...editProfileData, name: e.target.value})}
                  placeholder="Full Name"
                />
                <input 
                  className="w-full p-2 rounded-lg text-gray-800 text-sm"
                  value={editProfileData.institution}
                  onChange={e => setEditProfileData({...editProfileData, institution: e.target.value})}
                  placeholder="Institution"
                />
                <div className="grid grid-cols-2 gap-2">
                   <input 
                    className="w-full p-2 rounded-lg text-gray-800 text-sm"
                    value={editProfileData.phone}
                    onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})}
                    placeholder="Phone"
                  />
                  <input 
                    className="w-full p-2 rounded-lg text-gray-800 text-sm"
                    value={editProfileData.country}
                    onChange={e => setEditProfileData({...editProfileData, country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
                <input 
                  className="w-full p-2 rounded-lg text-gray-800 text-sm"
                  value={editProfileData.education}
                  onChange={e => setEditProfileData({...editProfileData, education: e.target.value})}
                  placeholder="Education"
                />
                <div className="flex space-x-2 pt-2">
                    <button onClick={sendProfileUpdateRequest} className="flex-1 bg-white text-indigo-600 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">Send Request</button>
                    <button onClick={() => setIsEditingProfile(false)} className="bg-indigo-800 hover:bg-indigo-900 text-white p-2 rounded-lg transition-colors"><X size={20}/></button>
                </div>
            </div>
        ) : (
            <div className="flex items-center space-x-4">
                <div className="relative group">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
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
                <p className="text-indigo-200 text-sm">{user.email}</p>
                <div className="flex items-center mt-1">
                     <p className="text-xs text-indigo-300 uppercase tracking-wider font-bold mr-2">{username === ADMIN_USERNAME ? 'Administrator' : 'Student'}</p>
                     {isVerified ? (
                        <span className="text-xs bg-indigo-500/50 px-1.5 py-0.5 rounded flex items-center text-white"><BadgeCheck size={10} className="mr-1"/> Verified</span>
                     ) : (
                        <span className="text-xs bg-yellow-500/50 px-1.5 py-0.5 rounded flex items-center text-white"><AlertTriangle size={10} className="mr-1"/> Unverified</span>
                     )}
                </div>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(true)} 
                  className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                    <Edit2 size={16} />
                </button>
            </div>
        )}
      </div>

      {/* Common Settings - Visible to everyone */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Preferences</h3>
        <SettingItem 
           icon={darkMode ? Sun : Moon} 
           title={darkMode ? "Light Mode" : "Dark Mode"} 
           toggle={darkMode} 
           onClick={toggleDarkMode} 
        />
        <SettingItem icon={Globe} title="Language" value="English" />
        <SettingItem icon={Bell} title="Notifications" value="On" />
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Security</h3>
        
        {!isVerified && username !== ADMIN_USERNAME && (
             <SettingItem icon={BadgeCheck} title="Request Verification" onClick={requestVerification} />
        )}

        {!showPinInput ? (
           <SettingItem icon={ShieldCheck} title="Change Vault PIN" onClick={() => setShowPinInput(true)} />
        ) : (
           <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-800 mb-3 animate-slide-up">
              <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Set New PIN</label>
              <div className="flex space-x-2">
                 <input 
                   type="text" 
                   value={newPin}
                   onChange={e => setNewPin(e.target.value.replace(/\D/g,'').slice(0, 4))}
                   placeholder="0000"
                   className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 font-mono text-lg text-center tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <button onClick={saveNewPin} className="bg-green-100 text-green-700 p-3 rounded-xl hover:bg-green-200">
                    <Check size={20} />
                 </button>
                 <button onClick={() => setShowPinInput(false)} className="bg-red-100 text-red-700 p-3 rounded-xl hover:bg-red-200">
                    <X size={20} />
                 </button>
              </div>
           </div>
        )}
      </div>

      <div>
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Account</h3>
         <SettingItem icon={LogOut} title="Log Out" onClick={onLogout} />
         <SettingItem icon={UserMinus} title="Request Account Deletion" danger onClick={requestAccountDeletion} />
         <SettingItem icon={Trash2} title="Reset Local Data" danger onClick={() => {
           if(window.confirm('Are you sure you want to delete ONLY your data and reset?')) resetApp();
         }} />
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">{WATERMARK}</p>
        <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Version 199.9988.098 • Nepal</p>
      </div>
    </div>
  );
};
