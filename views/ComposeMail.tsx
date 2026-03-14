import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, View } from '../types';
import { Megaphone, ArrowLeft, Send } from 'lucide-react';
import { useModal } from '../components/ModalProvider';
import { emailService } from '../services/emailService';
import { ADMIN_EMAIL } from '../constants';

interface ComposeMailProps {
    user: UserProfile;
    onNavigate: (view: View) => void;
}

export const ComposeMail: React.FC<ComposeMailProps> = ({ user, onNavigate }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { showAlert } = useModal();
    const isPro = user.subscriptionTier !== 'LIGHT';

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !body) {
            showAlert('Error', 'Subject and body are required.');
            return;
        }

        setIsSending(true);
        // Send to admin email, with replyTo as the user's email
        const result = await emailService.sendCustomEmail(
            ADMIN_EMAIL, 
            `[User Message] ${subject}`, 
            `Message from: ${user.name} (${user.email})\n\n${body}`,
            user.email
        );
        setIsSending(false);

        if (result.success) {
            if (result.error === 'MOCK_MODE') {
                showAlert('Success (Mock)', 'Message simulated. Configure SMTP in Admin Dashboard for real delivery.');
            } else {
                showAlert('Success', 'Message dispatched to Admin successfully.');
            }
            setSubject('');
            setBody('');
            onNavigate(View.DASHBOARD);
        } else {
            showAlert('Warning', `SMTP Error: ${result.error}. Mailto fallback triggered.`);
            const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-4xl sm:text-5xl ${isPro ? 'font-display italic tracking-tight text-amber-100' : 'font-sans font-bold text-gray-900'}`}>
                        Compose Mail
                    </h1>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest mt-2 ${isPro ? 'text-amber-500/60' : 'text-gray-500'}`}>
                        Direct Admin Communication
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate(View.DASHBOARD)}
                    className={`p-4 transition-all ${isPro ? 'bg-white/5 hover:bg-white/10 rounded-2xl text-white' : 'bg-gray-200 hover:bg-gray-300 rounded-none text-gray-900'}`}
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 sm:p-12 ${isPro ? 'glass-card' : 'bg-gray-300 border-4 border-gray-500 rounded-none shadow-none'}`}
            >
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${isPro ? 'text-white/40' : 'text-gray-600'}`}>To</label>
                        <input 
                            type="text" 
                            disabled
                            value="System Administrator" 
                            className={`w-full p-4 text-sm outline-none ${isPro ? 'bg-white/5 border border-white/10 rounded-xl text-white/50' : 'bg-gray-400 border-2 border-gray-500 rounded-none text-gray-700'}`} 
                        />
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${isPro ? 'text-white/40' : 'text-gray-600'}`}>Subject</label>
                        <input 
                            type="text" 
                            required
                            value={subject} 
                            onChange={e => setSubject(e.target.value)} 
                            className={`w-full p-4 text-sm outline-none transition-all ${isPro ? 'bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50' : 'bg-gray-200 border-2 border-gray-500 rounded-none text-gray-900 focus:border-gray-700'}`} 
                            placeholder="Message Subject" 
                        />
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${isPro ? 'text-white/40' : 'text-gray-600'}`}>Message Body</label>
                        <textarea 
                            required
                            value={body} 
                            onChange={e => setBody(e.target.value)} 
                            className={`w-full p-4 text-sm outline-none transition-all min-h-[250px] resize-y ${isPro ? 'bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50' : 'bg-gray-200 border-2 border-gray-500 rounded-none text-gray-900 focus:border-gray-700'}`} 
                            placeholder="Type your message here..." 
                        />
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSending}
                            className={`flex items-center gap-2 px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 ${isPro ? 'rounded-xl bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'rounded-none bg-gray-600 text-white hover:bg-gray-700 border-2 border-gray-700'}`}
                        >
                            <Send size={16} />
                            {isSending ? 'Dispatching...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
