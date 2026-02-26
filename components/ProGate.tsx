import React from 'react';
import { motion } from 'motion/react';
import { UserProfile, SubscriptionTier } from '../types';
import { Lock, Crown, CheckCircle2, Zap } from 'lucide-react';

interface ProGateProps {
  user: UserProfile;
  children: React.ReactNode;
  onActivateTrial: () => void;
}

export const ProGate: React.FC<ProGateProps> = ({ user, children, onActivateTrial }) => {
  if (user.subscriptionTier !== SubscriptionTier.LIGHT) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-12 max-w-2xl w-full relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <Crown size={64} className="mx-auto mb-6 text-amber-400" />
        <h2 className="text-3xl font-display italic mb-4">Elite Pro Feature</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          This module requires Quantum Elite Pro access. Unlock advanced capabilities to maximize your potential.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <Zap size={24} className="text-amber-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">15-Day Trial</h3>
            <p className="text-xs text-white/40 mb-4">Experience full power instantly.</p>
            <button 
              onClick={onActivateTrial}
              className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors text-xs uppercase tracking-widest"
            >
              Activate Trial
            </button>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <CheckCircle2 size={24} className="text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Lifetime Access</h3>
            <p className="text-xs text-white/40 mb-4">Complete tasks to earn permanent status.</p>
            <div className="text-xs text-white/60 bg-white/5 py-3 rounded-xl">
              Check Dashboard for Tasks
            </div>
          </div>
        </div>

        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Upgrade required for: Mission Control, Vault, Radar, Security
        </p>
      </motion.div>
    </div>
  );
};
