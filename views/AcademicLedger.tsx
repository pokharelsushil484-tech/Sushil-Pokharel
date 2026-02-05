
import React, { useState, useEffect } from 'react';
import { GradeRecord } from '../types';
import { 
  Trophy, Plus, Trash2, ChartPie, 
  ChevronRight, Award, GraduationCap, 
  BarChart3, Save, X, Sparkles
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
    semester: 'SPRING 2026'
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
    setNewGrade({ subject: '', score: 0, total: 100, semester: 'SPRING 2026' });
  };

  const deleteGrade = async (id: string) => {
    if (!confirm("PURGE ACADEMIC RECORD?")) return;
    const stored = await storageService.getData(`architect_data_${username}`);
    const filtered = grades.filter(g => g.id !== id);
    await storageService.setData(`architect_data_${username}`, { ...stored, grades: filtered });
    setGrades(filtered);
  };

  const avgPercentage = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + (g.score / g.total), 0) / grades.length) * 100 
    : 0;

  return (
    <div className="pb-24 animate-platinum space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-10 rounded-[3.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <GraduationCap size={40} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Academic<br/>Precision</h1>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] mt-2">Performance Mesh Ledger</p>
            </div>
        </div>
        <div className="flex items-center gap-6 mt-8 md:mt-0">
            <div className="text-right">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Mesh Average</span>
                <span className="text-3xl font-black text-white italic">{avgPercentage.toFixed(1)}%</span>
            </div>
            <button onClick={() => setShowAdd(true)} className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-indigo-50 transition-all shadow-2xl shadow-white/5">
                <Plus size={32} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {grades.length === 0 && (
            <div className="col-span-full py-40 master-box bg-black/20 border-dashed border-white/5 flex flex-col items-center justify-center opacity-30">
                <BarChart3 size={80} className="mb-6" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">No Data Nodes Logged</p>
            </div>
        )}
        {grades.map(grade => (
            <div key={grade.id} className="master-box p-8 bg-slate-900/40 hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-indigo-600 transition-all group-hover:text-white">
                        <Award size={24} />
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest">{grade.semester}</span>
                        <span className="text-4xl font-black text-white italic">{grade.grade}</span>
                    </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 truncate">{grade.subject}</h3>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
                    <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${(grade.score/grade.total)*100}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{grade.score} / {grade.total} POINTS</span>
                    <button onClick={() => deleteGrade(grade.id)} className="p-3 text-slate-700 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-3xl animate-fade-in">
          <div className="master-box p-12 max-w-lg w-full bg-slate-900 border-indigo-500/20 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Record Entry</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors"><X size={32}/></button>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Subject Node</label>
                    <input type="text" value={newGrade.subject} onChange={e => setNewGrade({...newGrade, subject: e.target.value.toUpperCase()})} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500" placeholder="SUBJECT NAME" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Score</label>
                        <input type="number" value={newGrade.score} onChange={e => setNewGrade({...newGrade, score: parseInt(e.target.value) || 0})} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Total</label>
                        <input type="number" value={newGrade.total} onChange={e => setNewGrade({...newGrade, total: parseInt(e.target.value) || 100})} className="w-full p-5 bg-black border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500" />
                    </div>
                </div>
                <button onClick={handleSave} className="w-full py-6 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-200 mt-6">Commit Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
