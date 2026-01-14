
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, GraduationCap, Send, Menu, X, 
  Sparkles, Facebook, Mail, 
  Phone, Shield, Cpu, Briefcase, Zap, 
  ArrowRight, AlertTriangle, Home, Camera, Upload, CheckCircle, RefreshCw
} from 'lucide-react';
import { APP_NAME, STUDENT_IDENTITY, ADMIN_EMAIL, ADMIN_PHONE, COPYRIGHT_NOTICE, PRECISION_WATERMARK } from './constants';

// --- Types ---
type View = 'portfolio' | 'academics' | 'interests' | 'connect' | 'terms' | 'error';

// --- Components ---

const ErrorPage = ({ reset }: { reset: () => void }) => (
  <div className="min-h-[70vh] flex items-center justify-center p-6 text-center animate-fade-in">
    <div className="bg-zinc-900/80 p-12 rounded-[3rem] border border-red-500/30 max-w-md shadow-2xl backdrop-blur-2xl">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">System Exception</h2>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">
        An unexpected input mismatch or navigation error has occurred. The identity protocol has been suspended for security.
      </p>
      <button 
        onClick={reset}
        className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw size={14} /> Re-Initialize Portfolio
      </button>
    </div>
  </div>
);

const Navbar = ({ setView, currentView }: { setView: (v: View) => void, currentView: View }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-xl bg-black/60 border-b border-white/5">
      <div 
        className="text-xl font-black tracking-tighter uppercase cursor-pointer hover:text-indigo-400 transition-colors" 
        onClick={() => setView('portfolio')}
      >
        S. Pokharel
      </div>
      
      <div className="hidden md:flex gap-10 items-center">
        {['portfolio', 'academics', 'interests', 'terms'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as View)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              currentView === v ? 'text-indigo-500 underline underline-offset-8' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {v}
          </button>
        ))}
        <button 
          onClick={() => setView('connect')}
          className="bg-white text-black px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-lg"
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
              className="text-left text-2xl font-black uppercase tracking-tighter text-white hover:text-indigo-400 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

const App = () => {
  const [view, setView] = useState<View>('portfolio');
  const [profileImage, setProfileImage] = useState<string | null>("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case 'portfolio':
        return (
          <>
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
              <div className="space-y-8 max-w-5xl animate-fade-in">
                <div className="inline-flex items-center space-x-2 bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/20">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">{STUDENT_IDENTITY}</span>
                </div>
                
                <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.85] uppercase italic">
                  Sushil<br/>Pokharel
                </h1>
                
                <p className="text-zinc-500 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                  Professional Portfolio of a <span className="text-white">BBS Student</span> dedicated to the convergence of Business Intelligence and Technology.
                </p>

                <div className="flex flex-wrap justify-center gap-6 pt-12">
                   <div className="flex flex-col items-center gap-4">
                      <div className="relative group w-32 h-32">
                        <div className="w-full h-full rounded-full border-4 border-white/10 overflow-hidden bg-zinc-900 shadow-2xl">
                           {profileImage ? <img src={profileImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" /> : <User size={48} className="m-auto mt-8 text-zinc-700"/>}
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-3 bg-indigo-600 rounded-full border-2 border-black hover:bg-indigo-500 transition-colors shadow-xl"
                        >
                          <Camera size={16} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 italic">Identity Image</span>
                   </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-16">
                  <a href="https://www.facebook.com/Susilpokrel09" target="_blank" className="p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all group">
                    <Facebook size={20} className="text-zinc-400 group-hover:text-indigo-500" />
                  </a>
                  <a href={`mailto:${ADMIN_EMAIL}`} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all group">
                    <Mail size={20} className="text-zinc-400 group-hover:text-indigo-500" />
                  </a>
                  <a href={`tel:${ADMIN_PHONE}`} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all group">
                    <Phone size={20} className="text-zinc-400 group-hover:text-indigo-500" />
                  </a>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-1 py-1 bg-white/5">
                {[
                  { title: "Strategic BBS", desc: "Applying modern economic theory to emerging markets." },
                  { title: "Tech Integration", desc: "Researching AI implementation in non-IT business environments." },
                  { title: "Digital Ethics", desc: "Advocating for privacy and secure data architectures." }
                ].map((item, i) => (
                  <div key={i} className="bg-black p-16 space-y-4 hover:bg-zinc-950 transition-colors">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Node 0{i+1}</h3>
                    <h4 className="text-2xl font-bold uppercase">{item.title}</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
            </div>
          </>
        );
      case 'academics':
        return (
          <section className="py-32 px-6 max-w-5xl mx-auto space-y-12 animate-fade-in">
            <h2 className="text-6xl font-black uppercase tracking-tighter italic text-center">Academic Track</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="p-12 bg-zinc-900/30 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:bg-zinc-900/50 transition-all">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"><GraduationCap size={32}/></div>
                  <div>
                    <h3 className="text-2xl font-bold uppercase italic">Bachelor of Business Studies</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Class of 2026 • Management Focus</p>
                  </div>
                </div>
                <div className="hidden sm:block"><CheckCircle className="text-indigo-500" size={24} /></div>
              </div>
              <div className="p-12 bg-zinc-900/10 rounded-[3rem] border border-white/5 flex justify-between items-center opacity-60">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><Shield size={32}/></div>
                  <div>
                    <h3 className="text-2xl font-bold uppercase italic">Grade 12 Certification</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Computer Applications & Commerce</p>
                  </div>
                </div>
                <div className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-zinc-700">Finalized</div>
              </div>
            </div>
          </section>
        );
      case 'interests':
        return (
          <section className="py-32 px-6 max-w-6xl mx-auto space-y-24 animate-fade-in">
            <div className="border-l-4 border-indigo-600 pl-10 space-y-4">
              <h2 className="text-7xl font-black uppercase tracking-tighter">Core Interests</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.5em]">The Vision of Sushil Pokharel</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
               <div className="space-y-6 group">
                  <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Cpu size={24}/></div>
                  <h4 className="text-xl font-bold uppercase tracking-tight text-white">Business Digitization</h4>
                  <p className="text-zinc-500 leading-relaxed text-lg">Focusing on how small to medium enterprises can leverage IT frameworks to scale operations without the overhead of massive IT departments.</p>
               </div>
               <div className="space-y-6 group">
                  <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Sparkles size={24}/></div>
                  <h4 className="text-xl font-bold uppercase tracking-tight text-white">Applied Intelligence</h4>
                  <p className="text-zinc-500 leading-relaxed text-lg">Passionate about tracking hardware and software evolution to implement AI-driven market forecasting and management automation.</p>
               </div>
            </div>
            <div className="pt-20 text-center">
               <button onClick={() => setView('error')} className="text-[10px] font-black uppercase tracking-widest text-zinc-800 hover:text-red-900 transition-colors">Test System Failure</button>
            </div>
          </section>
        );
      case 'connect':
        return (
          <section className="py-32 px-6 max-w-4xl mx-auto animate-fade-in">
             <div className="bg-zinc-900/40 p-12 md:p-20 rounded-[4rem] border border-white/5 shadow-2xl space-y-16 backdrop-blur-3xl">
                <div className="text-center space-y-4">
                  <h2 className="text-6xl font-black uppercase tracking-tighter italic">Connect</h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.6em]">Open Protocol for Engagement</p>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message Transmission: 100%'); }}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input required type="text" placeholder="FULL NAME" className="bg-black/50 border-b border-white/10 px-0 py-6 text-[10px] font-black uppercase tracking-[0.3em] focus:border-indigo-500 outline-none transition-all text-white placeholder:text-zinc-700" />
                      <input required type="email" placeholder="EMAIL ADDRESS" className="bg-black/50 border-b border-white/10 px-0 py-6 text-[10px] font-black uppercase tracking-[0.3em] focus:border-indigo-500 outline-none transition-all text-white placeholder:text-zinc-700" />
                   </div>
                   <textarea required rows={5} placeholder="MESSAGE BODY" className="w-full bg-black/50 border-b border-white/10 px-0 py-6 text-[10px] font-black uppercase tracking-[0.3em] focus:border-indigo-500 outline-none transition-all resize-none text-white placeholder:text-zinc-700"></textarea>
                   <button className="w-full bg-white text-black py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-4">
                     <Send size={14} /> Transmit Inquiry
                   </button>
                </form>
             </div>
          </section>
        );
      case 'terms':
        return (
          <section className="py-32 px-6 max-w-3xl mx-auto space-y-16 animate-fade-in">
            <h2 className="text-5xl font-black uppercase tracking-tighter text-center italic">Terms of Service</h2>
            <div className="space-y-12">
              {[
                { title: "Portfolio Context", text: "This site exists as a curated professional portfolio for Sushil Pokharel. All content reflects his individual academic track and research interests." },
                { title: "Privacy Policy", text: "Information transmitted via contact forms is treated as confidential and is used solely for the purpose of professional communication." },
                { title: "Intellectual Property", text: "Branding elements, design structure, and original text are the property of the author. Redistribution without consent is prohibited." }
              ].map((item, i) => (
                <div key={i} className="space-y-4 p-10 border-l-2 border-white/10 bg-zinc-900/10 rounded-r-3xl">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">{item.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">{item.text}</p>
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
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-600 selection:text-white antialiased">
      <Navbar setView={setView} currentView={view} />
      
      <main className="min-h-[80vh]">
        {renderContent()}
      </main>

      <footer className="py-32 px-8 border-t border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="space-y-8 text-center md:text-left">
            <h4 className="text-4xl font-black uppercase tracking-tighter italic">S. Pokharel</h4>
            <div className="space-y-2">
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.6em]">Academic Identity</p>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.6em]">{ADMIN_EMAIL}</p>
            </div>
            <div className="flex justify-center md:justify-start gap-8">
               {['terms', 'connect'].map(v => (
                 <button key={v} onClick={() => setView(v as View)} className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">{v}</button>
               ))}
            </div>
          </div>

          <div className="text-center md:text-right space-y-6">
             <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] italic">
               {PRECISION_WATERMARK}
             </p>
             <div className="h-px w-32 bg-white/10 ml-auto mr-auto md:mr-0"></div>
             <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.6em]">
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
