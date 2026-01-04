
import React, { useState, useEffect, useRef } from 'react';
import { ChangeRequest, ActivityLog, View, SupportTicket, TicketMessage } from '../types';
import { 
  BellRing, Eye, Trash2, FileClock, Search, RefreshCw, CheckCircle, XCircle, Send, Paperclip, Mail, X, Video, MapPin, Globe, Phone, User, Link, Copy, LifeBuoy, Clock
} from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';
import { storageService } from '../services/storageService';

export const AdminDashboard: React.FC = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'REQUESTS' | 'NODES' | 'LOGS' | 'INVITES' | 'SUPPORT'>('REQUESTS');
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [logFilter, setLogFilter] = useState('');
  
  const [emailMode, setEmailMode] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [ticketReply, setTicketReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Invite Generator State
  const [generatedInvite, setGeneratedInvite] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  const refreshData = async () => {
    const usersStr = localStorage.getItem('studentpocket_users');
    if (usersStr) {
      const usersObj = JSON.parse(usersStr);
      const list = await Promise.all(Object.entries(usersObj).map(async ([key, value]: [string, any]) => {
        const stored = await storageService.getData(`architect_data_${key}`);
        return {
            username: key,
            email: value.email,
            isVerified: stored?.user?.isVerified || false,
            isBanned: stored?.user?.isBanned || false,
            storageLimit: stored?.user?.storageLimitGB || 15,
            isAdmin: key === ADMIN_USERNAME
        };
      }));
      setUsersList(list);
    }
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));
    
    const logs = await storageService.getLogs();
    setLogs(logs);

    const ticketStr = localStorage.getItem('studentpocket_tickets');
    if (ticketStr) {
        const allTickets = JSON.parse(ticketStr);
        setTickets(allTickets.sort((a: SupportTicket, b: SupportTicket) => b.updatedAt - a.updatedAt));
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshTrigger]);

  useEffect(() => {
      if (selectedTicket) {
          // Re-fetch selected ticket to get updates
          const found = tickets.find(t => t.id === selectedTicket.id);
          if (found) setSelectedTicket(found);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
  }, [tickets]);

  const initiateProcess = (action: 'APPROVE' | 'REJECT') => {
      setEmailMode(action);
      if (action === 'APPROVE') {
          setEmailSubject('Verification Successful: StudentPocket Identity Confirmed');
          setEmailBody(`Dear Student,\n\nWe are pleased to inform you that your identity verification request has been approved.\n\nWelcome to StudentPocket.\n\nBest regards,\nSystem Admin`);
      } else {
          setEmailSubject('Action Required: Verification Request Update');
          setEmailBody(`Dear Student,\n\nWe reviewed your verification request but were unable to confirm your identity based on the provided documents.\n\nPlease review your details and resubmit.\n\nRegards,\nSystem Admin`);
      }
  };

  const sendEmailAndFinalize = async () => {
    if (!selectedRequest || !emailMode) return;
    setIsSending(true);

    const req = selectedRequest;
    const action = emailMode;
    const dataKey = `architect_data_${req.username}`;
    const stored = await storageService.getData(dataKey);
    
    if (stored && stored.user) {
      stored.user.isVerified = action === 'APPROVE';
      stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
      stored.user.adminFeedback = emailBody;
      
      await storageService.setData(dataKey, stored);

      await storageService.logActivity({
          actor: ADMIN_USERNAME,
          targetUser: req.username,
          actionType: 'ADMIN',
          description: `Request ${action}: ${req.username}`,
          metadata: JSON.stringify({ requestId: req.id, action })
      });

      // Update centralized request store
      const reqStr = localStorage.getItem('studentpocket_requests');
      if (reqStr) {
          const allRequests: ChangeRequest[] = JSON.parse(reqStr);
          const updatedRequests = allRequests.map(r => r.id === req.id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r);
          localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      }
      
      setTimeout(() => {
        setIsSending(false);
        setEmailMode(null);
        setSelectedRequest(null);
        setRefreshTrigger(prev => prev + 1);
        alert(`Request ${action === 'APPROVE' ? 'Authorized' : 'Rejected'}. Email simulated.`);
      }, 1000);

    } else {
        setIsSending(false);
        alert(`Error: User data not found.`);
    }
  };

  const updateUserNode = async (username: string, updates: any) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored) {
        stored.user = { ...stored.user, ...updates };
        await storageService.setData(dataKey, stored);
        setRefreshTrigger(prev => prev + 1);
    }
  };

  const generateInviteLink = () => {
    const code = Math.random().toString(36).substring(7);
    const origin = window.location.origin;
    const link = `${origin}/register/${code}`;
    
    // Persist invite to storage so it can be validated
    const invitesStr = localStorage.getItem('studentpocket_invites');
    const invites = invitesStr ? JSON.parse(invitesStr) : [];
    invites.push({
        code,
        status: 'ACTIVE',
        createdAt: Date.now(),
        createdBy: ADMIN_USERNAME
    });
    localStorage.setItem('studentpocket_invites', JSON.stringify(invites));

    setGeneratedInvite(link);
    setInviteCopied(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedInvite);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  // Support Ticket Logic
  const replyToTicket = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTicket || !ticketReply.trim()) return;

      const message: TicketMessage = {
          id: Date.now().toString(),
          sender: 'Admin Support',
          text: ticketReply,
          timestamp: Date.now(),
          isAdmin: true
      };

      const stored = localStorage.getItem('studentpocket_tickets');
      if (stored) {
          const allTickets: SupportTicket[] = JSON.parse(stored);
          const idx = allTickets.findIndex(t => t.id === selectedTicket.id);
          if (idx !== -1) {
              allTickets[idx].messages.push(message);
              allTickets[idx].updatedAt = Date.now();
              localStorage.setItem('studentpocket_tickets', JSON.stringify(allTickets));
              setRefreshTrigger(prev => prev + 1);
              setTicketReply('');
          }
      }
  };

  const closeTicket = () => {
      if (!selectedTicket) return;
      if (!window.confirm("Close this ticket?")) return;

      const stored = localStorage.getItem('studentpocket_tickets');
      if (stored) {
          const allTickets: SupportTicket[] = JSON.parse(stored);
          const idx = allTickets.findIndex(t => t.id === selectedTicket.id);
          if (idx !== -1) {
              allTickets[idx].status = 'CLOSED';
              allTickets[idx].updatedAt = Date.now();
              localStorage.setItem('studentpocket_tickets', JSON.stringify(allTickets));
              setRefreshTrigger(prev => prev + 1);
          }
      }
  };


  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(logFilter.toLowerCase()) || 
    log.actor.toLowerCase().includes(logFilter.toLowerCase())
  );

  const renderRequestDetails = (request: ChangeRequest) => {
    let details: any = {};
    try {
        details = JSON.parse(request.details);
    } catch(e) {
        return <p className="text-red-500 text-xs">Error parsing request details.</p>;
    }
    
    const profileImage = details._profileImage;
    const videoFile = details._videoFile;

    return (
        <div className="space-y-6">
            <div className="flex items-start space-x-6">
                 {/* Image */}
                 <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {profileImage ? (
                        <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={24}/></div>
                    )}
                 </div>
                 
                 {/* Video Indicator */}
                 <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Media Status</p>
                     <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${profileImage ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            <CheckCircle size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Photo Provided</span>
                     </div>
                     <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${videoFile ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Video size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{videoFile ? 'Video Included' : 'No Video'}</span>
                     </div>
                 </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Student Data</h3>
                 
                 <div className="grid grid-cols-1 gap-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{details.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Country</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center"><Globe size={12} className="mr-1.5 opacity-50"/> {details.country || 'N/A'}</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white break-all flex items-center"><Mail size={12} className="mr-1.5 opacity-50"/> {details.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center"><Phone size={12} className="mr-1.5 opacity-50"/> {details.phone}</p>
                        </div>
                     </div>
                     
                     <div className="pt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Permanent Address</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-start"><MapPin size={12} className="mr-1.5 mt-0.5 opacity-50"/> {details.permAddress}</p>
                     </div>
                     
                     {details.tempAddress && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Temporary Address</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-start"><MapPin size={12} className="mr-1.5 mt-0.5 opacity-50"/> {details.tempAddress}</p>
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">StudentPocket Management</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-indigo-600 hover:bg-slate-100 transition-colors"><RefreshCw size={18}/></button>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setViewMode('REQUESTS')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'REQUESTS' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Requests</button>
                <button onClick={() => setViewMode('NODES')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'NODES' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Users</button>
                <button onClick={() => setViewMode('SUPPORT')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'SUPPORT' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Help Desk</button>
                <button onClick={() => setViewMode('INVITES')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'INVITES' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Invites</button>
                <button onClick={() => setViewMode('LOGS')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'LOGS' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Logs</button>
            </div>
        </div>
      </div>

      {viewMode === 'INVITES' && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex-1">
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Student Enrollment</h2>
                     <p className="text-sm text-slate-500 leading-relaxed mb-6">
                        Generate securely signed registration links for new students. These links allow users to set up their profile and credentials directly.
                     </p>
                     <button onClick={generateInviteLink} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center">
                        <Link size={18} className="mr-2" /> Generate Link
                     </button>
                 </div>
                 
                 <div className="flex-1 w-full md:max-w-md">
                     <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Secure Link</p>
                         <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                             <input 
                                readOnly 
                                value={generatedInvite || 'No link generated'} 
                                className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-600 dark:text-slate-300 px-2"
                             />
                             {generatedInvite && (
                                <button onClick={copyInviteLink} className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                                    {inviteCopied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                                </button>
                             )}
                         </div>
                         {generatedInvite && <p className="text-[10px] text-emerald-500 font-bold mt-3 flex items-center"><CheckCircle size={12} className="mr-1.5"/> Ready to share</p>}
                     </div>
                 </div>
             </div>
        </div>
      )}

      {viewMode === 'SUPPORT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                  {tickets.map(ticket => (
                      <div 
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                              selectedTicket?.id === ticket.id
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                          }`}
                      >
                         <div className="flex justify-between items-center mb-2">
                             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                 ticket.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-black/20 text-slate-300'
                             }`}>{ticket.status}</span>
                             <span className="text-[10px] font-mono opacity-60">#{ticket.id}</span>
                         </div>
                         <h3 className="font-bold text-sm mb-1">{ticket.subject}</h3>
                         <p className="text-xs opacity-70 mb-3 truncate">{ticket.messages[ticket.messages.length-1].text}</p>
                         <div className="flex items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
                             <User size={12} className="mr-1"/> {ticket.userId}
                         </div>
                      </div>
                  ))}
                  {tickets.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                          <LifeBuoy className="mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-bold uppercase">No tickets</p>
                      </div>
                  )}
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
                              {selectedTicket.status === 'OPEN' && (
                                  <button onClick={closeTicket} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors">Close Ticket</button>
                              )}
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                              {selectedTicket.messages.map(msg => (
                                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[75%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                                          msg.isAdmin 
                                          ? 'bg-indigo-600 text-white rounded-br-none' 
                                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                                      }`}>
                                          <p>{msg.text}</p>
                                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-2 text-right">
                                              {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </p>
                                      </div>
                                  </div>
                              ))}
                              <div ref={messagesEndRef} />
                          </div>

                          {selectedTicket.status === 'OPEN' && (
                              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                  <form onSubmit={replyToTicket} className="flex gap-4">
                                      <input 
                                          type="text" 
                                          value={ticketReply}
                                          onChange={(e) => setTicketReply(e.target.value)}
                                          className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium text-sm focus:border-indigo-500 transition-all"
                                          placeholder="Type a reply..."
                                      />
                                      <button type="submit" className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                                          <Send size={20} />
                                      </button>
                                  </form>
                              </div>
                          )}
                      </>
                  ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                          <div className="text-center">
                              <LifeBuoy size={48} className="mx-auto mb-4" />
                              <p className="text-sm font-bold uppercase tracking-widest">Select a ticket to view</p>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {viewMode === 'REQUESTS' && (
        <div className="grid grid-cols-1 gap-4">
           {requests.filter(r => r.status === 'PENDING').map(req => {
             let details: any = {};
             try { details = JSON.parse(req.details); } catch(e) {}
             const thumbnail = details._profileImage;
             return (
               <div key={req.id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-6">
                     <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                        {thumbnail ? <img src={thumbnail} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20}/></div>}
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 dark:text-white">{details.fullName || req.username}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Verification Application • {req.username}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(req)} 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                  >
                    Review
                  </button>
               </div>
             );
           })}
           {requests.filter(r => r.status === 'PENDING').length === 0 && (
               <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                       <BellRing size={24} />
                   </div>
                   <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">No pending requests</p>
               </div>
           )}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && !emailMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 rounded-t-3xl sticky top-0 z-10">
                 <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 dark:text-white">Review Application</h2>
                 <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} className="text-slate-400"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {renderRequestDetails(selectedRequest)}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-3xl grid grid-cols-2 gap-4">
                 <button onClick={() => initiateProcess('APPROVE')} className="bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center"><CheckCircle size={16} className="mr-2"/> Approve</button>
                 <button onClick={() => initiateProcess('REJECT')} className="bg-red-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center"><XCircle size={16} className="mr-2"/> Reject</button>
              </div>
           </div>
        </div>
      )}

      {/* Email Modal */}
      {emailMode && selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${emailMode === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Compose {emailMode === 'APPROVE' ? 'Approval' : 'Rejection'}</h2>
                            <p className="text-xs text-slate-500">To: {selectedRequest.username}</p>
                        </div>
                    </div>
                    <button onClick={() => setEmailMode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                        <input 
                            type="text" 
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Message</label>
                        <textarea 
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-sm outline-none focus:border-indigo-500 transition-colors h-40 resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                    <button onClick={() => setEmailMode(null)} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button 
                        onClick={sendEmailAndFinalize}
                        disabled={isSending}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center"
                    >
                       {isSending ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                       Send & Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'NODES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {usersList.map(u => (
              <div key={u.username} className={`p-6 rounded-2xl border flex flex-col justify-between ${u.isAdmin ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                 <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm uppercase">{u.username.charAt(0)}</div>
                    <div className="overflow-hidden">
                        <p className={`font-bold text-sm truncate ${u.isAdmin ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{u.username}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{u.email}</p>
                    </div>
                 </div>
                 {!u.isAdmin && (
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Storage: {u.storageLimit}GB</span>
                          <div className="flex items-center space-x-1">
                              <button onClick={() => updateUserNode(u.username, { storageLimitGB: Math.max(1, u.storageLimit - 5) })} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg text-xs font-bold hover:text-indigo-600">-</button>
                              <button onClick={() => updateUserNode(u.username, { storageLimitGB: u.storageLimit + 5 })} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg text-xs font-bold hover:text-indigo-600">+</button>
                          </div>
                      </div>
                      <button onClick={() => updateUserNode(u.username, { isBanned: !u.isBanned })} className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${u.isBanned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                        {u.isBanned ? 'Restore Access' : 'Suspend User'}
                      </button>
                   </div>
                 )}
              </div>
           ))}
        </div>
      )}

      {viewMode === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600"><FileClock size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Logs</h2>
              </div>
              <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                  />
              </div>
           </div>
           
           <div className="max-h-[500px] overflow-y-auto no-scrollbar">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 backdrop-blur-md z-10">
                      <tr>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actor</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 text-[10px] font-mono text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                              <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300">{log.actor}</td>
                              <td className="p-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                  {log.description}
                              </td>
                          </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                          <tr><td colSpan={3} className="p-8 text-center text-xs text-slate-400">No logs found.</td></tr>
                      )}
                  </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};
