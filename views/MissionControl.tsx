import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mission, MissionTask, UserProfile } from '../types';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  Rocket, 
  AlertCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { upgradeService } from '../services/upgradeService';

interface MissionControlProps {
  username: string;
  user: UserProfile;
  updateUser: (user: UserProfile) => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({ username, user, updateUser }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMission, setNewMission] = useState<Partial<Mission>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    tasks: []
  });
  const [newTaskText, setNewTaskText] = useState('');

  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;

  useEffect(() => {
    loadMissions();
  }, [username]);

  const loadMissions = async () => {
    const stored = await storageService.getData(`architect_data_${username}`);
    if (stored?.missions) setMissions(stored.missions);
  };

  const saveMissions = async (updatedMissions: Mission[]) => {
    const stored = await storageService.getData(`architect_data_${username}`);
    await storageService.setData(`architect_data_${username}`, { ...stored, missions: updatedMissions });
    setMissions(updatedMissions);
  };

  const handleAddMission = async () => {
    if (!newMission.title?.trim()) return;

    const mission: Mission = {
      id: Date.now().toString(),
      title: newMission.title,
      description: newMission.description || '',
      status: 'ACTIVE',
      deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // Default 1 week
      progress: 0,
      tasks: newMission.tasks || [],
      priority: newMission.priority as any,
      createdAt: Date.now()
    };

    await saveMissions([mission, ...missions]);
    setShowAdd(false);
    setNewMission({ title: '', description: '', priority: 'MEDIUM', tasks: [] });
  };

  const toggleTask = async (missionId: string, taskId: string) => {
    let missionCompleted = false;
    const updated = missions.map(m => {
      if (m.id === missionId) {
        const newTasks = m.tasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = newTasks.filter(t => t.completed).length;
        const progress = newTasks.length > 0 ? (completedCount / newTasks.length) * 100 : 0;
        
        if (progress === 100 && m.progress < 100) {
          missionCompleted = true;
        }

        return { ...m, tasks: newTasks, progress };
      }
      return m;
    });
    await saveMissions(updated);

    if (missionCompleted) {
      const updatedUser = await upgradeService.updateTaskProgress(user, username, 'MISSION');
      updateUser(updatedUser);
    }
  };

  const addTaskToNewMission = () => {
    if (!newTaskText.trim()) return;
    const task: MissionTask = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false
    };
    setNewMission({ ...newMission, tasks: [...(newMission.tasks || []), task] });
    setNewTaskText('');
  };

  const deleteMission = async (id: string) => {
    if (!confirm('Abort mission protocol?')) return;
    await saveMissions(missions.filter(m => m.id !== id));
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
      className="space-y-8 pb-24 max-w-7xl mx-auto"
    >
      <motion.div variants={item} className={`flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8 ${isPro ? 'border-amber-500/20' : 'border-gray-500'}`}>
        <div>
          <h1 className={`text-4xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Mission Control</h1>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mt-2 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Strategic Operations Center</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className={`flex items-center gap-2 text-xs py-3 px-6 font-bold uppercase tracking-widest transition-all ${isPro ? 'bg-amber-500 text-black rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'bg-gray-400 text-gray-900 rounded-none border-2 border-gray-500 hover:bg-gray-500'}`}
        >
          <Plus size={16} />
          Initialize Mission
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {missions.map(mission => (
            <motion.div
              key={mission.id}
              variants={item}
              layout
              className={`p-6 group transition-all ${isPro ? 'glass-card hover:border-amber-500/30 border-amber-500/10' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                  mission.priority === 'CRITICAL' ? (isPro ? 'bg-red-500/10 text-red-400 border-red-500/20 rounded-full' : 'bg-red-200 text-red-800 border-red-400 rounded-none') :
                  mission.priority === 'HIGH' ? (isPro ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-full' : 'bg-orange-200 text-orange-800 border-orange-400 rounded-none') :
                  (isPro ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-full' : 'bg-green-200 text-green-800 border-green-400 rounded-none')
                }`}>
                  {mission.priority} Priority
                </div>
                <button onClick={() => deleteMission(mission.id)} className={`transition-colors ${isPro ? 'text-amber-500/20 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}>
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className={`text-xl mb-2 ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>{mission.title}</h3>
              <p className={`text-sm mb-6 line-clamp-2 ${isPro ? 'text-amber-100/60' : 'text-gray-700'}`}>{mission.description}</p>

              <div className="space-y-3 mb-6">
                {mission.tasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(mission.id, task.id)}
                    className="flex items-center gap-3 cursor-pointer group/task"
                  >
                    <div className={`w-4 h-4 flex items-center justify-center transition-colors border ${
                      task.completed ? (isPro ? 'bg-amber-500 border-amber-500 rounded-full' : 'bg-gray-800 border-gray-800 rounded-none') : (isPro ? 'border-amber-500/20 group-hover/task:border-amber-400 rounded-full' : 'border-gray-500 group-hover/task:border-gray-800 rounded-none')
                    }`}>
                      {task.completed && <CheckCircle2 size={10} className={isPro ? "text-black" : "text-white"} />}
                    </div>
                    <span className={`text-xs transition-colors ${task.completed ? (isPro ? 'text-amber-500/40 line-through' : 'text-gray-500 line-through') : (isPro ? 'text-amber-100/80' : 'text-gray-800')}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
                {mission.tasks.length > 3 && (
                  <p className={`text-[10px] pl-7 ${isPro ? 'text-amber-500/40' : 'text-gray-500'}`}>+{mission.tasks.length - 3} more tasks</p>
                )}
              </div>

              <div className="space-y-2">
                <div className={`flex justify-between text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>
                  <span>Progress</span>
                  <span>{Math.round(mission.progress)}%</span>
                </div>
                <div className={`h-1 overflow-hidden ${isPro ? 'bg-amber-950/20 rounded-full' : 'bg-gray-400 rounded-none'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${mission.progress}%` }}
                    className={`h-full ${isPro ? 'bg-amber-500' : 'bg-gray-700'}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {missions.length === 0 && (
          <motion.div variants={item} className={`col-span-full py-20 text-center ${isPro ? 'opacity-30' : 'opacity-50'}`}>
            <Rocket size={48} className={`mx-auto mb-4 ${isPro ? 'text-amber-500' : 'text-gray-500'}`} />
            <p className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-100' : 'text-gray-600'}`}>No Active Operations</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl p-8 space-y-6 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
            >
              <h2 className={`text-2xl ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Initialize New Mission</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newMission.title}
                  onChange={e => setNewMission({ ...newMission, title: e.target.value })}
                  placeholder="Mission Codename"
                  className={`w-full p-4 outline-none transition-all ${isPro ? 'bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-100 placeholder:text-amber-500/20 focus:border-amber-500/40' : 'bg-gray-200 border-2 border-gray-500 rounded-none text-gray-900 placeholder:text-gray-500 focus:border-gray-700'}`}
                />
                
                <textarea
                  value={newMission.description}
                  onChange={e => setNewMission({ ...newMission, description: e.target.value })}
                  placeholder="Operational Details"
                  rows={3}
                  className={`w-full p-4 outline-none transition-all resize-none ${isPro ? 'bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-100 placeholder:text-amber-500/20 focus:border-amber-500/40' : 'bg-gray-200 border-2 border-gray-500 rounded-none text-gray-900 placeholder:text-gray-500 focus:border-gray-700'}`}
                />

                <div className="flex gap-4">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewMission({ ...newMission, priority: p })}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        newMission.priority === p 
                          ? (isPro ? 'bg-amber-500 text-black border-amber-500 rounded-xl' : 'bg-gray-600 text-white border-gray-600 rounded-none')
                          : (isPro ? 'bg-amber-950/20 text-amber-500/40 border-amber-500/10 hover:bg-amber-500/10 rounded-xl' : 'bg-gray-300 text-gray-600 border-gray-400 hover:bg-gray-400 rounded-none')
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className={`space-y-3 pt-4 border-t ${isPro ? 'border-amber-500/10' : 'border-gray-400'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Tactical Objectives</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTaskToNewMission()}
                      placeholder="Add objective..."
                      className={`flex-1 p-3 text-xs outline-none transition-all ${isPro ? 'bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-100 placeholder:text-amber-500/20 focus:border-amber-500/40' : 'bg-gray-200 border-2 border-gray-500 rounded-none text-gray-900 placeholder:text-gray-500 focus:border-gray-700'}`}
                    />
                    <button onClick={addTaskToNewMission} className={`p-3 ${isPro ? 'bg-amber-500/10 rounded-xl hover:bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-gray-400 rounded-none hover:bg-gray-500 text-gray-900 border-2 border-gray-500'}`}>
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {newMission.tasks?.map((task, i) => (
                      <div key={i} className={`flex items-center gap-3 text-xs p-2 border ${isPro ? 'text-amber-100/80 bg-amber-950/20 rounded-lg border-amber-500/10' : 'text-gray-800 bg-gray-200 rounded-none border-gray-400'}`}>
                        <Circle size={12} className={isPro ? "text-amber-400" : "text-gray-600"} />
                        {task.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAdd(false)} className={`flex-1 py-4 text-xs font-bold uppercase transition-colors border ${isPro ? 'rounded-xl bg-amber-950/20 text-amber-500/60 hover:bg-amber-950/40 border-amber-500/10' : 'rounded-none bg-gray-300 text-gray-700 hover:bg-gray-400 border-gray-500'}`}>
                  Abort
                </button>
                <button onClick={handleAddMission} className={`flex-[2] py-4 text-xs font-bold uppercase transition-colors ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'}`}>
                  Launch Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
