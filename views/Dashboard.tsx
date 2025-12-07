import React, { useState } from 'react';
import { UserProfile, Assignment, ChangeRequest } from '../types';
import { Clock, CheckCircle2, BadgeCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface DashboardProps {
  user: UserProfile;
  assignments: Assignment[];
  isVerified: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, assignments, isVerified }) => {
  const [requestSent, setRequestSent] = useState(false);
  const pendingAssignments = assignments.filter(a => !a.completed).length;
  const completedAssignments = assignments.filter(a => a.completed).length;
  const total = assignments.length || 1;
  const progress = Math.round((completedAssignments / total) * 100);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const handleRequestVerification = () => {
     if(requestSent) return;
     const request: ChangeRequest = {
         id: Date.now().toString(),
         username: user.name, // Assuming name matches username for initial setup
         type: 'VERIFICATION_REQUEST',
         status: 'PENDING',
         timestamp: new Date().toISOString()
     };
     
     const reqStr = localStorage.getItem('studentpocket_requests') || '[]';
     const reqs = JSON.parse(reqStr);
     
     if(reqs.find((r:any) => r.username === user.name && r.type === 'VERIFICATION_REQUEST' && r.status === 'PENDING')) {
         alert("Request already pending.");
         setRequestSent(true);
         return;
     }

     reqs.push(request);
     localStorage.setItem('studentpocket_requests', JSON.stringify(reqs));
     setRequestSent(true);
     alert("Verification request sent to Admin.");
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{today}</p>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
            {isVerified ? (
              <div title="Verified Student">
                <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-50" />
              </div>
            ) : (
                <div title="Unverified Account">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 fill-yellow-50" />
                </div>
            )}
          </div>
        </div>
        {user.avatar && (
          <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
        )}
      </header>
      
      {/* Verification Alert */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center">
                <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0" size={24} />
                <div>
                    <h3 className="text-yellow-800 font-bold text-sm">Limited Mode Active</h3>
                    <p className="text-yellow-600 text-xs mt-1">Unlock AI Chat, Vault & CV by verifying email.</p>
                </div>
            </div>
            <button 
                onClick={handleRequestVerification}
                disabled={requestSent}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {requestSent ? 'Request Pending' : 'Request Verification'}
            </button>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-indigo-100 font-medium mb-1">Weekly Progress</h3>
            <p className="text-3xl font-bold mb-4">{progress}% <span className="text-sm font-normal text-indigo-200">Complete</span></p>
            <div className="flex items-center space-x-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle2 size={14} />
              <span>{completedAssignments} finished tasks</span>
            </div>
          </div>
          
          {/* Circular Progress SVG */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-800/30" />
              <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="8" fill="transparent" strokeDasharray={`${progress * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
              {pendingAssignments}
              <span className="text-xs font-normal ml-1">left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl flex items-center">
         <p className="text-orange-800 italic font-medium text-sm">"{quote}"</p>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h2>
          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">{pendingAssignments} Pending</span>
        </div>
        
        <div className="space-y-3">
          {assignments.filter(a => !a.completed).slice(0, 3).map(task => (
            <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <div className={`w-3 h-12 rounded-full mr-4 ${
                task.priority === 'Urgent' ? 'bg-red-500' : 
                task.priority === 'High' ? 'bg-orange-500' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{task.title}</h4>
                <p className="text-xs text-gray-500">{task.subject} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="text-gray-400">
                <Clock size={18} />
              </div>
            </div>
          ))}
          {assignments.filter(a => !a.completed).length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>All caught up! Great job.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};