
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeRecord } from '../types';
import { 
  Plus, 
  Trash2, 
  PieChart, 
  Award, 
  GraduationCap, 
  BarChart3, 
  X, 
  Sparkles,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface AcademicLedgerProps {
  username: string;
}

export const AcademicLedger: React.FC<AcademicLedgerProps> = ({ username }) => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGrade, setNewGrade] = useState({
    subject: '',
    score: 0,
    total: 100,
    semester: 'Spring 2026'
  });

  useEffect(() => {
    loadGrades();
  }, [username]);

  const loadGrades = async () => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (stored?.grades) setGrades(stored.grades);
  };

  const handleSave = async () => {
    if (!newGrade.subject.trim()) return;
    
    const calculateGrade = (score: number, total: number) => {
        const p = (score / total) * 100;
        if (p >= 90) return 'A+';
        if (p >= 80) return 'A';
        if (p >= 70) return 'B';
        if (p >= 60) return 'C';
        return 'D';
    };

    const record: GradeRecord = {
        id: Date.now().toString(),
        ...newGrade,
        grade: calculateGrade(newGrade.score, newGrade.total),
        timestamp: Date.now()
    };

    const stored = await storageService.getData(`architect_data_${username}`);
    const updatedGrades = [record, ...(stored?.grades || [])];
    await storageService.setData(`architect_data_${username}`, { ...stored, grades: updatedGrades });
    
    setGrades(updatedGrades);
    setShowAdd(false);
    setNewGrade({ subject: '', score: 0, total: 100, semester: 'Spring 2026' });
  };

  const deleteGrade = async (id: string) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    const filtered = grades.filter(g => g.id !== id);
    await storageService.setData(`architect_data_${username}`, { ...stored, grades: filtered });
    setGrades(filtered);
  };

  const avgPercentage = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + (g.score / g.total), 0) / grades.length) * 100 
    : 0;

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
      className="pb-20 space-y-10"
    >
      {/* Header Section */}
      <motion.div variants={item} className="glass-card p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl">
                <GraduationCap size={36} />
            </div>
            <div>
                <h1 className="text-4xl font-display italic tracking-tight">Academic Ledger</h1>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mt-2">Performance Mesh Analysis</p>
            </div>
        </div>
        <div className="relative z-10 flex items-center gap-8">
            <div className="text-right">
                <span className="block text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1">Mesh Average</span>
                <span className="text-4xl font-display italic">{avgPercentage.toFixed(1)}%</span>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-premium p-5 rounded-2xl">
                <Plus size={24} />
            </button>
        </div>
      </motion.div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {grades.length === 0 ? (
              <motion.div 
                key="empty"
                variants={item}
                className="col-span-full py-32 glass-card flex flex-col items-center justify-center opacity-20"
              >
                  <PieChart size={64} className="mb-6" />
                  <p className="text-xs font-semibold uppercase tracking-widest">No Academic Nodes Logged</p>
              </motion.div>
          ) : (
            grades.map(grade => (
                <motion.div 
                  key={grade.id} 
                  variants={item}
                  layout
                  className="glass-card p-8 group hover:border-white/20 transition-all"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                            <Award size={20} />
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1">{grade.semester}</span>
                            <span className="text-4xl font-display italic">{grade.grade}</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium mb-4 truncate">{grade.subject}</h3>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-6">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(grade.score/grade.total)*100}%` }}
                          className="bg-white h-full rounded-full"
                        ></motion.div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">
                          {grade.score} / {grade.total} Points
                        </span>
                        <button onClick={() => deleteGrade(grade.id)} className="p-2 text-white/10 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Grade Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card p-10 max-w-lg w-full relative z-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-display italic">Record Entry</h2>
                <button onClick={() => setShowAdd(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24}/>
                </button>
              </div>
              <div className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-white/20 uppercase tracking-widest ml-1">Subject Node</label>
                      <input 
                        type="text" 
                        value={newGrade.subject} 
                        onChange={e => setNewGrade({...newGrade, subject: e.target.value})} 
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-white/20" 
                        placeholder="e.g. Quantum Physics" 
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className="text-[10px] font-semibold text-white/20 uppercase tracking-widest ml-1">Score</label>
                          <input 
                            type="number" 
                            value={newGrade.score} 
                            onChange={e => setNewGrade({...newGrade, score: parseInt(e.target.value) || 0})} 
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-white/20" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-semibold text-white/20 uppercase tracking-widest ml-1">Total</label>
                          <input 
                            type="number" 
                            value={newGrade.total} 
                            onChange={e => setNewGrade({...newGrade, total: parseInt(e.target.value) || 100})} 
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-white/20" 
                          />
                      </div>
                  </div>
                  <button onClick={handleSave} className="btn-premium w-full py-5 text-xs">Commit Record</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

