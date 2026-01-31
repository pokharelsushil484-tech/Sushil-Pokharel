
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
// Added missing ShieldCheck import
import { 
  Users, Trash2, Ban as BanIcon, ShieldOff, BadgeCheck, 
  UserPlus, Loader2, Terminal, Lock, Mail,
  CheckCircle2, XCircle, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ADMIN_USERNAME, DEFAULT_USER, SYSTEM_DOMAIN } from '../constants';

type AdminView = 'OVERVIEW' | 'USERS' | 'PROVISION';

export const AdminDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<AdminView>('OVERVIEW');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [provisioning, setProvisioning] = useState({ username: '', password: '', fullName: '', email: '' });
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [processingUser, setProcessingUser] = useState<string | null>(null);

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
    } catch (error) {
        console.error("Dashboard Sync Error:", error);
    }
  };

  const toggleVerification = async (username: string, currentStatus: boolean) => {
    setProcessingUser(username);
    try {
        await storageService.toggleVerificationNode(username, !currentStatus);
        await loadData();
    } catch (e) {
        console.error("Verification toggle fault:", e);
    } finally {
        setProcessingUser(null);
    }
  };

  const handleAction = async (username: string, action: 'SUSPEND' | 'BAN' | 'DELETE') => {
      if (!window.confirm(`CRITICAL: Confirm ${action} action on node ${username.toUpperCase()}?`)) return;
      
      setProcessingUser(username);
      const dataKey = `architect_data_${username}`;
      
      try {
          if (action === 'DELETE') {
              const users = JSON.parse(localStorage.getItem('studentpocket_users') || '{}');
              delete users[username];
              localStorage.setItem('studentpocket_users', JSON.stringify(users));
              await storageService.deleteData(dataKey);
          } else if (action === 'BAN') {
              await storageService.enforceSecurityLockdown(username, "MANUAL ADMINISTRATIVE TERMINATION", "Lead Architect decision.");
          } else if (action === 'SUSPEND') {
              await storageService.suspendUserNode(username, "Administrative review required.");
          }
          await loadData();
      } catch (e) {
          console.error("Admin Action Fault:", e);
      } finally {
          setProcessingUser(null);
      }
  };

  const handleProvision = async (e: React.FormEvent) => {
      e.preventDefault();
      const uId = provisioning.username.toLowerCase();
      if (!uId || !provisioning.password) return;
      setIsProvisioning(true);

      const usersStr = localStorage.getItem('studentpocket_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      if (users[uId]) {
          alert("Error: Node ID already exists in encrypted registry.");
          setIsProvisioning(false);
          return;
      }

      users[uId] = { 
          password: provisioning.password, 
          name: provisioning.fullName || provisioning.username, 
          email: provisioning.email || `node@${SYSTEM_DOMAIN}`, 
          verified: true 
      };
      localStorage.setItem('studentpocket_users', JSON.stringify(users));

      const profile: UserProfile = {
          ...DEFAULT_USER,
          name: provisioning.fullName || provisioning.username,
          email: provisioning.email || `node@${SYSTEM_DOMAIN}`,
          isVerified: true,
          verificationStatus: 'VERIFIED',
          level: 1,
          studentId: `STP-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await storageService.setData(`architect_data_${uId}`, { user: profile, vaultDocs: [], assignments: [] });

      setTimeout(() => {
          setProvisioning({ username: '', password: '', fullName: '', email: '' });
          setIsProvisioning(false);
          loadData();
      }, 1000);
  };

  return (
    <div className="pb-32 animate-platinum space-y-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-10">
           <div>
               <div className="stark-badge mb-4">Lead Architect Terminal</div>
               <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Authority<br/>Command</h1>
           </div>
           <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-2xl">
               {(['OVERVIEW', 'USERS', 'PROVISION'] as AdminView[]).map((m) => (
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

       {viewMode === 'OVERVIEW' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="master-box p-12 space-y-8 bg-black/40">
                   <div className="flex justify-between items-center text-indigo-500">
                        <Users size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Nodes</span>
                   </div>
                   <h3 className="text-6xl font-black text-white italic">{profiles.length}</h3>
               </div>
               <div className="master-box p-12 space-y-8 bg-black/40 border-amber-500/20">
                   <div className="flex justify-between items-center text-amber-500">
                        <ShieldAlert size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Suspended</span>
                   </div>
                   <h3 className="text-6xl font-black text-white italic">{profiles.filter(p => p.isSuspended).length}</h3>
               </div>
               <div className="master-box p-12 space-y-8 bg-black/40 border-red-500/20">
                   <div className="flex justify-between items-center text-red-500">
                        <ShieldOff size={32} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Terminated</span>
                   </div>
                   <h3 className="text-6xl font-black text-white italic">{profiles.filter(p => p.isBanned).length}</h3>
               </div>
           </div>
       )}

       {viewMode === 'USERS' && (
           <div className="master-box overflow-hidden border-white/5 bg-black/20">
               <div className="overflow-x-auto">
                   <table className="w-full text-left min-w-[900px]">
                       <thead className="bg-white/5 border-b border-white/5 font-black text-[10px] uppercase tracking-widest text-slate-500">
                           <tr>
                               <th className="p-8">Ident Node</th>
                               <th className="p-8">Clearance Registry</th>
                               <th className="p-8">Status</th>
                               <th className="p-8 text-center">Nuclear Actions</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                           {profiles.map((p: any) => (
                               <tr key={p._username} className="hover:bg-white/[0.02] transition-colors">
                                   <td className="p-8">
                                       <div className="flex items-center gap-6">
                                           <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-lg shadow-inner text-white uppercase">{p.name[0]}</div>
                                           <div>
                                               <div className="text-base font-black text-white italic uppercase tracking-tighter">{p.name} {p.isVerified && <BadgeCheck size={16} className="inline text-indigo-400 ml-2" />}</div>
                                               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">NODE: {p._username}</div>
                                           </div>
                                       </div>
                                   </td>
                                   <td className="p-8">
                                        <button 
                                            onClick={() => toggleVerification(p._username, p.isVerified)}
                                            disabled={processingUser === p._username}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border ${p.isVerified ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' : 'bg-white text-black border-white hover:bg-slate-200'}`}
                                        >
                                            {p.isVerified ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                            {p.isVerified ? 'Unverify Node' : 'Verify Node'}
                                        </button>
                                   </td>
                                   <td className="p-8">
                                        <div className="flex flex-col gap-2">
                                            <span className={`inline-flex items-center px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit ${p.isBanned ? 'bg-red-500/10 text-red-500' : p.isSuspended ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-3 ${p.isBanned ? 'bg-red-500' : p.isSuspended ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                {p.isBanned ? 'TERMINATED' : p.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                                            </span>
                                        </div>
                                   </td>
                                   <td className="p-8">
                                       <div className="flex items-center justify-center gap-3">
                                           <button 
                                                onClick={() => handleAction(p._username, 'SUSPEND')}
                                                disabled={p.isBanned || p.isSuspended || processingUser === p._username}
                                                className="p-3 bg-white/5 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-black transition-all border border-amber-500/20 disabled:opacity-10"
                                                title="Suspend Node"
                                           >
                                               <ShieldOff size={18} />
                                           </button>
                                           <button 
                                                onClick={() => handleAction(p._username, 'BAN')}
                                                disabled={p.isBanned || processingUser === p._username}
                                                className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-black transition-all border border-red-500/20 disabled:opacity-10"
                                                title="Permanent Termination"
                                           >
                                               <BanIcon size={18} />
                                           </button>
                                           <button 
                                                onClick={() => handleAction(p._username, 'DELETE')}
                                                disabled={processingUser === p._username}
                                                className="p-3 bg-white/5 rounded-xl text-slate-500 hover:bg-white hover:text-black transition-all border border-white/10"
                                                title="Delete Node"
                                           >
                                               <Trash2 size={18} />
                                           </button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       )}

       {viewMode === 'PROVISION' && (
           <div className="max-w-2xl mx-auto master-box p-12 border border-indigo-500/30 bg-black/40">
               <div className="flex items-center space-x-6 mb-12">
                   <div className="w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl">
                       <UserPlus size={32} />
                   </div>
                   <div>
                       <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Instant Node Deploy</h2>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Provision Institutional Access</p>
                   </div>
               </div>
               <form onSubmit={handleProvision} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Node ID</label>
                            <div className="relative">
                                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                <input value={provisioning.username} onChange={e => setProvisioning({...provisioning, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-indigo-500 transition-all text-xs" placeholder="USERNAME" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Master Token</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                <input type="password" value={provisioning.password} onChange={e => setProvisioning({...provisioning, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-indigo-500 transition-all text-xs" placeholder="SECRET KEY" required />
                            </div>
                        </div>
                   </div>
                   <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Full Signature</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                            <input value={provisioning.fullName} onChange={e => setProvisioning({...provisioning, fullName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-indigo-500 transition-all text-xs" placeholder="LEGAL NAME" />
                        </div>
                   </div>
                   <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Digital Node Mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                            <input value={provisioning.email} onChange={e => setProvisioning({...provisioning, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-indigo-500 transition-all text-xs" placeholder="EMAIL ADDRESS" />
                        </div>
                   </div>
                   <button type="submit" disabled={isProvisioning} className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center">
                       {isProvisioning ? <Loader2 className="animate-spin" /> : 'Settle Node Entry'}
                   </button>
               </form>
           </div>
       )}
    </div>
  );
};
