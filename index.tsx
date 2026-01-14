
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, GraduationCap, Send, Menu, X, 
  Sparkles, Facebook, Mail, 
  Phone, Shield, Cpu, Briefcase, Zap, 
  ArrowRight, CheckCircle, AlertTriangle, Home, Info, ExternalLink
} from 'lucide-react';

// --- Types ---
type View = 'portfolio' | 'academics' | 'interests' | 'connect' | 'terms' | 'error';

// --- Constants ---
const APP_NAME = "Sushil Pokharel | Portfolio";
const STUDENT_ID = "Sushil Pokharel - Student";

// --- Components ---

const ErrorPage = ({ reset }: { reset: () => void }) => (
  <div className="min-h-[80vh] flex items-center justify-center p-6 text-center animate-scale-up">
    <div className="bg-zinc-900/50 p-12 rounded-[3rem] border border-red-500/20 max-w-md shadow-2xl backdrop-blur-xl">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">System Error</h2>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Navigation or Input Mismatch Detected</p>
      <button 
        onClick={reset}
        className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
      >
        <Home size={14} /> Reset Environment
      </button>
    </div>
  </div>
);

const Navbar = ({ setView, currentView }: { setView: (v: View) => void, currentView: View }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-xl bg-black/60 border-b border-white/5">
      <div 
        className="text-lg font-black tracking-tighter uppercase cursor-pointer hover:text-indigo-400 transition-colors" 
        onClick={() => setView('portfolio')}
      >
        Sushil Pokharel
      </div>
      
      <div className="hidden md:flex gap-10 items-center">
        {['portfolio', 'academics', 'interests', 'terms'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as View)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              currentView === v ? 'text-indigo-500' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {v}
          </button>
        ))}
        <button 
          onClick={() => setView('connect')}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
        >
          Connect
        </button>
      </div>

      <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 p-10 flex flex-col gap-8 animate-slide-up z-50 shadow-2xl">
          {['portfolio', 'academics', 'interests', 'connect', 'terms'].map((v) => (
            <button 
              key={v} 
              onClick={() => { setView(v as View); setIsOpen(false); }} 
              className="text-left text-xl font-black uppercase tracking-tighter text-white hover:text-indigo-400 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

const PortfolioSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto py-20">
    {[
      { 
        icon: Zap, 
        title: "Innovation Strategy", 
        desc: "Researching the integration of AI in modern business structures for enhanced productivity.",
        tag: "Research"
      },
      { 
        icon: Briefcase, 
        title: "Academic Excellence", 
        desc: "Bachelor of Business Studies (BBS) candidate with a focus on quantitative analysis.",
        tag: "BBS 2026"
      },
      { 
        icon: Shield, 
        title: "Data Integrity", 
        desc: "Advocating for secure information architecture in non-IT business environments.",
        tag: "Digital Ethics"
      }
    ].map((item, i) => (
      <div key={i} className="group bg-zinc-900/40 p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-zinc-900/60 shadow-xl">
        <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 transition-transform">
          <item.icon size={28} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 block">{item.tag}</span>
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
      </div>
    ))}
  </div>
);

const App = () => {
  const [view, setView] = useState<View>('portfolio');
  const [errorHistory, setErrorHistory] = useState<string[]>([]);

  // Simulation of error detection for "incorrect typing"
  // If user tries to navigate to an unknown path (though internal here, we simulate a state safety check)
  useEffect(() => {
    const handlePopstate = () => {
      // Logic for URL error detection could go here
      // If window.location.pathname is weird, setView('error')
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case 'portfolio':
        return (
          <>
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[150px] pointer-events-none"></div>
              
              <div className="text-center space-y-8 max-w-4xl relative z-10">
                <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{STUDENT_ID}</span>
                </div>
                
                <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase">
                  My<br/>Port<span className="text-indigo-600">folio</span>
                </h1>
                
                <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  A professional hub detailing the academic journey and technical interests of <span className="text-white italic">Sushil Pokharel</span>. 
                  Bridging business logic with the power of technology.
                </p>

                <div className="flex flex-wrap justify-center gap-6 pt-10">
                  <a href="https://www.facebook.com/Susilpokrel09" target="_blank" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl border border-white/10 transition-all group">
                    <Facebook size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Facebook</span>
                  </a>
                  <button onClick={() => setView('interests')} className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                    Explore Interests <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </section>
            
            <div className="border-t border-white/5 bg-zinc-950/30">
               <PortfolioSection />
            </div>
          </>
        );
      case 'academics':
        return (
          <section className="py-32 px-6 max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">Academic Roadmap</h2>
            <div className="space-y-6">
              <div className="p-10 bg-zinc-900/50 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-8">
                  <div className="p-5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20"><GraduationCap size={32}/></div>
                  <div>
                    <h3 className="text-2xl font-bold">Bachelor of Business Studies (BBS)</h3>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1">Current Undergraduate</p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active Enrollment</span>
              </div>
              <div className="p-10 bg-zinc-900/20 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
                <div className="flex items-center gap-8">
                  <div className="p-5 bg-zinc-800 rounded-2xl text-zinc-500"><Shield size={32}/></div>
                  <div>
                    <h3 className="text-2xl font-bold">Grade 12 Certification</h3>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1">Focus: Computer Applications</p>
                  </div>
                </div>
                <span className="bg-white/10 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">Completed</span>
              </div>
            </div>
          </section>
        );
      case 'interests':
        return (
          <section className="py-32 px-6 max-w-6xl mx-auto space-y-24 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black uppercase tracking-tighter italic">Personal Interests</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em]">The intersection of Passion and Progress</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-indigo-400"><Cpu size={24}/> <h4 className="text-sm font-black uppercase tracking-widest">IT Integration</h4></div>
                  <p className="text-zinc-400 leading-relaxed text-lg">My primary interest lies in bringing IT solutions to the traditional business sector. As a BBS student, I see enormous potential in digitalizing management processes for small to medium enterprises.</p>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-4 text-indigo-400"><Sparkles size={24}/> <h4 className="text-sm font-black uppercase tracking-widest">AI Research</h4></div>
                  <p className="text-zinc-400 leading-relaxed text-lg">I spend significant time researching artificial intelligence and how it can be utilized for market analysis. Staying updated with the latest in hardware and software is more than a hobby; it's a professional necessity.</p>
               </div>
            </div>
          </section>
        );
      case 'connect':
        return (
          <section className="py-32 px-6 max-w-4xl mx-auto animate-fade-in">
             <div className="bg-zinc-900/30 p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-12">
                <div className="text-center">
                  <h2 className="text-5xl font-black uppercase tracking-tighter">Get In Touch</h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">Open for Collaboration</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <a href="mailto:support@sushilpokharel00.com.np" className="p-6 bg-black/50 border border-white/5 rounded-3xl flex flex-col items-center gap-4 hover:border-indigo-500/40 transition-colors group">
                    <Mail className="text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</span>
                    <span className="text-xs font-bold truncate w-full text-center">support@sushilpokharel00.com.np</span>
                  </a>
                  <a href="tel:9765226385" className="p-6 bg-black/50 border border-white/5 rounded-3xl flex flex-col items-center gap-4 hover:border-indigo-500/40 transition-colors group">
                    <Phone className="text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Call</span>
                    <span className="text-xs font-bold">9765226385</span>
                  </a>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message transmission protocol initialized.'); }}>
                   <input required type="text" placeholder="Name" className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-indigo-500 outline-none transition-all" />
                   <textarea required rows={4} placeholder="Your Message" className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-indigo-500 outline-none transition-all resize-none"></textarea>
                   <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                     <Send size={14} /> Send Inquiry
                   </button>
                </form>
             </div>
          </section>
        );
      case 'terms':
        return (
          <section className="py-32 px-6 max-w-3xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Terms of Service</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">Compliance & Privacy</p>
            </div>
            <div className="space-y-10">
              {[
                { title: "Personal Usage", text: "This application is a personal professional portfolio of Sushil Pokharel. Content is provided for informational and recruitment purposes." },
                { title: "Intellectual Property", text: "All design elements, original text, and branding of 'StudentPocket' are the intellectual property of Sushil Pokharel." },
                { title: "Data Privacy", text: "Any information shared via the contact forms is treated with confidentiality and used only for direct communication." }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> {item.title}
                  </h4>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'error':
        return <ErrorPage reset={() => setView('portfolio')} />;
      default:
        return <ErrorPage reset={() => setView('portfolio')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar setView={setView} currentView={view} />
      
      <main className="animate-fade-in min-h-[70vh]">
        {renderContent()}
      </main>

      <footer className="py-20 px-6 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-3xl font-black uppercase tracking-tighter">Sushil Pokharel</h4>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em] max-w-xs leading-loose">
              StudentPocket – By Sushil.<br/>
              A Premier Digital Identity for Business & Technology.
            </p>
            <div className="flex justify-center md:justify-start gap-6">
               <button onClick={() => setView('terms')} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Terms</button>
               <button onClick={() => setView('connect')} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Connect</button>
               <button onClick={() => setView('error')} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors opacity-0">Debug</button>
            </div>
          </div>

          <div className="w-full md:w-auto text-center md:text-right space-y-4">
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em]">
               &copy; 2026 SUSHIL POKHAREL
             </p>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">
               Built with Precision by Sushil Pokharel
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
