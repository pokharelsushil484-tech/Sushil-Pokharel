import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, 
  Bot, 
  LogOut, 
  GraduationCap, 
  Cpu, 
  BookOpen, 
  Send, 
  Menu, 
  X, 
  Briefcase,
  Award,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type View = 'login' | 'profile' | 'ai-chat';

// --- Components ---

// 1. Auto-Generated Logo
const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#4F46E5" />
    <path d="M30 70V30H70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M70 70V50H45" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="50" y="65" fontFamily="Arial" fontWeight="bold" fontSize="35" fill="white" textAnchor="middle">SP</text>
  </svg>
);

// 2. Login Page
const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation of login
    if (email && password) onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-20 h-20 mb-4 shadow-lg rounded-full" />
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back, Sushil</h1>
          <p className="text-slate-500 text-sm mt-1">Access your personal dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="sushil@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. Profile Page
const Profile = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" 
                alt="Sushil Pokhrel" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-slate-200"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">Student</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">Researcher</span>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sushil Pokhrel</h1>
            <p className="text-slate-500 font-medium">BBS Student & Technology Enthusiast</p>
            <p className="mt-4 text-slate-600 leading-relaxed max-w-2xl">
              I am a dedicated learner bridging the gap between Business Studies and Technology. 
              With a background in Computer Science and a current focus on Business Studies, 
              I am passionate about leveraging AI to solve complex business problems.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Education</h2>
          </div>
          
          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-indigo-100">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
              <h3 className="font-semibold text-slate-900">Bachelor of Business Studies (BBS)</h3>
              <p className="text-sm text-slate-500">Pursuing</p>
              <p className="text-sm text-slate-600 mt-2">Focusing on financial management, business analysis, and strategic planning.</p>
            </div>
            
            <div className="relative pl-6 border-l-2 border-slate-100">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
              <h3 className="font-semibold text-slate-900">Grade 12 (Computer Science)</h3>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-sm text-slate-600 mt-2">Specialized in Computer Science, programming fundamentals, and data logic.</p>
            </div>
          </div>
        </div>

        {/* Interests & Skills */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Interests & Expertise</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Core Interests</h3>
              <div className="flex flex-wrap gap-2">
                {['Artificial Intelligence', 'Technology Research', 'Business Analytics', 'Innovation'].map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:border-indigo-300 transition-colors cursor-default">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Learning Journey</h3>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <Sparkles className="w-8 h-8 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Exploring GenAI</p>
                  <p className="text-xs text-indigo-700">Currently researching LLM applications in business.</p>
                </div>
              </div>
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
    { role: 'model', text: "Hello Sushil! I'm your AI Research Assistant. How can I help you with your BBS studies or tech research today?" }
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: `You are a helpful research assistant for Sushil, a BBS student interested in Computer Science. Answer concisely. User: ${userMessage}`,
      });
      
      const text = response.text || "I couldn't generate a response at this moment.";
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not connect to AI service. Please check API Key." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">Sushil's Assistant</h2>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 rounded-2xl p-4 rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Business trends, AI, or research topics..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

// 5. Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl text-slate-800">MySpace</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="profile" icon={User} label="Profile Overview" />
          <NavItem view="ai-chat" icon={Bot} label="AI Research Assistant" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-lg text-slate-800">MySpace</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-10 bg-white pt-20 px-4">
            <nav className="space-y-2">
              <NavItem view="profile" icon={User} label="Profile Overview" />
              <NavItem view="ai-chat" icon={Bot} label="AI Research Assistant" />
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
