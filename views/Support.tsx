
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportTicket, TicketMessage, UserProfile, SubscriptionTier } from '../types';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Clock, ShieldCheck, X } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

interface SupportProps {
  username: string;
  user: UserProfile;
}

export const Support: React.FC<SupportProps> = ({ username, user }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPro = user.subscriptionTier !== SubscriptionTier.LIGHT;

  useEffect(() => {
    loadTickets();
  }, [username]);

  useEffect(() => {
      if (activeTicket) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [activeTicket, tickets]);

  const loadTickets = () => {
    const stored = localStorage.getItem('studentpocket_tickets');
    if (stored) {
      const allTickets: SupportTicket[] = JSON.parse(stored);
      const myTickets = allTickets.filter(t => t.userId === username).sort((a, b) => b.updatedAt - a.updatedAt);
      setTickets(myTickets);
      if (activeTicket) {
          const updatedActive = myTickets.find(t => t.id === activeTicket.id);
          if (updatedActive) setActiveTicket(updatedActive);
      }
    }
  };

  const createTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    const newTicket: SupportTicket = {
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      userId: username,
      subject: newSubject,
      status: 'OPEN',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: Date.now().toString(),
          sender: username,
          text: newMessage,
          timestamp: Date.now(),
          isAdmin: false
        }
      ]
    };

    const stored = localStorage.getItem('studentpocket_tickets');
    const allTickets: SupportTicket[] = stored ? JSON.parse(stored) : [];
    allTickets.push(newTicket);
    localStorage.setItem('studentpocket_tickets', JSON.stringify(allTickets));

    setNewSubject('');
    setNewMessage('');
    setShowNewTicket(false);
    loadTickets();
  };

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const message: TicketMessage = {
      id: Date.now().toString(),
      sender: username,
      text: replyText,
      timestamp: Date.now(),
      isAdmin: false
    };

    const stored = localStorage.getItem('studentpocket_tickets');
    if (stored) {
        const allTickets: SupportTicket[] = JSON.parse(stored);
        const ticketIndex = allTickets.findIndex(t => t.id === activeTicket.id);
        if (ticketIndex !== -1) {
            allTickets[ticketIndex].messages.push(message);
            allTickets[ticketIndex].updatedAt = Date.now();
            localStorage.setItem('studentpocket_tickets', JSON.stringify(allTickets));
            loadTickets();
            setReplyText('');
        }
    }
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
      className="pb-20 space-y-8"
    >
      <motion.div variants={item} className={`p-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
        {isPro && <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 bg-amber-500/10"></div>}
        <div className="relative z-10 flex items-center gap-6">
            <div className={`w-16 h-16 flex items-center justify-center shrink-0 ${isPro ? 'rounded-2xl shadow-2xl bg-amber-400 text-black' : 'rounded-none border-2 border-gray-500 bg-gray-400 text-gray-800'}`}>
                <LifeBuoy size={32} />
            </div>
            <div>
               <h1 className={`text-3xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Institutional Support</h1>
               <p className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${isPro ? 'text-amber-500/60' : 'text-gray-600'}`}>Personnel Help Desk</p>
            </div>
        </div>
        <button 
            onClick={() => { setActiveTicket(null); setShowNewTicket(true); }}
            className={`p-4 relative z-10 transition-all ${isPro ? 'rounded-2xl shadow-lg bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'}`}
        >
            <Plus size={24} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div variants={item} className="lg:col-span-1 space-y-4">
            {tickets.length === 0 && !showNewTicket && (
                <div className={`p-8 text-center opacity-50 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-100/60' : 'text-gray-600'}`}>No active tickets</p>
                </div>
            )}
            {tickets.map(ticket => (
                <div 
                    key={ticket.id}
                    onClick={() => { setActiveTicket(ticket); setShowNewTicket(false); }}
                    className={`p-6 border cursor-pointer transition-all ${activeTicket?.id === ticket.id ? (isPro ? 'rounded-3xl bg-amber-400 text-black border-amber-400 shadow-xl' : 'rounded-none bg-gray-500 text-white border-gray-600') : (isPro ? 'rounded-3xl glass-card border-amber-500/10 hover:border-amber-500/30' : 'rounded-none bg-gray-200 border-gray-500 hover:bg-gray-300')}`}
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-widest ${isPro ? 'rounded-md' : 'rounded-none'} ${ticket.status === 'OPEN' ? (activeTicket?.id === ticket.id ? 'bg-black/10 text-black' : (isPro ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-200 text-green-800')) : (activeTicket?.id === ticket.id ? 'bg-black/5 text-black/60' : (isPro ? 'bg-white/5 text-white/40' : 'bg-gray-400 text-gray-600'))}`}>
                            {ticket.status}
                        </span>
                        <span className={`text-[10px] font-mono ${activeTicket?.id === ticket.id ? (isPro ? 'text-black/40' : 'text-gray-300') : (isPro ? 'text-amber-500/40' : 'text-gray-500')}`}>#{ticket.id}</span>
                    </div>
                    <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                </div>
            ))}
         </motion.div>

         <motion.div variants={item} className="lg:col-span-2">
            <AnimatePresence mode="wait">
                {showNewTicket ? (
                    <motion.div 
                        key="new-ticket"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-10 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className={`text-2xl ${isPro ? 'font-display italic text-amber-100' : 'font-sans font-bold text-gray-900'}`}>Initialize Ticket</h2>
                            <button onClick={() => setShowNewTicket(false)} className={`transition-colors ${isPro ? 'text-white/20 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}><X size={24}/></button>
                        </div>
                        <form onSubmit={createTicket} className="space-y-6">
                            <div className="space-y-2">
                                <label className={`text-[10px] font-semibold uppercase tracking-widest ml-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Subject Node</label>
                                <input 
                                    type="text" 
                                    value={newSubject} 
                                    onChange={e => setNewSubject(e.target.value)} 
                                    className={`w-full p-4 text-sm outline-none transition-all ${isPro ? 'rounded-xl bg-amber-950/20 border-amber-500/20 text-amber-100 focus:border-amber-500/40' : 'rounded-none bg-gray-200 border-2 border-gray-500 text-gray-900 focus:border-gray-700'}`}
                                    placeholder="Topic Identifier" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-[10px] font-semibold uppercase tracking-widest ml-1 ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Detailed Message</label>
                                <textarea 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    rows={6} 
                                    className={`w-full p-4 text-sm outline-none transition-all resize-none ${isPro ? 'rounded-xl bg-amber-950/20 border-amber-500/20 text-amber-100 focus:border-amber-500/40' : 'rounded-none bg-gray-200 border-2 border-gray-500 text-gray-900 focus:border-gray-700'}`}
                                    placeholder="Log the issue details..." 
                                    required 
                                />
                            </div>
                            <button type="submit" className={`w-full py-4 text-xs font-bold uppercase tracking-widest ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'}`}>Commit Request</button>
                        </form>
                    </motion.div>
                ) : activeTicket ? (
                    <motion.div 
                        key="active-ticket"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex flex-col h-[600px] overflow-hidden ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
                    >
                        <div className={`p-8 border-b flex justify-between items-center ${isPro ? 'bg-amber-950/10 border-amber-500/10' : 'bg-gray-400 border-gray-500'}`}>
                            <h3 className={`text-xl font-medium truncate pr-4 ${isPro ? 'text-amber-100' : 'text-gray-900'}`}>{activeTicket.subject}</h3>
                            <div className="flex items-center space-x-2 shrink-0">
                                {activeTicket.status === 'OPEN' ? <Clock className={isPro ? "text-amber-400" : "text-gray-600"} size={16}/> : <CheckCircle className={isPro ? "text-emerald-400" : "text-green-600"} size={16}/>}
                                <span className={`text-[10px] font-semibold uppercase tracking-widest ${isPro ? 'text-amber-500/40' : 'text-gray-600'}`}>Status: {activeTicket.status}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-box">
                            {activeTicket.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-5 ${msg.sender === username ? (isPro ? 'rounded-3xl rounded-br-sm bg-amber-400 text-black' : 'rounded-none bg-gray-500 text-white') : (isPro ? 'rounded-3xl rounded-bl-sm bg-amber-950/20 text-amber-100 border border-amber-500/20' : 'rounded-none bg-gray-200 text-gray-900 border-2 border-gray-500')}`}>
                                        {msg.isAdmin && (
                                            <div className={`flex items-center gap-2 mb-2 text-[9px] font-semibold uppercase tracking-widest ${isPro ? 'text-emerald-400' : 'text-green-700'}`}>
                                                <ShieldCheck size={12}/> Institutional Support
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <p className={`text-[9px] mt-3 font-medium ${msg.sender === username ? (isPro ? 'text-black/40' : 'text-gray-300') : (isPro ? 'text-amber-500/40' : 'text-gray-500')}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {activeTicket.status === 'OPEN' && (
                            <div className={`p-6 border-t ${isPro ? 'bg-amber-950/20 border-amber-500/10' : 'bg-gray-400 border-gray-500'}`}>
                                <form onSubmit={sendReply} className="relative">
                                    <input 
                                        value={replyText} 
                                        onChange={e => setReplyText(e.target.value)} 
                                        className={`w-full py-4 pl-6 pr-16 text-sm outline-none transition-all ${isPro ? 'rounded-2xl bg-amber-950/20 border-amber-500/20 text-amber-100 focus:border-amber-500/40 placeholder:text-amber-500/20' : 'rounded-none bg-gray-200 border-2 border-gray-500 text-gray-900 focus:border-gray-700 placeholder:text-gray-500'}`}
                                        placeholder="Type reply..." 
                                    />
                                    <button type="submit" className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 transition-colors ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400' : 'rounded-none bg-gray-500 text-white hover:bg-gray-600 border-2 border-gray-600'}`}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`h-[400px] flex flex-col items-center justify-center opacity-50 ${isPro ? 'glass-card border-amber-500/20' : 'bg-gray-300 border-4 border-gray-500 rounded-none'}`}
                    >
                        <MessageSquare size={48} className={isPro ? "mb-6 text-amber-500/20" : "mb-6 text-gray-500"} />
                        <p className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-amber-100/60' : 'text-gray-600'}`}>Select Node Communication</p>
                    </motion.div>
                )}
            </AnimatePresence>
         </motion.div>
      </div>
    </motion.div>
  );
};
