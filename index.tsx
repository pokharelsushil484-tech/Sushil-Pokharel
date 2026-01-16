
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, GraduationCap, Send, Menu, X, 
  Mail, Phone, Shield, Cpu, 
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
        Identity sync interrupted. Return to the main terminal to restore connection.
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
        className="text-lg font-black tracking-tighter uppercase cursor-pointer text-white mix-blend-difference" 
        onClick={() => setView('home')}
      >
        S. Pokhrel
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
  // Updated professional photo provided by the user
  const sushilPhoto = "https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/sushil-p.png";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <section className="flex flex-col md:flex-row min-h-screen pt-0 bg-[#0a0a0a] overflow-hidden">
            {/* Left Side: Professional Portrait */}
            <div className="w-full md:w-1/2 h-[75vh] md:h-screen relative overflow-hidden bg-zinc-900">
                <img 
                    src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/sushil-p.png" 
                    className="w-full h-full object-cover grayscale brightness-110 contrast-110 transition-all duration-1000 hover:grayscale-0 hover:scale-105" 
                    alt="Sushil Pokhrel Professional Portrait" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 hidden md:flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white/50 italic">Verified Candidate Profile</span>
                </div>
            </div>

            {/* Right Side: High-End Editorial Typography */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-24 py-24 md:py-0">
                <div className="space-y-12 animate-slide-up">
                    <div className="h-px w-24 bg-white/20"></div>
                    <h1 className="text-6xl md:text-[8rem] xl:text-[10rem] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                        Sushil<br/>Pokhrel<br/>Portfolio
                    </h1>
                    <div className="max-w-md space-y-6">
                        <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
                            BBS Candidate at the intersection of <span className="text-white">Business Strategy</span> and <span className="text-white">Technical Innovation</span>. 
                        </p>
                        <div className="flex items-center gap-10 pt-4">
                            <button onClick={() => setView('interests')} className="flex items-center gap-4 text-white group">
                                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                    <Sparkles size={20} />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Core Interests</span>
                            </button>
                            <button onClick={() => setView('about')} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                                Biography
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-10 right-10 hidden md:block">
                    <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.8em]">Nepal / 2026</p>
                </div>
            </div>
          </section>
        );
      case 'about':
        return (
            <section className="py-52 px-8 max-w-5xl mx-auto space-y-24 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-4">
                        <h2 className="text-7xl font-black uppercase tracking-tighter italic sticky top-40">About<br/>Me</h2>
                    </div>
                    <div className="md:col-span-8 space-y-12">
                        <div className="h-px w-full bg-white/10"></div>
                        <div className="space-y-8 text-2xl text-zinc-400 leading-relaxed font-light">
                            <p>
                                As a dedicated <span className="text-white">Bachelor of Business Studies (BBS)</span> student, I focus on synthesizing traditional management theories with modern digital frameworks.
                            </p>
                            <p>
                                My academic journey is defined by a commitment to quantitative rigor and ethical governance. I specialize in identifying how <span className="text-white">Emerging Technologies</span> like AI can be leveraged to streamline small-to-medium enterprise operations within non-IT sectors.
                            </p>
                            <p>
                                Outside of my formal education, I am an enthusiast of high-performance computing hardware, believing that a deep understanding of the physical machine is essential for strategic digital leadership.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12">
                            <div className="p-12 bg-zinc-900/40 rounded-[3rem] border border-white/5 hover:border-indigo-500/30 transition-colors group">
                                <GraduationCap className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="text-xl font-bold uppercase tracking-tight text-white mb-2">BBS Excellence</h4>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">T.U. Affiliate • Class of 2026</p>
                            </div>
                            <div className="p-12 bg-zinc-900/40 rounded-[3rem] border border-white/5 hover:border-emerald-500/30 transition-colors group">
                                <Shield className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Digital Ethics</h4>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Policy & Compliance Focus</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
      case 'interests':
        return (
          <section className="py-52 px-8 max-w-7xl mx-auto space-y-32 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/10 pb-12">
                <div>
                    <h2 className="text-8xl font-black uppercase tracking-tighter italic leading-none">Interests</h2>
                    <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-[0.8em] mt-4 ml-2">Strategic Specializations</p>
                </div>
                <p className="text-zinc-500 text-sm max-w-xs font-medium uppercase tracking-widest">Exploration of the synergy between capital and silicon.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
                {[
                  { icon: Cpu, title: "Next-Gen Hardware", desc: "Deep dive into GPU architectures, semi-conductors, and high-efficiency cooling systems." },
                  { icon: Sparkles, title: "Enterprise AI", desc: "Applying Large Language Models to automate market research and qualitative data analysis." },
                  { icon: Globe, title: "Global Markets", desc: "Understanding the macroeconomic shifts caused by digital decentralization and FinTech." },
                  { icon: Shield, title: "Cyber Governance", desc: "Advocating for robust security protocols in non-technical business environments." },
                  { icon: User, title: "UX Psychology", desc: "Designing business tools that respect human cognitive load and improve workflow." },
                  { icon: Mail, title: "Digital Communication", desc: "Optimization of organizational communication through advanced encrypted platforms." }
                ].map((item, i) => (
                  <div key={i} className="bg-black p-16 space-y-8 hover:bg-zinc-950 transition-all group">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                        <item.icon size={32} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold uppercase tracking-tight text-white mb-4 italic">{item.title}</h4>
                        <p className="text-zinc-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        );
      case 'contact':
        return (
            <section className="py-52 px-8 max-w-6xl mx-auto animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
                    <div className="space-y-16">
                        <h2 className="text-8xl font-black uppercase tracking-tighter italic leading-none">Let's<br/>Talk</h2>
                        <div className="space-y-8">
                            <div className="group cursor-pointer">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">Direct Mail</p>
                                <a href={`mailto:${ADMIN_EMAIL}`} className="text-2xl font-bold text-white group-hover:text-indigo-500 transition-colors">{ADMIN_EMAIL}</a>
                            </div>
                            <div className="group cursor-pointer">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">Mobile Access</p>
                                <a href={`tel:${ADMIN_PHONE}`} className="text-2xl font-bold text-white group-hover:text-indigo-500 transition-colors">+(977) {ADMIN_PHONE}</a>
                            </div>
                        </div>
                        <div className="flex gap-10 pt-10">
                            <a href="https://www.facebook.com/Susilpokrel09" target="_blank" className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-colors">Facebook</a>
                            <a href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                    <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); alert('Transmission Successful.'); }}>
                        <div className="space-y-2">
                             <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">01. Your Name</p>
                             <input required type="text" className="w-full bg-transparent border-b border-white/10 py-6 text-xl font-bold focus:border-white outline-none transition-all placeholder:text-zinc-800" />
                        </div>
                        <div className="space-y-2">
                             <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">02. Your Email</p>
                             <input required type="email" className="w-full bg-transparent border-b border-white/10 py-6 text-xl font-bold focus:border-white outline-none transition-all placeholder:text-zinc-800" />
                        </div>
                        <div className="space-y-2">
                             <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">03. Message Body</p>
                             <textarea required rows={4} className="w-full bg-transparent border-b border-white/10 py-6 text-xl font-bold focus:border-white outline-none transition-all resize-none placeholder:text-zinc-800"></textarea>
                        </div>
                        <button className="w-full bg-white text-black py-8 font-black text-xs uppercase tracking-[0.5em] hover:bg-indigo-600 hover:text-white transition-all">Submit Transmission</button>
                    </form>
                </div>
            </section>
        );
      case 'terms':
        return (
            <section className="py-52 px-8 max-w-4xl mx-auto space-y-20 animate-fade-in">
                <h2 className="text-7xl font-black uppercase tracking-tighter text-center italic">Legal Protocol</h2>
                <div className="space-y-16">
                    {[
                        { title: "Intellectual Property", text: "All creative assets, including the custom UI architecture and curated photography, are the exclusive property of Sushil Pokhrel. Unauthorized mirroring of this digital domain is prohibited." },
                        { title: "Professional Integrity", text: "The information presented herein is accurate to the best of the author's knowledge, representing a valid academic history within the BBS faculty." },
                        { title: "Privacy & Encryption", text: "Communication sent through this hub is protected by standard SSL encryption. Data is handled with the highest degree of professional confidentiality." }
                    ].map((item, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Clause 0{i+1}</span>
                            <div className="md:col-span-3 space-y-4">
                                <h4 className="text-xl font-bold uppercase tracking-tight text-white">{item.title}</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{item.text}</p>
                            </div>
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-600 selection:text-white antialiased overflow-x-hidden">
      <Navbar setView={setView} currentView={view} />
      
      <main className="min-h-screen">
        {renderContent()}
      </main>

      <footer className="py-52 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-24">
          <div className="space-y-10 w-full md:w-auto">
            <h4 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] italic">Sushil<br/>Pokhrel</h4>
            <div className="flex gap-12 border-t border-white/10 pt-8">
                <button onClick={() => setView('terms')} className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 hover:text-white transition-colors">Protocol</button>
                <button onClick={() => setView('contact')} className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 hover:text-white transition-colors">Connect</button>
                <button onClick={() => setView('home')} className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 hover:text-white transition-colors">Index</button>
            </div>
          </div>

          <div className="text-left md:text-right space-y-12 w-full md:w-auto">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.8em] italic">
                  {PRECISION_WATERMARK}
                </p>
                <button 
                    onClick={() => setView('error')}
                    className="text-[9px] font-bold text-zinc-800 hover:text-red-900 uppercase tracking-widest transition-colors flex items-center justify-start md:justify-end md:ml-auto"
                >
                    <AlertTriangle size={10} className="mr-2"/> Core System Status: Operational
                </button>
             </div>
             <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.8em] max-w-xs md:ml-auto">
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
