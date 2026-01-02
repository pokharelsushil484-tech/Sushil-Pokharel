
import React, { useState, useEffect } from 'react';
import { ChangeRequest, View, ActivityLog } from '../types';
import { 
  ShieldCheck, UserCheck, HardDrive, Plus, Minus, Activity, 
  Infinity as InfinityIcon, Check, ShieldX, UserMinus, UserPlus, BellRing, Eye, Trash2, FileClock, Search
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
  
  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, [refreshTrigger]);

  const handleProcessRequest = async (reqId: string, action: 'APPROVE' | 'REJECT') => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;

    const dataKey = `architect_data_${req.username}`;
    const stored = await storageService.getData(dataKey);
    
    if (stored) {
      stored.user.isVerified = action === 'APPROVE';
      stored.user.verificationStatus = action === 'APPROVE' ? 'VERIFIED' : 'NONE';
      await storageService.setData(dataKey, stored);
    }

    // Log the action
    await storageService.logActivity({
        actor: ADMIN_USERNAME,
        targetUser: req.username,
        actionType: 'ADMIN',
        description: `Authorization Signal ${action}: ${req.username}`,
        metadata: JSON.stringify({ requestId: reqId, action })
    });

    const updatedRequests = requests.filter(r => r.id !== reqId);
    localStorage.setItem('studentpocket_requests', JSON.stringify(updatedRequests));
    setRefreshTrigger(prev => prev + 1);
    setSelectedRequest(null);
  };

  const updateUserNode = async (username: string, updates: any) => {
    const dataKey = `architect_data_${username}`;
    const stored = await storageService.getData(dataKey);
    if (stored) {
        stored.user = { ...stored.user, ...updates };
        await storageService.setData(dataKey, stored);
        
        // Log the action
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

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Authority Console</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2">Node Control Nucleus</p>
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-3xl w-full md:w-auto overflow-x-auto">
            <button onClick={() => setViewMode('REQUESTS')} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${viewMode === 'REQUESTS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Signals ({requests.length})</button>
            <button onClick={() => setViewMode('NODES')} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${viewMode === 'NODES' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Active Nodes</button>
            <button onClick={() => setViewMode('LOGS')} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${viewMode === 'LOGS' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Audit Logs</button>
        </div>
      </div>

      {viewMode === 'REQUESTS' && (
        <div className="space-y-6">
           {requests.map(req => (
             <div key={req.id} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-6">
                   <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center animate-pulse"><BellRing size={28} /></div>
                   <div>
                      <p className="font-black text-lg uppercase tracking-tight dark:text-white">{req.username}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verification Form Signal</p>
                   </div>
                </div>
                <button onClick={() => setSelectedRequest(req)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                  <Eye size={24} />
                </button>
             </div>
           ))}
           {requests.length === 0 && <div className="text-center py-24 opacity-30 font-black uppercase tracking-widest text-xs">No pending authorization signals.</div>}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-[500] bg-slate-950/40 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Signal Review</h2>
                 <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-red-500"><Trash2 size={24}/></button>
              </div>
              <div className="space-y-8 mb-12">
                 {Object.entries(JSON.parse(selectedRequest.details)).map(([q, a]: [any, any]) => (
                   <div key={q} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Internal Query ID: {q}</p>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{a}</p>
                   </div>
                 ))}
              </div>
              <div className="flex space-x-4">
                 <button onClick={() => handleProcessRequest(selectedRequest.id, 'APPROVE')} className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl">Authorize Node</button>
                 <button onClick={() => handleProcessRequest(selectedRequest.id, 'REJECT')} className="flex-1 bg-red-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl">Deny Signal</button>
              </div>
           </div>
        </div>
      )}

      {viewMode === 'NODES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {usersList.map(u => (
              <div key={u.username} className={`p-10 rounded-[3rem] border flex flex-col justify-between transition-all ${u.isAdmin ? 'bg-slate-900 border-indigo-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                 <div className="flex items-center space-x-6 mb-10">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center font-black text-xl text-indigo-600">{u.username.charAt(0)}</div>
                    <div>
                        <p className={`font-black text-lg uppercase ${u.isAdmin ? 'text-white' : 'dark:text-white'}`}>{u.username}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">{u.isAdmin ? 'Architect' : u.isVerified ? 'Verified Node' : 'Locked Guest'}</p>
                    </div>
                 </div>
                 {!u.isAdmin && (
                   <div className="space-y-4">
                      <button onClick={() => updateUserNode(u.username, { isBanned: !u.isBanned })} className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest ${u.isBanned ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {u.isBanned ? 'Restore Authorization' : 'Suspend Node Access'}
                      </button>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <span className="text-[9px] font-black uppercase text-slate-500">Node Limit: {u.storageLimit}GB</span>
                          <div className="flex items-center space-x-2">
                              <button onClick={() => updateUserNode(u.username, { storageLimitGB: Math.max(1, u.storageLimit - 5) })} className="p-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm">-</button>
                              <button onClick={() => updateUserNode(u.username, { storageLimitGB: u.storageLimit + 5 })} className="p-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm">+</button>
                          </div>
                      </div>
                   </div>
                 )}
                 {u.isAdmin && <div className="p-8 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 text-center"><InfinityIcon className="text-indigo-500 mx-auto" size={40} /></div>}
              </div>
           ))}
        </div>
      )}

      {viewMode === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600"><FileClock size={24} /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white">System Activity</h2>
              </div>
              <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none dark:text-white"
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                  />
              </div>
           </div>
           
           <div className="max-h-[600px] overflow-y-auto no-scrollbar">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 backdrop-blur-md z-10">
                      <tr>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-6 text-xs font-bold text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="p-6 text-xs font-black uppercase dark:text-white">{log.actor}</td>
                              <td className="p-6">
                                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                      log.actionType === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' :
                                      log.actionType === 'AUTH' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                      log.actionType === 'DATA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      'bg-slate-50 text-slate-600 border-slate-100'
                                  }`}>
                                      {log.actionType}
                                  </span>
                              </td>
                              <td className="p-6 text-xs font-medium dark:text-slate-300">{log.description}</td>
                              <td className="p-6 text-xs font-bold text-slate-400 uppercase">{log.targetUser || '-'}</td>
                          </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                          <tr><td colSpan={5} className="p-12 text-center text-xs font-black text-slate-300 uppercase tracking-widest">No activity logs found.</td></tr>
                      )}
                  </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};
