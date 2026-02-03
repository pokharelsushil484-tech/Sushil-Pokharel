
import React, { useState, useEffect } from 'react';
import { UserProfile, SupportTicket, TicketMessage, View } from '../types';
import { 
  Users, Trash2, Ban as BanIcon, ShieldOff, BadgeCheck, 
  UserPlus, Loader2, Terminal, Lock, Mail,
  CheckCircle2, XCircle, ShieldAlert, ShieldCheck, MessageSquare, Send, Clock, ChevronRight, AlertOctagon, Gavel, Trash
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { emailService, DispatchType } from '../services/emailService';
import { ADMIN_USERNAME, DEFAULT_USER, SYSTEM_DOMAIN, ADMIN_EMAIL } from '../constants';

type AdminView = 'OVERVIEW' | 'USERS' | 'SUPPORT' | 'COMMUNICATIONS';

interface AdminDashboardProps {
    onNavigate: (view: View) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  
  // Dispatch State
  const [selectedNode, setSelectedNode] = useState('');
  const [dispatchType, setDispatchType] = useState<DispatchType>('SYSTEM_UPDATE');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    loadData();
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
  };

  const handleComposeDispatch = async () => {
    const node = profiles.find(p => p._username === selectedNode);
    if (!node) {
        alert("Select a target node for composition.");
        return;
    }

    await emailService.sendInstitutionalMail(
        node.email, 
        customMessage || "Standard Institutional Protocol Action", 
        dispatchType, 
        node._username
    );
    alert(`Dispatch prepared for ${node._username}. Proceed to composition.`);
  };

  return (
    <div className="pb-32 animate-platinum space-y-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-10">
           <div>
               <div className="stark-badge mb-4">Master Architect Terminal</div>
               <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Authority<br/>Command</h1>
           </div>
           <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-2xl">
               {(['OVERVIEW', 'USERS', 'SUPPORT', 'COMMUNICATIONS'] as AdminView[]).map((m) => (
                   <button 
                    key={m} 
                    onClick={() => setViewMode(m)}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                   >
                       {m}
                   </button>
               ))}
           </div>
       </div>

       {viewMode === 'COMMUNICATIONS' && (
           <div className="max-w-4xl mx-auto space-y-10">
                <div className="master-box p-12 bg-black/40 border-white/10 space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-white">
                            <Mail size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic">Administrative Relay</h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Compose Institutional Notifications</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Target Node (Username)</label>
                            <select 
                                value={selectedNode} 
                                onChange={e => setSelectedNode(e.target.value)}
                                className="w-full p-5 bg-black border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none"
                            >
                                <option value="">SELECT USER NODE...</option>
                                {profiles.map(p => (
                                    <option key={p._username} value={p._username}>{p.name} ({p._username.toUpperCase()})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Dispatch Category</label>
                            <select 
                                value={dispatchType} 
                                onChange={e => setDispatchType(e.target.value as DispatchType)}
                                className="w-full p-5 bg-black border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none"
                            >
                                <option value="SYSTEM_UPDATE">SYSTEM UPDATE / NEWS</option>
                                <option value="VERIFIED_NOTICE">IDENTITY VERIFIED</option>
                                <option value="BAN_NOTICE">ACCOUNT BAN</option>
                                <option value="TERMINATION_NOTICE">NODE TERMINATION</option>
                                <option value="DELETION_NOTICE">DATA DELETION</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Message / Reason Payload</label>
                        <textarea 
                            value={customMessage}
                            onChange={e => setCustomMessage(e.target.value)}
                            rows={4}
                            className="w-full p-6 bg-black border border-white/10 rounded-3xl font-medium text-white outline-none focus:border-indigo-500 transition-all resize-none"
                            placeholder="Enter the specific reason or update details here..."
                        />
                    </div>

                    <button 
                        onClick={handleComposeDispatch}
                        className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-4"
                    >
                        <Send size={20} />
                        Open Admin Composition Node
                    </button>
                </div>
                
                <div className="text-center opacity-40">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Authorization Point: pokharelsushil242@gmail.com</p>
                </div>
           </div>
       )}

       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="master-box p-12 space-y-8 bg-black/40">
                   <div className="flex justify-between items-center text-indigo-500">
                        <Users size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Nodes</span>
                   </div>
                   <h3 className="text-6xl font-black text-white italic">{profiles.length}</h3>
               </div>
           </div>
       )}

       {viewMode === 'USERS' && (
           <div className="master-box overflow-hidden border-white/5 bg-black/20">
               <div className="p-12 text-center text-slate-500 uppercase font-black text-[10px] tracking-widest italic">
                  Node Registry Active and Monitoring.
               </div>
           </div>
       )}
    </div>
  );
};
