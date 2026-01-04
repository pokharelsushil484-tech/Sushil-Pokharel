
import React, { useState, useEffect, useRef } from 'react';
import { SupportTicket, TicketMessage } from '../types';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, XCircle, Clock, ChevronRight, User, ShieldCheck } from 'lucide-react';
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
      // Filter for this user
      const myTickets = allTickets.filter(t => t.userId === username).sort((a, b) => b.updatedAt - a.updatedAt);
      setTickets(myTickets);
      
      // Update active ticket if exists (to show new messages)
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
            if (allTickets[ticketIndex].status === 'CLOSED') {
                allTickets[ticketIndex].status = 'OPEN'; // Re-open if closed
            }
            localStorage.setItem('studentpocket_tickets', JSON.stringify(allTickets));
            loadTickets();
            setReplyText('');
        }
    }
  };

  const closeTicket = () => {
      if (!activeTicket) return;
      if (!window.confirm("Are you sure you want to close this ticket?")) return;

      const stored = localStorage.getItem('studentpocket_tickets');
      if (stored) {
          const allTickets: SupportTicket[] = JSON.parse(stored);
          const ticketIndex = allTickets.findIndex(t => t.id === activeTicket.id);
          if (ticketIndex !== -1) {
              allTickets[ticketIndex].status = 'CLOSED';
              allTickets[ticketIndex].updatedAt = Date.now();
              localStorage.setItem('studentpocket_tickets', JSON.stringify(allTickets));
              loadTickets();
          }
      }
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Help Center</h1>
           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Professional Support</p>
        </div>
        <button 
            onClick={() => setShowNewTicket(true)}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform"
        >
            <Plus size={28} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Ticket List */}
         <div className="lg:col-span-1 space-y-4">
            {tickets.length === 0 && !showNewTicket && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No tickets found</p>
                </div>
            )}
            
            {tickets.map(ticket => (
                <div 
                    key={ticket.id}
                    onClick={() => { setActiveTicket(ticket); setShowNewTicket(false); }}
                    className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${
                        activeTicket?.id === ticket.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                    }`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            ticket.status === 'OPEN' 
                            ? (activeTicket?.id === ticket.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600') 
                            : (activeTicket?.id === ticket.id ? 'bg-black/20 text-white/70' : 'bg-slate-100 text-slate-500')
                        }`}>
                            {ticket.status}
                        </span>
                        <span className={`text-[10px] font-mono ${activeTicket?.id === ticket.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                            #{ticket.id}
                        </span>
                    </div>
                    <h3 className={`font-bold text-sm mb-1 ${activeTicket?.id === ticket.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{ticket.subject}</h3>
                    <p className={`text-xs truncate ${activeTicket?.id === ticket.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {ticket.messages[ticket.messages.length - 1].text}
                    </p>
                </div>
            ))}
         </div>

         {/* Content Area */}
         <div className="lg:col-span-2">
            {showNewTicket ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl animate-scale-up">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Request</h2>
                        <button onClick={() => setShowNewTicket(false)}><XCircle className="text-slate-400 hover:text-red-500 transition-colors" /></button>
                    </div>
                    <form onSubmit={createTicket} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Topic</label>
                            <input 
                                type="text" 
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-800 dark:text-white transition-all"
                                placeholder="What can we help with?"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Details</label>
                            <textarea 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                rows={6}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-medium text-slate-800 dark:text-white resize-none transition-all"
                                placeholder="Describe your issue..."
                            />
                        </div>
                        <div className="flex justify-end">
                             <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center shadow-lg">
                                <Send size={16} className="mr-2" /> Submit Ticket
                             </button>
                        </div>
                    </form>
                </div>
            ) : activeTicket ? (
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px] animate-fade-in">
                    {/* Chat Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{activeTicket.subject}</h2>
                            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider space-x-3">
                                <span className="flex items-center"><Clock size={12} className="mr-1"/> {new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                                <span className={`flex items-center ${activeTicket.status === 'OPEN' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {activeTicket.status === 'OPEN' ? <CheckCircle size={12} className="mr-1"/> : <XCircle size={12} className="mr-1"/>}
                                    {activeTicket.status}
                                </span>
                            </div>
                        </div>
                        {activeTicket.status === 'OPEN' && (
                             <button onClick={closeTicket} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors">
                                 Close Ticket
                             </button>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 dark:bg-slate-950/30">
                        {activeTicket.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${msg.sender === username ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                                        msg.sender === username 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center mt-2 space-x-2">
                                        {msg.isAdmin && <ShieldCheck size={12} className="text-indigo-500" />}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {msg.isAdmin ? 'Support Team' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {activeTicket.status === 'CLOSED' && (
                            <div className="flex justify-center my-6">
                                <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    Ticket Closed
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    {activeTicket.status === 'OPEN' && (
                        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <form onSubmit={sendReply} className="relative">
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium text-slate-800 dark:text-white focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                    placeholder="Type your reply..."
                                />
                                <button 
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
                    <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-black text-slate-400">Select a Ticket</h3>
                    <p className="text-sm text-slate-400 mt-2">View conversation history or create a new request.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
