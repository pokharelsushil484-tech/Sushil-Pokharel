
import React, { useState, useEffect } from 'react';
import { ChangeRequest, ActivityLog } from '../types';
import { 
  Infinity as InfinityIcon, BellRing, Eye, Trash2, FileClock, Search, RefreshCw, CheckCircle, XCircle, Send, Paperclip, Mail, X
} from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';
import { storageService } from '../services/storageService';

export const AdminDashboard: React.FC = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'REQUESTS' | 'NODES' | 'LOGS'>('REQUESTS');
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [logFilter, setLogFilter] = useState('');
  
  // Email Composition State
  const [emailMode, setEmailMode] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const refreshData = async () => {
    // Fetch Users
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
    // Fetch Requests
    const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
    setRequests(JSON.parse(reqStr));

    // Fetch Logs
    const activityLogs = await storageService.getLogs();
    setLogs(activityLogs);
  };

  useEffect(() => {
    refreshData();
  }, [refreshTrigger]);

  const initiateProcess = (action: 'APPROVE' | 'REJECT') => {
      setEmailMode(action);
      if (action === 'APPROVE') {
          setEmailSubject('Verification Successful: StudentPocket Identity Confirmed');
          setEmailBody(`Dear Student,\n\nWe are pleased to inform you that your identity verification request has been approved. Your node now has full access to the repository and AI architecture.\n\nWelcome to the network.\n\nBest regards,\nSystem Architect`);
      } else {
          setEmailSubject('Action Required: Verification Request Update');
          setEmailBody(`Dear Student,\n\nWe reviewed your verification request but were unable to confirm your identity based on the provided documents. \n\nPlease see the attachment for the document we received. The issue may be related to clarity or validity.\n\nPlease update your details and submit a new signal.\n\nRegards,\nSystem Admin`);
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
      // Save the email content as feedback for the user to see
      stored.user.adminFeedback = emailBody;
      
      await storageService.setData(dataKey, stored);

      // Log the action
      await storageService.logActivity({
          actor: ADMIN_USERNAME,
          targetUser: req.username,
          actionType: 'ADMIN',
          description: `Email Sent & Signal ${action}: ${req.username}`,
          metadata: JSON.stringify({ requestId: req.id, action, emailSubject })
      });

      // Remove from requests list
      const updatedRequests = requests.filter(r => r.id !== req.id);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
      
      setTimeout(() => {
        setIsSending(false);
        setEmailMode(null);
        setSelectedRequest(null);
        setRefreshTrigger(prev => prev + 1);
        alert(`Email sent to node ${req.username}. Request ${action === 'APPROVE' ? 'Authorized' : 'Rejected'}.`);
      }, 1500);

    } else {
        setIsSending(false);
        alert(`Error: Data node for user '${req.username}' not found. Cannot process request.`);
    }
  };

  const updateUserNode = async (username: string, updates: any) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored) {
        stored.user = { ...stored.user, ...updates };
        await storageService.setData(dataKey, stored);
        
        await storageService.logActivity({
            actor: ADMIN_USERNAME,
            targetUser: username,
            actionType: 'ADMIN',
            description: `Node Update: ${username}`,
            metadata: JSON.stringify(updates)
        });

        setRefreshTrigger(prev => prev + 1);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(logFilter.toLowerCase()) || 
    log.actor.toLowerCase().includes(logFilter.toLowerCase()) ||
    (log.targetUser && log.targetUser.toLowerCase().includes(logFilter.toLowerCase()))
  );

  const renderRequestDetails = (request: ChangeRequest) => {
    let detailsObj = {};
    try {
        detailsObj = JSON.parse(request.details);
    } catch(e) {
        return <p>Error parsing details.</p>;
    }
    
    const proofImage = (detailsObj as any)._verificationImage;
    const profileImage = (detailsObj as any)._profileImage;
    const textDetails = Object.entries(detailsObj).filter(([k]) => k !== '_verificationImage' && k !== '_profileImage');

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileImage && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Identity Profile Photo</p>
                        </div>
                        <img src={profileImage} alt="Profile Photo" className="w-full h-64 object-cover bg-white" />
                    </div>
                )}
                {proofImage && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Program Proof</p>
                        </div>
                        <img src={proofImage} alt="Verification Proof" className="w-full h-64 object-contain bg-slate-900" />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Security Responses</h3>
                 {textDetails.map(([q, a]: [any, any]) => (
                   <div key={q} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-3">Query: {q}</p>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{a}</p>
                   </div>
                 ))}
            </div>
        </div>
    );
  };

  // Helper to safely get image from request
  const getRequestThumbnail = (req: ChangeRequest) => {
      try {
          const d = JSON.parse(req.details);
          return d._profileImage || d._verificationImage;
      } catch { return null; }
  };
  
  const getVerificationImage = (req: ChangeRequest) => {
      try {
          const d = JSON.parse(req.details);
          return d._verificationImage;
      } catch { return null; }
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-8 px-4 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Authority Console</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2">Node Control Nucleus</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 shadow-sm hover:scale-105 transition-transform"><RefreshCw size={20}/></button>
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-3xl w-full md:w-auto overflow-x-auto no-scrollbar">
                <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'REQUESTS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Signals ({requests.length})</button>
                <button onClick={() => setViewMode('NODES')} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'NODES' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Nodes</button>
                <button onClick={() => setViewMode('LOGS')} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'LOGS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Logs</button>
            </div>
        </div>
      </div>

      {viewMode === 'REQUESTS' && (
        <div className="space-y-4">
           {requests.map(req => {
             const thumbnail = getRequestThumbnail(req);
             return (
               <div key={req.id} className="p-6 md:p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-6 hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-6 flex-1 min-w-0">
                     <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group cursor-pointer" onClick={() => setSelectedRequest(req)}>
                        {thumbnail ? (
                          <img src={thumbnail} alt="Profile" className="w-full h-full object-cover" />
                        ) : <BellRing size={24} />}
                     </div>
                     <div className="min-w-0">
                        <p className="font-black text-lg uppercase tracking-tight dark:text-white truncate">{req.username}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verification Signal</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <button 
                        onClick={() => setSelectedRequest(req)} 
                        className="flex-1 md:flex-none px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
                    >
                        Review Signal
                    </button>
                  </div>
               </div>
             );
           })}
           {requests.length === 0 && (
               <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                   <BellRing size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                   <p className="font-black uppercase tracking-widest text-xs text-slate-400">No pending authorization signals.</p>
               </div>
           )}
        </div>
      )}

      {/* Main Review Modal */}
      {selectedRequest && !emailMode && (
        <div className="fixed inset-0 z-[500] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto no-scrollbar animate-scale-up">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white dark:bg-slate-900 z-10 py-2">
                 <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Signal Review</h2>
                 <button onClick={() => setSelectedRequest(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
              </div>
              
              {renderRequestDetails(selectedRequest)}

              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button onClick={() => initiateProcess('APPROVE')} className="bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center"><CheckCircle size={16} className="mr-2"/> Accept</button>
                 <button onClick={() => initiateProcess('REJECT')} className="bg-red-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all flex items-center justify-center"><XCircle size={16} className="mr-2"/> Reject</button>
              </div>
           </div>
        </div>
      )}

      {/* Email Composition Modal */}
      {emailMode && selectedRequest && (
        <div className="fixed inset-0 z-[600] bg-slate-950/60 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-up flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${emailMode === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Compose {emailMode === 'APPROVE' ? 'Approval' : 'Rejection'}</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">To: {selectedRequest.username}</p>
                        </div>
                    </div>
                    <button onClick={() => setEmailMode(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject Line</label>
                        <input 
                            type="text" 
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message Body</label>
                        <textarea 
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 h-48 resize-none"
                        />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                                <Paperclip size={18} />
                             </div>
                             <div>
                                 <p className="text-xs font-black dark:text-white uppercase tracking-tight">Attachment Included</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">User_Proof.jpg</p>
                             </div>
                         </div>
                         <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                             <img src={getVerificationImage(selectedRequest)} className="w-full h-full object-cover" alt="attachment" />
                         </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                    <button onClick={() => setEmailMode(null)} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                    <button 
                        onClick={sendEmailAndFinalize}
                        disabled={isSending}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center"
                    >
                       {isSending ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                       Send & Finalize
                    </button>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'NODES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {usersList.map(u => (
              <div key={u.username} className={`p-8 rounded-[2.5rem] border flex flex-col justify-between transition-all ${u.isAdmin ? 'bg-slate-900 border-indigo-500/30 shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                 <div className="flex items-center space-x-5 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center font-black text-lg text-indigo-600 flex-shrink-0">{u.username.charAt(0)}</div>
                    <div className="overflow-hidden">
                        <p className={`font-black text-base uppercase truncate ${u.isAdmin ? 'text-white' : 'dark:text-white'}`}>{u.username}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider truncate">{u.email}</p>
                    </div>
                 </div>
                 {!u.isAdmin && (
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <span className="text-[9px] font-black uppercase text-slate-500">Limit: {u.storageLimit}GB</span>
                          <div className="flex items-center space-x-1">
                              <button onClick={() => updateUserNode(u.username, { storageLimitGB: Math.max(1, u.storageLimit - 5) })} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:text-indigo-600">-</button>
                              <button onClick={() => updateUserNode(u.username, { storageLimitGB: u.storageLimit + 5 })} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:text-indigo-600">+</button>
                          </div>
                      </div>
                      <button onClick={() => updateUserNode(u.username, { isBanned: !u.isBanned })} className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-colors ${u.isBanned ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {u.isBanned ? 'Restore Authorization' : 'Suspend Node Access'}
                      </button>
                   </div>
                 )}
                 {u.isAdmin && <div className="p-6 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-center"><InfinityIcon className="text-indigo-500 mx-auto" size={32} /></div>}
              </div>
           ))}
        </div>
      )}

      {viewMode === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600"><FileClock size={20} /></div>
                  <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">System Activity</h2>
              </div>
              <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/20"
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                  />
              </div>
           </div>
           
           <div className="max-h-[500px] overflow-y-auto no-scrollbar">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 backdrop-blur-md z-10">
                      <tr>
                          <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
                          <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor</th>
                          <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Type</th>
                          <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Event</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-6 text-[10px] font-bold text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                              <td className="p-6 text-[10px] font-black uppercase dark:text-white">{log.actor}</td>
                              <td className="p-6 hidden md:table-cell">
                                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                      log.actionType === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' :
                                      log.actionType === 'AUTH' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                      log.actionType === 'DATA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      'bg-slate-50 text-slate-600 border-slate-100'
                                  }`}>
                                      {log.actionType}
                                  </span>
                              </td>
                              <td className="p-6 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  {log.description}
                                  {log.targetUser && <span className="block text-slate-400 mt-1">Target: {log.targetUser}</span>}
                              </td>
                          </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                          <tr><td colSpan={4} className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity logs found.</td></tr>
                      )}
                  </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};
