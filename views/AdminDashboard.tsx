
import React, { useState, useEffect } from 'react';
import { UserProfile, SupportTicket, TicketMessage, View, ChangeRequest } from '../types';
import { 
  Users, ShieldAlert, Terminal, Radio, Megaphone, Zap, RefreshCw, Key, FileCheck, CheckCircle2, XCircle, Search, ShieldCheck, Undo2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { ADMIN_USERNAME, CREATOR_NAME, ADMIN_EMAIL, APP_VERSION } from '../constants';

type AdminView = 'OVERVIEW' | 'NODES' | 'SUPPORT' | 'BROADCAST' | 'AUDITS' | 'RECOVERY';

interface AdminDashboardProps {
    onNavigate: (view: View) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
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

    const reqStr = localStorage.getItem('studentpocket_requests');
    if (reqStr) setRequests(JSON.parse(reqStr));
  };

  const handleAuthorizeRecovery = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
      const allReqs: ChangeRequest[] = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
      const target = allReqs.find(r => r.id === requestId);
      if (!target) return;

      const dataKey = `architect_data_${target.username.toUpperCase()}`;
      const stored = await storageService.getData(dataKey);
      
      if (stored && stored.user) {
          if (action === 'APPROVE') {
            await emailService.sendInstitutionalMail(stored.user.email, target.linkId, 'PASSWORD_RECOVERY_LINK', target.username);
            alert(`RECOVERY PORTAL ACTIVATED FOR NODE: ${target.username}`);
          } else {
            const updated = allReqs.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r);
            localStorage.setItem('studentpocket_requests', JSON.stringify(updated));
            alert("RECOVERY REQUEST TERMINATED.");
          }
          loadData();
      }
  };

  const audits = requests.filter(r => r.type === 'VERIFICATION');
  const recoveries = requests.filter(r => r.type === 'RECOVERY' && r.status === 'PENDING');

  return (
    <div className="pb-32 animate-platinum space-y-12 uppercase">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/10 pb-10">
           <div className="space-y-4">
               <div className="stark-badge">Master Architect: {CREATOR_NAME}</div>
               <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Control Grid</h1>
               <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">{APP_VERSION} CORE</p>
           </div>
           <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
               {(['OVERVIEW', 'NODES', 'AUDITS', 'RECOVERY', 'BROADCAST'] as AdminView[]).map((m) => (
                   <button 
                    key={m} 
                    onClick={() => setViewMode(m)}
                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                   >
                       {m}
                   </button>
               ))}
           </div>
       </div>

       {viewMode === 'RECOVERY' && (
           <div className="space-y-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 mb-10 flex items-center gap-6">
                    <Undo2 className="text-amber-500" size={32} />
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic leading-none">Identity Restoration</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Pending Access Key Recovery Nodes</p>
                    </div>
                </div>
                {recoveries.length === 0 && <p className="text-center py-20 text-slate-600 font-black text-xs uppercase tracking-widest">No recovery appeals in registry</p>}
                {recoveries.map(req => (
                    <div key={req.id} className="master-box p-8 bg-black/40 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase">{req.username}</h3>
                            <p className="text-[9px] text-slate-500 font-bold tracking-widest">Request Node: {req.id}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleAuthorizeRecovery(req.id, 'REJECT')} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-500/20">Decline</button>
                            <button onClick={() => handleAuthorizeRecovery(req.id, 'APPROVE')} className="px-8 py-4 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">Approve Reset</button>
                        </div>
                    </div>
                ))}
           </div>
       )}

       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="master-box p-12 space-y-10 bg-black/40">
                   <div className="flex justify-between items-center text-indigo-500">
                        <Users size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Mesh</span>
                   </div>
                   <h3 className="text-7xl font-black text-white italic">{profiles.length}</h3>
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Personnel Nodes Online</p>
               </div>
               <div className="master-box p-12 space-y-10 bg-black/40 border-amber-500/10">
                   <div className="flex justify-between items-center text-amber-400">
                        <RefreshCw size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recovery Queue</span>
                   </div>
                   <h3 className="text-7xl font-black text-white italic">{recoveries.length}</h3>
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Restoration Appeals</p>
               </div>
               <div className="master-box p-12 space-y-10 bg-black/40 border-indigo-500/10">
                   <div className="flex justify-between items-center text-indigo-400">
                        <FileCheck size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Identity Audit</span>
                   </div>
                   <h3 className="text-7xl font-black text-white italic">{audits.filter(a => a.status === 'PENDING').length}</h3>
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Personnel Pending Audit</p>
               </div>
           </div>
       )}
       
       {viewMode === 'NODES' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map(p => (
                    <div key={p._username} className="master-box p-10 bg-black/40 border-white/5 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                <img src={p.avatar} className="w-full h-full object-cover opacity-50" />
                            </div>
                            <div className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.isBanned ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'}`}>
                                {p.isBanned ? 'TERMINATED' : 'ACTIVE'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic truncate">{p.name}</h3>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">ID KEY: {p.studentId || p._username.toUpperCase()}</p>
                        </div>
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Mesh Integrity</span>
                            <span className={`text-sm font-black italic ${p.integrityScore < 50 ? 'text-red-500' : 'text-emerald-500'}`}>{p.integrityScore}%</span>
                        </div>
                    </div>
                ))}
           </div>
       )}

       <div className="text-center py-24 opacity-20 border-t border-white/5">
           <ShieldCheck size={56} className="mx-auto text-white mb-6" />
           <p className="text-[11px] font-black uppercase tracking-[0.6em] italic">Sushil Pokharel Authority Terminal build v23</p>
       </div>
    </div>
  );
};
