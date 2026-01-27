import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChangeRequest, SupportTicket, TicketMessage } from '../types';
import { 
  Users, ShieldCheck, LifeBuoy, Trash2, 
  CheckCircle, XCircle, RefreshCw, User, Lock, 
  ShieldAlert, MessageSquare, Send, Key, ChevronUp, ChevronDown, Award, Edit2, ArrowRight, Save, X, BadgeCheck, BadgeAlert, Skull, AlertTriangle, MessageCircle, Ticket, Plus, UserPlus, Download, Copy, ShieldX
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ADMIN_USERNAME, DEFAULT_USER, SYSTEM_UPGRADE_TOKEN } from '../constants';

type AdminView = 'OVERVIEW' | 'USERS' | 'REQUESTS' | 'RECOVERY' | 'SUPPORT';

export const AdminDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  // Admission Key State
  const [msKey, setMsKey] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<'ACTIVE' | 'COOLDOWN'>('ACTIVE');
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
        const usersStr = localStorage.getItem('studentpocket_users');
        const usersObj = usersStr ? JSON.parse(usersStr) : {};

        const loadedProfiles: UserProfile[] = [];
        for (const username of Object.keys(usersObj)) {
            if (username === ADMIN_USERNAME) continue;
            const data = await storageService.getData(`architect_data_${username}`);
            if (data && data.user) {
                 loadedProfiles.push({ ...data.user, _username: username } as any);
            }
        }
        setProfiles(loadedProfiles);

        const reqStr = localStorage.getItem('studentpocket_requests');
        if (reqStr) setRequests(JSON.parse(reqStr));

        const ticketStr = localStorage.getItem('studentpocket_tickets');
        if (ticketStr) setTickets(JSON.parse(ticketStr));
        
        const keys = await storageService.getSystemKeys();
        setMsKey(keys.msCode);
        setKeyStatus(keys.status);
        setCooldownTime(keys.timerRemaining);
    } catch (error) {
        console.error("Dashboard Sync Error:", error);
    }
  };

  const handleVerifyRequest = async (req: ChangeRequest, approve: boolean) => {
      const data = await storageService.getData(`architect_data_${req.username}`);
      if (data && data.user) {
          data.user.isVerified = approve;
          data.user.verificationStatus = approve ? 'VERIFIED' : 'REJECTED';
          data.user.level = approve ? 1 : 0;
          await storageService.setData(`architect_data_${req.username}`, data);
      }

      const updatedReqs = requests.map(r => 
        r.id === req.id ? { ...r, status: approve ? 'APPROVED' : 'REJECTED' } : r
      );
      setRequests(updatedReqs as ChangeRequest[]);
      localStorage.setItem('studentpocket_requests', JSON.stringify(updatedReqs));
  };

  const toggleVerification = async (username: string, currentStatus: boolean) => {
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          data.user.isVerified = !currentStatus;
          data.user.verificationStatus = !currentStatus ? 'VERIFIED' : 'NONE';
          data.user.level = !currentStatus ? 1 : 0;
          await storageService.setData(`architect_data_${username}`, data);
          
          // Update the users registry too
          const usersStr = localStorage.getItem('studentpocket_users');
          const users = usersStr ? JSON.parse(usersStr) : {};
          if (users[username]) {
              users[username].verified = !currentStatus;
              localStorage.setItem('studentpocket_users', JSON.stringify(users));
          }
          
          loadData();
      }
  };

  const handleBanUser = async (username: string) => {
      if(!window.confirm(`Suspend access for ${username}?`)) return;
      const data = await storageService.getData(`architect_data_${username}`);
      if (data && data.user) {
          data.user.isBanned = true;
          await storageService.setData(`architect_data_${username}`, data);
          loadData();
      }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="pb-32 animate-platinum space-y-10">
       <div className="flex justify-between items-end border-b border-white/5 pb-8">
           <div>
               <div className="stark-badge mb-3">Authority Level 3</div>
               <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Command Matrix</h1>
           </div>
           <div className="flex gap-4">
               {['OVERVIEW', 'USERS', 'REQUESTS', 'SUPPORT'].map((m) => (
                   <button 
                    key={m} 
                    onClick={() => setViewMode(m as AdminView)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                   >
                       {m}
                   </button>
               ))}
           </div>
       </div>

       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="master-box p-10 space-y-6">
                   <div className="flex justify-between items-center">
                        <Users className="text-indigo-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</span>
                   </div>
                   <h3 className="text-5xl font-black text-white italic">{profiles.length}</h3>
               </div>
               <div className="master-box p-10 space-y-6">
                   <div className="flex justify-between items-center">
                        <ShieldAlert className="text-amber-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auth Pending</span>
                   </div>
                   <h3 className="text-5xl font-black text-white italic">{pendingRequests.length}</h3>
               </div>
               <div className="master-box p-10 space-y-6 border-indigo-500/20">
                   <div className="flex justify-between items-center">
                        <Key className="text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Key</span>
                   </div>
                   <div className="bg-black/50 p-4 rounded-xl text-center">
                        <h3 className="text-2xl font-mono font-black text-emerald-400 tracking-widest">{msKey || 'CYCLING...'}</h3>
                   </div>
               </div>
           </div>
       )}

       {viewMode === 'USERS' && (
           <div className="master-box overflow-hidden">
               <table className="w-full text-left">
                   <thead className="bg-white/5 border-b border-white/5">
                       <tr>
                           <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                           <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                           <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                           <th className="p-8"></th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                       {profiles.map((p: any) => (
                           <tr key={p._username} className="hover:bg-white/[0.02] transition-colors">
                               <td className="p-8">
                                   <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                           {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover"/> : <User size={18}/>}
                                       </div>
                                       <div>
                                           <div className="text-sm font-black text-white uppercase italic">{p.name}</div>
                                           <div className="text-[9px] text-slate-500 font-bold uppercase">{p.email}</div>
                                       </div>
                                   </div>
                               </td>
                               <td className="p-8">
                                   <span className={`stark-badge text-[8px] ${p.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                       {p.isVerified ? 'Verified' : 'Unverified'}
                                   </span>
                               </td>
                               <td className="p-8">
                                   <button 
                                      onClick={() => toggleVerification(p._username, p.isVerified)}
                                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center"
                                   >
                                       {p.isVerified ? <ShieldX size={12} className="mr-2"/> : <ShieldCheck size={12} className="mr-2"/>}
                                       {p.isVerified ? 'Unverify' : 'Verify'}
                                   </button>
                               </td>
                               <td className="p-8 text-right">
                                   <button onClick={() => handleBanUser(p._username)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 transition-all border border-white/5">
                                       <Lock size={16} />
                                   </button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {viewMode === 'REQUESTS' && (
           <div className="space-y-6">
               {pendingRequests.map(req => (
                   <div key={req.id} className="master-box p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                       <div className="flex items-center gap-8">
                           <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                               <ShieldCheck size={32} />
                           </div>
                           <div>
                               <h4 className="text-xl font-black text-white uppercase italic">Access Appeal</h4>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Node: {req.username} | Ref: {req.id}</p>
                           </div>
                       </div>
                       <div className="flex gap-4">
                           <button onClick={() => handleVerifyRequest(req, false)} className="px-8 py-4 rounded-2xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest border border-white/5 hover:text-red-500 transition-all">Deny</button>
                           <button onClick={() => handleVerifyRequest(req, true)} className="btn-platinum px-12 py-4 text-[10px]">Approve Access</button>
                       </div>
                   </div>
               ))}
               {pendingRequests.length === 0 && (
                   <div className="text-center py-20 opacity-20">
                       <ShieldCheck size={64} className="mx-auto mb-4" />
                       <p className="text-xl font-black uppercase tracking-[0.4em]">Grid Clean</p>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};