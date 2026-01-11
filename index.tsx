import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, 
  Bot, 
  LogOut, 
  GraduationCap, 
  BookOpen, 
  Send, 
  Menu, 
  X, 
  Briefcase,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

// 1. Auto-Generated Logo
const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-xl bg-indigo-600 text-white font-bold ${className}`}>
    <span className="text-sm tracking-tighter">SP</span>
  </div>
);

// 2. Login Page
const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login success
    if (email && password) onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 text-2xl mb-4 shadow-lg shadow-indigo-200" />
          <h1 className="text-2xl font-bold text-slate-800">StudentPocket</h1>
          <p className="text-slate-500 text-sm mt-1">By Sushil Pokhrel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Student Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="sushil@student.edu"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 transform active:scale-95"
          >
            Access Portfolio
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. Profile Page (Dashboard)
const Profile = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" 
                alt="Sushil Pokhrel" 
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-slate-200"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">BBS Student</span>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sushil Pokhrel</h1>
            <p className="text-slate-500 font-medium">Technology & Research Enthusiast</p>
            
            <div className="mt-6 flex flex-wrap gap-3">
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
                 <Bot size={16} className="text-indigo-500" />
                 <span>AI Research</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
                 <Search size={16} className="text-indigo-500" />
                 <span>Learning</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education Timeline */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <GraduationCap size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Academic Journey</h2>
          </div>
          
          <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            
            {/* Current Education */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm ring-1 ring-indigo-100"></div>
              <h3 className="font-bold text-slate-900">Bachelor of Business Studies (BBS)</h3>
              <p className="text-sm text-indigo-600 font-medium">Current Specialization</p>
              <p className="text-sm text-slate-500 mt-1">Focusing on business management, economics, and strategic planning.</p>
            </div>
            
            {/* Past Education */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
              <h3 className="font-bold text-slate-900">Grade 12</h3>
              <p className="text-sm text-slate-500 font-medium">Computer Science Major</p>
              <p className="text-sm text-slate-500 mt-1">Passed with distinction. Core focus on programming logic and systems.</p>
            </div>
          </div>
        </div>

        {/* Interests & Skills */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Sparkles size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">About Me</h2>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            I am a student passionate about bridging the gap between Business and Technology. 
            My background in Computer Science combined with my current Business studies allows me to 
            approach problems with a unique analytical perspective.
          </p>

          <div className="mt-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {['Artificial Intelligence', 'Business Tech', 'Market Research', 'Innovation'].map((item) => (
                <span key={item} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. AI Assistant Feature
const AIChat = () => {
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Namaste Sushil! I am your Smart Research Assistant. How can I help you with your BBS studies or tech research today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: `You are a helpful research assistant for Sushil, a BBS student with a background in Computer Science. Keep answers concise, professional, and educational. User: ${userMessage}`,
      });
      
      const text = response.text || "I couldn't process that request right now.";
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please check your internet or API key." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">Smart Assistant</h2>
          <p className="text-xs text-slate-500">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-bl-sm shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

// 5. Main App Shell
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'profile' | 'ai'>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: 'profile' | 'ai', icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view 
          ? 'bg-indigo-50 text-indigo-700 font-semibold' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${currentView === view ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{label}</span>
      </div>
      {currentView === view && <ChevronRight size={16} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">StudentPocket</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">By Sushil</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="px-4 py-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</p>
          </div>
          <NavItem view="profile" icon={User} label="Profile" />
          <NavItem view="ai" icon={Bot} label="Research Assistant" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-slate-800">StudentPocket</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg active:bg-slate-200"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-10 bg-white pt-20 px-4 animate-fade-in">
            <nav className="space-y-2">
              <NavItem view="profile" icon={User} label="My Profile" />
              <NavItem view="ai" icon={Bot} label="Research Assistant" />
              <div className="h-px bg-slate-100 my-4"></div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {currentView === 'profile' ? <Profile /> : <AIChat />}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
