
import React, { useState, useEffect } from 'react';
import { ChangeRequest, Post, UserProfile } from '../types';
import { Users, AlertTriangle, Trash2, RefreshCw, BadgeCheck, MessageSquare, Power, Link, KeyRound, Filter, CheckCircle2, Search, ShieldAlert, Megaphone, Plus, X, Edit2, Save, Info, Image as ImageIcon } from 'lucide-react';
import { sendPasswordResetEmail } from '../services/emailService';
import { ADMIN_USERNAME } from '../constants';

interface AdminDashboardProps {
  resetApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ resetApp }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userFilter, setUserFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Post Management State
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  // User Editing State
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  
  // ID Card Viewing
  const [viewIdCard, setViewIdCard] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

    // Load Posts
    const postsStr = localStorage.getItem('studentpocket_global_posts');
    if (postsStr) {
        setPosts(JSON.parse(postsStr));
    }
  }, [refreshTrigger]);

  const toggleVerification = (targetUser: string, currentStatus: boolean) => {
    if (targetUser === ADMIN_USERNAME) {
        showToast("Cannot change verification status of the System Administrator.", 'error');
        return;
    }

    const usersStr = localStorage.getItem('studentpocket_users');
    if (!usersStr) return;
    const users = JSON.parse(usersStr);
    
    if (users[targetUser]) {
      users[targetUser].verified = !currentStatus;
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
      setRefreshTrigger(prev => prev + 1);
      showToast(`User ${targetUser} ${!currentStatus ? 'Verified' : 'Unverified'}`, 'success');
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
    if (targetUser === ADMIN_USERNAME) {
        showToast("Cannot delete the System Administrator.", 'error');
        return;
    }

    if (!window.confirm(`PERMANENT DELETE WARNING:\n\nAre you sure you want to delete user "${targetUser}"?\n\nThis action will wipe all their data and cannot be undone.`)) return;
    executeUserDeletion(targetUser);
    setRefreshTrigger(prev => prev + 1);
    showToast(`User ${targetUser} deleted permanently.`, 'info');
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
        showToast(`Password updated for ${targetUser}`, 'success');
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
        showToast(`Reset link sent to ${targetEmail}`, 'success');
    } else {
        showToast(`Failed to send email to ${targetEmail}`, 'error');
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
                 data.user = { ...data.user, ...req.payload }; // Merge payload including avatar
                 localStorage.setItem(key, JSON.stringify(data));
                 showToast(`Profile updated for ${req.username}`, 'success');
             } else {
                 showToast("User data not found.", 'error');
             }
          } else if (req.type === 'PASSWORD_RESET') {
             const userObj = usersList.find(u => u.username === req.username);
             if (userObj && userObj.email) {
                 sendResetLink(req.username, userObj.email, true);
             } else {
                 adminResetPassword(req.username);
             }
          } else if (req.type === 'VERIFICATION_REQUEST') {
             const usersStr = localStorage.getItem('studentpocket_users');
             if (usersStr) {
                 const users = JSON.parse(usersStr);
                 if (users[req.username]) {
                     users[req.username].verified = true;
                     localStorage.setItem('studentpocket_users', JSON.stringify(users));
                     setRefreshTrigger(prev => prev + 1);
                     showToast(`${req.username} verified!`, 'success');
                 }
             }
          } else if (req.type === 'DELETE_ACCOUNT') {
             if (!window.confirm(`PERMANENT DELETE WARNING:\n\nAre you sure you want to approve the deletion for user "${req.username}"?\n\nThis will wipe all their data and cannot be undone.`)) {
                 return;
             }
             executeUserDeletion(req.username);
             showToast(`${req.username} deleted.`, 'info');
          }
      } else {
          showToast("Request rejected.", 'info');
      }

      // 2. Remove Request
      const newReqs = requests.filter(r => r.id !== req.id);
      setRequests(newReqs);
      localStorage.setItem('studentpocket_requests', JSON.stringify(newReqs));
      setRefreshTrigger(prev => prev + 1);
  };

  // --- Post Logic ---
  const createPost = () => {
    if (!newPost.title || !newPost.content) {
        showToast("Title and Content are required.", 'error');
        return;
    }

    const post: Post = {
        id: Date.now().toString(),
        title: newPost.title,
        content: newPost.content,
        date: new Date().toISOString(),
        author: ADMIN_USERNAME,
        likes: [],
        comments: []
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('studentpocket_global_posts', JSON.stringify(updatedPosts));
    setNewPost({ title: '', content: '' });
    setShowPostForm(false);
    showToast("Announcement broadcasted!", 'success');
  };

  const deletePost = (id: string) => {
      if(!confirm("Delete this post?")) return;
      const updatedPosts = posts.filter(p => p.id !== id);
      setPosts(updatedPosts);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updatedPosts));
      showToast("Announcement deleted.", 'info');
  };

  const handleFactoryReset = () => {
    if (window.confirm('CRITICAL WARNING: This will DELETE ALL USERS and ALL DATA permanently. The app will be reset to its initial state. Are you sure?')) {
      resetApp();
    }
  };

  const deleteAllStudents = () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL registered students?\n\nThis action cannot be undone. (Admin account will be preserved)")) return;
    
    const usersStr = localStorage.getItem('studentpocket_users');
    let users = {};
    if (usersStr) {
        try {
            users = JSON.parse(usersStr);
        } catch (e) {
            users = {};
        }
    }

    const preservedUsers: any = {};
    if (users[ADMIN_USERNAME]) {
        preservedUsers[ADMIN_USERNAME] = users[ADMIN_USERNAME];
    }
    if (users['admin']) {
        preservedUsers['admin'] = users['admin'];
    }

    Object.keys(users).forEach(username => {
        if (username !== ADMIN_USERNAME && username !== 'admin') {
            localStorage.removeItem(`studentpocket_data_${username}`);
        }
    });
    
    localStorage.setItem('studentpocket_users', JSON.stringify(preservedUsers));
    localStorage.removeItem('studentpocket_requests');
    setRequests([]);
    setRefreshTrigger(prev => prev + 1);
    
    showToast("All student accounts deleted.", 'success');
  };

  // --- Admin User Editing ---
  const startEditing = (user: any) => {
      setEditingUser(user.username);
      setEditFormData({
          name: user.profile?.name || '',
          email: user.profile?.email || '',
          phone: user.profile?.phone || '',
          education: user.profile?.education || '',
          institution: user.profile?.institution || '',
          country: user.profile?.country || ''
      });
  };

  const saveUserEdits = () => {
      if (!editingUser) return;

      const key = `studentpocket_data_${editingUser}`;
      const stored = localStorage.getItem(key);
      if (stored) {
          const data = JSON.parse(stored);
          data.user = { ...data.user, ...editFormData };
          localStorage.setItem(key, JSON.stringify(data));
          
          // Also update email in auth registry if changed
          if (editFormData.email) {
              const usersStr = localStorage.getItem('studentpocket_users');
              if (usersStr) {
                  const users = JSON.parse(usersStr);
                  if (users[editingUser]) {
                      users[editingUser].email = editFormData.email;
                      localStorage.setItem('studentpocket_users', JSON.stringify(users));
                  }
              }
          }

          setEditingUser(null);
          setRefreshTrigger(prev => prev + 1);
          showToast(`User ${editingUser} saved.`, 'success');
      } else {
          showToast("User data not found.", 'error');
      }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesFilter = 
        userFilter === 'ALL' || 
        (userFilter === 'PENDING' && !u.verified) || 
        (userFilter === 'VERIFIED' && u.verified);
    
    const matchesSearch = 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Sorting: Pending users first, then by username
  const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a.verified === b.verified) return a.username.localeCompare(b.username);
      return a.verified ? 1 : -1;
  });

  return (
    <div className="pb-20 animate-fade-in relative">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl animate-fade-in">
           {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-400 dark:text-green-600 mr-2" />}
           {toast.type === 'error' && <AlertTriangle size={18} className="text-red-400 dark:text-red-600 mr-2" />}
           {toast.type === 'info' && <Info size={18} className="text-blue-400 dark:text-blue-600 mr-2" />}
           <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {viewIdCard && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewIdCard(null)}>
           <div className="relative max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl p-2 animate-scale-up" onClick={e => e.stopPropagation()}>
              <img src={viewIdCard} className="w-full h-auto rounded-xl" alt="Student ID" />
              <button 
                onClick={() => setViewIdCard(null)}
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white"
              >
                  <X size={20}/>
              </button>
           </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      {/* ANNOUNCEMENTS */}
      <div className="mb-8">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center justify-between">
            <span className="flex items-center"><Megaphone size={16} className="mr-2" /> Broadcast Announcements</span>
            <button 
                onClick={() => setShowPostForm(!showPostForm)} 
                className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                {showPostForm ? <X size={16} /> : <Plus size={16} />}
            </button>
         </h3>

         {showPostForm && (
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-indigo-100 dark:border-gray-700 mb-4 animate-slide-up">
                 <input 
                    className="w-full mb-3 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-bold"
                    placeholder="Announcement Title"
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                 />
                 <textarea 
                    className="w-full mb-3 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg h-24 resize-none"
                    placeholder="Write your message here..."
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                 />
                 <button onClick={createPost} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">
                     Post Announcement
                 </button>
             </div>
         )}

         <div className="space-y-3">
             {posts.length === 0 ? (
                 <div className="text-gray-400 text-sm italic ml-2">No announcements posted.</div>
             ) : (
                 posts.map(post => (
                     <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                         <h4 className="font-bold text-gray-800 dark:text-white pr-8">{post.title}</h4>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{post.content}</p>
                         <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] text-gray-400">{new Date(post.date).toLocaleDateString()} • {new Date(post.date).toLocaleTimeString()}</p>
                            <div className="flex space-x-3 text-xs text-gray-400">
                                <span>{post.likes?.length || 0} Likes</span>
                                <span>{post.comments?.length || 0} Comments</span>
                            </div>
                         </div>
                         <button 
                            onClick={() => deletePost(post.id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                             <Trash2 size={14} />
                         </button>
                     </div>
                 ))
             )}
         </div>
      </div>

      {/* REQUESTS INBOX */}
      <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center justify-between">
          <span className="flex items-center"><MessageSquare size={16} className="mr-2" /> Requests Inbox</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Refresh Inbox">
                <RefreshCw size={14} />
            </button>
            {requests.length > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{requests.length}</span>}
          </div>
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
                                <span className="block font-bold mb-1">Proposed Changes:</span>
                                {req.payload.avatar && <div className="mb-2"><img src={req.payload.avatar} alt="New Avatar" className="w-10 h-10 rounded-full object-cover border"/></div>}
                                Name: {req.payload.name}<br/>
                                Institution: {req.payload.institution}<br/>
                                Phone: {req.payload.phone}
                            </div>
                        )}

                        {req.type === 'DELETE_ACCOUNT' && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-3 flex items-center">
                                <AlertTriangle size={12} className="mr-2"/> <strong>Warning:</strong>&nbsp;User requested permanent account deletion.
                            </div>
                        )}

                         {req.type === 'VERIFICATION_REQUEST' && (
                            <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded mb-3">
                                <div className="flex items-center mb-2 font-bold text-yellow-800 dark:text-yellow-400">
                                   <BadgeCheck size={14} className="mr-2"/> Verification Request
                                </div>
                                {req.payload?.emailVerified && (
                                   <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                                       <CheckCircle2 size={12} className="mr-1"/> Email Verified via OTP
                                   </div>
                                )}
                                {req.payload?.idCardImage && (
                                   <button 
                                      onClick={() => setViewIdCard(req.payload.idCardImage)}
                                      className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                                   >
                                      <ImageIcon size={14} className="mr-1"/> View Student ID Card
                                   </button>
                                )}
                            </div>
                        )}

                         {req.type === 'PASSWORD_RESET' && (
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-3 flex items-center">
                                <KeyRound size={12} className="mr-2"/> User requested a password reset.
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
                                {req.type === 'PASSWORD_RESET' ? 'Approve & Send Link' : req.type === 'VERIFICATION_REQUEST' ? 'Approve & Verify' : req.type === 'DELETE_ACCOUNT' ? 'Confirm Delete' : 'Approve Update'}
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

      {/* USER MANAGEMENT */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center justify-between">
          <span className="flex items-center"><Users size={16} className="mr-2" /> Registered Users</span>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{usersList.length}</span>
        </h3>

        {/* Search & Filters */}
        <div className="mb-4 space-y-3">
             <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 pl-10 pr-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
             </div>

             <div className="flex space-x-2 overflow-x-auto px-1">
                <button 
                    onClick={() => setUserFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${userFilter === 'ALL' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setUserFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center ${userFilter === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                    <AlertTriangle size={12} className="mr-1" /> Pending
                </button>
                <button 
                    onClick={() => setUserFilter('VERIFIED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center ${userFilter === 'VERIFIED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                    <BadgeCheck size={12} className="mr-1" /> Verified
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedUsers.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm">No users found matching your search.</p>
            </div>
          ) : (
            sortedUsers.map((u, idx) => {
              const isSystemAdmin = u.username === ADMIN_USERNAME;
              const isEditing = editingUser === u.username;

              return (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative flex flex-col">
                
                {/* Editing Overlay */}
                {isEditing && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h4 className="font-bold">Edit User: {u.username}</h4>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400"><X size={16}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            <input className="w-full p-2 border rounded" placeholder="Full Name" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Phone" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Institution" value={editFormData.institution} onChange={e => setEditFormData({...editFormData, institution: e.target.value})} />
                        </div>
                        <button onClick={saveUserEdits} className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center">
                            <Save size={16} className="mr-2"/> Save Changes
                        </button>
                    </div>
                )}

                {/* User Card Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0 ${u.verified ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                        {u.profile?.avatar ? <img src={u.profile.avatar} className="w-full h-full object-cover"/> : u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                          <div className="flex items-center">
                              <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight truncate">{u.username}</h4>
                              {isSystemAdmin && (
                                  <span className="ml-2 bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border border-indigo-200 flex items-center flex-shrink-0">
                                      <ShieldAlert size={8} className="mr-1"/> Admin
                                  </span>
                              )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{u.email}</p>
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
                </div>

                {/* User Details */}
                <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-900/30 text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-y-1 gap-x-2 border-b border-gray-100 dark:border-gray-700 flex-1">
                    <p className="truncate"><span className="font-bold text-gray-500">Name:</span> {u.profile?.name || 'N/A'}</p>
                    <p className="truncate"><span className="font-bold text-gray-500">Phone:</span> {u.profile?.phone || 'N/A'}</p>
                    <p className="col-span-2 truncate"><span className="font-bold text-gray-500">Education:</span> {u.profile?.education || 'N/A'}</p>
                    <div className="col-span-2 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                         <span className="text-[10px] text-gray-400 font-mono">PWD: {u.password}</span>
                         <span className="text-[10px] text-gray-400 font-mono">PIN: {u.profile?.vaultPin || '1234'}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center gap-2">
                    <div className="flex gap-2">
                        <button 
                          onClick={() => toggleVerification(u.username, u.verified)}
                          disabled={isSystemAdmin}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              isSystemAdmin ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' :
                              u.verified 
                              ? 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                              : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                          }`}
                        >
                          {u.verified ? 'Unverify' : 'Verify'}
                        </button>
                        
                        <button 
                            onClick={() => startEditing(u)}
                            className="p-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center"
                            title="Edit User"
                        >
                            <Edit2 size={14} />
                        </button>

                        <button 
                          onClick={() => adminResetPassword(u.username)}
                          className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center"
                          title="Reset Password"
                        >
                          <RefreshCw size={14} />
                        </button>
                    </div>

                    <button 
                        onClick={() => deleteUser(u.username)}
                        disabled={isSystemAdmin}
                        className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                            isSystemAdmin 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                        }`}
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            );
            })
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
