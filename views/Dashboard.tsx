

import React, { useState, useEffect } from 'react';
import { UserProfile, Assignment, ChangeRequest, Post } from '../types';
import { Clock, CheckCircle2, BadgeCheck, AlertTriangle, Send, Megaphone, BarChart3 } from 'lucide-react';
import { MOTIVATIONAL_QUOTES, ADMIN_USERNAME } from '../constants';

interface DashboardProps {
  user: UserProfile;
  assignments: Assignment[];
  isVerified: boolean;
  username: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, assignments, isVerified, username }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  
  const pendingAssignments = assignments.filter(a => !a.completed).length;
  const completedAssignments = assignments.filter(a => a.completed).length;
  const total = assignments.length || 1;
  const progress = Math.round((completedAssignments / total) * 100);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  // Subject Performance Calculations
  const subjectStats = assignments.reduce((acc, curr) => {
    // Normalize subject case
    const subject = curr.subject.trim(); 
    if (!acc[subject]) {
      acc[subject] = { total: 0, completed: 0 };
    }
    acc[subject].total += 1;
    if (curr.completed) {
      acc[subject].completed += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    percentage: Math.round((stats.completed / stats.total) * 100),
    total: stats.total,
    completed: stats.completed
  })).sort((a, b) => b.percentage - a.percentage); // Sort highest completion first

  useEffect(() => {
    const postsStr = localStorage.getItem('studentpocket_global_posts');
    if (postsStr) {
        setAnnouncements(JSON.parse(postsStr));
    }
  }, []);

  const handleRequestVerification = () => {
     if (username === ADMIN_USERNAME) return;
     
     const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
     const reqs = JSON.parse(reqStr);
     
     if(reqs.find((r: any) => r.username === username && r.type === 'VERIFICATION_REQUEST' && r.status === 'PENDING')) {
         alert("Verification request already pending. Please wait for Admin approval.");
         return;
     }

     setIsRequesting(true);

     const request: ChangeRequest = {
         id: Date.now().toString(),
         username: username,
         type: 'VERIFICATION_REQUEST',
         status: 'PENDING',
         timestamp: new Date().toISOString()
     };
     
     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     
     setTimeout(() => {
         setIsRequesting(false);
         alert("Request sent! The Admin will review your account shortly.");
     }, 500);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'High':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'Medium':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-base text-gray-500 font-semibold uppercase tracking-wide">{today}</p>
          <div className="flex items-center space-x-3 mt-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
            {isVerified ? (
              <div title="Verified Student">
                <BadgeCheck className="w-7 h-7 text-blue-500 fill-blue-50" />
              </div>
            ) : (
                <div title="Unverified Account">
                    <AlertTriangle className="w-7 h-7 text-yellow-500 fill-yellow-50" />
                </div>
            )}
          </div>
        </div>
        {user.avatar && (
          <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover" />
        )}
      </header>
      
      {/* Verification Alert */}
      {!isVerified && username !== ADMIN_USERNAME && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-scale-up shadow-sm">
            <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-xl mr-4">
                  <AlertTriangle className="text-yellow-600" size={28} />
                </div>
                <div>
                    <h3 className="text-yellow-900 font-bold text-lg">Unlock Full Features</h3>
                    <p className="text-yellow-700 text-sm mt-0.5 font-medium">Verify your account to access Vault, CV Builder & AI.</p>
                </div>
            </div>
            <button 
                onClick={handleRequestVerification}
                disabled={isRequesting}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            >
                <Send size={16} className="mr-2" />
                {isRequesting ? 'Sending...' : 'Request Verification'}
            </button>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h3 className="text-indigo-100 font-medium text-lg mb-2">Weekly Goal</h3>
            <p className="text-5xl font-bold mb-6 tracking-tight">{progress}%</p>
            <div className="flex items-center space-x-3 bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="bg-green-400 rounded-full p-1">
                 <CheckCircle2 size={16} className="text-indigo-900" />
              </div>
              <span className="font-medium text-indigo-50">{completedAssignments} finished tasks</span>
            </div>
          </div>
          
          {/* Circular Progress SVG */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-900/30" />
              <circle cx="64" cy="64" r="56" stroke="white" strokeWidth="12" fill="transparent" strokeDasharray={`${progress * 3.51} 351`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold leading-none">{pendingAssignments}</span>
              <span className="text-xs font-medium text-indigo-200 opacity-80 uppercase tracking-wide">Left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Performance Charts */}
      {assignments.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
           <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-50 p-2.5 rounded-xl">
                 <BarChart3 className="text-indigo-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-xl">Subject Performance</h3>
           </div>
           
           <div className="space-y-6">
             {subjectData.map((data) => (
               <div key={data.subject}>
                 <div className="flex justify-between items-center text-sm mb-2 font-bold">
                   <span className="text-gray-700 capitalize">{data.subject}</span>
                   <span className="text-indigo-600">{data.percentage}%</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                   <div
                     className={`h-full rounded-full transition-all duration-1000 ${
                       data.percentage === 100 ? 'bg-green-500' :
                       data.percentage >= 75 ? 'bg-blue-500' :
                       data.percentage >= 40 ? 'bg-orange-400' :
                       'bg-red-400'
                     }`}
                     style={{ width: `${data.percentage}%` }}
                   />
                 </div>
                 <div className="text-xs text-gray-400 mt-1.5 font-medium flex justify-between">
                     <span>{data.completed} done</span>
                     <span>{data.total} total</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

       {/* ANNOUNCEMENTS SECTION */}
       {announcements.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100">
             <div className="flex items-center space-x-2 mb-4">
               <Megaphone className="text-indigo-600" size={20} />
               <h3 className="font-bold text-gray-800 text-lg">Announcements</h3>
             </div>
             <div className="space-y-4">
               {announcements.slice(0, 3).map(post => (
                 <div key={post.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{post.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium text-right">{new Date(post.date).toLocaleDateString()}</p>
                 </div>
               ))}
             </div>
          </div>
       )}

      {/* Daily Quote */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-l-8 border-orange-400 p-6 rounded-r-3xl flex items-center shadow-sm">
         <p className="text-orange-900 italic font-medium text-base leading-relaxed">"{quote}"</p>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Deadlines</h2>
          <span className="bg-red-50 text-red-600 text-sm px-3 py-1.5 rounded-full font-bold border border-red-100">
             {pendingAssignments} Pending
          </span>
        </div>
        
        <div className="space-y-4">
          {assignments.filter(a => !a.completed).slice(0, 3).map(task => {
            const styles = getPriorityStyles(task.priority);
            return (
              <div key={task.id} className={`p-5 rounded-2xl shadow-sm border-l-[6px] flex items-center transition-all hover:shadow-md ${styles.replace('bg-', 'border-l-').split(' ')[2].replace('text-', 'border-')} bg-white border-gray-100`}>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-1">{task.title}</h4>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="font-medium text-gray-500">{task.subject}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${styles}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className={`flex flex-col items-end ${styles.split(' ')[2]}`}>
                  <div className="flex items-center text-sm font-bold mb-1">
                    <Clock size={16} className="mr-1.5" />
                    <span>Due {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                  </div>
                  <span className="text-xs text-gray-400">Est. {task.estimatedTime || 1}h</span>
                </div>
              </div>
            );
          })}
          {assignments.filter(a => !a.completed).length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                 <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-medium text-lg text-gray-600">All caught up!</p>
              <p className="text-sm">Great job keeping up with your studies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
