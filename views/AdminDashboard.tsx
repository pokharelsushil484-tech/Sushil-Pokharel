import React, { useState, useEffect } from 'react';
import { UserProfile, ChangeRequest, SupportTicket } from '../types';
import { 
  Users, ShieldCheck, RefreshCw, User, Lock, 
  ShieldAlert, Key, BadgeCheck, ShieldX, Ban, UserPlus, Send, Loader2, Database
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ADMIN_USERNAME, DEFAULT_USER, SYSTEM_DOMAIN } from '../constants';

type AdminView = 'OVERVIEW' | 'USERS' | 'PROVISION' | 'LINKS';

export const AdminDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [provisioning, setProvisioning] = useState({ username: '', password: '', fullName: '', email: '' });
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  const [msKey, setMsKey] = useState<string | null>(null);

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
        
        const keys = await storageService.getSystemKeys();
        setMsKey(keys.msCode);
    } catch (error) {
        console.error("Dashboard Sync Error:", error);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!provisioning.username || !provisioning.password) return;
      setIsProvisioning(true);

      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      if (users[provisioning.username]) {
          alert("Error: Node ID already exists in registry.");
          setIsProvisioning(false);
          return;
      }

      // 1. Update Global Registry (allows login from any "device")
      users[provisioning.username] = { 
          password: provisioning.password, 
          name: provisioning.fullName || provisioning.username, 
          email: provisioning.email || `node@${SYSTEM_DOMAIN}`, 
          verified: true 
      };
      localStorage.setItem('studentpocket_users', JSON.stringify(users));

      // 2. Initialize Data Node
      const profile: UserProfile = {
          ...DEFAULT_USER,
          name: provisioning.fullName || provisioning.username,
          email: provisioning.email || `node@${SYSTEM_DOMAIN}`,
          isVerified: true,
          verificationStatus: 'VERIFIED',
          level: 1,
          studentId: `STP-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await storageService.setData(`architect_data_${provisioning.username}`, { user: profile, vaultDocs: [], assignments: [] });

      setTimeout(() => {
          setProvisioning({ username: '', password: '', fullName: '', email: '' });
          setIsProvisioning(false);
          loadData();
          alert("Node Provisioned Successfully. User can now log in on any device.");
      }, 1000);
  };

  const toggleVerification = async (username: string, currentStatus: boolean) => {
      const dataKey = `architect_data_${username}`;
      const data = await storageService.getData(dataKey);
      if (data && data.user) {
          data.user.isVerified = !currentStatus;
          data.user.verificationStatus = !currentStatus ? 'VERIFIED' : 'NONE';
          await storageService.setData(dataKey, data);
          loadData();
      }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING' && r.type === 'VERIFICATION');

  return (
    <div className="pb-32 animate-platinum space-y-10">
       <div className="flex justify-between items-end border-b border-white/5 pb-8">
           <div>
               <div className="stark-badge mb-3">Lead Architect Hub</div>
               <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Command Matrix</h1>
           </div>
           <div className="flex gap-4">
               {['OVERVIEW', 'USERS', 'PROVISION', 'LINKS'].map((m) => (
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
                   <div className="flex justify-between items-center text-amber-500">
                        <ShieldAlert />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auth Pending</span>
                   </div>
                   <h3 className="text-5xl font-black text-white italic">{pendingRequests.length}</h3>
               </div>
               <div className="master-box p-10 space-y-6 border-indigo-500/20">
                   <div className="flex justify-between items-center text-emerald-500">
                        <Key />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Link</span>
                   </div>
                   <div className="bg-black/50 p-4 rounded-xl text-center font-mono text-xl text-emerald-400 tracking-widest">
                        {msKey || 'SYNCING...'}
                   </div>
               </div>
           </div>
       )}

       {viewMode === 'PROVISION' && (
           <div className="max-w-2xl mx-auto master-box p-12 border border-indigo-500/30">
               <div className="flex items-center space-x-6 mb-12">
                   <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                       <UserPlus size={32} />
                   </div>
                   <div>
                       <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Personnel Provisioning</h2>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instant Node Deployment</p>
                   </div>
               </div>
               <form onSubmit={handleProvision} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Node ID</label>
                            <input value={provisioning.username} onChange={e => setProvisioning({...provisioning, username: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="e.g. user_x" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Security Token</label>
                            <input type="password" value={provisioning.password} onChange={e => setProvisioning({...provisioning, password: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="e.g. secret_123" required />
                        </div>
                   </div>
                   <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Full Name</label>
                        <input value={provisioning.fullName} onChange={e => setProvisioning({...provisioning, fullName: e.target.value})} className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500" placeholder="LEGAL SIGNATURE" />
                   </div>
                   <button type="submit" disabled={isProvisioning} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center">
                       {isProvisioning ? <Loader2 className="animate-spin" /> : 'Provision Node'}
                   </button>
               </form>
           </div>
       )}

       {viewMode === 'USERS' && (
           <div className="master-box overflow-hidden">
               <table className="w-full text-left">
                   <thead className="bg-white/5 border-b border-white/5">
                       <tr>
                           <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity Node</th>
                           <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                           <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                       {profiles.map((p: any) => (
                           <tr key={p._username} className="hover:bg-white/[0.02]">
                               <td className="p-8">
                                   <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs">{p.name[0]}</div>
                                       <div>
                                           <div className="text-sm font-black text-white italic">{p.name} {p.isVerified && <BadgeCheck size={14} className="inline text-indigo-400 ml-2" />}</div>
                                           <div className="text-[9px] text-slate-500 font-bold uppercase">{p.email}</div>
                                       </div>
                                   </div>
                               </td>
                               <td className="p-8">
                                    <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.isVerified ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'}`}>
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
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}
    </div>
  );
};