
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, Loader2, MessageCircle, Lock, ShieldAlert, RefreshCw, Sparkles } from 'lucide-react';
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
          <div className="h-[70vh] flex flex-col items-center justify-center px-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-12 w-full max-w-md text-center relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                      <Lock size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-display italic mb-2">Feature Locked</h2>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest leading-relaxed">
                      AI assistance is restricted to verified nodes. Submit biometric audit from dashboard.
                  </p>
              </motion.div>
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
      className="flex flex-col h-[calc(100vh-140px)] relative space-y-6"
    >
      <motion.div variants={item} className="flex justify-between items-center glass-card p-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
             <Bot className="text-white" size={24} />
           </div>
           <div>
             <h1 className="text-xl font-display italic tracking-tight flex items-center gap-2">
               Neural Relay <Sparkles size={14} className="text-emerald-400" />
             </h1>
             <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">Institutional Intelligence Mesh</p>
           </div>
        </div>
        {chatHistory.length > 0 && (
          <button onClick={() => setChatHistory([])} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 transition-colors border border-white/5 hover:bg-white/10"><Trash2 size={18} /></button>
        )}
      </motion.div>

      <motion.div variants={item} className="flex-1 overflow-y-auto glass-card p-6 space-y-6 scroll-smooth">
        {chatHistory.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-8">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
                <MessageCircle size={64} className="text-white" />
              </div>
              <div className="text-center space-y-2">
                 <p className="text-xs font-semibold uppercase tracking-widest">System Listening</p>
                 <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Awaiting Command Input...</p>
              </div>
           </div>
        ) : (
          <AnimatePresence>
            {chatHistory.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-6 rounded-2xl text-sm leading-relaxed relative overflow-hidden ${msg.sender === 'user' ? 'bg-white text-black rounded-br-none' : 'bg-white/5 text-white/80 border border-white/10 rounded-bl-none'}`}>
                  <div className="text-[9px] font-semibold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                     {msg.sender === 'user' ? <User size={10}/> : <Bot size={10}/>}
                     {msg.sender === 'user' ? 'Identity Node' : 'Neural Architect'}
                  </div>
                  <div className="font-medium">{msg.text}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none flex items-center space-x-3">
              <RefreshCw className="animate-spin text-white/60" size={14} />
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-widest">Processing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      <motion.form variants={item} onSubmit={handleSend} className="relative group">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Enter command sequence..." 
          className="w-full bg-black/40 border border-white/10 text-white font-medium text-sm pl-6 pr-20 py-5 rounded-2xl outline-none focus:border-white/20 transition-all placeholder:text-white/20 backdrop-blur-xl" 
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading} 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-white/90 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </motion.form>
    </motion.div>
  );
};
