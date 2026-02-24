import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      case 'Urgent': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'High': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Medium': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default: return 'bg-white/5 text-white/60 border border-white/10';
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'Pending') return !a.completed;
    if (filter === 'Completed') return a.completed;
    return true;
  });

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
      className="pb-24 relative min-h-[600px] flex flex-col space-y-8"
    >
      <motion.div variants={item} className="flex flex-wrap justify-between items-center glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-display italic tracking-tight">Roadmap</h1>
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mt-1">Strategic Milestones</p>
        </div>
        
        <div className="relative z-10 flex items-center space-x-4">
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center">
                <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}><LayoutList size={20} /></button>
                <button onClick={() => setViewMode('CALENDAR')} className={`p-2 rounded-lg transition-all ${viewMode === 'CALENDAR' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}><CalendarIcon size={20} /></button>
            </div>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} className="btn-premium w-12 h-12 rounded-xl flex items-center justify-center">
                <Plus size={24} />
              </button>
            )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'LIST' ? (
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col space-y-8"
          >
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                  {['All', 'Pending', 'Completed'].map((f) => (
                      <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`px-6 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all border ${filter === f ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'}`}
                      >
                        {f}
                      </button>
                  ))}
              </div>

              <div className="space-y-4 scroll-box flex-1">
                  {filteredAssignments.length === 0 && (
                      <div className="glass-card py-32 flex flex-col items-center justify-center opacity-50">
                          <CalendarIcon className="w-16 h-16 mb-4 text-white/20" />
                          <p className="text-xs font-semibold uppercase tracking-widest">Target Cleared</p>
                      </div>
                  )}
                  
                  <AnimatePresence>
                    {filteredAssignments.map(task => (
                        <motion.div 
                            key={task.id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`glass-card p-6 transition-all ${task.completed ? 'opacity-50 grayscale' : 'hover:border-white/20'}`}
                        >
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center space-x-6 flex-1">
                                    <button 
                                        onClick={() => setAssignments(assignments.map(a => a.id === task.id ? { ...a, completed: !a.completed } : a))} 
                                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'border-white/20 text-transparent hover:border-white/40'}`}
                                    >
                                        <CheckSquare size={16} />
                                    </button>
                                    <div className="flex-1 space-y-2">
                                        <h4 className={`font-medium text-lg tracking-tight ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>{task.title}</h4>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-[9px] font-semibold uppercase tracking-widest text-white/60">{task.subject}</div>
                                            <div className={`px-3 py-1 rounded-md text-[9px] font-semibold uppercase tracking-widest ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                                            <div className="flex items-center text-[10px] font-medium text-white/40">
                                                <CalendarIcon size={12} className="mr-1.5" />
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setAssignments(assignments.filter(a => a.id !== task.id))} className="text-white/20 hover:text-red-400 transition-colors p-2 shrink-0"><Trash2 size={20} /></button>
                            </div>
                        </motion.div>
                    ))}
                  </AnimatePresence>
              </div>
          </motion.div>
        ) : (
            <motion.div 
              key="calendar-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card overflow-hidden"
            >
                <div className="p-6 flex justify-between items-center bg-white/5 border-b border-white/5">
                    <h2 className="text-lg font-display italic">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                    <div className="flex space-x-2">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-3 text-center text-[9px] font-semibold text-white/40 uppercase tracking-widest">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr bg-black/40">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="h-24 p-3 border-r border-b border-white/5 hover:bg-white/5 transition-colors relative group">
                            <span className="text-xs font-medium text-white/40 group-hover:text-white transition-colors">{i + 1}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-8 md:p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display italic tracking-tight">New Strategic Target</h2>
                <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Identifier</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-white/20 focus:border-white/20 transition-colors" 
                    placeholder="Task Title" 
                    value={newAssignment.title || ''} 
                    onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                        type="text" 
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-sm text-white placeholder:text-white/20 focus:border-white/20 transition-colors" 
                        placeholder="Academic Node" 
                        value={newAssignment.subject || ''} 
                        onChange={e => setNewAssignment({...newAssignment, subject: e.target.value})} 
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-sm text-white appearance-none focus:border-white/20 transition-colors" 
                        value={newAssignment.priority} 
                        onChange={e => setNewAssignment({...newAssignment, priority: e.target.value as TaskPriority})}
                    >
                      {(Object.values(TaskPriority) as string[]).map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Completion Date</label>
                   <input 
                        type="date" 
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-sm text-white focus:border-white/20 transition-colors" 
                        value={newAssignment.dueDate || ''} 
                        onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} 
                    />
                </div>

                <button onClick={handleAdd} className="btn-premium w-full py-4 text-xs mt-4">Synchronize Target</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};