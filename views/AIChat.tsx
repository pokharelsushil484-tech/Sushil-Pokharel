
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Loader2, MessageCircle, Lock } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithAI } from '../services/geminiService';

interface AIChatProps {
  chatHistory: ChatMessage[];
  setChatHistory: (messages: ChatMessage[]) => void;
  isVerified?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ chatHistory, setChatHistory, isVerified }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  // LOCK FOR UNVERIFIED USERS
  if (isVerified === false) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-yellow-200">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Feature Locked</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                      AI Study Assistant is restricted to verified students only. Please request verification from your Dashboard.
                  </p>
              </div>
          </div>
      );
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

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

  const clearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setChatHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
             <Bot className="mr-2 text-indigo-600 dark:text-indigo-400" /> Ask AI
           </h1>
           <p className="text-xs text-gray-500 dark:text-gray-400">Your personal study companion</p>
        </div>
        {chatHistory.length > 0 && (
          <button 
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4 mb-4 scroll-smooth">
        {chatHistory.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-70">
              <MessageCircle size={48} className="text-indigo-200 dark:text-gray-600" />
              <div className="text-center">
                 <p className="font-medium">Hi! I'm here to help.</p>
                 <p className="text-xs mt-1">Ask me about your homework, career paths,<br/>or request a study schedule.</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                 {["Help me verify a calculus theorem", "Tips for CV writing?", "Explain Photosynthesis"].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-xs bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full transition-colors"
                    >
                      "{suggestion}"
                    </button>
                 ))}
              </div>
           </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                <div className="font-bold text-[10px] opacity-70 mb-1 flex items-center">
                   {msg.sender === 'user' ? <User size={10} className="mr-1"/> : <Bot size={10} className="mr-1"/>}
                   {msg.sender === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none flex items-center space-x-2">
              <Bot size={14} className="text-gray-400" />
              <div className="flex space-x-1">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 pl-4 pr-12 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-md"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};
