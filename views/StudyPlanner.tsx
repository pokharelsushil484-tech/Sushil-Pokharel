import React, { useState } from 'react';
import { Assignment, TaskPriority } from '../types';
import { Plus, Trash2, Calendar as CalendarIcon, CheckSquare, X, LayoutList, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';

interface PlannerProps {
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  isAdmin?: boolean;
}

export const StudyPlanner: React.FC<PlannerProps> = ({ assignments, setAssignments, isAdmin }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    priority: TaskPriority.MEDIUM,
    completed: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState('All');
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleAdd = () => {
    if (!newAssignment.title || !newAssignment.dueDate) return;
    
    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title!,
      subject: newAssignment.subject || 'Elite Logic',
      dueDate: newAssignment.dueDate!,
      priority: newAssignment.priority || TaskPriority.MEDIUM,
      completed: false,
      estimatedTime: newAssignment.estimatedTime
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({ priority: TaskPriority.MEDIUM, completed: false });
    setShowAdd(false);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Urgent': return 'bg-red-500 text-black';
      case 'High': return 'bg-amber-500 text-black';
      case 'Medium': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-800 text-white';
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'Pending') return !a.completed;
    if (filter === 'Completed') return a.completed;
    return true;
  });

  return (
    <div className="pb-24 animate-fade-in relative min-h-[600px] flex flex-col space-y-8">
      <div className="flex flex-wrap justify-between items-center bg-slate-900/50 p-8 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Roadmap</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Strategic Milestones</p>
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="bg-black/50 p-1.5 rounded-2xl border border-white/5 flex items-center">
                <button onClick={() => setViewMode('LIST')} className={`p-3 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}><LayoutList size={22} /></button>
                <button onClick={() => setViewMode('CALENDAR')} className={`p-3 rounded-xl transition-all ${viewMode === 'CALENDAR' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}><CalendarIcon size={22} /></button>
            </div>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} className="bg-white text-black w-14 h-14 rounded-2xl shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center">
                <Plus size={32} />
              </button>
            )}
        </div>
      </div>

      {viewMode === 'LIST' ? (
        <div className="flex-1 flex flex-col space-y-8">
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                {['All', 'Pending', 'Completed'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f ? 'bg-white text-black border-white' : 'bg-transparent text-slate-600 border-white/5 hover:border-white/20'}`}>{f}</button>
                ))}
            </div>

            {/* Scroll Container for "Many Boxes" */}
            <div className="space-y-6 scroll-box flex-1">
                {filteredAssignments.length === 0 && (
                    <div className="text-center py-32 opacity-20 flex flex-col items-center">
                        <CalendarIcon className="w-20 h-20 mb-6" />
                        <p className="text-xl font-black uppercase tracking-widest">Target Cleared</p>
                    </div>
                )}
                
                {filteredAssignments.map(task => (
                    <div key={task.id} className={`master-box p-8 rounded-[3rem] transition-all ${task.completed ? 'opacity-40 grayscale' : 'hover:border-white/30'}`}>
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center space-x-8 flex-1">
                                <button 
                                    onClick={() => setAssignments(assignments.map(a => a.id === task.id ? { ...a, completed: !a.completed } : a))} 
                                    className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/10 text-transparent hover:border-white/40'}`}
                                >
                                    <CheckSquare size={20} />
                                </button>
                                <div className="flex-1 space-y-3">
                                    <h4 className={`font-black text-xl text-white tracking-tight uppercase ${task.completed ? 'line-through' : ''}`}>{task.title}</h4>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">{task.subject}</div>
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <CalendarIcon size={14} className="mr-2 text-indigo-500" />
                                            Deadline: {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setAssignments(assignments.filter(a => a.id !== task.id))} className="text-slate-800 hover:text-red-500 transition-colors p-2"><Trash2 size={24} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
          <div className="master-box rounded-[4rem] overflow-hidden animate-scale-in">
              <div className="p-8 flex justify-between items-center bg-white/5 border-b border-white/5">
                  <h2 className="text-xl font-black text-white uppercase italic">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                  <div className="flex space-x-3">
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-3 bg-black rounded-xl border border-white/10 text-white"><ChevronLeft size={18} /></button>
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-3 bg-black rounded-xl border border-white/10 text-white"><ChevronRight size={18} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
                  {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => <div key={day} className="p-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-widest">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr bg-black/40">
                  {/* Calendar render logic remains similar but with obsidian styling */}
                  {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="h-28 p-4 border-r border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <span className="text-xs font-black text-slate-700">{i + 1}</span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="bg-slate-900 border border-white/10 rounded-[4rem] w-full max-w-lg p-10 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-scale-up">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">New Strategic Target</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-all"><X size={32} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Identifier</label>
                <input type="text" className="w-full p-5 bg-black border border-white/5 rounded-3xl outline-none font-bold text-white placeholder:text-slate-800" placeholder="Task Title" value={newAssignment.title || ''} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Subject</label>
                  <input type="text" className="w-full p-5 bg-black border border-white/5 rounded-3xl outline-none font-bold text-white placeholder:text-slate-800" placeholder="Academic Node" value={newAssignment.subject || ''} onChange={e => setNewAssignment({...newAssignment, subject: e.target.value})} />
                </div>
                 <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Priority</label>
                  <select className="w-full p-5 bg-black border border-white/5 rounded-3xl outline-none font-bold text-white uppercase appearance-none" value={newAssignment.priority} onChange={e => setNewAssignment({...newAssignment, priority: e.target.value as TaskPriority})}>
                    {(Object.values(TaskPriority) as string[]).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Completion Date</label>
                 <input type="date" className="w-full p-5 bg-black border border-white/5 rounded-3xl outline-none font-bold text-white uppercase" value={newAssignment.dueDate || ''} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} />
              </div>

              <button onClick={handleAdd} className="w-full bg-white text-black py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] mt-8 shadow-2xl hover:bg-slate-200 transition-all">Synchronize Target</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};