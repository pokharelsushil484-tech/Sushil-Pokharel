
import React, { useState, useEffect } from 'react';
import { ChangeRequest } from '../types';
import { Users, AlertTriangle, Trash2, Mail, RefreshCw, BadgeCheck, MessageSquare, Power, Link } from 'lucide-react';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      try {
        const usersObj = JSON.parse(usersStr);
        const list = Object.entries(usersObj).map(([key, value]: [string, any]) => {
          // Try to fetch profile data
          const dataStr = localStorage.getItem(`studentpocket_data_${key}`);
          const profile = dataStr ? JSON.parse(dataStr).user : null;
          
          return {
            username: key,
            email: value.email,
            password: value.password,
            verified: value.verified,
            verificationCode: value.verificationCode,
            profile: profile // Full details if available
          };
        });
        setUsersList(list);
      } catch (e) {
        console.error("Error parsing users list", e);
      }
    }
    
    // Load Requests
    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) {
        setRequests(JSON.parse(reqStr));
    }
  }, [refreshTrigger]);

  const toggleVerification = (targetUser: string, currentStatus: boolean) => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (!usersStr) return;
    const users = JSON.parse(usersStr);
    
    if (users[targetUser]) {
      users[targetUser].verified = !currentStatus;
      // If verifying manually, remove code requirement
      if (!currentStatus) delete users[targetUser].verificationCode;
      
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const resendVerification = async (u: any) => {
    if (u.verified) return;
    const code = u.verificationCode || Math.floor(100000 + Math.random() * 900000).toString();
    
    // Ensure code is saved if we generated a new one
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
        const users = JSON.parse(usersStr);
        users[u.username].verificationCode = code;
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
    }

    const sent = await sendVerificationEmail(u.email, u.username, code);
    if(sent) {
      alert(`Email sent successfully to ${u.email}`);
    } else {
      alert(`Failed to send email to ${u.email}`);
    }
  };

  const executeUserDeletion = (targetUser: string) => {
    // Remove from auth registry
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      delete users[targetUser];
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
    }

    // Remove user data
    localStorage.removeItem(`studentpocket_data_${targetUser}`);
  };

  const deleteUser = (targetUser: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${targetUser}"? This cannot be undone.`)) return;
    executeUserDeletion(targetUser);
    setRefreshTrigger(prev => prev + 1);
  };

  const adminResetPassword = (targetUser: string) => {
    const newPass = prompt(`Enter NEW password for ${targetUser}:`);
    if (!newPass) return;

    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      if (users[targetUser]) {
        users[targetUser].password = newPass;
        // Also remove any reset tokens to clear pending resets
        delete users[targetUser].resetToken; 
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        setRefreshTrigger(prev => prev + 1);
        alert(`Password for ${targetUser} changed to: ${newPass}`);
      }
    }
  };

  const sendResetLink = async (targetUser: string, targetEmail: string, skipConfirm = false) => {
    if (!skipConfirm && !confirm(`Send password reset link to ${targetEmail}?`)) return;

    const usersStr = localStorage.getItem('studentpocket_users');
    if (!usersStr) return;
    
    const users = JSON.parse(usersStr);
    
    // Generate Token
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Save token to user
    users[targetUser] = {
      ...users[targetUser],
      resetToken: resetToken
    };
    localStorage.setItem('studentpocket_users', JSON.stringify(users));

    // Generate Link
    const link = `${window.location.origin}${window.location.pathname}?mode=reset&user=${encodeURIComponent(targetUser)}&token=${resetToken}`;

    // Send Email
    const sent = await sendPasswordResetEmail(targetEmail, targetUser, link);
    if (sent) {
        alert(`Reset link sent successfully to ${targetEmail}`);
    } else {
        alert(`Failed to send reset link to ${targetEmail}`);
    }
  };
  
  // --- Request System Handlers (Admin) ---
  const handleRequest = (req: ChangeRequest, action: 'APPROVE' | 'REJECT') => {
      // 1. Process Logic
      if (action === 'APPROVE') {
          if (req.type === 'PROFILE_UPDATE' && req.payload) {
             const key = `studentpocket_data_${req.username}`;
             const stored = localStorage.getItem(key);
             if (stored) {
                 const data = JSON.parse(stored);
                 data.user = { ...data.user, ...req.payload };
                 localStorage.setItem(key, JSON.stringify(data));
                 alert(`Profile updated for ${req.username}`);
             } else {
                 alert("User data not found, cannot update.");
             }
          } else if (req.type === 'PASSWORD_RESET') {
             // Look up user email to send link
             const userObj = usersList.find(u => u.username === req.username);
             if (userObj && userObj.email) {
                 // Automatically send link via email
                 sendResetLink(req.username, userObj.email, true);
             } else {
                 // Fallback to manual reset if no email found
                 adminResetPassword(req.username);
             }
          } else if (req.type === 'VERIFICATION_CODE') {
             // Find user code and alert it or resend
             const userObj = usersList.find(u => u.username === req.username);
             if (userObj) resendVerification(userObj);
             else alert("User not found");
          } else if (req.type === 'DELETE_ACCOUNT') {
             executeUserDeletion(req.username);
             alert(`User ${req.username} has been deleted.`);
          }
      }

      // 2. Remove Request
      const newReqs = requests.filter(r => r.id !== req.id);
      setRequests(newReqs);
      localStorage.setItem('studentpocket_requests', JSON.stringify(newReqs));
      setRefreshTrigger(prev => prev + 1);
  };

  const handleFactoryReset = () => {
    if (window.confirm('CRITICAL WARNING: This will DELETE ALL USERS and ALL DATA permanently. The app will be reset to its initial state. Are you sure?')) {
      resetApp();
    }
  };

  const deleteAllStudents = () => {
    if (!window.confirm("Are you sure you want to delete ALL registered students? This action cannot be undone. (Admin account will be preserved)")) return;
    
    const usersStr = localStorage.getItem('studentpocket_users');
    let users = {};
    if (usersStr) {
        try {
            users = JSON.parse(usersStr);
        } catch (e) {
            users = {};
        }
    }

    // Filter out students, keep admin if present (though typically admin is hardcoded)
    const preservedUsers: any = {};
    if (users['admin']) {
        preservedUsers['admin'] = users['admin'];
    }

    // Delete data for everyone else
    Object.keys(users).forEach(username => {
        if (username !== 'admin') {
            localStorage.removeItem(`studentpocket_data_${username}`);
        }
    });
    
    // Update registry with only admin remaining
    localStorage.setItem('studentpocket_users', JSON.stringify(preservedUsers));
    
    // Clear all pending requests
    localStorage.removeItem('studentpocket_requests');
    setRequests([]);
    
    setRefreshTrigger(prev => prev + 1);
    
    alert("All student accounts and their data have been deleted successfully.");
  };

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      {/* REQUESTS INBOX */}
      <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center justify-between">
          <span className="flex items-center"><MessageSquare size={16} className="mr-2" /> Requests Inbox</span>
          {requests.length > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{requests.length}</span>}
        </h3>
        
        <div className="space-y-3">
            {requests.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">No pending requests</div>
            ) : (
                requests.map(req => (
                    <div key={req.id} className={`bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm relative overflow-hidden ${req.type === 'DELETE_ACCOUNT' ? 'border-red-200 dark:border-red-900/50' : 'border-indigo-100 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{req.username}</p>
                                <p className={`text-[10px] uppercase font-bold tracking-wider ${req.type === 'DELETE_ACCOUNT' ? 'text-red-500' : 'text-gray-500'}`}>
                                    {req.type.replace('_', ' ')}
                                </p>
                            </div>
                            <span className="text-[10px] text-gray-400">{new Date(req.timestamp).toLocaleDateString()}</span>
                        </div>
                        
                        {req.type === 'PROFILE_UPDATE' && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                Changes: Name ({req.payload.name}), Phone ({req.payload.phone})...
                            </div>
                        )}

                        {req.type === 'DELETE_ACCOUNT' && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-3 flex items-center">
                                <AlertTriangle size={12} className="mr-2"/> User requested permanent account deletion.
                            </div>
                        )}
                        
                        <div className="flex space-x-2">
                            <button 
                              onClick={() => handleRequest(req, 'APPROVE')}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  req.type === 'DELETE_ACCOUNT' 
                                  ? 'bg-red-600 text-white hover:bg-red-700' 
                                  : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100'
                              }`}
                            >
                                {req.type === 'PASSWORD_RESET' ? 'Approve & Send Link' : req.type === 'VERIFICATION_CODE' ? 'Send/View Code' : req.type === 'DELETE_ACCOUNT' ? 'Confirm Delete' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => handleRequest(req, 'REJECT')}
                              className="px-3 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-lg text-xs font-bold hover:bg-gray-200"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center justify-between">
          <span className="flex items-center"><Users size={16} className="mr-2" /> Registered Users</span>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{usersList.length}</span>
        </h3>
        <div className="space-y-4">
          {usersList.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm">No registered students yet.</p>
            </div>
          ) : (
            usersList.map((u, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* User Card Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${u.verified ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{u.username}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{u.email}</p>
                          {u.verified ? (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
                               <BadgeCheck size={12} className="mr-1" /> Verified
                             </span>
                           ) : (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                               <AlertTriangle size={12} className="mr-1" /> Pending
                             </span>
                           )}
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Password</span>
                       <div className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 select-all mb-2">
                          {u.password}
                       </div>
                       
                       <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Vault PIN</span>
                       <div className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 select-all">
                          {u.profile?.vaultPin || '1234'}
                       </div>
                    </div>
                </div>

                {/* User Details */}
                <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-900/30 text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-y-1 gap-x-2 border-b border-gray-100 dark:border-gray-700">
                    <p><span className="font-bold text-gray-500">Name:</span> {u.profile?.name || 'N/A'}</p>
                    <p><span className="font-bold text-gray-500">Phone:</span> {u.profile?.phone || 'N/A'}</p>
                    <p className="col-span-2"><span className="font-bold text-gray-500">Education:</span> {u.profile?.education || 'N/A'}</p>
                    {u.verificationCode && !u.verified && (
                        <p className="col-span-2 text-orange-600 font-mono mt-1"><span className="font-bold">Code:</span> {u.verificationCode}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center gap-2 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => toggleVerification(u.username, u.verified)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              u.verified 
                              ? 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                              : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                          }`}
                        >
                          {u.verified ? 'Unverify' : 'Verify'}
                        </button>

                        <button 
                          onClick={() => adminResetPassword(u.username)}
                          className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center"
                        >
                          <RefreshCw size={12} className="mr-1" /> Manual Reset
                        </button>

                        <button 
                          onClick={() => sendResetLink(u.username, u.email)}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center"
                        >
                          <Link size={12} className="mr-1" /> Send Link
                        </button>
                    </div>

                    <button 
                        onClick={() => deleteUser(u.username)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-8 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3 ml-2 flex items-center">
          <AlertTriangle size={16} className="mr-2" /> Danger Zone
        </h3>
        
        <div 
          onClick={deleteAllStudents}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30 cursor-pointer active:scale-95 transition-transform group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Users size={20} />
            </div>
            <span className="font-bold text-red-700 dark:text-red-400">Delete All Students Only</span>
          </div>
        </div>

        <div 
          onClick={handleFactoryReset}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30 cursor-pointer active:scale-95 transition-transform group mt-3"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Power size={20} />
            </div>
            <span className="font-bold text-red-700 dark:text-red-400">Factory Reset Application</span>
          </div>
        </div>
        <p className="text-xs text-red-400 mt-2 px-2">
          "Delete All Students" removes all student accounts but keeps you logged in.<br/>
          "Factory Reset" wipes everything and logs you out.
        </p>
      </div>
    </div>
  );
};
