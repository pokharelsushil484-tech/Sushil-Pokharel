
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Download, History, Settings, Info, Search, 
  Video, Link as LinkIcon, Trash2, ArrowRight,
  ShieldCheck, Zap, Layers, Gavel, Monitor,
  Cpu, HardDrive, Share2, Loader2, Play, CheckCircle
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE, COPYRIGHT_NOTICE, PRECISION_WATERMARK, CREATOR_NAME } from './constants';
import { View, DownloadItem } from './types';
import { analyzeSocialUrl } from './services/geminiService';

const App = () => {
  const [view, setView] = useState<View>(View.DOWNLOADER);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('8K');
  const [history, setHistory] = useState<DownloadItem[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const qualities = ['1080p', '2K', '4K', '7K', '8K'];

  useEffect(() => {
    const saved = localStorage.getItem('8k_dl_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    setAnalysis(null);

    const result = await analyzeSocialUrl(urlInput);
    if (result.isValid) {
      setAnalysis(result);
      const newItem: DownloadItem = {
        id: Date.now().toString(),
        url: urlInput,
        platform: result.platform as any,
        status: 'READY',
        title: result.title,
        quality: selectedQuality,
        timestamp: Date.now()
      };
      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('8k_dl_history', JSON.stringify(newHistory));
    } else {
      alert("Regulation Error: Could not resolve video headers for this link.");
    }
    setIsProcessing(false);
  };

  const renderContent = () => {
    switch (view) {
      case View.DOWNLOADER:
        return (
          <div className="space-y-12 animate-fade-in">
            {/* Header branding */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                Powered by Sushil Pokharel
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic">
                {APP_NAME}
              </h1>
              <p className="text-slate-400 font-medium uppercase tracking-[0.4em] text-xs">{APP_TAGLINE}</p>
            </div>

            {/* Quality Selector & Input */}
            <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {qualities.map(q => (
                  <button 
                    key={q}
                    onClick={() => setSelectedQuality(q)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedQuality === q ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form onSubmit={handleProcess} className="relative">
                <input 
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste high-res video URL here..."
                  className="w-full bg-black border-2 border-white/5 rounded-3xl px-8 py-6 text-white font-bold outline-none focus:border-indigo-600 transition-all placeholder:text-slate-700"
                />
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="absolute right-3 top-3 bottom-3 px-10 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Analyze 8K'}
                </button>
              </form>
            </div>

            {/* Analysis & Regulation Result */}
            {analysis && (
              <div className="max-w-3xl mx-auto p-10 bg-white rounded-[3rem] shadow-2xl animate-scale-up space-y-8">
                <div className="flex justify-between items-start">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                        <Monitor size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 truncate w-64 md:w-96">{analysis.title}</h3>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{analysis.platform} Detected</p>
                      </div>
                   </div>
                   <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tighter">
                      Targeting {selectedQuality}
                   </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <Gavel size={20} className="text-amber-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Regulation Status</h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic">{analysis.regulationNote || "This video is clear for private archival. Ensure copyright compliance."}</p>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Initializing ${selectedQuality} Secure Stream...`)}
                  className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-indigo-200 transition-all flex items-center justify-center"
                >
                  <Download className="mr-3" size={20}/> Process & Download
                </button>
              </div>
            )}

            {/* Technical Regulation & Hardware Monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-10">
                {[
                  { icon: Cpu, title: "Processing Engine", value: "Active", desc: "Sushil Pro-Engine v4.2" },
                  { icon: HardDrive, title: "Buffer Regulation", value: "Standard", desc: "Queue managed via local node" },
                  { icon: ShieldCheck, title: "Secure Handshake", value: "Verified", desc: "Encryption layer active" }
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 space-y-4">
                    <stat.icon className="text-indigo-500" size={24} />
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.title}</h4>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">{stat.value}</span>
                      </div>
                      <p className="text-sm font-black text-white tracking-tight italic">{stat.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      case View.HISTORY:
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-5xl font-black text-white tracking-tighter italic">Transfer Logs</h2>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em] mt-2">Historic UHD Acquisitions</p>
              </div>
              <button onClick={() => setHistory([])} className="p-4 text-slate-600 hover:text-red-500 transition-colors">
                <Trash2 size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-32 text-center bg-slate-900/30 rounded-[3rem] border border-dashed border-white/5">
                  <Play size={48} className="mx-auto mb-4 text-slate-800" />
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Repository Vacant</p>
                </div>
              ) : history.map(item => (
                <div key={item.id} className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-slate-900 transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Layers size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white truncate w-48 md:w-80 tracking-tight">{item.title}</h4>
                      <div className="flex gap-3 items-center mt-1">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.platform}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                        <span className="text-[9px] font-black text-slate-500 uppercase">{item.quality}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-4 bg-white/5 text-slate-500 rounded-xl hover:text-white transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case View.ABOUT:
        return (
          <div className="max-w-3xl mx-auto space-y-16 animate-fade-in py-10">
            <div className="space-y-6 text-center">
              <h2 className="text-6xl font-black text-white tracking-tighter italic">About {APP_NAME}</h2>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                The web's most powerful toolkit for preserving social media memories in maximum quality. 
                Built with precision by <span className="text-white border-b border-indigo-600 pb-1">{CREATOR_NAME}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 bg-white rounded-[3rem] space-y-6">
                <Zap size={32} className="text-indigo-600" />
                <h4 className="text-2xl font-black text-slate-900 italic">High Speed</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Multi-threaded logic paths ensure your 8K downloads are processed with zero hardware latency.</p>
              </div>
              <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-6">
                <ShieldCheck size={32} className="text-indigo-500" />
                <h4 className="text-2xl font-black text-white italic">Zero Logging</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Your data is your own. We act as a gateway, never storing video content on our nodes.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Nav */}
      <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView(View.DOWNLOADER)}>
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
            <Cpu size={28} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">8K Downloaders</span>
        </div>

        <div className="hidden md:flex gap-12 items-center">
          {[
            { view: View.DOWNLOADER, label: "Studio" },
            { view: View.HISTORY, label: "Transfer Log" },
            { view: View.ABOUT, label: "Core" }
          ].map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all ${
                view === item.view ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'text-slate-600 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
          <Settings size={20} />
        </button>
      </nav>

      {/* Main Container */}
      <main className="pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-20 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-4xl font-black uppercase tracking-tighter italic">Sushil<br/>Pokhrel</h4>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.8em]">8K Performance Tier</p>
          </div>
          <div className="text-left md:text-right space-y-4 opacity-40">
            <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
              Proprietary Video Regulation Protocols<br/>
              Developed & Maintained by Sushil Innovation Group
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{COPYRIGHT_NOTICE}</p>
          </div>
        </div>
      </footer>

      {/* Bottom Regulation Tracker (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-2 flex justify-between shadow-2xl border border-white/10">
          {[
            { view: View.DOWNLOADER, icon: Monitor },
            { view: View.HISTORY, icon: History },
            { view: View.ABOUT, icon: Info }
          ].map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                view === item.view ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'
              }`}
            >
              <item.icon size={22} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
