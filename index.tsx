import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, Bot, GraduationCap, Send, Menu, X, 
  Sparkles, ChevronRight, Github, Linkedin, 
  Mail, ExternalLink, Calendar, Search, PlayCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type View = 'portfolio' | 'ai' | 'academics' | 'contact';

// --- Components ---

const Navbar = ({ setView, currentView }: { setView: (v: View) => void, currentView: View }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-black/50 border-b border-white/5">
      <div className="text-xl font-black tracking-tighter uppercase">Sushil Pokharel</div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 items-center">
        {['portfolio', 'academics', 'ai'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as View)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentView === v ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            {v === 'ai' ? 'AI Assistant' : v}
          </button>
        ))}
        <button 
          onClick={() => setView('contact')}
          className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
        >
          Contact
        </button>
      </div>

      {/* Mobile Toggle */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 p-8 flex flex-col gap-6 animate-slide-up">
          {['portfolio', 'academics', 'ai', 'contact'].map((v) => (
            <button key={v} onClick={() => { setView(v as View); setIsOpen(false); }} className="text-left text-lg font-bold uppercase">{v}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <div className="min-h-screen flex flex-col md:flex-row pt-20">
    {/* Left: Black & White Photo Area */}
    <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-zinc-900 relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
        className="w-full h-full object-cover grayscale opacity-80"
        alt="Sushil Pokharel Portrait"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
    </div>

    {/* Right: Portfolio Header Text (Matching the User's Image) */}
    <div className="w-full md:w-1/2 bg-black flex flex-col justify-center p-8 md:p-20 space-y-8">
      <div className="animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[1px] w-20 bg-white/40"></div>
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/60">Business & Tech</span>
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-6">
          MY<br />PORTFOLIO
        </h1>
        <p className="max-w-md text-zinc-400 text-sm leading-relaxed font-medium mb-10">
          Bridging the gap between Bachelor of Business Studies (BBS) and Computer Science. I specialize in market research and AI-driven business strategies.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button className="bg-white text-black px-10 py-4 rounded-sm font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
            Explore Work
          </button>
          <button className="flex items-center gap-2 text-white px-10 py-4 rounded-sm font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-all">
            <PlayCircle size={18} /> Play Video
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AcademicJourney = () => (
  <section className="py-20 px-8 max-w-6xl mx-auto space-y-12">
    <div className="border-l border-white/10 pl-8 space-y-2">
      <h2 className="text-4xl font-black uppercase tracking-tighter italic">Academics</h2>
      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">My Educational Timeline</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="p-10 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-6">
          <GraduationCap className="text-white" size={32} />
          <span className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Running</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Bachelor of Business Studies (BBS)</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">Currently specializing in strategic management and technology integration for the modern marketplace.</p>
      </div>

      <div className="p-10 bg-zinc-900/50 border border-white/5 rounded-2xl opacity-60">
        <div className="flex justify-between items-start mb-6">
          <User className="text-white" size={32} />
          <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Grade 12</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">Major in Computer Science. Strong foundation in logic, data structures, and algorithmic thinking.</p>
      </div>
    </div>
  </section>
);

const AIChat = () => {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I'm Sushil's AI assistant. Ask me anything about his business research or CS background." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const onSend = async (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const model = 'gemini-3-flash-preview';
      const response = await genAI.models.generateContent({
        model,
        contents: `Context: You are representing Sushil Pokharel, a BBS student with a background in Computer Science interested in AI and Research. Respond to: ${msg}`
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Something went wrong." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Service temporarily unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 h-[80vh] flex flex-col">
      <div className="mb-8 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-black uppercase tracking-widest">Research Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-xl text-sm ${m.role === 'user' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-300 border border-white/10'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-zinc-500 animate-pulse uppercase tracking-widest font-black">AI is thinking...</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSend} className="flex gap-2">
        <input 
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..." 
          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-6 py-4 text-sm outline-none focus:border-white transition-all"
        />
        <button type="submit" className="bg-white text-black p-4 rounded-xl hover:bg-zinc-200"><Send size={20} /></button>
      </form>
    </div>
  );
};

const Contact = () => (
  <section className="py-20 px-8 text-center space-y-12">
    <div className="space-y-4">
      <h2 className="text-6xl font-black tracking-tighter uppercase">Let's Connect</h2>
      <p className="text-zinc-500 max-w-lg mx-auto uppercase text-xs font-bold tracking-[0.4em]">Available for Collaboration & Internships</p>
    </div>
    
    <div className="flex flex-wrap justify-center gap-8">
      <a href="#" className="flex items-center gap-4 group p-6 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-white/20">
        <Linkedin className="group-hover:text-blue-500 transition-colors" />
        <span className="font-bold uppercase tracking-widest text-xs">LinkedIn</span>
      </a>
      <a href="#" className="flex items-center gap-4 group p-6 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-white/20">
        <Mail className="group-hover:text-red-500 transition-colors" />
        <span className="font-bold uppercase tracking-widest text-xs">Email</span>
      </a>
    </div>
  </section>
);

const App = () => {
  const [view, setView] = useState<View>('portfolio');

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar setView={setView} currentView={view} />
      
      <main className="animate-fade-in">
        {view === 'portfolio' && (
          <>
            <Hero />
            <div className="bg-gradient-to-b from-black to-zinc-950">
              <section className="py-20 px-8 max-w-6xl mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                      <Sparkles className="text-zinc-500" />
                      <h3 className="text-xl font-bold uppercase italic">AI & Innovation</h3>
                      <p className="text-zinc-500 text-sm">Passionate about utilizing Generative AI to automate business operations and market forecasting.</p>
                    </div>
                    <div className="space-y-4">
                      <Search className="text-zinc-500" />
                      <h3 className="text-xl font-bold uppercase italic">Market Research</h3>
                      <p className="text-zinc-500 text-sm">Deep analysis of consumer behavior and data trends to drive strategic growth for emerging brands.</p>
                    </div>
                    <div className="space-y-4">
                      <ExternalLink className="text-zinc-500" />
                      <h3 className="text-xl font-bold uppercase italic">Consulting</h3>
                      <p className="text-zinc-500 text-sm">Providing technical insights to non-IT business sectors to streamline digital transformation.</p>
                    </div>
                 </div>
              </section>
            </div>
          </>
        )}
        
        {view === 'academics' && <AcademicJourney />}
        {view === 'ai' && <AIChat />}
        {view === 'contact' && <Contact />}
      </main>

      <footer className="py-12 px-8 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">
        &copy; 2025 SUSHIL POKHAREL | ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

// --- Render ---
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);