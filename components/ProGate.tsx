import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, SubscriptionTier } from '../types';
import { Lock, Crown, CheckCircle2, Zap, XCircle } from 'lucide-react';

interface ProGateProps {
  user: UserProfile;
  children: React.ReactNode;
  onActivatePro: () => void;
}

const QUESTIONS = [
  {
    question: "What is the primary purpose of the Quantum Elite Suite?",
    options: ["Gaming", "Professional Productivity", "Social Media", "Video Streaming"],
    answer: 1
  },
  {
    question: "Which feature is exclusive to the Pro version?",
    options: ["Dashboard", "Support", "Mission Control", "Settings"],
    answer: 2
  },
  {
    question: "What is the highest professional tier?",
    options: ["Novice", "Intermediate", "Advanced", "Quantum Elite"],
    answer: 3
  }
];

export const ProGate: React.FC<ProGateProps> = ({ user, children, onActivatePro }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizFailed, setQuizFailed] = useState(false);

  if (user.subscriptionTier !== SubscriptionTier.LIGHT) {
    return <>{children}</>;
  }

  const handleAnswer = (index: number) => {
    if (index === QUESTIONS[currentQuestion].answer) {
      if (currentQuestion === QUESTIONS.length - 1) {
        onActivatePro();
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    } else {
      setQuizFailed(true);
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setCurrentQuestion(0);
    setQuizFailed(false);
  };

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

        {!showQuiz && !quizFailed && (
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="bg-gray-400 p-6 rounded-none border-2 border-gray-500 w-full max-w-md">
              <CheckCircle2 size={24} className="text-gray-800 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lifetime Access</h3>
              <p className="text-xs text-gray-700 mb-4 font-medium">Answer a few questions correctly to earn permanent Pro status.</p>
              <button 
                onClick={() => setShowQuiz(true)}
                className="w-full py-3 bg-gray-600 text-white font-bold rounded-none hover:bg-gray-700 transition-colors text-xs uppercase tracking-widest border-2 border-gray-800"
              >
                Start Qualification Quiz
              </button>
            </div>
          </div>
        )}

        {showQuiz && !quizFailed && (
          <div className="bg-gray-400 p-8 rounded-none border-2 border-gray-500 w-full max-w-md mx-auto text-left">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </h3>
            <p className="text-lg font-bold text-gray-900 mb-6">
              {QUESTIONS[currentQuestion].question}
            </p>
            <div className="space-y-3">
              {QUESTIONS[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full text-left p-4 bg-gray-300 border-2 border-gray-500 hover:bg-gray-500 hover:text-white transition-colors font-bold text-gray-800"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {quizFailed && (
          <div className="bg-gray-400 p-8 rounded-none border-2 border-gray-500 w-full max-w-md mx-auto">
            <XCircle size={48} className="text-red-600 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Qualification Failed</h3>
            <p className="text-sm text-gray-700 mb-6 font-medium">
              Incorrect answer. You did not qualify for the Pro version.
            </p>
            <button 
              onClick={resetQuiz}
              className="w-full py-3 bg-gray-600 text-white font-bold rounded-none hover:bg-gray-700 transition-colors text-xs uppercase tracking-widest border-2 border-gray-800"
            >
              Try Again Later
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-8">
          Upgrade required for: Mission Control, Vault, Radar, Security
        </p>
      </motion.div>
    </div>
  );
};
