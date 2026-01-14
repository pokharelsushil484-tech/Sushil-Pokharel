import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, Bot, GraduationCap, Send, Menu, X, 
  Sparkles, ChevronRight, Facebook, 
  Mail, ExternalLink, Calendar, Search, PlayCircle, Phone, Shield
} from 'lucide-react';

// --- Types ---
type View = 'portfolio' | 'academics' | 'interests' | 'connect' | 'terms';

// --- Components ---

const Navbar = ({ setView, currentView }: { setView: (v: View) => void, currentView: View }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-black/50 border-b border-white/5">
      <div className="text-xl font-black tracking-tighter uppercase cursor-pointer" onClick={() => setView('portfolio')}>Sushil Pokharel</div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 items-center">
        {['portfolio', 'academics', 'interests'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as View)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentView === v ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            {v}
          </button>
        ))}
        <button 
          onClick={() => setView('connect')}
          className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
        >
          Connect
        </button>
      </div>

      {/* Mobile Toggle */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-white/10 p-8 flex flex-col gap-6 animate-slide-up">
          {['portfolio', 'academics', 'interests', 'connect'].map((v) => (
            <button key={v} onClick={() => { setView(v as View); setIsOpen(false); }} className="text-left text-lg font-bold uppercase">{v}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onExplore }: { onExplore: () => void }) => (
  <div className="min-h-screen flex flex-col md:flex-row pt-20">
    {/* Left: Black & White Photo Area (Reflecting User Image) */}
    <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-zinc-900 relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
        className="w-full h-full object-cover grayscale opacity-80"
        alt="Sushil Pokharel Portrait"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
    </div>

    {/* Right: Portfolio Header Text */}
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
          I am a Bachelor of Business Studies student with a deep fascination for the IT world. I explore the synergy between management and digital innovation.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button onClick={onExplore} className="bg-white text-black px-10 py-4 rounded-sm font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
            View Interests
          </button>
          <button className="flex items-center gap-2 text-white px-10 py-4 rounded-sm font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-all">
            <PlayCircle size={18} /> Intro Video
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
      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Educational Background</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="p-10 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-6">
          <GraduationCap className="text-white" size={32} />
          <span className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Running</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Bachelor of Business Studies (BBS)</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">Developing a strong foundation in business management, economics, and strategic planning at the undergraduate level.</p>
      </div>

      <div className="p-10 bg-zinc-900/50 border border-white/5 rounded-2xl opacity-60">
        <div className="flex justify-between items-start mb-6">
          <User className="text-white" size={32} />
          <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Grade 12</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">Foundation in general sciences and business studies, providing the groundwork for higher academic pursuits.</p>
      </div>
    </div>
  </section>
);

const Interests = () => (
  <section className="py-20 px-8 max-w-6xl mx-auto space-y-16">
    <div className="text-center space-y-4">
      <h2 className="text-5xl font-black uppercase tracking-tighter">My Passions</h2>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Where Business meets Information Technology</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-6 group hover:bg-zinc-900/60 transition-all">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <Bot size={24} />
        </div>
        <h3 className="text-xl font-bold uppercase italic">Artificial Intelligence</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          I am fascinated by how AI can revolutionize business operations. My focus is on understanding the application of LLMs and machine learning within management systems to drive efficiency.
        </p>
      </div>

      <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-6 group hover:bg-zinc-900/60 transition-all">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <Search size={24} />
        </div>
        <h3 className="text-xl font-bold uppercase italic">Tech Research</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          I actively look for new updates related to computer hardware, software breakthroughs, and the latest trends in the tech industry to maintain a competitive digital literacy.
        </p>
      </div>

      <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-6 group hover:bg-zinc-900/60 transition-all">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <ExternalLink size={24} />
        </div>
        <h3 className="text-xl font-bold uppercase italic">IT Integration</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Though I am not a formal IT student, my interest in Information Technology is immense. I aim to bridge the gap between technical complexity and business practicalities.
        </p>
      </div>
    </div>
  </section>
);

const Connect = () => {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('sent'), 1500);
  };

  return (
    <section className="py-20 px-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl font-black tracking-tighter uppercase">Let's Connect</h2>
            <p className="text-zinc-500 uppercase text-xs font-bold tracking-[0.4em]">Get in touch for collaborations</p>
          </div>

          <div className="space-y-6">
            <a href="mailto:support@sushilpokharel00.com.np" className="flex items-center gap-6 group p-4 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-white/20">
              <Mail className="text-zinc-400 group-hover:text-white transition-colors" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-600">Email</p>
                <p className="text-sm font-bold truncate">support@sushilpokharel00.com.np</p>
              </div>
            </a>
            <a href="tel:9765226385" className="flex items-center gap-6 group p-4 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-white/20">
              <Phone className="text-zinc-400 group-hover:text-white transition-colors" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-600">Phone</p>
                <p className="text-sm font-bold">9765226385</p>
              </div>
            </a>
            <a href="https://www.facebook.com/Susilpokrel09" target="_blank" rel="noreferrer" className="flex items-center gap-6 group p-4 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-white/20">
              <Facebook className="text-zinc-400 group-hover:text-white transition-colors" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-600">Facebook</p>
                <p className="text-sm font-bold">Susilpokrel09</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-white/5">
          {formState === 'sent' ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center">
                <ChevronRight size={32} />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Message Sent</h3>
              <p className="text-zinc-500 text-sm">I will get back to you shortly.</p>
              <button onClick={() => setFormState('idle')} className="text-xs uppercase font-black underline underline-offset-4">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500">Name</label>
                <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-white transition-all text-sm" placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500">Email</label>
                <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-white transition-all text-sm" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500">Message</label>
                <textarea required rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-white transition-all text-sm resize-none" placeholder="Your message here..."></textarea>
              </div>
              <button disabled={formState === 'sending'} type="submit" className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2">
                {formState === 'sending' ? 'Sending...' : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const Terms = () => (
  <section className="py-24 px-8 max-w-4xl mx-auto space-y-12">
    <div className="space-y-4">
      <h2 className="text-5xl font-black uppercase tracking-tighter">Terms of Service</h2>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Last Updated: January 2026</p>
    </div>
    
    <div className="space-y-8 text-zinc-400 text-sm leading-relaxed font-medium">
      <div className="space-y-2">
        <h3 className="text-white font-bold uppercase tracking-widest text-base">1. Personal Portfolio</h3>
        <p>This website serves as the personal professional portfolio of Sushil Pokharel. All content, images, and project descriptions are owned by the author unless stated otherwise.</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-white font-bold uppercase tracking-widest text-base">2. Contact & Privacy</h3>
        <p>Information submitted through the contact form is used solely for professional communication between the visitor and Sushil Pokharel. We do not sell or share your contact information with third parties.</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-white font-bold uppercase tracking-widest text-base">3. Use of Content</h3>
        <p>The unauthorized copying or redistribution of the design, source code, or media files on this site is strictly prohibited. For inquiries regarding content usage, please contact support@sushilpokharel00.com.np.</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-white font-bold uppercase tracking-widest text-base">4. External Links</h3>
        <p>This site may contain links to external social media platforms (e.g., Facebook). We are not responsible for the privacy practices or content of these external sites.</p>
      </div>
    </div>
  </section>
);

const App = () => {
  const [view, setView] = useState<View>('portfolio');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar setView={setView} currentView={view} />
      
      <main className="animate-fade-in">
        {view === 'portfolio' && (
          <>
            <Hero onExplore={() => setView('interests')} />
            <div className="bg-gradient-to-b from-black to-zinc-950">
              <section className="py-20 px-8 max-w-6xl mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                      <Sparkles className="text-zinc-500" />
                      <h3 className="text-xl font-bold uppercase italic">AI & Innovation</h3>
                      <p className="text-zinc-500 text-sm">Passionate about how Artificial Intelligence is reshaping the business landscape and operational logic.</p>
                    </div>
                    <div className="space-y-4">
                      <Search className="text-zinc-500" />
                      <h3 className="text-xl font-bold uppercase italic">Computer Updates</h3>
                      <p className="text-zinc-500 text-sm">Staying current with latest hardware, software, and IT infrastructures to bridge business and technology.</p>
                    </div>
                    <div className="space-y-4">
                      <Shield className="text-zinc-500" />
                      <h3 className="text-xl font-bold uppercase italic">Market Analysis</h3>
                      <p className="text-zinc-500 text-sm">Combining business studies with technical research to provide modern insights for growth.</p>
                    </div>
                 </div>
              </section>
            </div>
          </>
        )}
        
        {view === 'academics' && <AcademicJourney />}
        {view === 'interests' && <Interests />}
        {view === 'connect' && <Connect />}
        {view === 'terms' && <Terms />}
      </main>

      <footer className="py-16 px-8 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-black uppercase tracking-tighter">Sushil Pokharel</h4>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-1">Student Portfolio</p>
          </div>
          
          <div className="flex gap-8">
            <button onClick={() => setView('portfolio')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Home</button>
            <button onClick={() => setView('connect')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Contact</button>
            <button onClick={() => setView('terms')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Terms</button>
          </div>
          
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">
            &copy; 2026 SUSHIL POKHAREL
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