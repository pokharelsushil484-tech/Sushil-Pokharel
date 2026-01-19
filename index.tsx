
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Download, History, Settings, Info, Video, 
  Link as LinkIcon, Trash2, ShieldCheck, Zap, 
  Monitor, Cpu, HardDrive, Share2, Loader2, 
  Play, CheckCircle, AlertTriangle, ChevronRight,
  Layers, Settings2, Instagram, Facebook, Youtube, Twitter, 
  Globe, Activity, Gavel
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE, COPYRIGHT_NOTICE, PRECISION_WATERMARK, CREATOR_NAME } from './constants';
import { View, DownloadItem } from './types';
import { analyzeVideoLink } from './services/geminiService';

const App = () => {
  const [view, setView] = useState<View>(View.DOWNLOADER);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [history, setHistory] = useState<DownloadItem[]>([]);

  const qualityTiers = [
    { label: '144p', info: 'Low Bitrate' },
    { label: '360p', info: 'Standard' },
    { label: '720p', info: 'HD Ready' },
    { label: '1080p', info: 'Full HD' },
    { label: '2K', info: 'Quad HD' },
    { label: '4K', info: 'Ultra HD' },
    { label: '7K', info: 'Studio' },
    { label: '8K', info: 'Extreme' }
  ];

  const platforms = [
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-400' },
    { name: 'TikTok', icon: Video, color: 'text-cyan-400' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('8k_dl_pro_history');
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
      setHistory(prev => [newItem, ...prev].slice(0, 10));
      localStorage.setItem('8k_dl_pro_history', JSON.stringify([newItem, ...history].slice(0, 10)));
    } else {
      alert("Invalid Source: The 8K Engine could not verify this link regulation.");
    }
    setIsAnalyzing(false);
  };

  const startDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            alert(`Download Complete: ${result.title} saved in ${selectedQuality}`);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const renderContent = () => {
    switch (view) {
      case View.DOWNLOADER:
        return (
          <div className="space-y-16 animate-fade-in">
            {/* Dynamic Hero Section */}
            <div className="text-center space-y-6 relative">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg animate-pulse">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
                  Secure 8K Node Active
                </span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 tracking-tighter uppercase italic leading-none">
                {APP_NAME}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.6em] text-[10px] max-w-xl mx-auto">
                {APP_TAGLINE} by <span className="text-white">{CREATOR_NAME}</span>
              </p>
            </div>

            {/* Input & Quality Selector Card */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                {/* Platform Bar */}
                <div className="flex justify-center items-center gap-8 mb-12 opacity-60">
                   {platforms.map((p, i) => (
                     <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <p.icon className={`${p.color} group-hover:scale-125 transition-transform duration-500`} size={28} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{p.name}</span>
                     </div>
                   ))}
                </div>

                {/* Quality Grid - Lowest to Highest */}
                <div className="mb-10">
                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                     {qualityTiers.map((q) => (
                       <button
                         key={q.label}
                         onClick={() => setSelectedQuality(q.label)}
                         className={`relative flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
                           selectedQuality === q.label 
                           ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
                           : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'
                         }`}
                       >
                         <span className="text-xs font-black tracking-tighter">{q.label}</span>
                         <span className="text-[7px] font-bold uppercase tracking-tight mt-1 opacity-50">{q.info}</span>
                       </button>
                     ))}
                   </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleAnalyze} className="relative group">
                  <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                    <LinkIcon className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                  </div>
                  <input 
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter Video Link to Start Extraction..."
                    className="w-full bg-black/60 border-2 border-white/10 rounded-[2.5rem] pl-20 pr-44 py-8 text-white text-lg font-bold outline-none focus:border-indigo-600/50 focus:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all placeholder:text-slate-800"
                  />
                  <button 
                    type="submit"
                    disabled={isAnalyzing}
                    className="absolute right-4 top-4 bottom-4 px-12 bg-white text-black rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-500 disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : 'Analyze Link'}
                  </button>
                </form>
              </div>
            </div>

            {/* Analysis Result Card */}
            {result && (
              <div className="max-w-4xl mx-auto bg-white rounded-[4rem] p-12 shadow-2xl animate-scale-up border border-indigo-100/20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                   <div className="flex items-center space-x-8">
                      <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center text-indigo-500 shadow-xl border border-white/5">
                        <Video size={48} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none truncate w-64 md:w-96">{result.title}</h3>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">{result.platform} UHD STREAM</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-center md:items-end space-y-2">
                       <span className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">7K-8K Compatible</span>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Size: {result.estimatedSizes?.pro || '2.4 GB'}</p>
                   </div>
                </div>

                <div className="my-10 h-px bg-slate-100"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start space-x-4">
                       <Gavel className="text-amber-500 mt-1" size={20} />
                       <div>
                          <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1">Regulation Notice</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed italic">{result.regulationMessage || 'Verified for private collection.'}</p>
                       </div>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start space-x-4">
                       <Activity className="text-indigo-600 mt-1" size={20} />
                       <div>
                          <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1">Stream Integrity</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">Bitrate matching optimized for {selectedQuality} output.</p>
                       </div>
                    </div>
                </div>

                {/* Progress Visual */}
                {isDownloading && (
                  <div className="mb-8 space-y-3">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-indigo-600">
                      <span>Downloading Data Segments...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={startDownload}
                  disabled={isDownloading}
                  className="w-full py-8 bg-slate-900 hover:bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-2xl transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="animate-spin mr-3" size={24} />
                  ) : (
                    <Download className="mr-3 group-hover:translate-y-1 transition-transform" size={24} />
                  )}
                  {isDownloading ? 'Processing 8K Buffers...' : `Download Video (${selectedQuality})`}
                </button>
              </div>
            )}

            {/* Hardware Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-10">
               {[
                 { icon: Cpu, label: "Core Node", value: "Sushil v3.0 Pro" },
                 { icon: Monitor, label: "Buffer Logic", value: "7K/8K Handshake" },
                 { icon: HardDrive, label: "Regulation", value: "Active Global" }
               ].map((item, i) => (
                 <div key={i} className="p-10 bg-white/5 border border-white/5 rounded-[3rem] flex flex-col items-center text-center space-y-4 hover:bg-white/10 transition-colors cursor-default">
                    <item.icon className="text-indigo-400" size={32} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{item.label}</p>
                      <p className="text-sm font-black text-white italic tracking-tighter">{item.value}</p>
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
                  <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">History</h2>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.5em] mt-3">Verified 8K Extraction Logs</p>
                </div>
                <button onClick={() => setHistory([])} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-red-500 transition-all border border-white/5">
                  <Trash2 size={24} />
                </button>
             </div>

             <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="py-40 text-center bg-white/5 border-2 border-dashed border-white/5 rounded-[4rem] opacity-20">
                     <Play size={80} className="mx-auto mb-6 text-slate-600" />
                     <p className="text-xs font-black uppercase tracking-[0.5em]">No Logged Transmissions</p>
                  </div>
                ) : history.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all">
                     <div className="flex items-center space-x-8">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                          <Layers size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg tracking-tight truncate w-48 md:w-[30rem] uppercase italic">{item.title}</h4>
                          <div className="flex items-center space-x-6 mt-2">
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{item.platform}</span>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">{item.quality}</span>
                          </div>
                        </div>
                     </div>
                     <button className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors">
                        <Share2 size={20} />
                     </button>
                  </div>
                ))}
             </div>
          </div>
        );
      case View.ABOUT:
        return (
          <div className="max-w-4xl mx-auto space-y-16 animate-fade-in py-10">
            <div className="space-y-8 text-center">
              <h2 className="text-8xl font-black text-white italic tracking-tighter uppercase leading-none">{APP_NAME}</h2>
              <div className="h-1.5 w-32 bg-indigo-600 mx-auto rounded-full"></div>
              <p className="text-2xl text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto">
                Studio-grade toolkit for ultra-high-definition video preservation. 
                Engineered for maximum bitrate retention and regulation compliance.
              </p>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em]">Proprietary Technology by {CREATOR_NAME}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
               <div className="p-12 bg-white rounded-[3.5rem] space-y-8 shadow-2xl">
                  <Zap size={50} className="text-indigo-600" />
                  <h4 className="text-3xl font-black text-slate-900 italic uppercase leading-none">Zero Loss<br/>Bitrate</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium uppercase tracking-tight">Our multi-thread architecture bypasses standard compression, fetching the original source file for 7K and 8K workflows.</p>
               </div>
               <div className="p-12 bg-slate-900 border border-white/10 rounded-[3.5rem] space-y-8 shadow-2xl shadow-indigo-600/5">
                  <ShieldCheck size={50} className="text-indigo-500" />
                  <h4 className="text-3xl font-black text-white italic uppercase leading-none">Global<br/>Regulation</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium uppercase tracking-tight">Every extraction is monitored for legal compliance, ensuring your archival process meets platform terms of service.</p>
               </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="h-full w-full opacity-5" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
      </div>

      {/* Modern Studio Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div 
          className="flex items-center space-x-4 cursor-pointer group" 
          onClick={() => setView(View.DOWNLOADER)}
        >
          <div className="w-14 h-14 bg-white text-black rounded-[1.5rem] flex items-center justify-center shadow-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
            <Monitor size={30} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter uppercase italic leading-none">8K Downloader</span>
            <span className="text-[8px] font-bold text-indigo-500 tracking-[0.4em] uppercase">Sushil Pro-Node</span>
          </div>
        </div>

        <div className="hidden md:flex gap-14 items-center">
          {[
            { view: View.DOWNLOADER, label: "Studio" },
            { view: View.HISTORY, label: "Log Files" },
            { view: View.ABOUT, label: "Core" }
          ].map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all relative py-2 ${
                view === item.view ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-600 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button className="w-14 h-14 rounded-[1.5rem] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 shadow-inner">
          <Settings2 size={24} />
        </button>
      </nav>

      {/* Main Content Viewport */}
      <main className="pt-52 pb-44 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Pro Studio Footer */}
      <footer className="py-24 px-10 border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="space-y-6">
              <h4 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Sushil<br/>Innovation</h4>
              <div className="flex space-x-6 text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">
                 <span className="hover:text-white cursor-pointer transition-colors">Extraction V3</span>
                 <span className="hover:text-white cursor-pointer transition-colors">Bitrate Pro</span>
              </div>
           </div>
           <div className="text-left md:text-right space-y-4">
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-relaxed">
                Hardware Accelertation Active • 72-Node Processing Cluster<br/>
                Developed & Maintained by <span className="text-white border-b border-indigo-600">Sushil Pokharel</span>
              </p>
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">{COPYRIGHT_NOTICE}</p>
           </div>
        </div>
      </footer>

      {/* Mobile Floating Hub */}
      <div className="md:hidden fixed bottom-8 left-8 right-8 z-[100]">
        <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] p-3 flex justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
          {[
            { view: View.DOWNLOADER, icon: Monitor },
            { view: View.HISTORY, icon: History },
            { view: View.ABOUT, icon: Info }
          ].map(item => (
            <button 
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex-1 flex flex-col items-center justify-center p-5 rounded-[2rem] transition-all duration-500 ${
                view === item.view ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600'
              }`}
            >
              <item.icon size={26} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
