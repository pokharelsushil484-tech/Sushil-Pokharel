import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceRecord, UserProfile, SubscriptionTier } from '../types';
import { CheckCircle2, XCircle, Plus, BookOpen, Trash2, TrendingUp, Info, GraduationCap } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useModal } from '../components/ModalProvider';

interface AttendanceTrackerProps {
  username: string;
  user: UserProfile;
  updateUser: (user: UserProfile) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ username, user, updateUser }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const { showConfirm } = useModal();

  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;

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
  };

  const deleteSubject = async (id: string) => {
    showConfirm('Delete Record', "Delete attendance record?", async () => {
      const updated = records.filter(r => r.id !== id);
      const stored = await storageService.getData(`architect_data_${username}`);
      await storageService.setData(`architect_data_${username}`, { ...stored, attendance: updated });
      setRecords(updated);
    });
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
      <motion.div variants={item} className={`flex flex-col sm:flex-row justify-between items-center gap-6 p-8 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
        <div>
          <h1 className={`text-3xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Presence Hub</h1>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Institutional Attendance Sync</p>
        </div>
        <div className={`flex p-2 w-full sm:w-auto ${isPro ? 'rounded-xl bg-amber-950/20 border border-amber-500/20' : 'rounded-none bg-gray-200 border-2 border-gray-500'}`}>
          <input 
            type="text" 
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            className={`bg-transparent px-4 py-2 text-xs font-medium outline-none min-w-0 flex-1 ${isPro ? 'text-amber-100 placeholder:text-amber-500/20' : 'text-gray-900 placeholder:text-gray-500'}`}
            placeholder="Add subject node..."
          />
          <button onClick={addSubject} className={`p-2 transition-all ${isPro ? 'rounded-lg bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'}`}>
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
                className={`p-8 group transition-all ${isPro ? 'glass-card hover:border-amber-500/30 border-amber-500/10' : 'bg-gray-200 border-2 border-gray-500 rounded-none'}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-12 h-12 flex items-center justify-center border ${isPro ? 'rounded-xl bg-amber-950/20 text-amber-400 border-amber-500/20' : 'rounded-none bg-gray-400 text-gray-800 border-gray-500'}`}>
                    <GraduationCap size={20} />
                  </div>
                  <div className="text-right">
                    <span className={`block text-[8px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Score Rate</span>
                    <span className={`text-3xl ${percent < 75 ? 'text-red-600' : (isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900')}`}>{percent.toFixed(0)}%</span>
                  </div>
                </div>

                <h3 className={`text-lg tracking-tight mb-8 truncate ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{record.subject}</h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => updateAttendance(record.id, 'present')}
                    className={`flex flex-col items-center p-4 border transition-all group/btn ${isPro ? 'rounded-xl bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' : 'rounded-none bg-green-200 border-green-500 hover:bg-green-300'}`}
                  >
                    <span className={`text-[8px] font-bold uppercase mb-2 ${isPro ? 'text-emerald-400' : 'text-green-800'}`}>Present</span>
                    <span className={`text-xl group-hover/btn:scale-110 transition-transform ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{record.present}</span>
                  </button>
                  <button 
                    onClick={() => updateAttendance(record.id, 'absent')}
                    className={`flex flex-col items-center p-4 border transition-all group/btn ${isPro ? 'rounded-xl bg-red-500/10 border-red-500/20 hover:bg-red-500/20' : 'rounded-none bg-red-200 border-red-500 hover:bg-red-300'}`}
                  >
                    <span className={`text-[8px] font-bold uppercase mb-2 ${isPro ? 'text-red-400' : 'text-red-800'}`}>Absent</span>
                    <span className={`text-xl group-hover/btn:scale-110 transition-transform ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{record.absent}</span>
                  </button>
                </div>

                <div className={`flex justify-between items-center pt-6 border-t ${isPro ? 'border-amber-500/10' : 'border-gray-400'}`}>
                  <div className={`flex items-center gap-2 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>
                    <TrendingUp size={12} />
                    <span className="text-[9px] font-semibold uppercase tracking-widest">{total} Sessions Logged</span>
                  </div>
                  <button onClick={() => deleteSubject(record.id)} className={`transition-colors p-2 ${isPro ? 'text-white/20 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}>
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
