
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeRecord, UserProfile, SubscriptionTier } from '../types';
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
  user: UserProfile;
}

export const AcademicLedger: React.FC<AcademicLedgerProps> = ({ username, user }) => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGrade, setNewGrade] = useState({
    subject: '',
    score: 0,
    total: 100,
    semester: 'Spring 2026'
  });

  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;

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
      <motion.div variants={item} className={`p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
        {isPro && <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 bg-amber-500/10"></div>}
        <div className="relative z-10 flex items-center gap-8">
            <div className={`w-20 h-20 flex items-center justify-center ${isPro ? 'rounded-3xl shadow-2xl bg-amber-400 text-black' : 'rounded-none border-2 border-gray-500 bg-gray-400 text-gray-800'}`}>
                <GraduationCap size={36} />
            </div>
            <div>
                <h1 className={`text-4xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Academic Ledger</h1>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mt-2 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Performance Mesh Analysis</p>
            </div>
        </div>
        <div className="relative z-10 flex items-center gap-8">
            <div className="text-right">
                <span className={`block text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Mesh Average</span>
                <span className={`text-4xl ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{avgPercentage.toFixed(1)}%</span>
            </div>
            <button onClick={() => setShowAdd(true)} className={`p-5 transition-all ${isPro ? 'rounded-2xl shadow-lg bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none border-2 border-gray-500 bg-gray-400 text-gray-900 hover:bg-gray-500'}`}>
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
                className={`col-span-full py-32 flex flex-col items-center justify-center ${isPro ? 'glass-card opacity-20 border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 border-dashed rounded-none'}`}
              >
                  <PieChart size={64} className={`mb-6 ${isPro ? 'text-amber-100' : 'text-gray-500'}`} />
                  <p className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-100/60' : 'text-gray-600'}`}>No Academic Nodes Logged</p>
              </motion.div>
          ) : (
            grades.map(grade => (
                <motion.div 
                  key={grade.id} 
                  variants={item}
                  layout
                  className={`p-8 group transition-all ${isPro ? 'glass-card hover:border-amber-500/30 border-amber-500/10' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className={`p-4 border transition-all ${isPro ? 'rounded-2xl bg-amber-950/20 border-amber-500/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-black' : 'rounded-none bg-gray-400 border-gray-500 text-gray-800'}`}>
                            <Award size={20} />
                        </div>
                        <div className="text-right">
                            <span className={`block text-[10px] font-semibold uppercase tracking-widest mb-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>{grade.semester}</span>
                            <span className={`text-4xl ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{grade.grade}</span>
                        </div>
                    </div>
                    <h3 className={`text-lg font-medium mb-4 truncate ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>{grade.subject}</h3>
                    <div className={`w-full h-1 overflow-hidden mb-6 ${isPro ? 'rounded-full bg-amber-950/30' : 'rounded-none bg-gray-400'}`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(grade.score/grade.total)*100}%` }}
                          className={`h-full ${isPro ? 'rounded-full bg-amber-400' : 'bg-gray-700'}`}
                        ></motion.div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>
                          {grade.score} / {grade.total} Points
                        </span>
                        <button onClick={() => deleteGrade(grade.id)} className={`p-2 transition-colors ${isPro ? 'text-white/10 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}>
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
              className={`p-10 max-w-lg w-full relative z-10 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className={`text-2xl ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Record Entry</h2>
                <button onClick={() => setShowAdd(false)} className={`transition-colors ${isPro ? 'text-white/20 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                  <X size={24}/>
                </button>
              </div>
              <div className="space-y-6">
                  <div className="space-y-2">
                      <label className={`text-[10px] font-semibold uppercase tracking-widest ml-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Subject Node</label>
                      <input 
                        type="text" 
                        value={newGrade.subject} 
                        onChange={e => setNewGrade({...newGrade, subject: e.target.value})} 
                        className={`w-full p-4 outline-none transition-all ${isPro ? 'rounded-xl bg-amber-950/20 border-amber-500/20 text-amber-100 focus:border-amber-500/40' : 'rounded-none border-2 border-gray-500 bg-gray-200 text-gray-900 focus:border-gray-700'}`}
                        placeholder="e.g. Quantum Physics" 
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className={`text-[10px] font-semibold uppercase tracking-widest ml-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Score</label>
                          <input 
                            type="number" 
                            value={newGrade.score} 
                            onChange={e => setNewGrade({...newGrade, score: parseInt(e.target.value) || 0})} 
                            className={`w-full p-4 outline-none transition-all ${isPro ? 'rounded-xl bg-amber-950/20 border-amber-500/20 text-amber-100 focus:border-amber-500/40' : 'rounded-none border-2 border-gray-500 bg-gray-200 text-gray-900 focus:border-gray-700'}`}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className={`text-[10px] font-semibold uppercase tracking-widest ml-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Total</label>
                          <input 
                            type="number" 
                            value={newGrade.total} 
                            onChange={e => setNewGrade({...newGrade, total: parseInt(e.target.value) || 100})} 
                            className={`w-full p-4 outline-none transition-all ${isPro ? 'rounded-xl bg-amber-950/20 border-amber-500/20 text-amber-100 focus:border-amber-500/40' : 'rounded-none border-2 border-gray-500 bg-gray-200 text-gray-900 focus:border-gray-700'}`}
                          />
                      </div>
                  </div>
                  <button onClick={handleSave} className={`w-full py-5 text-xs font-bold uppercase tracking-widest ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none border-2 border-gray-500 bg-gray-400 text-gray-900 hover:bg-gray-500'}`}>Commit Record</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

