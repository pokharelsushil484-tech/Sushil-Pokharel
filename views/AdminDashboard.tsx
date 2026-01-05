
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChangeRequest, SupportTicket, TicketMessage } from '../types';
import { 
  Users, ShieldCheck, LifeBuoy, Trash2, 
  CheckCircle, XCircle, RefreshCw, User, Lock, 
  ShieldAlert, MessageSquare, Send, Key, ChevronUp, ChevronDown, Award, Edit2, ArrowRight, Save, X, BadgeCheck, BadgeAlert, Skull, AlertTriangle, MessageCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ADMIN_USERNAME } from '../constants';

type AdminView = 'OVERVIEW' | 'USERS' | 'REQUESTS' | 'RECOVERY' | 'SUPPORT';

export const AdminDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Admission Key State
  const [msKey, setMsKey] = useState<string | null>(null);
  const [admKey, setAdmKey] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<'ACTIVE' | 'COOLDOWN'>('ACTIVE');
  const [cooldownTime, setCooldownTime] = useState(0);
  
  const [generatedAdmissionKey, setGeneratedAdmissionKey] = useState<{user: string, key: string} | null>(null);
  
  // Editing State
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Messaging State
  const [messagingUser, setMessagingUser] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for Admission Key Status
  useEffect(() => {
    const checkKey = async () => {
        const state = await storageService.getSystemKeys();
        setMsKey(state.msCode);
        setAdmKey(state.admCode);
        setKeyStatus(state.status);
        setCooldownTime(state.timerRemaining);
    };
    
    checkKey();
    const interval = setInterval(checkKey, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket, tickets]);

  const loadData = async () => {
    try {
        const usersStr = localStorage.getItem('studentpocket_users');
        const usersObj = usersStr ? JSON.parse(usersStr) : {};

        const loadedProfiles: UserProfile[] = [];
        for (const username of Object.keys(usersObj)) {
            if (username === ADMIN_USERNAME) continue;
            try {
                const data = await storageService.getData(`architect_data_${username}`);
                if (data && data.user) {
                     loadedProfiles.push({ ...data.user, _username: username } as any);
                }
            } catch (e) { console.error("Error loading profile", username); }
        }
        setProfiles(loadedProfiles);

        const reqStr = localStorage.getItem('studentpocket_requests');
        if (reqStr) setRequests(JSON.parse(reqStr));

        const ticketStr = localStorage.getItem('studentpocket_tickets');
        if (ticketStr) {
            const allTickets: SupportTicket[] = JSON.parse(ticketStr);
            setTickets(allTickets.sort((a, b) => b.updatedAt - a.updatedAt));
            
            if (selectedTicket) {
                const updated = allTickets.find(t => t.id === selectedTicket.id);
                if (updated) setSelectedTicket(updated);
            }
        }
    } catch (error) {
        console.error("Dashboard Sync Error:", error);
    }
  };

  const handleVerifyRequest = async (req: ChangeRequest, approve: boolean) => {
      const data = await storageService.getData(`architect_data_${req.username}`);
      if (data && data.user) {
          
          if (req.type === 'DATA_CHANGE' && approve) {
              const details = JSON.parse(req.details);
              // Update user profile with new data
              data.user.name = details.new.name;
              data.user.email = details.new.email;
              data.user.phone = details.new.phone;
              data.user.education = details.new.education;
              
               // Update global users list if name or email changed
               const usersStr = localStorage.getItem('studentpocket_users');
               if (usersStr) {
                  const users = JSON.parse(usersStr);
                  if (users[req.username]) {
                      users[req.username].name = details.new.name;
                      users[req.username].email = details.new.email;
                      localStorage.setItem('studentpocket_users', JSON.stringify(users));
                  }
               }
          }
          
          if (req.type === 'NAME_CHANGE' && approve) {
               const details = JSON.parse(req.details);
               data.user.name = details.newName;
               
               // Update global users list
               const usersStr = localStorage.getItem('studentpocket_users');
               if (usersStr) {
                  const users = JSON.parse(usersStr);
                  if (users[req.username]) {
                      users[req.username].name = details.newName;
                      localStorage.setItem('studentpocket_users', JSON.stringify(users));
                  }
               }
          }

          data.user.isVerified = approve;
          data.user.verificationStatus = approve ? 'VERIFIED' : 'REJECTED';
          
          // Clear suspicious flags if approved and grant Blue Tick badge
          if (approve) {
              data.user.isSuspicious = false;
              // Remove negative badges, add verified
              const currentBadges = data.user.badges || [];
              const cleanBadges = currentBadges.filter(b => b !== 'SUSPICIOUS' && b !== 'DANGEROUS');
              if (!cleanBadges.includes('VERIFIED')) cleanBadges.push('VERIFIED');
              data.user.badges = cleanBadges;
          }

          // Maintain level for Data Change, set for new Verification
          if (req.type === 'VERIFICATION') {
              data.user.level = approve ? 2 : 0; 
          }
          
          data.user.adminFeedback = approve 
            ? (req.type === 'DATA_CHANGE' ? "Profile Update Approved." : req.type === 'NAME_CHANGE' ? "Name Change Approved." : "Identity Verified by Administration. Active User.") 
            : "Request rejected by administrator.";
          
          await storageService.setData(`architect_data_${req.username}`, data);
      }

      const updatedReqs = requests.map(r => 
        r.id === req.id ? { ...r, status: approve ? 'APPROVED' : 'REJECTED' } : r
      );
      setRequests(updatedReqs as ChangeRequest[]);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedReqs));
  };
  
  const saveNameEdit = async (username: string) => {
      if (!editName.trim()) {
          setEditingUser(null);
          return;
      }

      // Update in DB
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          data.user.name = editName;
          data.user.adminFeedback = "Name updated by Administrator.";
          await storageService.setData(`architect_data_${username}`, data);
      }
      
      // Update in Auth
      const usersStr = localStorage.getItem('studentpocket_users');
      if (usersStr) {
          const users = JSON.parse(usersStr);
          if (users[username]) {
              users[username].name = editName;
              localStorage.setItem('studentpocket_users', JSON.stringify(users));
          }
      }
      
      setEditingUser(null);
      setEditName('');
      loadData();
  };

  const saveAdminComment = async (username: string) => {
      if (!adminComment.trim()) {
          setMessagingUser(null);
          return;
      }
      
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          // Append comment to list
          const comments = data.user.adminComments || [];
          comments.unshift(adminComment); // Newest first
          data.user.adminComments = comments;
          data.user.adminFeedback = adminComment; // Set as feedback too for alerts
          await storageService.setData(`architect_data_${username}`, data);
      }
      
      setMessagingUser(null);
      setAdminComment('');
      loadData();
  };
  
  const toggleBadge = async (username: string, badge: string) => {
       const data = await storageService.getData(`architect_data_${username}`);
       if (data && data.user) {
           let badges = data.user.badges || [];
           if (badges.includes(badge)) {
               badges = badges.filter(b => b !== badge);
           } else {
               badges.push(badge);
               // If marking suspicious/dangerous, remove verified
               if (badge === 'SUSPICIOUS' || badge === 'DANGEROUS') {
                   badges = badges.filter(b => b !== 'VERIFIED');
                   data.user.isVerified = false;
                   data.user.isSuspicious = true;
               }
           }
           data.user.badges = badges;
           await storageService.setData(`architect_data_${username}`, data);
           loadData();
       }
  };

  const handleRecoveryRequest = async (req: ChangeRequest) => {
      // Generate Admission Key
      const key = 'ADM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const data = await storageService.getData(`architect_data_${req.username}`);
      if (data && data.user) {
          data.user.admissionKey = key;
          // Note: We don't unban immediately, the login process with key handles it
          await storageService.setData(`architect_data_${req.username}`, data);
      }
      
      const updatedReqs = requests.map(r => 
        r.id === req.id ? { ...r, status: 'APPROVED' } : r
      );
      setRequests(updatedReqs as ChangeRequest[]);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedReqs));
      
      setGeneratedAdmissionKey({ user: req.username, key: key });
  };

  const handleChangeLevel = async (username: string, delta: number) => {
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          const newLevel = Math.max(0, Math.min(3, (data.user.level || 0) + delta));
          data.user.level = newLevel;
          if (newLevel > 0) {
              data.user.isVerified = true;
              data.user.verificationStatus = 'VERIFIED';
          }
          await storageService.setData(`architect_data_${username}`, data);
          loadData();
      }
  };

  const handleBanUser = async (username: string) => {
      if(!window.confirm(`Ban user ${username}?`)) return;
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          data.user.isBanned = true;
          data.user.banReason = "Account suspended by Administrator.";
          
          // Add Dangerous Badge
          const badges = data.user.badges || [];
          if (!badges.includes('DANGEROUS')) badges.push('DANGEROUS');
          data.user.badges = badges.filter(b => b !== 'VERIFIED');
          
          await storageService.setData(`architect_data_${username}`, data);
          loadData();
      }
  };

  const sendTicketReply = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTicket || !replyText.trim()) return;

      const message: TicketMessage = {
          id: Date.now().toString(),
          sender: ADMIN_USERNAME, 
          text: replyText,
          timestamp: Date.now(),
          isAdmin: true
      };

      const updatedTickets = tickets.map(t => {
          if (t.id === selectedTicket.id) {
              return {
                  ...t,
                  messages: [...t.messages, message],
                  updatedAt: Date.now(),
                  status: 'OPEN' as const
              };
          }
          return t;
      });

      localStorage.setItem('studentpocket_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets as SupportTicket[]);
      setReplyText('');
      
      const updated = updatedTickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
  };

  const closeTicket = () => {
      if (!selectedTicket) return;
      if (!window.confirm("Close this ticket?")) return;
      
      const updatedTickets = tickets.map(t => 
          t.id === selectedTicket.id ? { ...t, status: 'CLOSED' as const, updatedAt: Date.now() } : t
      );
      localStorage.setItem('studentpocket_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets as SupportTicket[]);
      
      const updated = updatedTickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated as SupportTicket);
  };

  const deleteTicket = (id: string) => {
      if (!window.confirm("Delete ticket permanently?")) return;
      const updatedTickets = tickets.filter(t => t.id !== id);
      localStorage.setItem('studentpocket_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
      if (selectedTicket?.id === id) setSelectedTicket(null);
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING' && (r.type === 'VERIFICATION' || r.type === 'DATA_CHANGE' || r.type === 'NAME_CHANGE'));
  const recoveryRequests = requests.filter(r => r.status === 'PENDING' && r.type === 'RECOVERY');
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;

  return (
    <div className="pb-12 animate-fade-in w-full max-w-7xl mx-auto space-y-6 px-4">
       {/* Compact Header */}
       <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
               <h1 className="text-2xl font-bold uppercase tracking-tight">System Command</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Console</p>
           </div>
           
           <div className="flex flex-wrap gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-md">
               {[
                   { id: 'OVERVIEW', icon: ShieldAlert, label: 'Ops' },
                   { id: 'USERS', icon: Users, label: 'Nodes' },
                   { id: 'REQUESTS', icon: ShieldCheck, label: 'Auth', badge: pendingRequests.length },
                   { id: 'RECOVERY', icon: Key, label: 'Bans', badge: recoveryRequests.length },
                   { id: 'SUPPORT', icon: LifeBuoy, label: 'Tickets', badge: openTicketsCount }
               ].map(tab => (
                   <button
                       key={tab.id}
                       onClick={() => setViewMode(tab.id as AdminView)}
                       className={`flex items-center px-4 py-2 rounded-lg transition-all relative ${
                           viewMode === tab.id 
                           ? 'bg-white text-slate-900 shadow-sm' 
                           : 'text-slate-400 hover:text-white hover:bg-white/5'
                       }`}
                   >
                       <tab.icon size={14} className="mr-2" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                       {tab.badge > 0 && (
                           <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                       )}
                   </button>
               ))}
           </div>
       </div>

       {generatedAdmissionKey && (
           <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center animate-scale-up">
               <div>
                   <h3 className="font-bold text-lg">Admission Key Generated</h3>
                   <p className="text-xs opacity-90">User: {generatedAdmissionKey.user}</p>
                   <p className="text-[9px] uppercase tracking-widest mt-1">Provide this key to the user via Email</p>
               </div>
               <div className="flex items-center gap-4 mt-4 md:mt-0">
                   <div className="bg-white/20 p-2 rounded-lg font-mono font-bold tracking-widest select-all">
                       {generatedAdmissionKey.key}
                   </div>
                   <button onClick={() => setGeneratedAdmissionKey(null)} className="p-2 hover:bg-white/20 rounded-full"><XCircle size={20}/></button>
               </div>
           </div>
       )}

       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Admission Key Widget */}
               <div className="bg-slate-800 text-white p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group col-span-1 md:col-span-2">
                   <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center space-x-2">
                           <Key size={18} className="text-emerald-400" />
                           <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Access Keys</span>
                       </div>
                       <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${keyStatus === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                           {keyStatus}
                       </div>
                   </div>
                   <div className="text-center py-2 relative flex flex-col gap-2 justify-center h-full">
                       {keyStatus === 'ACTIVE' ? (
                          <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
                            <div className="bg-black/30 p-2 rounded-lg">
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Master Key</p>
                                <h3 className="text-2xl font-black font-mono tracking-wider text-emerald-400 select-all">{msKey}</h3>
                            </div>
                            <div className="bg-black/30 p-2 rounded-lg">
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Admission Key</p>
                                <h3 className="text-2xl font-black font-mono tracking-wider text-blue-400 select-all">{admKey}</h3>
                            </div>
                          </div>
                       ) : (
                          <>
                            <h3 className="text-4xl md:text-5xl font-black font-mono tracking-widest text-amber-500 animate-pulse">
                                {String(Math.floor(cooldownTime / 60)).padStart(2, '0')}:{String(cooldownTime % 60).padStart(2, '0')}
                            </h3>
                            <p className="text-[9px] text-slate-500 mt-2 uppercase">Cycling Keys...</p>
                          </>
                       )}
                   </div>
                   {keyStatus === 'COOLDOWN' && (
                        <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-1000 linear" style={{width: `${(cooldownTime / 60) * 100}%`}}></div>
                   )}
                   {keyStatus === 'ACTIVE' && (
                        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 linear" style={{width: `${(cooldownTime / 60) * 100}%`}}></div>
                   )}
               </div>

               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                        <Users size={20} className="text-indigo-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Nodes</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{profiles.length}</h3>
               </div>
               
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                        <ShieldCheck size={20} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pending</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{pendingRequests.length}</h3>
               </div>
           </div>
       )}

       {/* Other Views remain unchanged */}
       {viewMode === 'USERS' && (
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
               <div className="space-y-2">
                   {profiles.map((user: any, i) => (
                       <div key={i} className="flex flex-col gap-2 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                           <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {editingUser === user._username ? (
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                            type="text" 
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="px-2 py-1 text-sm bg-white dark:bg-black border border-slate-300 rounded"
                                                            autoFocus
                                                    />
                                                    <button onClick={() => saveNameEdit(user._username)} className="text-green-500 hover:text-green-600"><Save size={16}/></button>
                                                    <button onClick={() => setEditingUser(null)} className="text-red-500 hover:text-red-600"><X size={16}/></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</h4>
                                                    <button onClick={() => { setEditingUser(user._username); setEditName(user.name); }} className="text-slate-400 hover:text-indigo-500"><Edit2 size={12}/></button>
                                                </>
                                            )}
                                            
                                            {/* Badges Display */}
                                            {user.badges?.includes('VERIFIED') && <BadgeCheck size={14} className="text-blue-500 fill-white dark:fill-slate-900" />}
                                            {user.badges?.includes('SUSPICIOUS') && (
                                                <span className="flex items-center px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-widest rounded border border-amber-200 dark:border-amber-800">
                                                    <BadgeAlert size={10} className="mr-1"/> Suspicious
                                                </span>
                                            )}
                                            {user.badges?.includes('DANGEROUS') && (
                                                <span className="flex items-center px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase tracking-widest rounded border border-red-200 dark:border-red-800">
                                                    <Skull size={10} className="mr-1"/> Dangerous
                                                </span>
                                            )}
                                            
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${user.level > 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>Level {user.level || 0}</span>
                                            {user.isBanned && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">BANNED</span>}
                                        </div>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {user._username}</p>
                                            {user.studentId && <p className="text-[10px] text-indigo-400 mt-0.5 font-bold">SID: {user.studentId}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => toggleBadge(user._username, 'SUSPICIOUS')}
                                            className={`p-2 rounded-lg transition-colors ${user.badges?.includes('SUSPICIOUS') ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-amber-500'}`}
                                            title="Mark Suspicious"
                                        >
                                            <AlertTriangle size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => { setMessagingUser(user._username); setAdminComment(''); }}
                                            className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                                            title="Message User"
                                        >
                                            <MessageCircle size={16}/>
                                        </button>
                                        <div className="flex flex-col items-center mr-2">
                                            <button onClick={() => handleChangeLevel(user._username, 1)} className="p-1 text-slate-400 hover:text-emerald-500"><ChevronUp size={14} /></button>
                                            <span className="text-[9px] font-bold text-slate-500">LVL</span>
                                            <button onClick={() => handleChangeLevel(user._username, -1)} className="p-1 text-slate-400 hover:text-red-500"><ChevronDown size={14} /></button>
                                        </div>
                                        <button 
                                                onClick={() => handleBanUser(user._username)} 
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"
                                                title="Suspend User"
                                        >
                                            <Lock size={16} />
                                        </button>
                                </div>
                           </div>
                           
                           {/* Message Input Inline */}
                           {messagingUser === user._username && (
                               <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl flex gap-2 animate-fade-in mt-1">
                                   <input 
                                        type="text" 
                                        value={adminComment} 
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        placeholder="Send admin comment/feedback..."
                                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                                        autoFocus
                                   />
                                   <button onClick={() => saveAdminComment(user._username)} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Send</button>
                                   <button onClick={() => setMessagingUser(null)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                                </div>
                           )}
                       </div>
                   ))}
               </div>
           </div>
       )}

       {viewMode === 'REQUESTS' && (
           <div className="space-y-4">
               {pendingRequests.length === 0 && (
                   <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                       <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                       <p className="text-xs font-bold uppercase tracking-wider">No Pending Verifications</p>
                   </div>
               )}
               {pendingRequests.map(req => {
                   const isDataChange = req.type === 'DATA_CHANGE' || req.type === 'NAME_CHANGE';
                   const details = isDataChange ? JSON.parse(req.details) : {};
                   
                   // Check if user is marked suspicious
                   const requestUser = profiles.find(p => (p as any)._username === req.username);
                   const isSuspicious = requestUser?.badges?.includes('SUSPICIOUS') || requestUser?.isSuspicious;

                   return (
                   <div key={req.id} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border ${isSuspicious || req.autoFlagged ? 'border-amber-500/50 dark:border-amber-500/50' : 'border-slate-200 dark:border-slate-800'} shadow-sm flex flex-col md:flex-row justify-between items-center gap-4`}>
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               {isDataChange ? <Edit2 size={16} className="text-blue-500"/> : <ShieldCheck size={16} className="text-emerald-500"/>}
                               <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                   {isDataChange ? 'Profile Update Request' : 'Verification Request'}
                               </h4>
                               {req.autoFlagged && <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center"><ShieldAlert size={10} className="mr-1"/> Unverified Data Detected</span>}
                               {isSuspicious && <span className="bg-amber-100 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center"><BadgeAlert size={10} className="mr-1"/> Suspicious Account</span>}
                           </div>
                           
                           {isDataChange ? (
                               <div className="text-xs text-slate-500 mt-2 space-y-1">
                                   {req.type === 'NAME_CHANGE' ? (
                                       <p><span className="font-bold text-slate-400">Name:</span> <span className="line-through opacity-50">{details.oldName}</span> <ArrowRight size={10} className="inline mx-1"/> <span className="font-bold text-indigo-600 dark:text-indigo-400">{details.newName}</span></p>
                                   ) : (
                                       <>
                                           {details.old.name !== details.new.name && (
                                               <p><span className="font-bold text-slate-400">Name:</span> <span className="line-through opacity-50">{details.old.name}</span> <ArrowRight size={10} className="inline mx-1"/> <span className="font-bold text-indigo-600 dark:text-indigo-400">{details.new.name}</span></p>
                                           )}
                                           {details.old.email !== details.new.email && (
                                               <p><span className="font-bold text-slate-400">Email:</span> <span className="line-through opacity-50">{details.old.email}</span> <ArrowRight size={10} className="inline mx-1"/> <span className="font-bold text-indigo-600 dark:text-indigo-400">{details.new.email}</span></p>
                                           )}
                                           {details.old.education !== details.new.education && (
                                               <p><span className="font-bold text-slate-400">Education:</span> <span className="line-through opacity-50">{details.old.education}</span> <ArrowRight size={10} className="inline mx-1"/> <span className="font-bold text-indigo-600 dark:text-indigo-400">{details.new.education}</span></p>
                                           )}
                                       </>
                                   )}
                               </div>
                           ) : (
                               <p className="text-xs text-slate-500 font-mono">Ref: {req.generatedStudentId || 'N/A'} • User: {req.username}</p>
                           )}
                           
                           {req.autoFlagReason && <p className="text-[10px] text-red-500 font-bold mt-1">System Flag: {req.autoFlagReason}</p>}
                       </div>
                       <div className="flex space-x-2">
                           <button onClick={() => handleVerifyRequest(req, false)} className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-xs uppercase hover:bg-red-100 transition-colors">Reject</button>
                           <button onClick={() => handleVerifyRequest(req, true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-700 transition-colors">Approve & Verify</button>
                       </div>
                   </div>
               )})}
           </div>
       )}

       {viewMode === 'RECOVERY' && (
           <div className="space-y-4">
                {recoveryRequests.length === 0 && (
                   <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                       <Key size={32} className="mx-auto mb-2 opacity-50" />
                       <p className="text-xs font-bold uppercase tracking-wider">No Recovery Requests</p>
                   </div>
               )}
               {recoveryRequests.map(req => {
                   const details = JSON.parse(req.details || '{}');
                   return (
                       <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col gap-4">
                           <div className="flex justify-between items-start">
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <h4 className="font-bold text-sm text-slate-900 dark:text-white">Account Recovery Appeal</h4>
                                       <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full">BANNED USER</span>
                                   </div>
                                   <p className="text-xs text-slate-500">User: {req.username} • ID: {req.id}</p>
                                   <p className="text-xs text-slate-400 mt-1">Appeal Date: {new Date(req.createdAt).toLocaleString()}</p>
                               </div>
                           </div>
                           <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic">
                               "{details.reason || 'No reason provided'}"
                           </div>
                           <button 
                                onClick={() => handleRecoveryRequest(req)}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center"
                           >
                               <Key size={14} className="mr-2"/> Generate Admission Key
                           </button>
                       </div>
                   );
               })}
           </div>
       )}

       {viewMode === 'SUPPORT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Ticket List */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inbox ({tickets.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {tickets.map(ticket => (
                          <div 
                              key={ticket.id}
                              onClick={() => setSelectedTicket(ticket)}
                              className={`p-4 rounded-xl cursor-pointer transition-all ${
                                  selectedTicket?.id === ticket.id
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                          >
                             <div className="flex justify-between items-start mb-1">
                                 <span className="font-bold text-sm truncate w-2/3">{ticket.subject}</span>
                                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ticket.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-500/20 text-slate-500'} ${selectedTicket?.id === ticket.id ? 'bg-white/20 text-white' : ''}`}>{ticket.status}</span>
                             </div>
                             <p className="text-xs opacity-70 truncate">{ticket.messages[ticket.messages.length-1]?.text}</p>
                             <div className="flex justify-between items-center mt-2">
                                 <span className="text-[9px] font-mono opacity-60">#{ticket.id}</span>
                                 <span className="text-[9px] font-bold opacity-60">{ticket.userId}</span>
                             </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Chat View */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                  {selectedTicket ? (
                      <>
                          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                              <div>
                                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">{selectedTicket.subject}</h2>
                                  <p className="text-[10px] text-slate-500">User: {selectedTicket.userId} • ID: {selectedTicket.id}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                  {selectedTicket.status === 'OPEN' && (
                                      <button onClick={closeTicket} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 text-[10px] font-bold uppercase rounded-lg transition-colors">Close Ticket</button>
                                  )}
                                  <button onClick={() => deleteTicket(selectedTicket.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                              </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
                                {selectedTicket.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-3 rounded-2xl text-sm ${
                                                msg.isAdmin 
                                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[9px] text-slate-400 mt-1 px-1">
                                                {msg.isAdmin ? 'Admin' : selectedTicket.userId} • {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                          </div>

                          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                <form onSubmit={sendTicketReply} className="relative flex gap-2">
                                    <input 
                                        type="text" 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 transition-all"
                                        placeholder="Type reply..."
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="px-4 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                          </div>
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
                          <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-400">Select a ticket to view</p>
                      </div>
                  )}
              </div>
          </div>
       )}
    </div>
  );
};
