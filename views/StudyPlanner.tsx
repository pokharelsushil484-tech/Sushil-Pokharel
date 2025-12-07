import React, { useState } from 'react';
import { Assignment, TaskPriority } from '../types';
import { Plus, Trash2, Calendar, CheckSquare, X } from 'lucide-react';
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

  return (
    <div className="pb-20 animate-fade-in relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar">
        {['All', 'Pending', 'Completed'].map((filter) => (
          <button key={filter} className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 border border-gray-200 whitespace-nowrap">
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {assignments.length === 0 && (
            <div className="text-center p-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No study plans assigned yet.</p>
            </div>
        )}
        {assignments.map(task => (
          <div key={task.id} className={`p-4 rounded-2xl shadow-sm border transition-all ${task.completed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <button 
                  onClick={() => toggleComplete(task.id)}
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'
                  }`}
                >
                  <CheckSquare size={14} />
                </button>
                <div>
                  <h4 className={`font-bold text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{task.subject}</span>
                    <span className={`px-2 py-0.5 rounded ${
                       task.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Calendar size={12} className="mr-1" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => deleteAssignment(task.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Assignment</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Physics Chapter 3"
                  value={newAssignment.title || ''}
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm text-gray-600 mb-1">Subject</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Math"
                    value={newAssignment.subject || ''}
                    onChange={e => setNewAssignment({...newAssignment, subject: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                    value={newAssignment.priority}
                    onChange={e => setNewAssignment({...newAssignment, priority: e.target.value as TaskPriority})}
                  >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                    <input 
                      type="date" 
                      className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                      value={newAssignment.dueDate || ''}
                      onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-sm text-gray-600 mb-1">Est. Hours</label>
                    <input 
                      type="number" 
                      className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full text-indigo-600 text-sm font-medium hover:bg-indigo-50 p-2 rounded-lg transition-colors border border-dashed border-indigo-200"
                 >
                   {isGenerating ? "Thinking..." : "✨ Ask AI for a study breakdown"}
                 </button>
               )}

              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-indigo-200"
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