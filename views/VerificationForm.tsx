
import React, { useState, useEffect } from 'react';
import { UserProfile, VerificationQuestion, ChangeRequest, View } from '../types';
import { generateVerificationForm } from '../services/geminiService';
import { ShieldCheck, Loader2, ArrowLeft, ClipboardCheck, Zap, ShieldAlert } from 'lucide-react';

interface VerificationFormProps {
  user: UserProfile;
  updateUser: (u: UserProfile) => void;
  onNavigate: (v: View) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ user, updateUser, onNavigate }) => {
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
    
    const request: ChangeRequest = {
      id: 'AUTH-' + Date.now(),
      userId: user.name,
      username: user.name,
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
      <div className="h-[80vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center mb-12 border border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Analyzing Data Nodes</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.7em] text-slate-400">Synthesizing Authorization Architecture...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-24">
      <button onClick={() => onNavigate(View.DASHBOARD)} className="flex items-center text-slate-400 hover:text-indigo-600 mb-12 font-black text-[10px] uppercase tracking-[0.6em] transition-all group bg-white/5 px-6 py-3 rounded-2xl border border-white/5 hover:border-indigo-600/30">
        <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-2 transition-transform" /> TERMINATE AUTHORIZATION
      </button>

      <div className="bg-white dark:bg-[#0f172a] rounded-[4rem] p-16 lg:p-24 shadow-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 mb-20">
          <div className="w-28 h-28 bg-indigo-600 rounded-[3rem] flex items-center justify-center text-white shadow-3xl shadow-indigo-600/20">
            <ShieldCheck size={56} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Security Authorization</h2>
            <p className="text-[12px] text-indigo-500 font-black uppercase tracking-[0.7em] mt-6">Protocol Level: Infrastructure Provisioning</p>
          </div>
        </div>

        <div className="mb-16 p-10 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex items-start space-x-8">
            <ShieldAlert className="text-amber-500 flex-shrink-0" size={40} />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase tracking-[0.1em]">
                CRITICAL WARNING: Provisioning false identity metadata will result in immediate and permanent cluster node suspension. Data is reviewed by the Master Architect manually.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {questions.map((q) => (
            <div key={q.id} className="space-y-8">
              <label className="block text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-tight">
                {q.question}
              </label>
              {q.type === 'text' ? (
                <textarea
                  required
                  className="w-full p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-transparent focus:border-indigo-600 outline-none transition-all dark:text-white font-bold text-lg placeholder:text-slate-300"
                  placeholder="INPUT ENCRYPTED RESPONSE..."
                  rows={4}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {q.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`p-8 rounded-[2rem] border-2 text-left font-black text-xs transition-all uppercase tracking-[0.3em] ${
                        answers[q.id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xl scale-105' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100'
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
            className="w-full bg-indigo-600 text-white py-10 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-3xl transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-20 flex items-center justify-center group"
          >
            {submitting ? <Loader2 className="animate-spin mr-6" /> : <Zap size={28} className="mr-6 group-hover:scale-125 transition-transform" />}
            {submitting ? 'COMMITTING ENCRYPTED CLUSTER SIGNAL...' : 'AUTHORIZE CLUSTER PROVISION'}
          </button>
        </form>
      </div>
    </div>
  );
};
