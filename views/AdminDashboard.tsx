
import React, { useState, useEffect } from 'react';
import { ChangeRequest, Post, UserProfile, Note, Assignment, TaskPriority } from '../types';
import { Users, AlertTriangle, Trash2, RefreshCw, BadgeCheck, MessageSquare, Power, Link, KeyRound, Filter, CheckCircle2, Search, ShieldAlert, Megaphone, Plus, X, Edit2, Save, Info, Image as ImageIcon, HelpCircle, Send, UserPlus, HardDrive, Download, Upload, Eye, BookOpen, Calendar, Award, Wand2, Clock, Inbox, UserCog, Check, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from '../services/emailService';
import { generateUserBadge } from '../services/geminiService';
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
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState({ title: '', content: '' });

  // User Creation State
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });

  // Detailed User Inspection State (Spy Mode)
  const [inspectingUser, setInspectingUser] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<{ user: UserProfile, notes: Note[], assignments: Assignment[] } | null>(null);
  const [inspectTab, setInspectTab] = useState<'PROFILE' | 'NOTES' | 'PLANNER'>('PROFILE');

  // View Mode
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'REQUESTS' | 'SUPPORT'>('DASHBOARD');

  // Badge Generator State
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [manualBadgeName, setManualBadgeName] = useState('');

  // Inspector - Add Note/Assignment State
  const [adminNote, setAdminNote] = useState({ title: '', content: '' });
  const [adminTask, setAdminTask] = useState<Partial<Assignment>>({ priority: TaskPriority.MEDIUM });

  // Ticket Reply State
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});

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
          const dataStr = localStorage.getItem(`studentpocket_data_${key}`);
          const profile = dataStr ? JSON.parse(dataStr).user : null;
          return {
            username: key,
            email: value.email,
            password: value.password,
            verified: value.verified,
            profile: profile
          };
        });
        setUsersList(list);
      } catch (e) {
        console.error("Error parsing users list", e);
      }
    }
    
    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) setRequests(JSON.parse(reqStr));

    const postsStr = localStorage.getItem('studentpocket_global_posts');
    if (postsStr) setPosts(JSON.parse(postsStr));
  }, [refreshTrigger]);

  // --- REQUEST MANAGEMENT ---
  const handleProfileUpdate = (req: ChangeRequest, approved: boolean) => {
      if (approved && req.payload) {
          const key = `studentpocket_data_${req.username}`;
          const stored = localStorage.getItem(key);
          if (stored) {
              const data = JSON.parse(stored);
              data.user = { ...data.user, ...req.payload };
              localStorage.setItem(key, JSON.stringify(data));
          }
      }

      const updatedRequests = requests.map(r => r.id === req.id ? { ...r, status: approved ? 'APPROVED' as const : 'REJECTED' as const } : r);
      setRequests(updatedRequests);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      setRefreshTrigger(prev => prev + 1);
      showToast(approved ? "Profile Updated & Verified" : "Request Rejected", approved ? 'success' : 'info');
  };

  const handleVerificationRequest = (req: ChangeRequest, approved: boolean) => {
      if (approved) {
          const usersStr = localStorage.getItem('studentpocket_users');
          if (usersStr) {
              const users = JSON.parse(usersStr);
              if (users[req.username]) {
                  users[req.username].verified = true;
                  localStorage.setItem('studentpocket_users', JSON.stringify(users));
              }
          }
      }

      const updatedRequests = requests.map(r => r.id === req.id ? { ...r, status: approved ? 'APPROVED' as const : 'REJECTED' as const } : r);
      setRequests(updatedRequests);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      setRefreshTrigger(prev => prev + 1);
      showToast(approved ? "Professional Verification Granted" : "Verification Rejected", approved ? 'success' : 'info');
  };

  // --- POST PREVIEW & SAVE ---
  const savePost = () => {
      if (!postForm.title || !postForm.content) return;
      
      let updatedPosts = [...posts];
      if (editingPostId) {
          updatedPosts = updatedPosts.map(p => p.id === editingPostId ? { ...p, title: postForm.title, content: postForm.content } : p);
          showToast("Announcement updated.", 'success');
      } else {
          const newPost: Post = {
              id: Date.now().toString(),
              title: postForm.title,
              content: postForm.content,
              date: new Date().toISOString(),
              author: ADMIN_USERNAME,
              likes: [], comments: []
          };
          updatedPosts = [newPost, ...updatedPosts];
          showToast("Announcement published globally.", 'success');
      }
      
      setPosts(updatedPosts);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updatedPosts));
      setPostForm({ title: '', content: '' });
      setEditingPostId(null);
      setShowPostForm(false);
      setShowPostPreview(false);
  };

  const startEditPost = (post: Post) => {
      setPostForm({ title: post.title, content: post.content });
      setEditingPostId(post.id);
      setShowPostForm(true);
  };

  const deleteTicket = (ticketId: string) => {
      if(!confirm("Delete this ticket?")) return;
      const updatedRequests = requests.filter(r => r.id !== ticketId);
      setRequests(updatedRequests);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      showToast("Ticket deleted.", 'success');
  };

  const resolveTicket = (ticketId: string) => {
      const response = replyText[ticketId];
      if (!response || !response.trim()) {
          alert("Please write a response before resolving.");
          return;
      }
      const updatedRequests = requests.map(r => r.id === ticketId ? { ...r, status: 'RESOLVED' as const, payload: { ...r.payload, adminResponse: response } } : r);
      setRequests(updatedRequests);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      const newReplies = {...replyText};
      delete newReplies[ticketId];
      setReplyText(newReplies);
      showToast("Ticket resolved.", 'success');
  };

  const handleInspectUser = (username: string) => {
      const dataStr = localStorage.getItem(`studentpocket_data_${username}`);
      if (dataStr) {
          const parsed = JSON.parse(dataStr);
          setInspectData(parsed);
          setInspectingUser(username);
          setInspectTab('PROFILE');
      } else {
          showToast("User data not initialized.", 'error');
      }
  };

  const closeInspection = () => {
      setInspectingUser(null);
      setInspectData(null);
  };

  const addBadgeToUser = (badge: string) => {
      if (!inspectData?.user || !inspectingUser) return;
      const currentBadges = inspectData.user.badges || [];
      if (!currentBadges.includes(badge)) {
          const updatedUser = { ...inspectData.user, badges: [...currentBadges, badge] };
          const key = `studentpocket_data_${inspectingUser}`;
          const fullData = JSON.parse(localStorage.getItem(key) || '{}');
          fullData.user = updatedUser;
          localStorage.setItem(key, JSON.stringify(fullData));
          setInspectData({...inspectData, user: updatedUser});
          showToast(`Awarded: ${badge}`, 'success');
      } else {
          showToast("User already has this badge.", 'info');
      }
  };

  const removeBadge = (badgeToRemove: string) => {
      if (!inspectData?.user || !inspectingUser) return;
      if (!confirm(`Remove "${badgeToRemove}"?`)) return;
      const updatedUser = { ...inspectData.user, badges: (inspectData.user.badges || []).filter(b => b !== badgeToRemove) };
      const key = `studentpocket_data_${inspectingUser}`;
      const fullData = JSON.parse(localStorage.getItem(key) || '{}');
      fullData.user = updatedUser;
      localStorage.setItem(key, JSON.stringify(fullData));
      setInspectData({...inspectData, user: updatedUser});
      showToast("Badge removed.", 'success');
  };

  const createUser = () => {
      if (!newUser.username || !newUser.password || !newUser.email) {
          showToast("All fields required.", 'error');
          return;
      }
      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      if (users[newUser.username]) {
          showToast("Username exists.", 'error');
          return;
      }
      users[newUser.username] = { email: newUser.email, password: newUser.password, verified: true };
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
      const initialData = { user: { name: newUser.username, email: newUser.email, phone: "", education: "", institution: "", country: "", skills: [], badges: ["🌱 Verified Newcomer"] }, assignments: [], notes: [], vaultDocs: [], scholarships: [] };
      localStorage.setItem(`studentpocket_data_${newUser.username}`, JSON.stringify(initialData));
      setNewUser({ username: '', email: '', password: '' });
      setShowCreateUser(false);
      setRefreshTrigger(prev => prev + 1);
      showToast("Professional user created.", 'success');
  };

  // Added deleteUser function to fix the error at line 460
  const deleteUser = (usernameToDelete: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${usernameToDelete}" and all associated data? This cannot be undone.`)) return;
    
    // Remove from system users list
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      delete users[usernameToDelete];
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
    }
    
    // Remove individual user data storage
    localStorage.removeItem(`studentpocket_data_${usernameToDelete}`);
    
    // Clean up any pending change requests or tickets for this user
    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) {
      const allReqs: ChangeRequest[] = JSON.parse(reqStr);
      const filteredReqs = allReqs.filter(r => r.username !== usernameToDelete);
      localStorage.setItem('studentpocket_requests', JSON.stringify(filteredReqs));
      setRequests(filteredReqs);
    }

    setRefreshTrigger(prev => prev + 1);
    showToast(`User ${usernameToDelete} has been purged from the system.`, 'success');
  };

  const deletePost = (id: string) => {
      if(!confirm("Delete this post?")) return;
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updated));
  };

  const filteredUsers = usersList.filter(u => {
    const matchesFilter = userFilter === 'ALL' || (userFilter === 'PENDING' && !u.verified) || (userFilter === 'VERIFIED' && u.verified);
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingProfileRequests = requests.filter(r => r.type === 'PROFILE_UPDATE' && r.status === 'PENDING');
  const pendingVerificationRequests = requests.filter(r => r.type === 'VERIFICATION_REQUEST' && r.status === 'PENDING');
  const supportTickets = requests.filter(r => r.type === 'SUPPORT_TICKET');
  const activeRequestCount = pendingProfileRequests.length + pendingVerificationRequests.length;

  return (
    <div className="pb-20 animate-fade-in relative">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl animate-fade-in z-[100]">
           <Info size={18} className="mr-2" /> <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* INSPECT USER MODAL */}
      {inspectingUser && inspectData && (
          <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 flex flex-col animate-slide-up overflow-hidden">
              <div className="bg-white dark:bg-gray-800 p-4 shadow-md flex justify-between items-center z-10">
                  <div className="flex items-center">
                      <button onClick={closeInspection} className="mr-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><X size={20}/></button>
                      <div>
                          <h2 className="text-lg font-bold flex items-center">{inspectingUser} <BadgeCheck size={16} className="ml-2 text-blue-500"/></h2>
                          <p className="text-xs text-gray-500">{inspectData.user.email}</p>
                      </div>
                  </div>
                  <div className="flex space-x-2">
                      <button onClick={() => setInspectTab('PROFILE')} className={`px-4 py-2 rounded-lg text-sm font-bold ${inspectTab === 'PROFILE' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Profile</button>
                      <button onClick={() => setInspectTab('NOTES')} className={`px-4 py-2 rounded-lg text-sm font-bold ${inspectTab === 'NOTES' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Notes</button>
                      <button onClick={() => setInspectTab('PLANNER')} className={`px-4 py-2 rounded-lg text-sm font-bold ${inspectTab === 'PLANNER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Plans</button>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                  {inspectTab === 'PROFILE' && (
                      <div className="max-w-4xl mx-auto space-y-6">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <h3 className="text-lg font-bold mb-4 flex items-center"><Award className="mr-2 text-yellow-500"/> Professional Recognition</h3>
                              <div className="flex flex-wrap gap-2 mb-4">
                                  {inspectData.user.badges?.map((b, i) => (
                                      <span key={i} className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-full text-sm font-bold border border-yellow-200 dark:border-yellow-800 flex items-center">
                                          {b} <button onClick={() => removeBadge(b)} className="ml-2 text-red-400 hover:text-red-600"><X size={12} /></button>
                                      </span>
                                  ))}
                              </div>
                              <div className="flex gap-2">
                                  <input type="text" placeholder="Custom Badge/Role" className="flex-1 px-3 py-2 rounded-xl text-sm border dark:bg-gray-700 dark:border-gray-600" value={manualBadgeName} onChange={(e) => setManualBadgeName(e.target.value)} />
                                  <button onClick={() => addBadgeToUser(manualBadgeName)} className="bg-indigo-600 text-white px-4 rounded-xl font-bold">Assign</button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Master Console</h1>

      {/* VIEW TOGGLE */}
      <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl mb-6 max-w-lg shadow-inner">
          <button onClick={() => setViewMode('DASHBOARD')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'DASHBOARD' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-white' : 'text-gray-500'}`}>Console</button>
          <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'REQUESTS' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-white' : 'text-gray-500'}`}>Approvals {activeRequestCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{activeRequestCount}</span>}</button>
          <button onClick={() => setViewMode('SUPPORT')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'SUPPORT' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-white' : 'text-gray-500'}`}>Tickets</button>
      </div>

      {viewMode === 'DASHBOARD' && (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button onClick={() => setShowCreateUser(true)} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 flex flex-col items-center justify-center transition-all active:scale-95">
                    <UserPlus size={24} className="mb-2" />
                    <span className="font-bold text-sm">Add Pro User</span>
                </button>
                <button onClick={() => setShowPostForm(true)} className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg hover:bg-purple-700 flex flex-col items-center justify-center transition-all active:scale-95">
                    <Megaphone size={24} className="mb-2" />
                    <span className="font-bold text-sm">Global Post</span>
                </button>
                <button onClick={resetApp} className="bg-red-600 text-white p-4 rounded-2xl shadow-lg hover:bg-red-700 flex flex-col items-center justify-center transition-all active:scale-95">
                    <Trash2 size={24} className="mb-2" />
                    <span className="font-bold text-sm">Reset App</span>
                </button>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex flex-col items-center justify-center border dark:border-gray-700">
                    <span className="text-3xl font-bold text-indigo-600">{usersList.length}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</span>
                </div>
            </div>

            {/* CREATE USER MODAL */}
            {showCreateUser && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-indigo-100 dark:border-gray-700 mb-8 animate-slide-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Initialize Verified User</h3>
                        <button onClick={() => setShowCreateUser(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input className="p-3 border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                        <input className="p-3 border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        <input className="p-3 border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    </div>
                    <button onClick={createUser} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Add Fully Verified Pro</button>
                </div>
            )}

            {/* POST EDITOR WITH PREVIEW */}
            {showPostForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-100 dark:border-gray-700 mb-8 animate-slide-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-purple-600"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl flex items-center"><Megaphone className="mr-2 text-purple-600"/> {editingPostId ? 'Refine Post' : 'Compose Global Post'}</h3>
                        <div className="flex space-x-2">
                             <button 
                                onClick={() => setShowPostPreview(!showPostPreview)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${showPostPreview ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                             >
                                {showPostPreview ? <EyeOff size={14} className="mr-2"/> : <Eye size={14} className="mr-2"/>}
                                {showPostPreview ? 'Hide Preview' : 'Show Preview'}
                             </button>
                             <button onClick={() => { setShowPostForm(false); setEditingPostId(null); setPostForm({title:'',content:''}); }} className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-700 p-2 rounded-full"><X size={20}/></button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <input className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-transparent focus:border-purple-500 border-2 outline-none rounded-xl font-bold text-lg" placeholder="Headline" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
                            <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-transparent focus:border-purple-500 border-2 outline-none rounded-xl h-48 text-sm leading-relaxed" placeholder="Write your message to the students..." value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
                            <button onClick={savePost} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center">
                                <Send className="mr-2" size={20}/> {editingPostId ? 'Push Updates' : 'Publish to All'}
                            </button>
                         </div>

                         {/* PREVIEW PANEL */}
                         <div className={`transition-all duration-300 ${showPostPreview ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none lg:block hidden'}`}>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live User Preview</p>
                             <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden transition-all">
                                    <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                                        {postForm.title || 'Enter a headline...'}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-h-[60px]">
                                        {postForm.content || 'Start typing your announcement to see how it looks here.'}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">A</div>
                                            <span className="text-[10px] font-bold text-gray-400">Admin Team</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {/* POST LIST */}
            {posts.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center">
                        <MessageSquare size={16} className="mr-2" /> Live Announcements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {posts.map(post => (
                            <div key={post.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 relative group hover:shadow-md transition-shadow">
                                <h4 className="font-bold pr-16 text-indigo-600 dark:text-indigo-400">{post.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{post.content}</p>
                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditPost(post)} className="p-2 bg-gray-50 dark:bg-gray-700 text-indigo-600 rounded-xl hover:bg-indigo-100"><Edit2 size={16}/></button>
                                    <button onClick={() => deletePost(post.id)} className="p-2 bg-gray-50 dark:bg-gray-700 text-red-600 rounded-xl hover:bg-red-100"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* USER LISTING */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4 ml-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Professional Directory</h3>
                    <div className="flex items-center space-x-2">
                        <Search size={14} className="text-gray-400" />
                        <input type="text" placeholder="Search professionals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-sm outline-none w-48 font-medium text-gray-600 dark:text-gray-400" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((u, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-sm ${u.verified ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700' : 'bg-gray-400'}`}>
                                    {u.profile?.avatar ? <img src={u.profile.avatar} className="w-full h-full object-cover"/> : u.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                        <h4 className="font-bold text-gray-800 dark:text-white truncate">{u.username}</h4>
                                        {u.verified && <BadgeCheck size={16} className="ml-1 text-blue-500 fill-blue-50 dark:fill-blue-900 flex-shrink-0" />}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{u.profile?.profession || 'Standard Student'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                                <button onClick={() => handleInspectUser(u.username)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"><Eye size={12} className="mr-1"/> Details</button>
                                <div className="flex space-x-3">
                                    {u.username !== ADMIN_USERNAME && (
                                        <button onClick={() => deleteUser(u.username)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
      )}

      {viewMode === 'REQUESTS' && (
          <div className="space-y-6 animate-fade-in">
              <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 flex items-center">
                     <UserCog size={16} className="mr-2"/> Status & Profile Updates ({pendingProfileRequests.length})
                  </h3>
                  {pendingProfileRequests.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200">System idle. No pending profile changes.</div>
                  ) : (
                      pendingProfileRequests.map(req => (
                          <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">{req.username.charAt(0).toUpperCase()}</div>
                                      <div>
                                          <h4 className="font-bold text-lg">{req.username}</h4>
                                          <p className="text-xs text-gray-400">Request ID: {req.id}</p>
                                      </div>
                                  </div>
                                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Verification Pending</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl mb-6 border border-gray-100 dark:border-gray-700">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Proposed Name</p><p className="font-bold dark:text-white">{req.payload.name}</p></div>
                                      <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Proposed Title</p><p className="font-bold dark:text-white">{req.payload.profession}</p></div>
                                  </div>
                              </div>
                              <div className="flex justify-end space-x-3">
                                  <button onClick={() => handleProfileUpdate(req, false)} className="px-6 py-2.5 text-red-600 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors">Decline</button>
                                  <button onClick={() => handleProfileUpdate(req, true)} className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center"><Check size={16} className="mr-2"/> Authorize Professional Update</button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {viewMode === 'SUPPORT' && (
          <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Active Support Tickets</h3>
              {supportTickets.length === 0 ? (
                  <div className="text-center py-24 text-gray-400 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700">
                      <Inbox size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-medium">All clear! No pending tickets.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {supportTickets.map(ticket => (
                          <div key={ticket.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <div className="flex items-center space-x-2">
                                          <span className="font-bold text-gray-800 dark:text-white">{ticket.username}</span>
                                          <span className="text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded uppercase tracking-tighter">{new Date(ticket.timestamp).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                      {ticket.status === 'PENDING' ? <span className="text-[10px] bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">Waiting for Response</span> : <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Case Resolved</span>}
                                      <button onClick={() => deleteTicket(ticket.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                  </div>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-6 bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl italic">
                                  "{ticket.payload.message}"
                              </p>
                              {ticket.status === 'PENDING' ? (
                                  <div className="flex gap-2">
                                      <input className="flex-1 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Enter resolution details..." value={replyText[ticket.id] || ''} onChange={(e) => setReplyText({...replyText, [ticket.id]: e.target.value})} />
                                      <button onClick={() => resolveTicket(ticket.id)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all">Submit Solution</button>
                                  </div>
                              ) : (
                                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/50">
                                      <p className="text-[10px] font-bold text-green-700 dark:text-green-400 mb-1 uppercase tracking-widest">Admin Resolution</p>
                                      <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">{ticket.payload.adminResponse}</p>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
