
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Download, History, Settings, Info, Video, 
  Link as LinkIcon, Trash2, ShieldCheck, Zap, 
  Monitor, Cpu, HardDrive, Share2, Loader2, 
  Play, CheckCircle, AlertTriangle, ChevronRight,
  Layers, Settings2
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE, COPYRIGHT_NOTICE, PRECISION_WATERMARK, CREATOR_NAME } from './constants';
import { View, DownloadItem } from './types';
import { analyzeVideoLink } from './services/geminiService';

const App = () => {
  const [view, setView] = useState<View>(View.DOWNLOADER);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [history, setHistory] = useState<DownloadItem[]>([]);

  const qualityTiers = [
    { label: '144p', cat: 'Low' },
    { label: '360p', cat: 'Low' },
    { label: '720p', cat: 'SD' },
    { label: '1080p', cat: 'HD' },
    { label: '2K', cat: 'UHD' },
    { label: '4K', cat: 'UHD' },
    { label: '7K', cat: 'PRO' },
    { label: '8K', cat: 'PRO' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('8k_downloader_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    const data = await analyzeVideoLink(url);
    
    if (data.isValid) {
      setResult(data);
      const newItem: DownloadItem = {
        id: Date.now().toString(),
        url: url,
        platform: data.platform,
        status: 'READY',
        title: data.title,
        quality: selectedQuality,
        timestamp: Date.now()
      };
      const updatedHistory = [newItem, ...history].slice(0, 15);
      setHistory(updatedHistory);
      localStorage.setItem('8k_downloader_history', JSON.stringify(updatedHistory));
    } else {
      alert("Invalid or unsupported URL. Please paste a valid social media link.");
    }
    setIsAnalyzing(false);
  };

  const handleDownload = () => {
    alert(`Initializing ${selectedQuality} Secure Download for: ${result.title}\n\nProcessed by Sushil Pokharel's 8K Engine.`);
  };

  const renderContent = () => {
    switch (view) {
      case View.DOWNLOADER:
        return (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                Built by Sushil Pokharel
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic uppercase leading-none">
                {APP_NAME}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">{APP_TAGLINE}</p>
            </div>

            {/* Input & Quality Selector */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                {/* Quality Grid */}
                <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
                   <div className="flex space-x-3 min-w-max">
                     {qualityTiers.map((q) => (
                       <button
                         key={q.label}
                         onClick={() => setSelectedQuality(q.label)}
                         className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                           selectedQuality === q.label 
                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                           : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                         }`}
                       >
                         {q.label}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Paste Area */}
                <form onSubmit={handleAnalyze} className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <LinkIcon className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                  </div>
                  <input 
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste Video Link (YouTube, Facebook, Instagram...)"
                    className="w-full bg-black/50 border-2 border-white/5 rounded-3xl pl-16 pr-40 py-7 text-white font-bold outline-none focus:border-indigo-600 transition-all placeholder:text-slate-700"
                  />
                  <button 
                    type="submit"
                    disabled={isAnalyzing}
                    className="absolute right-3 top-3 bottom-3 px-10 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : 'Analyze'}
                  </button>
                </form>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className="max-w-3xl mx-auto p-10 bg-white rounded-[3.5rem] shadow-2xl animate-scale-up space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-indigo-500">
                        <Video size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate w-64 md:w-80">{result.title}</h3>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">{result.platform} Video Detected</p>
                      </div>
                   </div>
                   <div className="shrink-0 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100">
                      Target: {selectedQuality}
                   </div>
                </div>

                {/* Regulation Panel */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start space-x-4">
                   <ShieldCheck className="text-indigo-600 mt-1" size={20} />
                   <div>
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Video Regulation Status</h4>
                      <p className="text-xs text-slate-500 leading-relaxed italic">{result.regulationMessage || "Safe for Personal Archive. High-resolution stream available."}</p>
                   </div>
                </div>

                {/* The Download Action */}
                <button 
                  onClick={handleDownload}
                  className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center group"
                >
                  <Download className="mr-3 group-hover:bounce" size={24}/> Download {selectedQuality} Video
                </button>
              </div>
            )}

            {/* Tech Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-10">
               {[
                 { icon: Cpu, label: "Core Processing", value: "Sushil v3.0" },
                 { icon: Monitor, label: "Resolution Tier", value: "8K Cinema" },
                 { icon: HardDrive, label: "Regulatory Guard", value: "Active" }
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                    <item.icon className="text-indigo-500" size={24} />
                    <div>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-sm font-black text-white italic">{item.value}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );
      case View.HISTORY:
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
             <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter">Recent Logs</h2>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em] mt-2">Historic UHD Extraction Results</p>
                </div>
                <button onClick={() => setHistory([])} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
                  <Trash2 size={24} />
                </button>
             </div>

             <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                     <Play size={64} className="mx-auto mb-4" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">No Downloads Found</p>
                  </div>
                ) : history.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all">
                     <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                          <Layers size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white tracking-tight truncate w-48 md:w-96 uppercase italic">{item.title}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.platform}</span>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.quality}</span>
                          </div>
                        </div>
                     </div>
                     <button onClick={() => alert("Re-processing link...")} className="p-4 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                        <Share2 size={18} />
                     </button>
                  </div>
                ))}
             </div>
          </div>
        );
      case View.ABOUT:
        return (
          <div className="max-w-3xl mx-auto space-y-12 animate-fade-in py-10">
            <div className="space-y-6 text-center">
              <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase">{APP_NAME}</h2>
              <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full"></div>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                The definitive studio-grade toolkit for ultra-high-definition video preservation. 
                Optimized for 8K and 7K content layers. 
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em]">Developed by {CREATOR_NAME}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
               <div className="p-10 bg-white rounded-[3rem] space-y-6">
                  <Zap size={40} className="text-indigo-600" />
                  <h4 className="text-2xl font-black text-slate-900 italic uppercase">Ultimate Bitrate</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">Our engine prioritizes original bitrates, ensuring no pixel loss during the 8K handshake process.</p>
               </div>
               <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-6">
                  <ShieldCheck size={40} className="text-indigo-500" />
                  <h4 className="text-2xl font-black text-white italic uppercase">Regulated Gate</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">Advanced algorithms monitor every link to ensure your download complies with platform safety regulations.</p>
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
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setView(View.DOWNLOADER)}
        >
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
            <Settings2 size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">8K Downloaders</span>
        </div>

        <div className="hidden md:flex gap-12 items-center">
          {[
            { view: View.DOWNLOADER, label: "Studio" },
            { view: View.HISTORY, label: "Logs" },
            { view: View.ABOUT, label: "Core" }
          ].map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all ${
                view === item.view ? 'text-indigo-400' : 'text-slate-600 hover:text-white'
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

      <main className="pt-44 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <footer className="py-20 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="space-y-4">
              <h4 className="text-4xl font-black uppercase tracking-tighter italic leading-tight">Sushil<br/>Pokharel</h4>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.8em]">{PRECISION_WATERMARK}</p>
           </div>
           <div className="text-center md:text-right opacity-40">
              <p className="text-[9px] font-bold uppercase tracking-widest mb-2 leading-relaxed">
                Full Spectrum Multi-Tier Quality Algorithm v3.0<br/>
                Proprietary Extraction Logic by Sushil Innovation
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">{COPYRIGHT_NOTICE}</p>
           </div>
        </div>
      </footer>

      {/* Mobile Nav */}
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
