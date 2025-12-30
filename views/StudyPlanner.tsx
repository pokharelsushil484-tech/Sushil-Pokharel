
import React, { useState } from 'react';
import { Assignment, TaskPriority } from '../types';
import { Plus, Trash2, Calendar as CalendarIcon, CheckSquare, X, Clock, LayoutList, ChevronLeft, ChevronRight, Bell, Sparkles } from 'lucide-react';
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
    completed: false,
    reminderMinutes: 0
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
      category: newAssignment.category || 'General',
      subject: newAssignment.subject || 'General',
      dueDate: newAssignment.dueDate!,
      priority: newAssignment.priority || TaskPriority.MEDIUM,
      completed: false,
      estimatedTime: newAssignment.estimatedTime,
      reminderMinutes: newAssignment.reminderMinutes || 0
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({ priority: TaskPriority.MEDIUM, completed: false, reminderMinutes: 0 });
    setAiPlan(null);
    setShowAdd(false);
  };

  const toggleComplete = (id: string) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };
  
  const handleGeneratePlan = async () => {
    if(!newAssignment.subject || !newAssignment.estimatedTime) return;
    setIsGenerating(true);
    const plan = await generateStudyPlan(newAssignment.subject, newAssignment.estimatedTime);
    setAiPlan(plan);
    setIsGenerating(false);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getAssignmentsForDate = (day: number) => {
    return assignments.filter(a => {
      const d = new Date(a.dueDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear() &&
        !a.completed
      );
    });
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'Pending') return !a.completed;
    if (filter === 'Completed') return a.completed;
    return true;
  });

  return (
    <div className="pb-24 animate-fade-in relative min-h-screen">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Study Planner</h1>
        
        <div className="flex items-center space-x-3">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center">
                <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'text-gray-400'}`}><LayoutList size={20} /></button>
                <button onClick={() => setViewMode('CALENDAR')} className={`p-2 rounded-lg transition-all ${viewMode === 'CALENDAR' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'text-gray-400'}`}><CalendarIcon size={20} /></button>
            </div>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center">
                <Plus size={24} />
              </button>
            )}
        </div>
      </div>

      {viewMode === 'LIST' ? (
        <>
            <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                {['All', 'Pending', 'Completed'].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>{f}</button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredAssignments.length === 0 && (
                    <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-indigo-100" />
                        <p className="text-lg font-medium">No tasks found.</p>
                    </div>
                )}
                
                {filteredAssignments.map(task => (
                    <div key={task.id} className={`p-5 rounded-2xl border transition-all ${task.completed ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                                <button onClick={() => toggleComplete(task.id)} className={`mt-1 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 dark:border-gray-600 text-transparent'}`}><CheckSquare size={18} /></button>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg text-gray-800 dark:text-white mb-1 ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">{task.subject}</span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 font-medium">
                                        <CalendarIcon size={16} className="mr-2 text-indigo-400" />
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => deleteAssignment(task.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </>
      ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                  <div className="flex space-x-2">
                      <button onClick={() => changeMonth(-1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"><ChevronLeft size={16} /></button>
                      <button onClick={() => changeMonth(1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"><ChevronRight size={16} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="p-3 text-center text-xs font-bold text-gray-400 uppercase">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                  {Array.from({ length: startDayOfMonth(currentDate) }).map((_, i) => <div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/30 dark:bg-gray-900/10 border-r border-b border-gray-100 dark:border-gray-800"></div>)}
                  {Array.from({ length: daysInMonth(currentDate) }).map((_, i) => {
                      const day = i + 1;
                      const dayTasks = getAssignmentsForDate(day);
                      return (
                          <div key={day} className="h-24 md:h-32 p-2 border-r border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/20">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{day}</span>
                              <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)] no-scrollbar">
                                  {dayTasks.map(task => (
                                      <div key={task.id} className="text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 truncate flex items-center">
                                          <span className={`w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0 ${task.priority === 'Urgent' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                          <span className="truncate dark:text-gray-200">{task.title}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Task</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:bg-gray-50 p-2 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-medium text-lg dark:text-white" value={newAssignment.title || ''} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-medium dark:text-white" value={newAssignment.subject || ''} onChange={e => setNewAssignment({...newAssignment, subject: e.target.value})} />
                </div>
                 <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-medium dark:text-white" value={newAssignment.priority} onChange={e => setNewAssignment({...newAssignment, priority: e.target.value as TaskPriority})}>
                    {(Object.values(TaskPriority) as string[]).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                    <input type="date" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-medium dark:text-white" value={newAssignment.dueDate || ''} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Est. Hours</label>
                    <input type="number" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-medium dark:text-white" value={newAssignment.estimatedTime || ''} onChange={e => setNewAssignment({...newAssignment, estimatedTime: e.target.value})} />
                </div>
              </div>

               {newAssignment.subject && newAssignment.estimatedTime && (
                 <div className="space-y-4">
                    <button onClick={handleGeneratePlan} disabled={isGenerating} className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 py-4 rounded-xl font-bold flex items-center justify-center transition-all">
                      <Sparkles size={18} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? "Thinking..." : "Generate AI Study Plan"}
                    </button>
                    {aiPlan && (
                        <div className="p-4 bg-indigo-50/50 dark:bg-gray-800 rounded-xl text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-indigo-100 dark:border-indigo-900/50">
                            <p className="font-black text-indigo-600 mb-2 uppercase tracking-widest text-[10px]">AI Strategic Breakdown</p>
                            {aiPlan}
                        </div>
                    )}
                 </div>
               )}

              <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg mt-4 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95">Add Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
