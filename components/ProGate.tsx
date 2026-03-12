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
        className="bg-gray-300 border-4 border-gray-500 p-12 max-w-2xl w-full relative overflow-hidden rounded-none"
      >
        <Crown size={64} className="mx-auto mb-6 text-gray-600" />
        <h2 className="text-3xl font-sans font-bold text-gray-900 mb-4">Beta Access Limit</h2>
        <p className="text-gray-700 mb-8 max-w-md mx-auto font-medium">
          This advanced module is part of the Quantum Elite Pro suite. Your current Beta access is limited to essential features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-400 p-6 rounded-none border-2 border-gray-500">
            <Zap size={24} className="text-gray-800 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">15-Day Trial</h3>
            <p className="text-xs text-gray-700 mb-4 font-medium">Experience full power instantly.</p>
            <button 
              onClick={onActivateTrial}
              className="w-full py-3 bg-gray-600 text-white font-bold rounded-none hover:bg-gray-700 transition-colors text-xs uppercase tracking-widest border-2 border-gray-800"
            >
              Activate Trial
            </button>
          </div>

          <div className="bg-gray-400 p-6 rounded-none border-2 border-gray-500">
            <CheckCircle2 size={24} className="text-gray-800 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Lifetime Access</h3>
            <p className="text-xs text-gray-700 mb-4 font-medium">Complete tasks to earn permanent status.</p>
            <div className="text-xs text-gray-800 bg-gray-300 border border-gray-500 py-3 rounded-none font-bold">
              Check Dashboard for Tasks
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          Upgrade required for: Mission Control, Vault, Radar, Security
        </p>
      </motion.div>
    </div>
  );
};
