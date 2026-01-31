
import React, { useState, useEffect, useRef } from 'react';
import { SupportTicket, TicketMessage } from '../types';
import { LifeBuoy, Plus, MessageSquare, Send, CheckCircle, XCircle, Clock, ShieldCheck, X } from 'lucide-react';
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

  return (
    <div className="pb-24 animate-fade-in w-full max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-xl">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Institutional Support</h1>
           <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Personnel Help Desk</p>
        </div>
        <button 
            onClick={() => setShowNewTicket(true)}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl hover:bg-slate-200 transition-all"
        >
            <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-4">
            {tickets.map(ticket => (
                <div 
                    key={ticket.id}
                    onClick={() => { setActiveTicket(ticket); setShowNewTicket(false); }}
                    className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all ${activeTicket?.id === ticket.id ? 'bg-indigo-600 text-white' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className={`px-3 py-0.5 rounded text-[8px] font-black uppercase ${ticket.status === 'OPEN' ? 'bg-emerald-500 text-black' : 'bg-slate-800'}`}>{ticket.status}</span>
                        <span className="text-[9px] font-mono opacity-40">#{ticket.id}</span>
                    </div>
                    <h3 className="font-bold text-sm italic">{ticket.subject}</h3>
                </div>
            ))}
         </div>

         <div className="lg:col-span-2">
            {showNewTicket ? (
                <div className="master-box p-12 border-indigo-500/20 bg-black/40 animate-scale-up">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-white uppercase italic">Initialize Ticket</h2>
                        <button onClick={() => setShowNewTicket(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
                    </div>
                    <form onSubmit={createTicket} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Subject Node</label>
                            <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="w-full p-5 bg-black border border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all" placeholder="TOPIC IDENTIFIER" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Detailed Message</label>
                            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={5} className="w-full p-5 bg-black border border-white/5 rounded-2xl font-medium text-white outline-none focus:border-indigo-500 transition-all resize-none" placeholder="LOG THE ISSUE DETAILS..." required />
                        </div>
                        <button type="submit" className="w-full py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-2xl">Commit Request</button>
                    </form>
                </div>
            ) : activeTicket ? (
                <div className="master-box flex flex-col h-[600px] border-white/10 bg-black/40 animate-fade-in">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="text-xl font-black text-white italic">{activeTicket.subject}</h3>
                        <div className="flex items-center space-x-3">
                            {activeTicket.status === 'OPEN' ? <Clock className="text-amber-500" size={16}/> : <CheckCircle className="text-emerald-500" size={16}/>}
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">STATUS: {activeTicket.status}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-box">
                        {activeTicket.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-5 rounded-[2rem] ${msg.sender === username ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/5 text-slate-200 rounded-bl-none border border-white/5'}`}>
                                    {msg.isAdmin && <div className="flex items-center gap-2 mb-2 text-[8px] font-black text-indigo-400 uppercase tracking-widest"><ShieldCheck size={10}/> Institutional Support</div>}
                                    <p className="text-sm font-medium">{msg.text}</p>
                                    <p className="text-[8px] opacity-40 mt-3 font-bold">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    {activeTicket.status === 'OPEN' && (
                        <div className="p-6 bg-slate-950/50 border-t border-white/5">
                            <form onSubmit={sendReply} className="relative">
                                <input value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-8 pr-16 text-xs text-white outline-none focus:border-indigo-500" placeholder="TYPE REPLY..." />
                                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-black rounded-xl hover:bg-slate-200">
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center opacity-20">
                    <LifeBuoy size={64} className="mb-6" />
                    <p className="text-xs font-black uppercase tracking-[0.4em]">Select Node Communication</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
