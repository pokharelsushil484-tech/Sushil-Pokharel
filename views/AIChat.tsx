
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Loader2, MessageCircle, Lock, ShieldAlert, RefreshCw } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithAI } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface AIChatProps {
  chatHistory: ChatMessage[];
  setChatHistory: (messages: ChatMessage[]) => void;
  isVerified?: boolean;
  username?: string; 
}

export const AIChat: React.FC<AIChatProps> = ({ chatHistory, setChatHistory, isVerified, username }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  if (isVerified === false) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
              <div className="master-box p-12 bg-slate-900 border-indigo-500/20 text-center max-w-sm">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 border border-indigo-500/20">
                      <Lock size={32} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Feature Locked</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      AI assistance is restricted to verified nodes. Submit biometric audit from dashboard.
                  </p>
              </div>
          </div>
      );
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !username) return;

    // LINGUISTIC THREAT SCAN: Check for prohibited terminology
    const isTerminated = await storageService.scanAndProtect(username, input);
    if (isTerminated) {
        window.location.reload(); // Lock user out
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };

    setChatHistory([...chatHistory, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithAI(input);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'ai',
      timestamp: Date.now(),
    };

    setChatHistory([...chatHistory, userMsg, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center">
             <Bot className="mr-4 text-indigo-500" size={32} /> Neural Relay
           </h1>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Institutional Intelligence Mesh</p>
        </div>
        {chatHistory.length > 0 && (
          <button onClick={() => setChatHistory([])} className="p-4 bg-white/5 rounded-2xl text-slate-600 hover:text-red-500 transition-colors border border-white/5"><Trash2 size={18} /></button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-black/40 rounded-[2.5rem] border border-white/5 p-8 space-y-6 scroll-smooth shadow-inner">
        {chatHistory.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-10">
              <MessageCircle size={100} className="text-white" />
              <div className="text-center space-y-2">
                 <p className="text-xs font-black uppercase tracking-[0.6em]">System Listening</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Command Input...</p>
              </div>
           </div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/5 text-slate-200 border border-white/5 rounded-bl-none'}`}>
                <div className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mb-3 flex items-center">
                   {msg.sender === 'user' ? <User size={12} className="mr-2"/> : <Bot size={12} className="mr-2"/>}
                   {msg.sender === 'user' ? 'Identity Node' : 'Neural Architect'}
                </div>
                <div className="font-medium">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-bl-none flex items-center space-x-3">
              <RefreshCw className="animate-spin text-indigo-500" size={14} />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative group">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ENTER COMMAND SEQUENCE..." className="w-full bg-black border border-white/10 text-white font-bold text-xs pl-8 pr-20 py-7 rounded-3xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-900 shadow-2xl" />
        <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-slate-200 shadow-xl transition-all">
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
        </button>
      </form>
    </div>
  );
};
