
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, GraduationCap, Send, Menu, X, 
  Facebook, Mail, Phone, Shield, Cpu, 
  Sparkles, Globe, Play, CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { APP_NAME, STUDENT_IDENTITY, ADMIN_EMAIL, ADMIN_PHONE, COPYRIGHT_NOTICE, PRECISION_WATERMARK } from './constants';

// --- Types ---
type View = 'home' | 'about' | 'interests' | 'contact' | 'terms' | 'error';

// --- Components ---

const ErrorPage = ({ reset }: { reset: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-6 text-center animate-scale-up bg-[#0a0a0a]">
    <div className="bg-zinc-900/80 p-16 rounded-[4rem] border border-red-500/20 max-w-lg shadow-2xl backdrop-blur-3xl">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">System Suspension</h2>
      <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-12 leading-relaxed">
        Critical protocol mismatch. The requested identity state is currently unavailable. 
      </p>
      <button 
        onClick={reset}
        className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl"
      >
        <RefreshCw size={18} /> Restore Environment
      </button>
    </div>
  </div>
);

const Navbar = ({ setView, currentView }: { setView: (v: View) => void, currentView: View }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center bg-transparent">
      <div 
        className="text-lg font-black tracking-tighter uppercase cursor-pointer text-white" 
        onClick={() => setView('home')}
      >
        Sushil Pokharel
      </div>
      
      <div className="hidden md:flex gap-12 items-center">
        {['home', 'about', 'interests', 'contact'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as View)}
            className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
              currentView === v ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {v}
          </button>
        ))}
        <button className="text-white hover:opacity-70 transition-opacity">
            <Menu size={24} />
        </button>
      </div>

      <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-0 left-0 w-full h-screen bg-[#0a0a0a] p-12 flex flex-col justify-center items-center gap-10 animate-fade-in z-[60]">
          {['home', 'about', 'interests', 'contact', 'terms'].map((v) => (
            <button 
              key={v} 
              onClick={() => { setView(v as View); setIsOpen(false); }} 
              className="text-4xl font-black uppercase tracking-tighter text-white hover:italic transition-all"
            >
              {v}
            </button>
          ))}
          <button onClick={() => setIsOpen(false)} className="mt-20 p-4 border border-white/20 rounded-full text-white">
              <X size={32} />
          </button>
        </div>
      )}
    </nav>
  );
};

const App = () => {
  const [view, setView] = useState<View>('home');
  // Fixed professional photo path
  const sushilPhoto = "https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/sushil-p.png";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <section className="flex flex-col md:flex-row min-h-screen pt-0 bg-[#0a0a0a] overflow-hidden">
            {/* Left Side: Large Photo (Grayscale as per reference) */}
            <div className="w-full md:w-1/2 h-[70vh] md:h-screen relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale brightness-90 transition-transform duration-1000 hover:scale-105" 
                    alt="Sushil Pokharel Portrait" 
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-10 left-10 hidden md:block">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Identity Verified</span>
                </div>
            </div>

            {/* Right Side: Professional Typography */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-24 py-20 md:py-0">
                <div className="space-y-12 animate-slide-up">
                    <div className="h-px w-24 bg-white/20"></div>
                    <h1 className="text-7xl md:text-[11rem] font-black text-white leading-[0.8] tracking-tighter uppercase">
                        My<br/>Portfolio
                    </h1>
                    <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-md leading-relaxed">
                        I am <span className="text-white">Sushil Pokharel</span>, a BBS student bridging management concepts with technical excellence. This is my professional digital showcase.
                    </p>
                    <div className="flex items-center gap-8 pt-6">
                        <button onClick={() => setView('interests')} className="flex items-center gap-4 text-white group">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">View Interests</span>
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-10 right-10 hidden md:block">
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">S. Pokharel / 01</p>
                </div>
            </div>
          </section>
        );
      case 'about':
        return (
            <section className="py-40 px-8 max-w-4xl mx-auto space-y-20 animate-fade-in">
                <div className="text-center space-y-4">
                  <h2 className="text-7xl font-black uppercase tracking-tighter italic">About Me</h2>
                  <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-[0.6em]">{STUDENT_IDENTITY}</p>
                </div>
                
                <div className="space-y-8 text-xl text-zinc-400 leading-relaxed font-medium">
                    <p>
                        Currently pursuing a <span className="text-white">Bachelor of Business Studies (BBS)</span>, I am dedicated to understanding the strategic intersection of management and modern technology. My academic focus involves leveraging quantitative analysis and business ethics to drive innovation in emerging markets.
                    </p>
                    <p>
                        Beyond my academic track, I am an enthusiast of computer hardware and AI developments. I believe that technical efficiency is the backbone of any successful business environment, and I strive to bridge the gap between complex IT frameworks and practical management solutions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-20 border-t border-white/5">
                    <div className="p-10 bg-zinc-900/30 rounded-[2.5rem] border border-white/5 flex items-center space-x-6">
                        <div className="p-4 bg-white rounded-2xl text-black shadow-xl"><GraduationCap size={24}/></div>
                        <div>
                            <h4 className="text-lg font-bold uppercase tracking-tight text-white">BBS Candidate</h4>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Class of 2026</p>
                        </div>
                    </div>
                    <div className="p-10 bg-zinc-900/30 rounded-[2.5rem] border border-white/5 flex items-center space-x-6">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl"><Shield size={24}/></div>
                        <div>
                            <h4 className="text-lg font-bold uppercase tracking-tight text-white">Ethical Integrity</h4>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Digital Governance</p>
                        </div>
                    </div>
                </div>
            </section>
        );
      case 'interests':
        return (
          <section className="py-40 px-8 max-w-7xl mx-auto space-y-32 animate-fade-in">
             <div className="space-y-4">
                <h2 className="text-6xl font-black uppercase tracking-tighter italic">Core Interests</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.5em]">Academic & Personal Innovations</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 px-1 py-1 bg-white/5">
                {[
                  { icon: Cpu, title: "Modern Hardware", desc: "Passionate about the evolution of computer components and high-performance computing architectures." },
                  { icon: Sparkles, title: "Applied AI", desc: "Exploring how Artificial Intelligence can automate market research and business logic in the BBS domain." },
                  { icon: Globe, title: "Digital Ethics", desc: "Advocating for data privacy and ethical implementation of tech in non-IT business sectors." },
                  { icon: Send, title: "Communication", desc: "Studying the impact of digital communication platforms on modern business management." },
                  { icon: Shield, title: "Cyber Safety", desc: "Interested in developing security protocols for individuals and small business entities." },
                  { icon: User, title: "User Experience", desc: "Analyzing human-computer interaction to improve business software usability." }
                ].map((item, i) => (
                  <div key={i} className="bg-black p-12 space-y-6 hover:bg-zinc-950 transition-colors group">
                    <item.icon className="text-indigo-500 group-hover:scale-110 transition-transform" size={28} />
                    <h4 className="text-xl font-bold uppercase tracking-tight text-white">{item.title}</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </section>
        );
      case 'contact':
        return (
            <section className="py-40 px-8 max-w-4xl mx-auto animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        <h2 className="text-7xl font-black uppercase tracking-tighter italic">Connect</h2>
                        <div className="space-y-6">
                            <a href={`mailto:${ADMIN_EMAIL}`} className="block text-2xl font-bold text-white hover:text-indigo-500 transition-colors">{ADMIN_EMAIL}</a>
                            <a href={`tel:${ADMIN_PHONE}`} className="block text-2xl font-bold text-white hover:text-indigo-500 transition-colors">{ADMIN_PHONE}</a>
                        </div>
                        <div className="flex gap-6 pt-10">
                            <a href="https://www.facebook.com/Susilpokrel09" target="_blank" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">Facebook</a>
                            <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">Instagram</a>
                        </div>
                    </div>
                    <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); alert('Transmission Successful.'); }}>
                        <input required type="text" placeholder="Your Name" className="w-full bg-transparent border-b border-white/10 py-6 text-sm font-bold uppercase tracking-widest focus:border-white outline-none transition-all placeholder:text-zinc-800" />
                        <input required type="email" placeholder="Your Email" className="w-full bg-transparent border-b border-white/10 py-6 text-sm font-bold uppercase tracking-widest focus:border-white outline-none transition-all placeholder:text-zinc-800" />
                        <textarea required rows={4} placeholder="Your Message" className="w-full bg-transparent border-b border-white/10 py-6 text-sm font-bold uppercase tracking-widest focus:border-white outline-none transition-all resize-none placeholder:text-zinc-800"></textarea>
                        <button className="bg-white text-black px-12 py-5 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-colors">Send Inquiry</button>
                    </form>
                </div>
            </section>
        );
      case 'terms':
        return (
            <section className="py-40 px-8 max-w-3xl mx-auto space-y-16 animate-fade-in">
                <h2 className="text-6xl font-black uppercase tracking-tighter text-center italic">Terms</h2>
                <div className="space-y-12">
                    {[
                        { title: "Identity Context", text: "This application is the exclusive professional portfolio of Sushil Pokharel. All content reflects his individual academic history and research interests." },
                        { title: "Intellectual Property", text: "Branding, UI architecture, and text content are property of the author. This design is built with precision for professional representation." },
                        { title: "Privacy Protocol", text: "Information transmitted via contact channels is strictly confidential and used solely for professional engagement." }
                    ].map((item, i) => (
                        <div key={i} className="space-y-4 border-l-2 border-white/10 pl-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500">{item.title}</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        );
      case 'error':
        return <ErrorPage reset={() => setView('home')} />;
      default:
        return <ErrorPage reset={() => setView('home')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black antialiased overflow-x-hidden">
      <Navbar setView={setView} currentView={view} />
      
      <main className="min-h-screen">
        {renderContent()}
      </main>

      <footer className="py-40 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-16">
          <div className="space-y-8 w-full md:w-auto">
            <h4 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Sushil<br/>Pokharel</h4>
            <div className="flex gap-10">
                <button onClick={() => setView('terms')} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors">Legal</button>
                <button onClick={() => setView('contact')} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors">Connect</button>
            </div>
          </div>

          <div className="text-right space-y-10 w-full md:w-auto">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] italic">
                  {PRECISION_WATERMARK}
                </p>
                <button 
                    onClick={() => setView('error')}
                    className="text-[9px] font-bold text-zinc-800 hover:text-red-900 uppercase tracking-widest transition-colors flex items-center justify-end ml-auto"
                >
                    <AlertTriangle size={10} className="mr-2"/> System Status
                </button>
             </div>
             <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.8em]">
               {COPYRIGHT_NOTICE}
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Render ---
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
