
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChangeRequest, SupportTicket, TicketMessage } from '../types';
import { 
  Users, ShieldCheck, LifeBuoy, Search, Trash2, 
  CheckCircle, XCircle, RefreshCw, User, Lock, 
  ShieldAlert, MessageSquare, Send, Clock, Filter, Key 
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ADMIN_USERNAME } from '../constants';

type AdminView = 'OVERVIEW' | 'USERS' | 'REQUESTS' | 'SUPPORT';

export const AdminDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [users, setUsers] = useState<Record<string, any>>({}); // LocalStorage users
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [keyCountdown, setKeyCountdown] = useState(50);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MASTER_KEY_INTERVAL = 50000; // 50 seconds

  // Master Key ticker - 50 Second Rotation
  useEffect(() => {
    const updateMasterKey = () => {
        const timeStep = MASTER_KEY_INTERVAL;
        const now = Date.now();
        const seed = Math.floor(now / timeStep);
        
        // Deterministic generation based on time window
        const rawCode = Math.abs(Math.sin(seed + 1) * 1000000).toFixed(0); 
        const code = rawCode.slice(0, 6).padEnd(6, '0'); // Ensure 6 digits
        
        setMasterKey(code);
        
        // Calculate remaining seconds
        const nextTick = (seed + 1) * timeStep;
        const remaining = Math.ceil((nextTick - now) / 1000);
        setKeyCountdown(remaining);
    };

    updateMasterKey(); // Initial call
    const interval = setInterval(updateMasterKey, 1000); // Check every second to update countdown
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket, tickets]);

  const loadData = async () => {
    try {
        // Load Users
        const usersStr = localStorage.getItem('studentpocket_users');
        const usersObj = usersStr ? JSON.parse(usersStr) : {};
        setUsers(usersObj);

        // Load Profiles
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

        // Load Requests
        const reqStr = localStorage.getItem('studentpocket_requests');
        if (reqStr) setRequests(JSON.parse(reqStr));

        // Load Tickets
        const ticketStr = localStorage.getItem('studentpocket_tickets');
        if (ticketStr) {
            const allTickets: SupportTicket[] = JSON.parse(ticketStr);
            // Show ALL tickets to admin
            const validTickets = allTickets.filter(t => t && Array.isArray(t.messages) && t.messages.length > 0);
            setTickets(validTickets.sort((a, b) => b.updatedAt - a.updatedAt));
            
            // Update selected ticket if active
            if (selectedTicket) {
                const updated = validTickets.find(t => t.id === selectedTicket.id);
                if (updated) setSelectedTicket(updated);
            }
        }
    } catch (error) {
        console.error("Dashboard Sync Error:", error);
    }
  };

  const handleVerifyRequest = async (req: ChangeRequest, approve: boolean) => {
      // Logic to approve/reject verification
      // Update User Profile
      const data = await storageService.getData(`architect_data_${req.username}`);
      if (data && data.user) {
          data.user.isVerified = approve;
          data.user.verificationStatus = approve ? 'VERIFIED' : 'REJECTED';
          data.user.adminFeedback = approve 
            ? "Identity Verified by Administration." 
            : "Verification rejected. Please ensure details match your ID.";
          
          await storageService.setData(`architect_data_${req.username}`, data);
      }

      // Update Request Status
      const updatedReqs = requests.map(r => 
        r.id === req.id ? { ...r, status: approve ? 'APPROVED' : 'REJECTED' } : r
      );
      setRequests(updatedReqs as ChangeRequest[]);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedReqs));
  };

  const handleBanUser = async (username: string) => {
      if(!window.confirm(`Ban user ${username}?`)) return;
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          data.user.isBanned = true;
          data.user.banReason = "Account suspended by Administrator.";
          await storageService.setData(`architect_data_${username}`, data);
          loadData();
      }
  };

  const generateRescueKey = async (username: string) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      if(window.confirm(`Generate ONE-TIME Master Key for ${username}?\n\nCode: ${code}`)) {
          const data = await storageService.getData(`architect_data_${username}`);
          if (data && data.user) {
              data.user.rescueKey = code;
              await storageService.setData(`architect_data_${username}`, data);
              alert(`Key Generated: ${code}\nSend this to the user for manual verification.`);
              loadData();
          }
      }
  };

  // Support Ticket Functions
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
                  status: 'OPEN' as const // Re-open if replied
              };
          }
          return t;
      });

      localStorage.setItem('studentpocket_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets as SupportTicket[]);
      setReplyText('');
      
      // Update local selection
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

  const deleteSupportTicket = (id: string) => {
      if (!window.confirm("Delete this ticket permanently?")) return;
      const updatedTickets = tickets.filter(t => t.id !== id);
      localStorage.setItem('studentpocket_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
      if (selectedTicket?.id === id) setSelectedTicket(null);
  };

  // Filter Logic
  const filteredUsers = profiles.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-8">
       {/* Admin Header */}
       <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
               <div>
                   <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">System Command</h1>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Administrative Console</p>
               </div>
               <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-sm">
                   {[
                       { id: 'OVERVIEW', icon: ShieldAlert, label: 'Ops' },
                       { id: 'USERS', icon: Users, label: 'Nodes' },
                       { id: 'REQUESTS', icon: ShieldCheck, label: 'Auth', badge: pendingRequests.length },
                       { id: 'SUPPORT', icon: LifeBuoy, label: 'Help', badge: openTicketsCount }
                   ].map(tab => (
                       <button
                           key={tab.id}
                           onClick={() => setViewMode(tab.id as AdminView)}
                           className={`flex items-center px-6 py-3 rounded-xl transition-all relative ${
                               viewMode === tab.id 
                               ? 'bg-white text-slate-900 shadow-lg' 
                               : 'text-slate-400 hover:text-white hover:bg-white/5'
                           }`}
                       >
                           <tab.icon size={16} className="mr-2" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                           {tab.badge > 0 && (
                               <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-md animate-pulse"></div>
                           )}
                       </button>
                   ))}
               </div>
           </div>
       </div>

       {/* VIEWS */}
       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {/* Stats Cards */}
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                       <Users size={24} />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{profiles.length}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Active Nodes</p>
               </div>
               
               {/* Master Key Widget */}
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="flex justify-between items-start mb-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                           <Key size={24} />
                       </div>
                       <div className="text-[10px] font-bold text-slate-500 bg-black/30 px-2 py-1 rounded-lg tabular-nums">
                           {keyCountdown}s
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <div>
                           <h3 className="text-4xl font-black font-mono tracking-widest animate-pulse">{masterKey || '...'}</h3>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">Live Master Key</p>
                       </div>
                       <div className={`w-2 h-2 rounded-full ${keyCountdown < 10 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
                   </div>
                   {/* Progress Bar */}
                   <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000 linear" style={{width: `${(keyCountdown / 50) * 100}%`}}></div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                       <ShieldCheck size={24} />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{pendingRequests.length}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Pending Auth</p>
               </div>
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                       <LifeBuoy size={24} />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{openTicketsCount}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Open Tickets</p>
               </div>
           </div>
       )}

       {viewMode === 'USERS' && (
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <div className="flex items-center space-x-4 mb-8 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                   <Search size={20} className="text-slate-400 ml-2" />
                   <input 
                        type="text" 
                        placeholder="Search Identity Nodes..." 
                        className="bg-transparent w-full outline-none font-bold text-slate-700 dark:text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                   />
               </div>
               <div className="space-y-4">
                   {filteredUsers.map((user: any, i) => (
                       <div key={i} className="flex justify-between items-center p-6 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                           <div className="flex items-center space-x-4">
                               <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="p-3 w-full h-full text-slate-400" />}
                               </div>
                               <div>
                                   <h4 className="font-bold text-slate-900 dark:text-white">{user.name}</h4>
                                   <p className="text-xs text-slate-500">{user.email}</p>
                                   {user.rescueKey && <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider mt-1">Key: {user.rescueKey}</p>}
                               </div>
                           </div>
                           <div className="flex items-center space-x-3">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                   {user.isVerified ? 'Verified' : 'Guest'}
                               </span>
                               
                               <button 
                                    onClick={() => generateRescueKey(user._username)} 
                                    className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                                    title="Generate Rescue Key"
                               >
                                   <Key size={18} />
                               </button>

                               <button 
                                    onClick={() => handleBanUser(user._username || user.email.split('@')[0])} 
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    title="Ban User"
                               >
                                   <Lock size={18} />
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {viewMode === 'REQUESTS' && (
           <div className="space-y-4">
               {pendingRequests.length === 0 && (
                   <div className="text-center py-20 text-slate-400">
                       <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                       <p className="text-xs font-bold uppercase tracking-wider">All Clear</p>
                   </div>
               )}
               {pendingRequests.map(req => (
                   <div key={req.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="flex items-center space-x-6">
                           <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                               <ShieldAlert size={24} />
                           </div>
                           <div>
                               <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Verification Request</h4>
                               <p className="text-xs text-slate-500 font-mono">ID: {req.generatedStudentId || req.username}</p>
                           </div>
                       </div>
                       <div className="flex space-x-3">
                           <button 
                                onClick={() => handleVerifyRequest(req, false)}
                                className="px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors"
                           >
                               Reject
                           </button>
                           <button 
                                onClick={() => handleVerifyRequest(req, true)}
                                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-colors"
                           >
                               Approve
                           </button>
                       </div>
                   </div>
               ))}
           </div>
       )}

       {viewMode === 'SUPPORT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center px-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Inbox</h3>
                      <button onClick={loadData} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Refresh Tickets">
                          <RefreshCw size={14} />
                      </button>
                  </div>
                  
                  {tickets.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                          <LifeBuoy className="mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-bold uppercase">No tickets</p>
                      </div>
                  )}

                  {tickets.map(ticket => (
                      <div 
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                              selectedTicket?.id === ticket.id
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                          }`}
                      >
                         <div className="flex justify-between items-center mb-2">
                             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                 ticket.status === 'OPEN' 
                                 ? (selectedTicket?.id === ticket.id ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-600') 
                                 : (selectedTicket?.id === ticket.id ? 'bg-black/20 text-white/50' : 'bg-slate-100 text-slate-400')
                             }`}>{ticket.status}</span>
                             <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-mono ${selectedTicket?.id === ticket.id ? 'text-indigo-200' : 'text-slate-400 opacity-60'}`}>#{ticket.id}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteSupportTicket(ticket.id); }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        selectedTicket?.id === ticket.id 
                                        ? 'text-indigo-200 hover:text-white hover:bg-indigo-500' 
                                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                                    title="Delete Ticket"
                                >
                                    <Trash2 size={14} />
                                </button>
                             </div>
                         </div>
                         <h3 className={`font-bold text-sm mb-1 ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{ticket.subject}</h3>
                         <p className={`text-xs opacity-70 mb-3 truncate ${selectedTicket?.id === ticket.id ? 'text-indigo-100' : 'text-slate-500'}`}>{ticket.messages[ticket.messages.length-1]?.text || 'No content'}</p>
                         <div className={`flex items-center text-[10px] font-bold uppercase tracking-wider ${selectedTicket?.id === ticket.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                             <User size={12} className="mr-1"/> {ticket.userId}
                         </div>
                      </div>
                  ))}
              </div>

              {/* Chat View */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[700px] overflow-hidden">
                  {selectedTicket ? (
                      <>
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                              <div>
                                  <h2 className="font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                                  <p className="text-xs text-slate-500 mt-1">User: {selectedTicket.userId}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                  {selectedTicket.status === 'OPEN' && (
                                      <button onClick={closeTicket} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors">Close Ticket</button>
                                  )}
                                  <button onClick={() => deleteSupportTicket(selectedTicket.id)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-colors" title="Delete Ticket">
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                                {selectedTicket.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] ${msg.isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                                                msg.isAdmin 
                                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center mt-2 space-x-2">
                                                {msg.isAdmin && <ShieldCheck size={12} className="text-indigo-500" />}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {msg.isAdmin ? 'Admin' : 'User'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                          </div>

                          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                <form onSubmit={sendTicketReply} className="relative">
                                    <input 
                                        type="text" 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium text-slate-800 dark:text-white focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Reply as Admin..."
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                          </div>
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
                          <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                          <h3 className="text-xl font-black text-slate-400">Select a Ticket</h3>
                          <p className="text-sm text-slate-400 mt-2">View user request details.</p>
                      </div>
                  )}
              </div>
          </div>
       )}
    </div>
  );
};
