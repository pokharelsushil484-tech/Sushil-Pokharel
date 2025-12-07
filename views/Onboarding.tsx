import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_USER } from '../constants';
import { Camera, Check, Upload } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(profile);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md p-8 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }} 
          />
        </div>

        {step === 1 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome, Sushil! 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Let's set up your personal student pocket.</p>
            
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4 group">
                <div className="w-full h-full rounded-full bg-indigo-50 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-xl overflow-hidden relative">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-indigo-300 dark:text-gray-500">
                      <Camera className="w-10 h-10 mb-1" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <label 
                    htmlFor="photo-upload"
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                  />
                </div>
                
                {/* Badge */}
                <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 pointer-events-none">
                  <Camera size={16} />
                </div>
              </div>

              <div className="flex space-x-3">
                 {/* Upload File Button */}
                 <input 
                   id="photo-upload"
                   type="file" 
                   accept="image/*" 
                   onChange={handleImageUpload} 
                   className="hidden"
                 />
                 <label 
                   htmlFor="photo-upload"
                   className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600 px-4 py-2 rounded-full font-medium cursor-pointer transition-colors text-sm"
                 >
                   <Upload size={14} />
                   <span>Upload</span>
                 </label>

                 {/* Camera Capture Button */}
                  <input 
                   id="camera-capture"
                   type="file" 
                   accept="image/*"
                   capture="user" 
                   onChange={handleImageUpload} 
                   className="hidden"
                 />
                 <label 
                   htmlFor="camera-capture"
                   className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600 px-4 py-2 rounded-full font-medium cursor-pointer transition-colors text-sm"
                 >
                   <Camera size={14} />
                   <span>Selfie</span>
                 </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Confirm Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
                <input 
                  type="text" 
                  value={profile.education} 
                  onChange={(e) => setProfile({...profile, education: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">All Set!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Your academic journey is organized and ready. 
              <br/><br/>
              <strong>Created by Sushil Pokharel</strong>
            </p>
          </div>
        )}

        <button 
          onClick={handleNext}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
        >
          {step === 3 ? "Launch App" : "Continue"}
        </button>
      </div>
    </div>
  );
};