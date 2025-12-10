
import React, { useState, useEffect } from 'react';
import { ChangeRequest, Post, UserProfile, Note, Assignment, TaskPriority } from '../types';
import { Users, AlertTriangle, Trash2, RefreshCw, BadgeCheck, MessageSquare, Power, Link, KeyRound, Filter, CheckCircle2, Search, ShieldAlert, Megaphone, Plus, X, Edit2, Save, Info, Image as ImageIcon, HelpCircle, Send, UserPlus, HardDrive, Download, Upload, Eye, BookOpen, Calendar, Award, Wand2 } from 'lucide-react';
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState({ title: '', content: '' });

  // User Creation State
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });

  // Detailed User Inspection State (Spy Mode)
  const [inspectingUser, setInspectingUser] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<{ user: UserProfile, notes: Note[], assignments: Assignment[] } | null>(null);
  const [inspectTab, setInspectTab] = useState<'PROFILE' | 'NOTES' | 'PLANNER'>('PROFILE');

  // Badge Generator State
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);

  // Inspector - Add Note/Assignment State
  const [adminNote, setAdminNote] = useState({ title: '', content: '' });
  const [adminTask, setAdminTask] = useState<Partial<Assignment>>({ priority: TaskPriority.MEDIUM });

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

  // --- INSPECTION LOGIC ---
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

  const handleGenerateBadge = async () => {
      if (!inspectData?.user) return;
      setIsGeneratingBadge(true);
      
      const noteCount = inspectData.notes?.length || 0;
      const taskCount = inspectData.assignments?.length || 0;
      const context = `User has created ${noteCount} notes and ${taskCount} assignments.`;

      const badge = await generateUserBadge(inspectData.user, context);
      
      const currentBadges = inspectData.user.badges || [];
      if (!currentBadges.includes(badge)) {
          const updatedUser = { ...inspectData.user, badges: [...currentBadges, badge] };
          
          // Save
          const key = `studentpocket_data_${inspectingUser}`;
          const fullData = JSON.parse(localStorage.getItem(key) || '{}');
          fullData.user = updatedUser;
          localStorage.setItem(key, JSON.stringify(fullData));
          
          setInspectData({...inspectData, user: updatedUser});
          showToast(`Badge Assigned: ${badge}`, 'success');
      }
      setIsGeneratingBadge(false);
  };

  const handleBulkBadgeAssign = async () => {
      if(!confirm("Generate AI badges for ALL users based on their activity? This may take a moment.")) return;
      
      const updates: string[] = [];
      let count = 0;
      
      showToast("Starting bulk analysis...", 'info');
      
      for (const u of usersList) {
          if(u.username === ADMIN_USERNAME) continue;
          
          const key = `studentpocket_data_${u.username}`;
          const stored = localStorage.getItem(key);
          if (stored) {
              const data = JSON.parse(stored);
              const noteCount = data.notes?.length || 0;
              const taskCount = data.assignments?.length || 0;
              const context = `User has created ${noteCount} notes and ${taskCount} assignments.`;
              
              try {
                  const newBadge = await generateUserBadge(data.user, context);
                  if (!data.user.badges) data.user.badges = [];
                  if (!data.user.badges.includes(newBadge)) {
                      data.user.badges.push(newBadge);
                      localStorage.setItem(key, JSON.stringify(data));
                      updates.push(`${u.username}: ${newBadge}`);
                      count++;
                  }
              } catch(e) {
                  console.error(e);
              }
          }
      }
      
      setRefreshTrigger(prev => prev + 1);
      showToast(`Awarded ${count} new badges!`, 'success');
  };

  const addAdminNote = () => {
      if (!adminNote.title || !adminNote.content || !inspectingUser) return;
      
      const newNote: Note = {
          id: Date.now().toString(),
          title: adminNote.title,
          content: adminNote.content,
          date: new Date().toISOString(),
          tags: ['Admin'],
          author: ADMIN_USERNAME
      };
      
      const key = `studentpocket_data_${inspectingUser}`;
      const fullData = JSON.parse(localStorage.getItem(key) || '{}');
      fullData.notes = [newNote, ...(fullData.notes || [])];
      localStorage.setItem(key, JSON.stringify(fullData));
      
      setInspectData({ ...inspectData!, notes: fullData.notes });
      setAdminNote({ title: '', content: '' });
      showToast("Note added to user's notebook.", 'success');
  };

  const addAdminTask = () => {
      if (!adminTask.title || !adminTask.dueDate || !inspectingUser) return;
      
      const newTask: Assignment = {
          id: Date.now().toString(),
          title: adminTask.title,
          subject: adminTask.subject || 'General',
          dueDate: adminTask.dueDate,
          priority: adminTask.priority || TaskPriority.MEDIUM,
          completed: false,
          assignedBy: ADMIN_USERNAME
      };
      
      const key = `studentpocket_data_${inspectingUser}`;
      const fullData = JSON.parse(localStorage.getItem(key) || '{}');
      fullData.assignments = [...(fullData.assignments || []), newTask];
      localStorage.setItem(key, JSON.stringify(fullData));
      
      setInspectData({ ...inspectData!, assignments: fullData.assignments });
      setAdminTask({ priority: TaskPriority.MEDIUM });
      showToast("Assignment assigned to user.", 'success');
  };

  // --- USER CREATION ---
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
      
      users[newUser.username] = {
          email: newUser.email,
          password: newUser.password,
          verified: true // Admin created users are verified by default
      };
      localStorage.setItem('studentpocket_users', JSON.stringify(users));
      
      // Init Data with Badge
      const initialData = {
          user: {
              name: newUser.username,
              email: newUser.email,
              phone: "", education: "", institution: "", country: "", skills: [],
              badges: ["🌱 New Member"] // Auto Badge
          },
          assignments: [], notes: [], vaultDocs: [], scholarships: []
      };
      localStorage.setItem(`studentpocket_data_${newUser.username}`, JSON.stringify(initialData));
      
      setNewUser({ username: '', email: '', password: '' });
      setShowCreateUser(false);
      setRefreshTrigger(prev => prev + 1);
      showToast("User created successfully.", 'success');
  };

  // --- POST MANAGEMENT ---
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
          showToast("Announcement posted.", 'success');
      }
      
      setPosts(updatedPosts);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updatedPosts));
      setPostForm({ title: '', content: '' });
      setEditingPostId(null);
      setShowPostForm(false);
  };

  const startEditPost = (post: Post) => {
      setPostForm({ title: post.title, content: post.content });
      setEditingPostId(post.id);
      setShowPostForm(true);
  };
  
  const deletePost = (id: string) => {
      if(!confirm("Delete post?")) return;
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updated));
  };

  // --- SERVER MANAGEMENT ---
  const backupData = () => {
      const data: any = {};
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('studentpocket_')) {
              data[key] = localStorage.getItem(key);
          }
      });
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studentpocket_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      showToast("Backup downloaded.", 'success');
  };

  const restoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              Object.keys(data).forEach(key => {
                  localStorage.setItem(key, data[key]);
              });
              setRefreshTrigger(prev => prev + 1);
              showToast("System restored successfully.", 'success');
          } catch (err) {
              showToast("Invalid backup file.", 'error');
          }
      };
      reader.readAsText(file);
  };

  // --- Existing User Logic ---
  const toggleVerification = (targetUser: string, currentStatus: boolean) => {
      if (targetUser === ADMIN_USERNAME) return;
      const usersStr = localStorage.getItem('studentpocket_users');
      if (!usersStr) return;
      const users = JSON.parse(usersStr);
      if (users[targetUser]) {
        users[targetUser].verified = !currentStatus;
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
        setRefreshTrigger(prev => prev + 1);
      }
  };
  
  const deleteUser = (targetUser: string) => {
      if (targetUser === ADMIN_USERNAME) return;
      if (!confirm(`Permanently delete ${targetUser}?`)) return;
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        delete users[targetUser];
        localStorage.setItem('studentpocket_users', JSON.stringify(users));
      }
      localStorage.removeItem(`studentpocket_data_${targetUser}`);
      setRefreshTrigger(prev => prev + 1);
      showToast("User deleted.", 'info');
  };

  // --- Render Helpers ---
  const filteredUsers = usersList.filter(u => {
    const matchesFilter = userFilter === 'ALL' || (userFilter === 'PENDING' && !u.verified) || (userFilter === 'VERIFIED' && u.verified);
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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
                          <h2 className="text-lg font-bold flex items-center">{inspectingUser} <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Spy Mode</span></h2>
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
                              <h3 className="text-lg font-bold mb-4 flex items-center"><Award className="mr-2 text-yellow-500"/> Badges</h3>
                              <div className="flex flex-wrap gap-2 mb-4">
                                  {inspectData.user.badges?.map((b, i) => (
                                      <span key={i} className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">{b}</span>
                                  ))}
                                  {(!inspectData.user.badges || inspectData.user.badges.length === 0) && <span className="text-gray-400 text-sm">No badges yet.</span>}
                              </div>
                              <button 
                                onClick={handleGenerateBadge} 
                                disabled={isGeneratingBadge}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-indigo-700 disabled:opacity-50"
                              >
                                  <Wand2 size={16} className="mr-2" /> {isGeneratingBadge ? 'Analyzing...' : 'Generate AI Badge'}
                              </button>
                          </div>

                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <h3 className="text-lg font-bold mb-4">CV / Profile Overview</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                      <span className="block font-bold text-gray-500 text-xs uppercase">Profession</span>
                                      {inspectData.user.profession || 'N/A'}
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                      <span className="block font-bold text-gray-500 text-xs uppercase">Education</span>
                                      {inspectData.user.education || 'N/A'}
                                  </div>
                                  <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                      <span className="block font-bold text-gray-500 text-xs uppercase">Personal Statement</span>
                                      {inspectData.user.personalStatement || 'N/A'}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {inspectTab === 'NOTES' && (
                      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                              {inspectData.notes.length === 0 && <p className="text-center text-gray-400 py-10">User has no notes.</p>}
                              {inspectData.notes.map(note => (
                                  <div key={note.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                      <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-bold">{note.title}</h4>
                                          {note.author === ADMIN_USERNAME && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Admin Note</span>}
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                                  </div>
                              ))}
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-fit border border-indigo-100 dark:border-indigo-900">
                              <h3 className="font-bold mb-4 text-indigo-600">Add Admin Note</h3>
                              <input className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700 text-sm" placeholder="Title" value={adminNote.title} onChange={e => setAdminNote({...adminNote, title: e.target.value})} />
                              <textarea className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700 text-sm h-32" placeholder="Content" value={adminNote.content} onChange={e => setAdminNote({...adminNote, content: e.target.value})} />
                              <button onClick={addAdminNote} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">Add Note to User</button>
                          </div>
                      </div>
                  )}

                  {inspectTab === 'PLANNER' && (
                      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                           <div className="lg:col-span-2 space-y-4">
                              {inspectData.assignments.length === 0 && <p className="text-center text-gray-400 py-10">User has no assignments.</p>}
                              {inspectData.assignments.map(task => (
                                  <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                      <div>
                                          <h4 className={`font-bold ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                                          <p className="text-xs text-gray-500">{task.subject} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                      </div>
                                      {task.assignedBy === ADMIN_USERNAME && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Admin Assigned</span>}
                                  </div>
                              ))}
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-fit border border-indigo-100 dark:border-indigo-900">
                              <h3 className="font-bold mb-4 text-indigo-600">Assign Task</h3>
                              <input className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700 text-sm" placeholder="Task Title" value={adminTask.title || ''} onChange={e => setAdminTask({...adminTask, title: e.target.value})} />
                              <input className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700 text-sm" placeholder="Subject" value={adminTask.subject || ''} onChange={e => setAdminTask({...adminTask, subject: e.target.value})} />
                              <input type="date" className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700 text-sm" value={adminTask.dueDate || ''} onChange={e => setAdminTask({...adminTask, dueDate: e.target.value})} />
                              <button onClick={addAdminTask} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">Assign to User</button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      {/* SYSTEM CONTROLS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <button onClick={() => setShowCreateUser(true)} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 flex flex-col items-center justify-center transition-all active:scale-95">
               <UserPlus size={24} className="mb-2" />
               <span className="font-bold text-sm">New User</span>
           </button>
           <button onClick={backupData} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 flex flex-col items-center justify-center transition-all active:scale-95">
               <Download size={24} className="mb-2" />
               <span className="font-bold text-sm">Backup Data</span>
           </button>
           <label className="bg-teal-600 text-white p-4 rounded-2xl shadow-lg hover:bg-teal-700 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer">
               <Upload size={24} className="mb-2" />
               <span className="font-bold text-sm">Restore Data</span>
               <input type="file" className="hidden" accept=".json" onChange={restoreData} />
           </label>
           <button onClick={() => setShowPostForm(true)} className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg hover:bg-purple-700 flex flex-col items-center justify-center transition-all active:scale-95">
               <Megaphone size={24} className="mb-2" />
               <span className="font-bold text-sm">New Post</span>
           </button>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateUser && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-indigo-100 mb-8 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Create New Student</h3>
                  <button onClick={() => setShowCreateUser(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="p-3 border rounded-xl" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                  <input className="p-3 border rounded-xl" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  <input className="p-3 border rounded-xl" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <button onClick={createUser} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Create & Verify User</button>
          </div>
      )}

      {/* POST EDITOR */}
      {showPostForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-100 mb-8 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">{editingPostId ? 'Edit Announcement' : 'New Announcement'}</h3>
                  <button onClick={() => { setShowPostForm(false); setEditingPostId(null); setPostForm({title:'',content:''}); }} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
              </div>
              <input className="w-full mb-3 p-3 border rounded-xl font-bold" placeholder="Title" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <textarea className="w-full mb-3 p-3 border rounded-xl h-32" placeholder="Content" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button onClick={savePost} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700">
                  {editingPostId ? 'Update Post' : 'Publish Post'}
              </button>
          </div>
      )}

      {/* POST LIST */}
      {posts.length > 0 && (
          <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Active Announcements</h3>
              <div className="space-y-3">
                  {posts.map(post => (
                      <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                          <h4 className="font-bold pr-16">{post.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{post.content}</p>
                          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditPost(post)} className="p-1.5 bg-gray-100 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 size={14}/></button>
                              <button onClick={() => deletePost(post.id)} className="p-1.5 bg-gray-100 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* USER MANAGEMENT */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center justify-between">
          <span className="flex items-center"><Users size={16} className="mr-2" /> Registered Users</span>
          <div className="flex space-x-2">
             <button 
                onClick={handleBulkBadgeAssign} 
                className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center hover:bg-yellow-200"
             >
                <Wand2 size={12} className="mr-1"/> Auto-Award AI Badges
             </button>
             <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1.5 rounded-full">{usersList.length}</span>
          </div>
        </h3>

        {/* Search */}
        <div className="mb-4 relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
             <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 pl-10 pr-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700"
             />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 relative group">
                    <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center space-x-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden ${u.verified ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                                 {u.profile?.avatar ? <img src={u.profile.avatar} className="w-full h-full object-cover"/> : u.username.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                 <h4 className="font-bold">{u.username}</h4>
                                 <p className="text-xs text-gray-500">{u.profile?.profession || 'Student'}</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => handleInspectUser(u.username)} 
                            className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center hover:bg-indigo-100 transition-colors"
                         >
                             <Eye size={12} className="mr-1" /> Inspect
                         </button>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${u.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {u.verified ? 'Verified' : 'Pending'}
                        </span>
                        <div className="flex space-x-2">
                            {u.username !== ADMIN_USERNAME && (
                                <>
                                <button onClick={() => toggleVerification(u.username, u.verified)} className="text-xs text-gray-400 hover:text-indigo-600 font-bold">{u.verified ? 'Unverify' : 'Verify'}</button>
                                <button onClick={() => deleteUser(u.username)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
