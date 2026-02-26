
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceRecord, UserProfile } from '../types';
import { CheckCircle2, XCircle, Plus, BookOpen, Trash2, TrendingUp, Info, GraduationCap } from 'lucide-react';
import { storageService } from '../services/storageService';
import { upgradeService } from '../services/upgradeService';

interface AttendanceTrackerProps {
  username: string;
  user: UserProfile;
  updateUser: (user: UserProfile) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ username, user, updateUser }) => {
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
      subject: newSubject,
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

    const updatedUser = await upgradeService.updateTaskProgress(user, username, 'ATTENDANCE');
    updateUser(updatedUser);
  };

  const deleteSubject = async (id: string) => {
    if (!confirm("Delete attendance record?")) return;
    const updated = records.filter(r => r.id !== id);
    const stored = await storageService.getData(`architect_data_${username}`);
    await storageService.setData(`architect_data_${username}`, { ...stored, attendance: updated });
    setRecords(updated);
  };

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
      className="space-y-10 pb-24"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-center gap-6 glass-card p-8">
        <div>
          <h1 className="text-3xl font-display italic tracking-tight text-white">Presence Hub</h1>
          <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mt-1">Institutional Attendance Sync</p>
        </div>
        <div className="flex bg-white/5 p-2 rounded-xl border border-white/10 w-full sm:w-auto">
          <input 
            type="text" 
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            className="bg-transparent px-4 py-2 text-xs font-medium text-white outline-none placeholder:text-white/20 min-w-0 flex-1"
            placeholder="Add subject node..."
          />
          <button onClick={addSubject} className="p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all">
            <Plus size={16} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {records.map(record => {
            const total = record.present + record.absent;
            const percent = total > 0 ? (record.present / total) * 100 : 0;
            return (
              <motion.div 
                key={record.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-8 group hover:border-indigo-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 border border-white/5">
                    <GraduationCap size={20} />
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-semibold text-white/40 uppercase tracking-widest">Score Rate</span>
                    <span className={`text-3xl font-display italic ${percent < 75 ? 'text-red-400' : 'text-white'}`}>{percent.toFixed(0)}%</span>
                  </div>
                </div>

                <h3 className="text-lg font-display italic text-white tracking-tight mb-8 truncate">{record.subject}</h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => updateAttendance(record.id, 'present')}
                    className="flex flex-col items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group/btn"
                  >
                    <span className="text-[8px] font-bold text-emerald-400 uppercase mb-2">Present</span>
                    <span className="text-xl font-display italic text-white group-hover/btn:scale-110 transition-transform">{record.present}</span>
                  </button>
                  <button 
                    onClick={() => updateAttendance(record.id, 'absent')}
                    className="flex flex-col items-center p-4 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all group/btn"
                  >
                    <span className="text-[8px] font-bold text-red-400 uppercase mb-2">Absent</span>
                    <span className="text-xl font-display italic text-white group-hover/btn:scale-110 transition-transform">{record.absent}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/40">
                    <TrendingUp size={12} />
                    <span className="text-[9px] font-semibold uppercase tracking-widest">{total} Sessions Logged</span>
                  </div>
                  <button onClick={() => deleteSubject(record.id)} className="text-white/20 hover:text-red-400 transition-colors p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
