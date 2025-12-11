
import React, { useState, useEffect } from 'react';
import { UserProfile, Post, Comment, PostAttachment } from '../types';
import { Megaphone, Heart, MessageCircle, Send, Paperclip, Image as ImageIcon, FileText, Download, X, Crown, BadgeCheck, AlertTriangle } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

interface DashboardProps {
  user: UserProfile;
  isVerified: boolean;
  username: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, isVerified, username }) => {
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  
  // Post Creation State (Admin Only)
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAttachments, setNewPostAttachments] = useState<PostAttachment[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const isAdmin = username === ADMIN_USERNAME;

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPosts = () => {
    const postsStr = localStorage.getItem('studentpocket_global_posts');
    if (postsStr) {
        const loadedPosts: Post[] = JSON.parse(postsStr);
        setAnnouncements(loadedPosts.map(p => ({
            ...p,
            likes: p.likes || [],
            comments: p.comments || [],
            attachments: p.attachments || []
        })));
    }
  };

  const savePosts = (updatedPosts: Post[]) => {
      setAnnouncements(updatedPosts);
      localStorage.setItem('studentpocket_global_posts', JSON.stringify(updatedPosts));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          files.forEach(file => {
              if (file.size > 2 * 1024 * 1024) { // 2MB Limit per file for localStorage
                  alert(`File ${file.name} is too large (Max 2MB)`);
                  return;
              }
              const reader = new FileReader();
              reader.onloadend = () => {
                  setNewPostAttachments(prev => [...prev, {
                      name: file.name,
                      type: file.type.startsWith('image/') ? 'image' : 'file',
                      data: reader.result as string,
                      mimeType: file.type,
                      size: file.size
                  }]);
              };
              reader.readAsDataURL(file);
          });
      }
  };

  const removeAttachment = (index: number) => {
      setNewPostAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
      if (!newPostTitle.trim() || !newPostContent.trim()) {
          alert("Please enter a title and content.");
          return;
      }
      setIsPosting(true);

      const newPost: Post = {
          id: Date.now().toString(),
          title: newPostTitle,
          content: newPostContent,
          date: new Date().toISOString(),
          author: ADMIN_USERNAME, // Always Admin in this context
          likes: [],
          comments: [],
          attachments: newPostAttachments
      };

      const updatedPosts = [newPost, ...announcements];
      savePosts(updatedPosts);
      
      // Reset
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostAttachments([]);
      setIsPosting(false);
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

  const downloadAttachment = (att: PostAttachment) => {
      const link = document.createElement('a');
      link.href = att.data;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Classroom Stream</h1>
              <p className="opacity-90">{isAdmin ? "You are the Teacher" : "Welcome to your class feed"}</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
              <Megaphone size={120} />
          </div>
      </div>

      {/* Admin Post Creator */}
      {isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Announce something to your class</h3>
              <input 
                  className="w-full mb-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Title"
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
              />
              <textarea 
                  className="w-full mb-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Share details with your students..."
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
              />
              
              {/* Attachment Preview */}
              {newPostAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                      {newPostAttachments.map((att, idx) => (
                          <div key={idx} className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800">
                              {att.type === 'image' ? <ImageIcon size={14} className="mr-2 text-indigo-500"/> : <FileText size={14} className="mr-2 text-indigo-500"/>}
                              <span className="truncate max-w-[150px] mr-2 dark:text-gray-300">{att.name}</span>
                              <button onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                          </div>
                      ))}
                  </div>
              )}

              <div className="flex justify-between items-center">
                  <label className="flex items-center cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors">
                      <Paperclip size={18} className="mr-2" />
                      Add Attachment
                      <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                  <button 
                      onClick={handleCreatePost}
                      disabled={isPosting}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                      {isPosting ? 'Posting...' : 'Post'}
                  </button>
              </div>
          </div>
      )}

      {/* Stream Feed */}
      <div className="space-y-6">
          {announcements.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No announcements yet.</p>
                  <p className="text-sm">Check back later for updates from your teacher.</p>
              </div>
          ) : (
              announcements.map(post => {
                 const isLiked = post.likes.includes(username);
                 const commentsVisible = showComments[post.id];
                 
                 return (
                   <div key={post.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                      {/* Post Header */}
                      <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm mr-3">
                              {post.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                              <p className="font-bold text-gray-800 dark:text-white flex items-center">
                                  {post.author === ADMIN_USERNAME ? 'Teacher' : post.author}
                                  {post.author === ADMIN_USERNAME && <BadgeCheck size={14} className="ml-1 text-blue-500 fill-blue-50" />}
                              </p>
                              <p className="text-[10px] text-gray-400">{new Date(post.date).toLocaleString()}</p>
                          </div>
                      </div>
                      
                      {/* Content */}
                      <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{post.title}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
                          {post.content}
                      </div>

                      {/* Attachments Display */}
                      {post.attachments && post.attachments.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                              {post.attachments.map((att, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => downloadAttachment(att)}
                                    className="flex items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  >
                                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg mr-3 shadow-sm text-indigo-600">
                                          {att.type === 'image' ? <ImageIcon size={20}/> : <FileText size={20}/>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{att.name}</p>
                                          <p className="text-[10px] text-gray-400 uppercase">{att.type}</p>
                                      </div>
                                      <Download size={16} className="text-gray-400" />
                                  </div>
                              ))}
                          </div>
                      )}
                      
                      {/* Social Actions */}
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                          <div className="flex space-x-6">
                            <button 
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'}`}
                            >
                                <Heart size={20} className={isLiked ? 'fill-pink-500' : ''} />
                                <span>{post.likes.length}</span>
                            </button>
                            
                            <button 
                                onClick={() => setShowComments({...showComments, [post.id]: !commentsVisible})}
                                className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <MessageCircle size={20} />
                                <span>{post.comments.length} Class Comments</span>
                            </button>
                          </div>
                      </div>

                      {/* Comments Section */}
                      {commentsVisible && (
                          <div className="mt-6 animate-fade-in bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                  {post.comments.map(comment => (
                                      <div key={comment.id} className="flex space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                              {comment.username.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm">
                                              <div className="flex justify-between items-baseline mb-1">
                                                  <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                      {comment.username === ADMIN_USERNAME ? 'Teacher' : comment.username}
                                                  </span>
                                                  <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                              </div>
                                              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                          </div>
                                      </div>
                                  ))}
                                  {post.comments.length === 0 && <p className="text-center text-xs text-gray-400 py-2">No comments yet. Be the first!</p>}
                              </div>
                              <div className="flex items-center gap-2 relative">
                                  <input 
                                    type="text" 
                                    placeholder="Add a class comment..." 
                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white pr-10"
                                    value={commentText[post.id] || ''}
                                    onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                  />
                                  <button 
                                    onClick={() => handleComment(post.id)}
                                    className="absolute right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                                  >
                                      <Send size={14} />
                                  </button>
                              </div>
                          </div>
                      )}
                   </div>
                 );
               })
          )}
      </div>
    </div>
  );
};
