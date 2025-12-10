
import React, { useState, useEffect } from 'react';
import { UserProfile, Assignment, ChangeRequest, Post, Comment } from '../types';
import { Clock, CheckCircle2, BadgeCheck, AlertTriangle, Send, Megaphone, BarChart3, Heart, MessageCircle, User, Award, Flame, Trophy, Crown, Share2, Star, Zap } from 'lucide-react';
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
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  
  const pendingAssignments = assignments.filter(a => !a.completed).length;
  const completedAssignments = assignments.filter(a => a.completed).length;
  const total = assignments.length || 1;
  const progress = Math.round((completedAssignments / total) * 100);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  // Subject Performance Calculations
  const subjectStats = assignments.reduce<Record<string, { total: number; completed: number }>>((acc, curr) => {
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
  }, {});

  const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    percentage: Math.round((stats.completed / stats.total) * 100),
    total: stats.total,
    completed: stats.completed
  })).sort((a, b) => b.percentage - a.percentage);

  useEffect(() => {
    loadPosts();
    // Poll for updates (simple real-time simulation)
    const interval = setInterval(loadPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPosts = () => {
    const postsStr = localStorage.getItem('studentpocket_global_posts');
    if (postsStr) {
        const loadedPosts: Post[] = JSON.parse(postsStr);
        // Ensure likes/comments arrays exist for legacy posts
        const sanitizedPosts = loadedPosts.map(p => ({
            ...p,
            likes: p.likes || [],
            comments: p.comments || []
        }));
        setAnnouncements(sanitizedPosts);
    }
  };

  const savePosts = (updatedPosts: Post[]) => {
      setAnnouncements(updatedPosts);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updatedPosts));
  };

  const handleLike = (postId: string) => {
      const updatedPosts = announcements.map(post => {
          if (post.id === postId) {
              const isLiked = post.likes.includes(username);
              const newLikes = isLiked 
                  ? post.likes.filter(u => u !== username)
                  : [...post.likes, username];
              return { ...post, likes: newLikes };
          }
          return post;
      });
      savePosts(updatedPosts);
  };

  const handleComment = (postId: string) => {
      const text = commentText[postId];
      if (!text || !text.trim()) return;

      const newComment: Comment = {
          id: Date.now().toString(),
          username: username,
          text: text.trim(),
          timestamp: new Date().toISOString()
      };

      const updatedPosts = announcements.map(post => {
          if (post.id === postId) {
              return { ...post, comments: [...post.comments, newComment] };
          }
          return post;
      });

      savePosts(updatedPosts);
      setCommentText({ ...commentText, [postId]: '' });
      setShowComments({ ...showComments, [postId]: true });
  };

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

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: 'Join me on StudentPocket!',
              text: 'I am organizing my student life with StudentPocket. Join me and get organized!',
              url: window.location.origin
          }).catch(console.error);
      } else {
          alert("Share Link Copied: " + window.location.origin);
      }
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
      {/* Header with Gamification */}
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div>
            <p className="text-base text-gray-500 font-semibold uppercase tracking-wide">{today}</p>
            <div className="flex items-center space-x-2 mt-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
                {user.isPro && <Crown size={24} className="text-yellow-500 fill-yellow-100" />}
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
        </div>

        {/* Viral Gamification Bar */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-3 text-white shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-between min-w-[100px]">
                <div>
                    <p className="text-[10px] font-bold opacity-80 uppercase">Day Streak</p>
                    <p className="text-xl font-bold">{user.streak || 1} 🔥</p>
                </div>
            </div>
            <div className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-3 text-white shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-between min-w-[100px]">
                <div>
                    <p className="text-[10px] font-bold opacity-80 uppercase">XP Points</p>
                    <p className="text-xl font-bold">{user.points || 150} ⚡</p>
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm flex items-center justify-between min-w-[100px]">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Global Rank</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">#{user.rank || '1204'}</p>
                </div>
                <Trophy size={20} className="text-yellow-500" />
            </div>
        </div>
      </header>

      {/* Monetization / Pro Banner */}
      {!user.isPro && (
          <div className="bg-gray-900 dark:bg-black rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative z-10 flex justify-between items-center">
                  <div>
                      <h3 className="text-xl font-bold flex items-center"><Crown size={20} className="mr-2 text-yellow-400" /> Go Pro</h3>
                      <p className="text-sm text-gray-300 mt-1">Unlock AI Unlimited & Exclusive Badges.</p>
                  </div>
                  <button className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors">
                      Upgrade
                  </button>
              </div>
          </div>
      )}
      
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

      {/* Share / Viral Loop */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">Invite Friends & Earn</h3>
              <p className="text-sm text-purple-100 mb-4">Get +500 XP and a Pro Badge for every friend who joins.</p>
              <button 
                onClick={handleShare}
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-white/30 transition-colors"
              >
                  <Share2 size={16} className="mr-2" /> Invite Friends
              </button>
          </div>
          <Star className="absolute top-4 right-4 text-white opacity-20 w-24 h-24 rotate-12" />
      </div>

       {/* ANNOUNCEMENTS SECTION - SOCIAL FEED */}
       {announcements.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-indigo-100 dark:border-gray-700">
             <div className="flex items-center space-x-2 mb-4">
               <Megaphone className="text-indigo-600 dark:text-indigo-400" size={20} />
               <h3 className="font-bold text-gray-800 dark:text-white text-lg">Trending Updates</h3>
             </div>
             <div className="space-y-6">
               {announcements.map(post => {
                 const isLiked = post.likes.includes(username);
                 const commentsVisible = showComments[post.id];
                 
                 return (
                   <div key={post.id} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-all hover:shadow-md">
                      <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs mr-3">
                              {post.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{post.author === ADMIN_USERNAME ? 'System Admin' : post.author}</p>
                              <p className="text-[10px] text-gray-400">{new Date(post.date).toLocaleDateString()}</p>
                          </div>
                      </div>
                      
                      <h4 className="font-bold text-gray-800 dark:text-white text-base mb-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
                      
                      {/* Social Actions */}
                      <div className="flex items-center space-x-6 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'}`}
                          >
                              <Heart size={18} className={isLiked ? 'fill-pink-500' : ''} />
                              <span>{post.likes.length}</span>
                          </button>
                          
                          <button 
                            onClick={() => setShowComments({...showComments, [post.id]: !commentsVisible})}
                            className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                              <MessageCircle size={18} />
                              <span>{post.comments.length}</span>
                          </button>
                      </div>

                      {/* Comments Section */}
                      {commentsVisible && (
                          <div className="mt-4 animate-fade-in">
                              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                                  {post.comments.map(comment => (
                                      <div key={comment.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl text-sm border border-gray-100 dark:border-gray-700">
                                          <div className="flex justify-between items-baseline mb-1">
                                              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{comment.username}</span>
                                              <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                                      </div>
                                  ))}
                                  {post.comments.length === 0 && <p className="text-xs text-gray-400 italic">No comments yet.</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Write a comment..." 
                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white"
                                    value={commentText[post.id] || ''}
                                    onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                  />
                                  <button 
                                    onClick={() => handleComment(post.id)}
                                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                                  >
                                      <Send size={16} />
                                  </button>
                              </div>
                          </div>
                      )}
                   </div>
                 );
               })}
             </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                 <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xl">Subject Performance</h3>
           </div>
           
           <div className="space-y-6">
             {subjectData.map((data) => (
               <div key={data.subject}>
                 <div className="flex justify-between items-center text-sm mb-2 font-bold">
                   <span className="text-gray-700 dark:text-gray-300 capitalize">{data.subject}</span>
                   <span className="text-indigo-600 dark:text-indigo-400">{data.percentage}%</span>
                 </div>
                 <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
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

      {/* Daily Quote */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-l-8 border-orange-400 p-6 rounded-r-3xl flex items-center shadow-sm">
         <p className="text-orange-900 dark:text-orange-200 italic font-medium text-base leading-relaxed">"{quote}"</p>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deadlines</h2>
          <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-3 py-1.5 rounded-full font-bold border border-red-100 dark:border-red-900/50">
             {pendingAssignments} Pending
          </span>
        </div>
        
        <div className="space-y-4">
          {assignments.filter(a => !a.completed).slice(0, 3).map(task => {
            const styles = getPriorityStyles(task.priority);
            return (
              <div key={task.id} className={`p-5 rounded-2xl shadow-sm border-l-[6px] flex items-center transition-all hover:shadow-md ${styles.replace('bg-', 'border-l-').split(' ')[2].replace('text-', 'border-')} bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700`}>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-1">{task.title}</h4>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{task.subject}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${styles}`}>
                      {task.priority}
                    </span>
                    {task.assignedBy === ADMIN_USERNAME && (
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                            Admin Assigned
                        </span>
                    )}
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
            <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                 <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
              <p className="font-medium text-lg text-gray-600 dark:text-gray-300">All caught up!</p>
              <p className="text-sm">Great job keeping up with your studies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
