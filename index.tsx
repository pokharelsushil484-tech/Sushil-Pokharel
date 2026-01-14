
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, GraduationCap, Send, Menu, X, 
  Sparkles, Facebook, Mail, Search, 
  Phone, Shield, Cpu, Briefcase, Zap, 
  FileText, ExternalLink, ArrowRight, CheckCircle
} from 'lucide-react';

// --- Types ---
type View = 'portfolio' | 'academics' | 'interests' | 'connect' | 'terms';

// --- Components ---

const Navbar = ({ setView, currentView }: { setView: (v: View) => void, currentView: View }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-black/50 border-b border-white/5">
      <div className="text-xl font-black tracking-tighter uppercase cursor-pointer" onClick={() => setView('portfolio')}>
        Sushil Pokharel
      </div>
      
      <div className="hidden md:flex gap-8 items-center">
        {['portfolio', 'academics', 'interests'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as View)}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${currentView === v ? 'text-white underline underline-offset-8' : 'text-zinc-500 hover:text-white'}`}
          >
            {v}
          </button>
        ))}
        <button 
          onClick={() => setView('connect')}
          className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-lg shadow-white/5"
        >
          Connect
        </button>
      </div>

      <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 p-8 flex flex-col gap-6 animate-slide-up z-50">
          {['portfolio', 'academics', 'interests', 'connect', 'terms'].map((v) => (
            <button key={v} onClick={() => { setView(v as View); setIsOpen(false); }} className="text-left text-lg font-bold uppercase text-white hover:text-zinc-400">{v}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

const ContactForm = ({ title }: { title: string }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1500);
  };

  return (
    <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
        <Mail size={16} className="text-indigo-500" /> {title}
      </h3>
      {status === 'sent' ? (
        <div className="py-10 text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-emerald-500" />
          <p className="font-bold uppercase tracking-widest text-xs">Message Received</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Name" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-xs outline-none focus:border-white/40 transition-all" />
          <input required type="email" placeholder="Email" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-xs outline-none focus:border-white/40 transition-all" />
          <textarea required placeholder="Message" rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-xs outline-none focus:border-white/40 transition-all resize-none"></textarea>
          <button disabled={status === 'sending'} className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2">
            {status === 'sending' ? 'Transmitting...' : <><Send size={14} /> Send Inquiry</>}
          </button>
        </form>
      )}
    </div>
  );
};

const Interests = () => (
  <section className="py-24 px-8 max-w-6xl mx-auto space-y-20">
    <div className="border-l-4 border-white pl-8 space-y-4">
      <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Interests &<br/>Innovation</h2>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em]">Exploring the intersection of Business and Tech</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { 
          icon: Sparkles, 
          title: "Artificial Intelligence", 
          desc: "Deeply interested in how Generative AI can optimize business workflows. I research the application of LLMs in market forecasting and strategic management for non-IT corporations." 
        },
        { 
          icon: Search, 
          title: "Tech Research", 
          desc: "I actively monitor computer updates, focusing on new hardware releases and software efficiencies. Maintaining up-to-date digital literacy is my core priority." 
        },
        { 
          icon: Cpu, 
          title: "IT Integration", 
          desc: "As a BBS student, I recognize that IT is the backbone of modern business. I focus on bridging technical gaps in the business world to ensure seamless digital transformation." 
        }
      ].map((item, i) => (
        <div key={i} className="group p-10 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] hover:bg-zinc-900/50 transition-all">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-inner">
            <item.icon size={28} />
          </div>
          <h3 className="text-xl font-bold uppercase italic mb-4">{item.title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const Connect = () => (
  <section className="py-24 px-8 max-w-6xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-6xl font-black tracking-tighter uppercase">Connect</h2>
          <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.5em]">Direct Channels & Social Infrastructure</p>
        </div>

        <div className="space-y-6">
          <a href="mailto:support@sushilpokharel00.com.np" className="flex items-center gap-6 group p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
            <div className="p-3 bg-zinc-900 rounded-xl group-hover:text-indigo-400 transition-colors"><Mail size={24}/></div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-zinc-600 uppercase">Official Email</p>
              <p className="text-sm font-bold truncate">support@sushilpokharel00.com.np</p>
            </div>
          </a>
          <a href="tel:9765226385" className="flex items-center gap-6 group p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
            <div className="p-3 bg-zinc-900 rounded-xl group-hover:text-emerald-400 transition-colors"><Phone size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase">Primary Phone</p>
              <p className="text-sm font-bold">9765226385</p>
            </div>
          </a>
          <a href="https://www.facebook.com/Susilpokrel09" target="_blank" rel="noreferrer" className="flex items-center gap-6 group p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
            <div className="p-3 bg-zinc-900 rounded-xl group-hover:text-blue-500 transition-colors"><Facebook size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase">Facebook Identity</p>
              <p className="text-sm font-bold">Susilpokrel09</p>
            </div>
          </a>
        </div>
      </div>

      <ContactForm title="Let's Connect" />
    </div>
  </section>
);

const Terms = () => (
  <section className="py-28 px-8 max-w-4xl mx-auto space-y-16">
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-black uppercase tracking-widest">Terms of Service</h2>
      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.5em]">Effective as of January 2026</p>
    </div>

    <div className="space-y-10">
      {[
        { title: "1. Portfolio Usage", text: "This application serves as a personal professional portfolio for Sushil Pokharel. Content here demonstrates academic and personal interests for recruitment and collaboration purposes." },
        { title: "2. Intellectual Property", text: "The design, branding, and original text content of 'StudentPocket – By Sushil' are intellectual properties of Sushil Pokharel. Unauthorized reproduction is prohibited." },
        { title: "3. Privacy & Communication", text: "Data submitted via contact forms is treated with strict confidentiality and used solely for direct communication with the author." },
        { title: "4. External Resources", text: "Links to external platforms like Facebook are governed by their respective terms. We are not responsible for third-party content or privacy policies." }
      ].map((term, i) => (
        <div key={i} className="space-y-3 p-8 border-l border-white/10 bg-zinc-900/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-white">{term.title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{term.text}</p>
        </div>
      ))}
    </div>
  </section>
);

const App = () => {
  const [view, setView] = useState<View>('portfolio');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar setView={setView} currentView={view} />
      
      <main className="animate-fade-in pt-16">
        {view === 'portfolio' && (
          <>
            {/* Hero Split Screen */}
            <div className="min-h-[90vh] flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-zinc-900 overflow-hidden grayscale contrast-125 opacity-80">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop" 
                  className="w-full h-full object-cover" 
                  alt="Professional Portait"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-24 space-y-10">
                <div className="animate-slide-up">
                  <div className="h-px w-24 bg-white/40 mb-8"></div>
                  <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase">
                    My<br/>Port<br/>folio
                  </h1>
                  <p className="mt-10 text-zinc-500 text-xs font-bold uppercase tracking-[0.5em]">
                    Sushil Pokharel • BBS 2026
                  </p>
                  <div className="mt-12 flex gap-4">
                    <button onClick={() => setView('interests')} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-zinc-400 transition-colors group">
                      Explore Interests <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <section className="py-20 px-8 border-y border-white/5">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                <div>
                  <Zap className="text-zinc-600 mb-6" size={32} />
                  <h4 className="text-sm font-black uppercase tracking-widest mb-4 italic text-white">Innovation First</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Dedicated to understanding how AI can create efficient management structures in the BBS field.</p>
                </div>
                <div>
                  <Briefcase className="text-zinc-600 mb-6" size={32} />
                  <h4 className="text-sm font-black uppercase tracking-widest mb-4 italic text-white">Strategic Mindset</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Leveraging business principles with technical research to solve complex organizational problems.</p>
                </div>
                <div>
                  <Shield className="text-zinc-600 mb-6" size={32} />
                  <h4 className="text-sm font-black uppercase tracking-widest mb-4 italic text-white">Secure Identity</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Advocating for data security and integrity in all digital business integrations.</p>
                </div>
              </div>
            </section>
          </>
        )}
        
        {view === 'academics' && (
          <section className="py-24 px-8 max-w-6xl mx-auto space-y-16">
            <h2 className="text-5xl font-black uppercase tracking-tighter text-center">Academic Track</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-12 bg-zinc-900/50 rounded-[3rem] border border-white/10 flex flex-col justify-between h-80">
                <GraduationCap size={40} className="text-indigo-400" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-3 py-1 rounded-full">Enrolled</span>
                  <h3 className="text-2xl font-bold mt-4">Bachelor of Business Studies (BBS)</h3>
                  <p className="text-zinc-500 text-sm mt-2 font-medium">Undergraduate pursuit in Strategic Management and Economics.</p>
                </div>
              </div>
              <div className="p-12 bg-zinc-900/20 rounded-[3rem] border border-white/5 flex flex-col justify-between h-80 opacity-60">
                <Shield size={40} className="text-zinc-600" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full">Completed</span>
                  <h3 className="text-2xl font-bold mt-4 italic">Grade 12</h3>
                  <p className="text-zinc-600 text-sm mt-2 font-medium">Foundation in Computer Science and Quantitative Methods.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'interests' && <Interests />}
        {view === 'connect' && <Connect />}
        {view === 'terms' && <Terms />}
      </main>

      <footer className="mt-20 py-24 px-8 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            <div className="space-y-6">
              <h4 className="text-2xl font-black uppercase tracking-tight">Sushil Pokharel</h4>
              <p className="text-zinc-500 text-xs max-w-xs leading-relaxed uppercase tracking-widest font-bold">
                StudentPocket – By Sushil.<br/>A Professional Data & Business Identity Hub.
              </p>
              <div className="flex gap-4">
                 {['portfolio', 'interests', 'terms'].map(v => (
                   <button key={v} onClick={() => setView(v as View)} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">{v}</button>
                 ))}
              </div>
            </div>
            <ContactForm title="Let's Contact" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-4">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">
              &copy; 2026 SUSHIL POKHAREL
            </p>
            <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">
              Built with Precision by Sushil Tech
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
