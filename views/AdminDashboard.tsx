
import React, { useState, useEffect } from 'react';
import { UserProfile, SupportTicket, TicketMessage, View } from '../types';
// Fix: Add missing RefreshCw import from lucide-react to resolve the reference error on line 140
import { 
  Users, Trash2, Ban as BanIcon, ShieldOff, BadgeCheck, 
  UserPlus, Loader2, Terminal, Lock, Mail,
  CheckCircle2, XCircle, ShieldAlert, ShieldCheck, MessageSquare, Send, Clock, ChevronRight, AlertOctagon, Gavel, Trash, Radio, Megaphone, CheckCircle, X, ShieldCheck as AdminIcon,
  RefreshCw
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { emailService, DispatchType } from '../services/emailService';
import { ADMIN_USERNAME, DEFAULT_USER, SYSTEM_DOMAIN, ADMIN_EMAIL, CREATOR_NAME } from '../constants';

type AdminView = 'OVERVIEW' | 'NODES' | 'SUPPORT' | 'BROADCAST' | 'RECOVERY';

interface AdminDashboardProps {
    onNavigate: (view: View) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');
  
  // Broadcast State
  const [broadcastText, setBroadcastText] = useState('');

  useEffect(() => {
    loadData();
    const current = localStorage.getItem('sp_global_broadcast');
    if (current) setBroadcastText(current);
  }, []);

  const loadData = async () => {
    const usersStr = localStorage.getItem('studentpocket_users');
    const usersObj = usersStr ? JSON.parse(usersStr) : {};
    const loadedProfiles: any[] = [];
    for (const username of Object.keys(usersObj)) {
        const data = await storageService.getData(`architect_data_${username}`);
        if (data && data.user) {
             loadedProfiles.push({ ...data.user, _username: username });
        }
    }
    setProfiles(loadedProfiles);

    const ticketStr = localStorage.getItem('studentpocket_tickets');
    if (ticketStr) setTickets(JSON.parse(ticketStr));
  };

  const handleUnblockNode = async (username: string) => {
    if (!confirm(`AUTHORIZE REACTIVATION FOR NODE: ${username.toUpperCase()}?`)) return;
    
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored && stored.user) {
        stored.user.isBanned = false;
        stored.user.violationCount = 0;
        stored.user.verificationStatus = 'VERIFIED';
        await storageService.setData(dataKey, stored);
        
        await emailService.sendInstitutionalMail(stored.user.email, "Access Restored by Lead Architect", "VERIFIED_NOTICE", username);
        alert("NODE REACTIVATED.");
        loadData();
    }
  };

  const handlePublishBroadcast = async () => {
      if (!broadcastText.trim()) {
          localStorage.removeItem('sp_global_broadcast');
          alert("Broadcast Terminal Cleared.");
      } else {
          localStorage.setItem('sp_global_broadcast', broadcastText.trim());
          await emailService.sendInstitutionalMail(ADMIN_EMAIL, broadcastText, 'SYSTEM_UPDATE', 'GLOBAL MESH');
          alert("Broadcast Synchronized.");
      }
  };

  const handleAdminReply = () => {
    if (!selectedTicket || !adminReply.trim()) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const newMsg: TicketMessage = {
          id: Date.now().toString(),
          sender: 'Architect',
          text: adminReply,
          timestamp: Date.now(),
          isAdmin: true
        };
        return { ...t, messages: [...t.messages, newMsg], updatedAt: Date.now() };
      }
      return t;
    });

    localStorage.setItem('studentpocket_tickets', JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    setAdminReply('');
  };

  return (
    <div className="pb-32 animate-platinum space-y-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-10">
           <div className="space-y-3">
               <div className="stark-badge">Lead Architect: {CREATOR_NAME}</div>
               <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Command<br/>Center</h1>
           </div>
           <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
               {(['OVERVIEW', 'NODES', 'SUPPORT', 'BROADCAST', 'RECOVERY'] as AdminView[]).map((m) => (
                   <button 
                    key={m} 
                    onClick={() => setViewMode(m)}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                   >
                       {m}
                   </button>
               ))}
           </div>
       </div>

       {viewMode === 'NODES' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(p => (
                    <div key={p._username} className="master-box p-8 bg-black/40 border-white/5 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                <img src={p.avatar} className="w-full h-full object-cover opacity-50" />
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.isBanned ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'}`}>
                                {p.isBanned ? 'TERMINATED' : 'ACTIVE'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic truncate">{p.name}</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ID: {p._username.toUpperCase()}</p>
                        </div>
                        {p.isBanned && (
                            <button onClick={() => handleUnblockNode(p._username)} className="w-full py-4 bg-indigo-600 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                                <RefreshCw size={14} /> Reactivate Node
                            </button>
                        )}
                    </div>
                ))}
           </div>
       )}

       {viewMode === 'BROADCAST' && (
           <div className="max-w-4xl mx-auto space-y-10 animate-slide-up">
                <div className="master-box p-12 bg-black/40 border-indigo-500/20 space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg">
                            <Radio size={32} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic">Global Sync Protocol</h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mesh Broadcast Terminal</p>
                        </div>
                    </div>

                    <textarea 
                        value={broadcastText}
                        onChange={e => setBroadcastText(e.target.value)}
                        rows={3}
                        className="w-full p-8 bg-black border border-white/10 rounded-[2.5rem] font-bold text-lg text-indigo-400 outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
                        placeholder="Commit global update message..."
                    />

                    <button 
                        onClick={handlePublishBroadcast}
                        className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-4"
                    >
                        <Megaphone size={20} />
                        Publish to All Nodes
                    </button>
                </div>
           </div>
       )}

       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="master-box p-12 space-y-8 bg-black/40">
                   <div className="flex justify-between items-center text-indigo-500">
                        <Users size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Registry</span>
                   </div>
                   <h3 className="text-6xl font-black text-white italic">{profiles.length}</h3>
                   <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Identity Nodes Online</p>
               </div>
               <div className="master-box p-12 space-y-8 bg-black/40 border-red-500/10">
                   <div className="flex justify-between items-center text-red-500">
                        <ShieldAlert size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Terminated Nodes</span>
                   </div>
                   <h3 className="text-6xl font-black text-white italic">{profiles.filter(p => p.isBanned).length}</h3>
                   <p className="text-[9px] font-black text-red-950 uppercase tracking-[0.5em]">Protocol Violations Locked</p>
               </div>
           </div>
       )}
       
       <div className="text-center py-20 opacity-20">
           <AdminIcon size={48} className="mx-auto text-white mb-4" />
           <p className="text-[10px] font-black uppercase tracking-[0.6em]">Sushil Pokharel Master Authority Terminal</p>
       </div>
    </div>
  );
};
