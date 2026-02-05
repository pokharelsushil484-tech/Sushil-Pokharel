
import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types';
import { CheckCircle2, XCircle, Plus, BookOpen, Trash2, TrendingUp, Info } from 'lucide-react';
import { storageService } from '../services/storageService';

export const AttendanceTracker: React.FC<{ username: string }> = ({ username }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    loadRecords();
  }, [username]);

  const loadRecords = async () => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (stored?.attendance) setRecords(stored.attendance);
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      subject: newSubject.toUpperCase(),
      present: 0,
      absent: 0,
      lastUpdated: Date.now()
    };
    const stored = await storageService.getData(`architect_data_${username}`);
    const updated = [newRecord, ...(stored?.attendance || [])];
    await storageService.setData(`architect_data_${username}`, { ...stored, attendance: updated });
    setRecords(updated);
    setNewSubject('');
  };

  const updateAttendance = async (id: string, type: 'present' | 'absent') => {
    const updated = records.map(r => {
      if (r.id === id) {
        return { ...r, [type]: r[type] + 1, lastUpdated: Date.now() };
      }
      return r;
    });
    const stored = await storageService.getData(`architect_data_${username}`);
    await storageService.setData(`architect_data_${username}`, { ...stored, attendance: updated });
    setRecords(updated);
  };

  const deleteSubject = async (id: string) => {
    if (!confirm("DELETE ATTENDANCE NODE?")) return;
    const updated = records.filter(r => r.id !== id);
    const stored = await storageService.getData(`architect_data_${username}`);
    await storageService.setData(`architect_data_${username}`, { ...stored, attendance: updated });
    setRecords(updated);
  };

  return (
    <div className="space-y-10 animate-platinum pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Presence Hub</h1>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.5em] mt-1">Institutional Attendance Sync</p>
        </div>
        <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 w-full sm:w-auto">
          <input 
            type="text" 
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            className="bg-transparent px-6 py-3 text-[10px] font-black text-white uppercase outline-none placeholder:text-slate-700 min-w-0"
            placeholder="ADD SUBJECT NODE..."
          />
          <button onClick={addSubject} className="p-3 bg-white text-black rounded-xl hover:bg-indigo-50 transition-all">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {records.map(record => {
          const total = record.present + record.absent;
          const percent = total > 0 ? (record.present / total) * 100 : 0;
          return (
            <div key={record.id} className="master-box p-8 bg-black/40 border-white/5 group hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500 border border-white/5">
                  <BookOpen size={24} />
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Score Rate</span>
                  <span className={`text-4xl font-black italic ${percent < 75 ? 'text-red-500' : 'text-white'}`}>{percent.toFixed(0)}%</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 truncate italic">{record.subject}</h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => updateAttendance(record.id, 'present')}
                  className="flex flex-col items-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                >
                  <span className="text-[8px] font-black text-emerald-500 uppercase mb-2">Present</span>
                  <span className="text-2xl font-black text-white">{record.present}</span>
                </button>
                <button 
                  onClick={() => updateAttendance(record.id, 'absent')}
                  className="flex flex-col items-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <span className="text-[8px] font-black text-red-500 uppercase mb-2">Absent</span>
                  <span className="text-2xl font-black text-white">{record.absent}</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp size={12} />
                  <span className="text-[9px] font-bold uppercase">{total} SESSIONS LOGGED</span>
                </div>
                <button onClick={() => deleteSubject(record.id)} className="text-slate-800 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
