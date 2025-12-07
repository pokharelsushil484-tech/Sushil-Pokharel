
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Mail, Phone, MapPin, Download, Loader2, Lock } from 'lucide-react';

declare var html2pdf: any;

interface CVBuilderProps {
  user: UserProfile;
  isVerified?: boolean;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ user, isVerified }) => {
  const [isExporting, setIsExporting] = useState(false);

  // LOCK FOR UNVERIFIED USERS
  if (isVerified === false) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-yellow-200">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Feature Locked</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                      CV Builder is restricted to verified students only. Please request verification from your Dashboard.
                  </p>
              </div>
          </div>
      );
  }

  const handleExport = () => {
    setIsExporting(true);
    const element = document.getElementById('cv-template');
    
    // Options for high-quality A4 PDF
    const opt = {
      margin: 0,
      filename: `CV_${user.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
      }).catch((err: any) => {
        console.error("PDF Export failed:", err);
        setIsExporting(false);
        alert("Could not generate PDF. Opening print dialog instead.");
        window.print();
      });
    } else {
      // Fallback
      window.print();
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-lg hover:bg-indigo-700 disabled:opacity-70 transition-all active:scale-95"
        >
          {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
          {isExporting ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>

      {/* CV Preview Area - A4 Aspect Ratio approx */}
      <div id="cv-template" className="bg-white shadow-xl rounded-none md:rounded-lg overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col print:shadow-none print:w-full print:max-w-none">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-8">
          <div className="flex justify-between items-start">
             <div>
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{user.name}</h1>
                <p className="text-slate-300 font-medium">{user.education}</p>
             </div>
             {user.avatar && (
               <img src={user.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg" alt="Profile" />
             )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
          
          {/* Sidebar Info */}
          <div className="md:col-span-1 space-y-8 border-r border-gray-100 pr-4">
             <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b pb-2">Contact</h3>
               <div className="space-y-3 text-sm text-gray-600">
                 <div className="flex items-center"><Phone size={14} className="mr-3 text-indigo-600" /> {user.phone}</div>
                 <div className="flex items-center"><Mail size={14} className="mr-3 text-indigo-600" /> <span className="text-xs break-all">{user.email}</span></div>
                 <div className="flex items-center"><MapPin size={14} className="mr-3 text-indigo-600" /> {user.country}</div>
               </div>
             </div>

             <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b pb-2">Skills</h3>
               <div className="flex flex-wrap gap-2">
                 {user.skills.map((skill, i) => (
                   <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">{skill}</span>
                 ))}
               </div>
             </div>
          </div>

          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center">
                 <span className="w-2 h-2 bg-indigo-500 mr-2 rounded-full"></span>
                 Education
               </h3>
               <div className="mb-4">
                 <h4 className="font-bold text-gray-900 text-lg">{user.institution}</h4>
                 <p className="text-indigo-600 font-medium">{user.education}</p>
                 <p className="text-gray-500 text-sm mt-2">Completed +2 with focus on core subjects. Demonstrated consistent academic performance.</p>
               </div>
            </div>
            
            <div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center">
                 <span className="w-2 h-2 bg-indigo-500 mr-2 rounded-full"></span>
                 Profile
               </h3>
               <p className="text-sm text-gray-600 leading-relaxed text-justify">
                 Motivated student from {user.country} with a strong academic record at {user.institution}. 
                 {user.studyPreference} looking for opportunities to grow and learn. 
                 Eager to apply learned skills in a practical environment.
               </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100 mt-auto">
          <p className="text-xs text-gray-400 font-medium">Created with StudentPocket App</p>
        </div>

      </div>
    </div>
  );
};