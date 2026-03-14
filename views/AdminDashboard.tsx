
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, SupportTicket, TicketMessage, View, ChangeRequest } from '../types';
import { 
  Users, ShieldAlert, Terminal, Radio, Megaphone, Zap, RefreshCw, Key, FileCheck, CheckCircle2, XCircle, Search, ShieldCheck, Undo2
} from 'lucide-react';
import { useModal } from '../components/ModalProvider';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { ADMIN_USERNAME, CREATOR_NAME, ADMIN_EMAIL, APP_VERSION } from '../constants';

type AdminView = 'OVERVIEW' | 'NODES' | 'SUPPORT' | 'BROADCAST' | 'AUDITS' | 'RECOVERY' | 'SMTP' | 'COMPOSE';

interface AdminDashboardProps {
    onNavigate: (view: View) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<(UserProfile & { _username: string })[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [broadcastText, setBroadcastText] = useState('');
  const [smtpSettings, setSmtpSettings] = useState({ host: '', port: '587', user: '', pass: '', fromEmail: '', fromName: 'StudentPocket System' });
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);
  const { showAlert } = useModal();

  useEffect(() => {
    loadData();
    const current = localStorage.getItem('sp_global_broadcast');
    if (current) setBroadcastText(current);
    const smtp = localStorage.getItem('sp_smtp_settings');
    if (smtp) setSmtpSettings(JSON.parse(smtp));
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
            showAlert('Success', `Recovery portal activated for node: ${target.username}`);
          } else {
            const updated = allReqs.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r);
            localStorage.setItem('studentpocket_requests', JSON.stringify(updated));
            showAlert('Terminated', "Recovery request terminated.");
          }
          loadData();
      }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!composeForm.to || !composeForm.subject || !composeForm.body) {
          showAlert('Error', 'All fields are required for dispatch.');
          return;
      }
      setIsSending(true);
      const success = await emailService.sendCustomEmail(composeForm.to, composeForm.subject, composeForm.body);
      setIsSending(false);
      if (success) {
          showAlert('Success', 'Email dispatched successfully.');
          setComposeForm({ to: '', subject: '', body: '' });
      } else {
          showAlert('Warning', 'SMTP dispatch failed. Mailto fallback triggered.');
      }
  };

  const audits = requests.filter(r => r.type === 'VERIFICATION');
  const recoveries = requests.filter(r => r.type === 'RECOVERY' && r.status === 'PENDING');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="pb-32 space-y-12"
    >
       <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/10 pb-10">
           <div className="space-y-4">
               <div className="inline-flex items-center gap-2 bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/10 text-[10px] font-semibold uppercase tracking-widest">
                 <ShieldCheck size={12}/> Master Architect: {CREATOR_NAME}
               </div>
               <h1 className="text-4xl sm:text-6xl font-display italic tracking-tight leading-none">Control Grid</h1>
               <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{APP_VERSION} Core</p>
           </div>
           <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
               {(['OVERVIEW', 'NODES', 'AUDITS', 'RECOVERY', 'BROADCAST', 'SMTP', 'COMPOSE'] as AdminView[]).map((m) => (
                   <button 
                    key={m} 
                    onClick={() => setViewMode(m)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                   >
                       {m}
                   </button>
               ))}
           </div>
       </motion.div>

       <AnimatePresence mode="wait">
         <motion.div
           key={viewMode}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
         >
           {viewMode === 'RECOVERY' && (
               <div className="space-y-6">
                    <div className="glass-card p-8 mb-10 flex items-center gap-6">
                        <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                          <Undo2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display italic leading-none">Identity Restoration</h2>
                            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mt-2">Pending Access Key Recovery Nodes</p>
                        </div>
                    </div>
                    {recoveries.length === 0 && (
                      <div className="glass-card py-20 flex flex-col items-center justify-center opacity-50">
                        <CheckCircle2 size={48} className="mb-4 text-white/20" />
                        <p className="text-xs font-semibold uppercase tracking-widest">No recovery appeals in registry</p>
                      </div>
                    )}
                    {recoveries.map(req => (
                        <div key={req.id} className="glass-card p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div>
                                <h3 className="text-xl font-medium">{req.username}</h3>
                                <p className="text-[10px] text-white/40 font-semibold tracking-widest uppercase mt-1">Request Node: {req.id}</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handleAuthorizeRecovery(req.id, 'REJECT')} className="px-8 py-3 bg-red-500/10 text-red-400 rounded-xl font-semibold text-xs transition-colors hover:bg-red-500/20">Decline</button>
                                <button onClick={() => handleAuthorizeRecovery(req.id, 'APPROVE')} className="btn-premium px-8 py-3 text-xs">Approve Reset</button>
                            </div>
                        </div>
                    ))}
               </div>
           )}

           {viewMode === 'OVERVIEW' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="glass-card p-10 space-y-8">
                       <div className="flex justify-between items-center text-white/40">
                            <Users size={24} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Active Mesh</span>
                       </div>
                       <h3 className="text-6xl font-display italic">{profiles.length}</h3>
                       <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Personnel Nodes Online</p>
                   </div>
                   <div className="glass-card p-10 space-y-8">
                       <div className="flex justify-between items-center text-amber-400/60">
                            <RefreshCw size={24} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Recovery Queue</span>
                       </div>
                       <h3 className="text-6xl font-display italic">{recoveries.length}</h3>
                       <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Restoration Appeals</p>
                   </div>
                   <div className="glass-card p-10 space-y-8">
                       <div className="flex justify-between items-center text-emerald-400/60">
                            <FileCheck size={24} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Identity Audit</span>
                       </div>
                       <h3 className="text-6xl font-display italic">{audits.filter(a => a.status === 'PENDING').length}</h3>
                       <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Personnel Pending Audit</p>
                   </div>
               </div>
           )}
           
           {viewMode === 'NODES' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map(p => (
                        <div key={p._username} className="glass-card p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden shrink-0">
                                    <img src={p.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"} className="w-full h-full object-cover opacity-70" alt="Avatar" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest ${p.isBanned ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {p.isBanned ? 'Terminated' : 'Active'}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium truncate">{p.name}</h3>
                                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">ID KEY: {p.studentId || p._username}</p>
                            </div>
                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Mesh Integrity</span>
                                <span className={`text-sm font-medium ${p.integrityScore < 50 ? 'text-red-400' : 'text-emerald-400'}`}>{p.integrityScore}%</span>
                            </div>
                        </div>
                    ))}
               </div>
           )}

           {viewMode === 'SMTP' && (
               <div className="glass-card p-10 max-w-2xl mx-auto">
                   <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                           <Radio size={24} />
                       </div>
                       <div>
                           <h2 className="text-2xl font-display italic tracking-tight">SMTP Configuration</h2>
                           <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">Global Email Dispatch Settings</p>
                       </div>
                   </div>
                   
                   <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-6">
                           <div>
                               <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">SMTP Host</label>
                               <input type="text" value={smtpSettings.host} onChange={e => setSmtpSettings({...smtpSettings, host: e.target.value})} className="input-field" placeholder="smtp.example.com" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">SMTP Port</label>
                               <input type="text" value={smtpSettings.port} onChange={e => setSmtpSettings({...smtpSettings, port: e.target.value})} className="input-field" placeholder="587" />
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                           <div>
                               <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">SMTP User</label>
                               <input type="text" value={smtpSettings.user} onChange={e => setSmtpSettings({...smtpSettings, user: e.target.value})} className="input-field" placeholder="user@example.com" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">SMTP Password</label>
                               <input type="password" value={smtpSettings.pass} onChange={e => setSmtpSettings({...smtpSettings, pass: e.target.value})} className="input-field" placeholder="••••••••" />
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                           <div>
                               <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">From Email</label>
                               <input type="text" value={smtpSettings.fromEmail} onChange={e => setSmtpSettings({...smtpSettings, fromEmail: e.target.value})} className="input-field" placeholder="noreply@example.com" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">From Name</label>
                               <input type="text" value={smtpSettings.fromName} onChange={e => setSmtpSettings({...smtpSettings, fromName: e.target.value})} className="input-field" placeholder="StudentPocket System" />
                           </div>
                       </div>
                       
                       <div className="pt-6 border-t border-white/10 flex justify-end">
                           <button 
                               onClick={() => {
                                   localStorage.setItem('sp_smtp_settings', JSON.stringify(smtpSettings));
                                   showAlert('Success', 'SMTP configuration updated successfully.');
                               }}
                               className="px-8 py-4 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                           >
                               Save Configuration
                           </button>
                       </div>
                   </div>
               </div>
           )}

           {viewMode === 'COMPOSE' && (
               <div className="glass-card p-10 max-w-2xl mx-auto">
                   <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                           <Megaphone size={24} />
                       </div>
                       <div>
                           <h2 className="text-2xl font-display italic tracking-tight">Compose Mail</h2>
                           <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">Direct SMTP Dispatch</p>
                       </div>
                   </div>
                   
                   <form onSubmit={handleSendEmail} className="space-y-6">
                       <div>
                           <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Recipient Email</label>
                           <input 
                               type="email" 
                               required
                               value={composeForm.to} 
                               onChange={e => setComposeForm({...composeForm, to: e.target.value})} 
                               className="input-field" 
                               placeholder="user@example.com" 
                           />
                       </div>
                       <div>
                           <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Subject</label>
                           <input 
                               type="text" 
                               required
                               value={composeForm.subject} 
                               onChange={e => setComposeForm({...composeForm, subject: e.target.value})} 
                               className="input-field" 
                               placeholder="Message Subject" 
                           />
                       </div>
                       <div>
                           <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Message Body</label>
                           <textarea 
                               required
                               value={composeForm.body} 
                               onChange={e => setComposeForm({...composeForm, body: e.target.value})} 
                               className="input-field min-h-[200px] resize-y" 
                               placeholder="Type your message here..." 
                           />
                       </div>
                       
                       <div className="pt-6 border-t border-white/10 flex justify-end">
                           <button 
                               type="submit"
                               disabled={isSending}
                               className="px-8 py-4 rounded-xl bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                           >
                               {isSending ? 'Dispatching...' : 'Send Message'}
                           </button>
                       </div>
                   </form>
               </div>
           )}
         </motion.div>
       </AnimatePresence>

       <motion.div variants={item} className="text-center py-20 opacity-20 border-t border-white/5">
           <ShieldCheck size={40} className="mx-auto text-white mb-6" />
           <p className="text-[10px] font-semibold uppercase tracking-widest">Sushil Pokharel Authority Terminal build v23</p>
       </motion.div>
    </motion.div>
  );
};
