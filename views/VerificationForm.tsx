
import React, { useState, useEffect } from 'react';
import { UserProfile, VerificationQuestion, ChangeRequest, View } from '../types';
import { generateVerificationForm } from '../services/geminiService';
import { ShieldCheck, Loader2, ArrowLeft, Zap, ShieldAlert } from 'lucide-react';

interface VerificationFormProps {
  user: UserProfile;
  username: string; // Critical for linking request to correct storage key
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, username, updateUser, onNavigate }) => {
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      const q = await generateVerificationForm(user);
      setQuestions(q);
      setLoading(false);
    };
    fetchForm();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Create request with the LOGIN ID (username), not the display name
    const request: ChangeRequest = {
      id: 'AUTH-' + Date.now(),
      userId: username,
      username: username, // This MUST match the key used in storageService (architect_data_USERNAME)
      type: 'VERIFICATION',
      details: JSON.stringify(answers),
      status: 'PENDING',
      createdAt: Date.now()
    };

    const existing = JSON.parse(localStorage.getItem('studentpocket_requests') || '[]');
    localStorage.setItem('studentpocket_requests', JSON.stringify([...existing, request]));

    setTimeout(() => {
      updateUser({ ...user, verificationStatus: 'PENDING_APPROVAL' });
      setSubmitting(false);
      onNavigate(View.DASHBOARD);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse px-6 text-center">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Analyzing Data Nodes</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synthesizing Authorization Architecture...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-24 px-4 sm:px-0">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-8 font-black text-[10px] uppercase tracking-[0.3em] transition-all group bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-indigo-600/30">
        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> CANCEL SIGNAL
      </button>

      <div className="bg-white dark:bg-[#0f172a] rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20 flex-shrink-0">
            <ShieldCheck size={40} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Security Authorization</h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em] mt-4">Node: {username}</p>
          </div>
        </div>

        <div className="mb-12 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-4">
            <ShieldAlert className="text-amber-500 flex-shrink-0 mt-1" size={24} />
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase tracking-wide">
                Warning: Provisioning false identity metadata will result in immediate cluster node suspension.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {questions.map((q) => (
            <div key={q.id} className="space-y-6">
              <label className="block text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-snug">
                {q.question}
              </label>
              {q.type === 'text' ? (
                <textarea
                  required
                  className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-transparent focus:border-indigo-600 outline-none transition-all dark:text-white font-bold text-sm placeholder:text-slate-300"
                  placeholder="INPUT ENCRYPTED RESPONSE..."
                  rows={3}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`p-6 rounded-2xl border-2 text-left font-black text-[10px] transition-all uppercase tracking-[0.2em] ${
                        answers[q.id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {submitting ? <Loader2 className="animate-spin mr-4" /> : <Zap size={20} className="mr-4 group-hover:scale-125 transition-transform" />}
            {submitting ? 'SYNCING...' : 'COMMIT SIGNAL'}
          </button>
        </form>
      </div>
    </div>
  );
};
