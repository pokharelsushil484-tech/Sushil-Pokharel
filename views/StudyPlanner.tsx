import React, { useState } from 'react';
import { Assignment, TaskPriority } from '../types';
import { Plus, Trash2, Calendar, CheckSquare, X, Clock } from 'lucide-react';
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

  const handleAdd = () => {
    if (!newAssignment.title || !newAssignment.dueDate) return;
    
    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title!,
      subject: newAssignment.subject || 'General',
      dueDate: newAssignment.dueDate!,
      priority: newAssignment.priority || TaskPriority.MEDIUM,
      completed: false,
      estimatedTime: newAssignment.estimatedTime
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({ priority: TaskPriority.MEDIUM, completed: false });
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
    alert(`AI Study Plan Suggestion:\n${plan}`);
    setIsGenerating(false);
  }

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'Pending') return !a.completed;
    if (filter === 'Completed') return a.completed;
    return true;
  });

  return (
    <div className="pb-24 animate-fade-in relative min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Study Planner</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"
          >
            <Plus size={28} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Pending', 'Completed'].map((f) => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filter === f 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAssignments.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-indigo-100" />
                <p className="text-lg font-medium text-gray-500">No tasks found.</p>
                {isAdmin && <p className="text-sm">Click + to add a new assignment.</p>}
            </div>
        )}
        
        {filteredAssignments.map(task => {
            const priorityStyle = getPriorityColor(task.priority);
            return (
              <div key={task.id} className={`p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${task.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button 
                      onClick={() => toggleComplete(task.id)}
                      className={`mt-1 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent hover:border-indigo-300'
                      }`}
                    >
                      <CheckSquare size={18} />
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg text-gray-800 mb-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                         <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                            {task.subject}
                         </span>
                         <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${priorityStyle}`}>
                            {task.priority}
                         </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 font-medium">
                        <Calendar size={16} className="mr-2 text-indigo-400" />
                        <span className={new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500 font-bold' : ''}>
                           Due: {new Date(task.dueDate).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                        </span>
                        {task.estimatedTime && (
                           <>
                             <span className="mx-2 text-gray-300">|</span>
                             <Clock size={16} className="mr-2 text-indigo-400" />
                             <span>{task.estimatedTime}h</span>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteAssignment(task.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">New Assignment</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-lg"
                  placeholder="e.g. Physics Chapter 3"
                  value={newAssignment.title || ''}
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                    placeholder="Math"
                    value={newAssignment.subject || ''}
                    onChange={e => setNewAssignment({...newAssignment, subject: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium appearance-none"
                    value={newAssignment.priority}
                    onChange={e => setNewAssignment({...newAssignment, priority: e.target.value as TaskPriority})}
                  >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                      value={newAssignment.dueDate || ''}
                      onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Est. Hours</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                      placeholder="2"
                      value={newAssignment.estimatedTime || ''}
                      onChange={e => setNewAssignment({...newAssignment, estimatedTime: e.target.value})}
                    />
                </div>
              </div>

               {/* AI Feature */}
               {newAssignment.subject && newAssignment.estimatedTime && (
                 <button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="w-full text-indigo-600 text-sm font-bold hover:bg-indigo-50 p-4 rounded-xl transition-colors border-2 border-dashed border-indigo-200 flex items-center justify-center"
                 >
                   {isGenerating ? "Thinking..." : "✨ Ask AI for a study breakdown"}
                 </button>
               )}

              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg mt-6 shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};