
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportTicket, TicketMessage } from '../types';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, Clock, ShieldCheck, X } from 'lucide-react';
import { ADMIN_USERNAME } from '../constants';

interface SupportProps {
  username: string;
}

export const Support: React.FC<SupportProps> = ({ username }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <motion.div variants={item} className="glass-card p-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
                <LifeBuoy size={32} />
            </div>
            <div>
               <h1 className="text-3xl font-display italic tracking-tight">Institutional Support</h1>
               <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mt-1">Personnel Help Desk</p>
            </div>
        </div>
        <button 
            onClick={() => { setActiveTicket(null); setShowNewTicket(true); }}
            className="btn-premium p-4 rounded-2xl relative z-10"
        >
            <Plus size={24} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div variants={item} className="lg:col-span-1 space-y-4">
            {tickets.length === 0 && !showNewTicket && (
                <div className="glass-card p-8 text-center opacity-50">
                    <p className="text-xs font-semibold uppercase tracking-widest">No active tickets</p>
                </div>
            )}
            {tickets.map(ticket => (
                <div 
                    key={ticket.id}
                    onClick={() => { setActiveTicket(ticket); setShowNewTicket(false); }}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all ${activeTicket?.id === ticket.id ? 'bg-white text-black border-white shadow-xl' : 'glass-card hover:border-white/20'}`}
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-semibold uppercase tracking-widest ${ticket.status === 'OPEN' ? (activeTicket?.id === ticket.id ? 'bg-black/10 text-black' : 'bg-emerald-500/10 text-emerald-400') : (activeTicket?.id === ticket.id ? 'bg-black/5 text-black/60' : 'bg-white/5 text-white/40')}`}>
                            {ticket.status}
                        </span>
                        <span className={`text-[10px] font-mono ${activeTicket?.id === ticket.id ? 'text-black/40' : 'text-white/20'}`}>#{ticket.id}</span>
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
                        className="glass-card p-10"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-display italic">Initialize Ticket</h2>
                            <button onClick={() => setShowNewTicket(false)} className="text-white/20 hover:text-white transition-colors"><X size={24}/></button>
                        </div>
                        <form onSubmit={createTicket} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Subject Node</label>
                                <input 
                                    type="text" 
                                    value={newSubject} 
                                    onChange={e => setNewSubject(e.target.value)} 
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-white/20 transition-all" 
                                    placeholder="Topic Identifier" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Detailed Message</label>
                                <textarea 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    rows={6} 
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-white/20 transition-all resize-none" 
                                    placeholder="Log the issue details..." 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn-premium w-full py-4 text-xs">Commit Request</button>
                        </form>
                    </motion.div>
                ) : activeTicket ? (
                    <motion.div 
                        key="active-ticket"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card flex flex-col h-[600px] overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-medium truncate pr-4">{activeTicket.subject}</h3>
                            <div className="flex items-center space-x-2 shrink-0">
                                {activeTicket.status === 'OPEN' ? <Clock className="text-amber-400" size={16}/> : <CheckCircle className="text-emerald-400" size={16}/>}
                                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Status: {activeTicket.status}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-box">
                            {activeTicket.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-3xl ${msg.sender === username ? 'bg-white text-black rounded-br-sm' : 'bg-white/5 text-white rounded-bl-sm border border-white/5'}`}>
                                        {msg.isAdmin && (
                                            <div className="flex items-center gap-2 mb-2 text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">
                                                <ShieldCheck size={12}/> Institutional Support
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <p className={`text-[9px] mt-3 font-medium ${msg.sender === username ? 'text-black/40' : 'text-white/20'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {activeTicket.status === 'OPEN' && (
                            <div className="p-6 bg-black/20 border-t border-white/5">
                                <form onSubmit={sendReply} className="relative">
                                    <input 
                                        value={replyText} 
                                        onChange={e => setReplyText(e.target.value)} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm text-white outline-none focus:border-white/20" 
                                        placeholder="Type reply..." 
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white text-black rounded-xl hover:bg-slate-200 transition-colors">
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
                        className="h-[400px] glass-card flex flex-col items-center justify-center opacity-50"
                    >
                        <MessageSquare size={48} className="mb-6 text-white/20" />
                        <p className="text-xs font-semibold uppercase tracking-widest">Select Node Communication</p>
                    </motion.div>
                )}
            </AnimatePresence>
         </motion.div>
      </div>
    </motion.div>
  );
};
