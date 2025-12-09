

import React, { useState } from 'react';
import { UserProfile, Experience, Project } from '../types';
import { Mail, Phone, MapPin, Download, Loader2, Lock, Plus, Trash2, Edit2, Check, Briefcase, GraduationCap, Code } from 'lucide-react';

declare var html2pdf: any;

interface CVBuilderProps {
  user: UserProfile;
  isVerified?: boolean;
  updateUser: (u: UserProfile) => void;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ user, isVerified, updateUser }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Local state for editing form
  const [experiences, setExperiences] = useState<Experience[]>(user.experience || []);
  const [projects, setProjects] = useState<Project[]>(user.projects || []);

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

  // --- Editing Handlers ---

  const saveChanges = () => {
    updateUser({
      ...user,
      experience: experiences,
      projects: projects
    });
    setIsEditing(false);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      role: 'New Role',
      company: 'Company Name',
      duration: 'Year - Year',
      description: 'Brief description of your responsibilities.'
    };
    setExperiences([...experiences, newExp]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      title: 'Project Title',
      role: 'Lead',
      description: 'What did you build or achieve?'
    };
    setProjects([...projects, newProj]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // --- Render Editor ---
  if (isEditing) {
    return (
      <div className="pb-20 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit CV Details</h1>
          <button 
            onClick={saveChanges}
            className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg hover:bg-green-700 transition-all active:scale-95"
          >
            <Check size={16} className="mr-2" /> Save Changes
          </button>
        </div>

        <div className="space-y-6">
           {/* Experience Editor */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center">
                    <Briefcase size={20} className="mr-2 text-indigo-500"/> Experience
                 </h3>
                 <button onClick={addExperience} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center">
                    <Plus size={14} className="mr-1"/> Add Item
                 </button>
              </div>
              <div className="space-y-4">
                 {experiences.map(exp => (
                   <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl relative group">
                      <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                         <input className="p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-bold" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Role" />
                         <input className="p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company" />
                         <input className="col-span-2 p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" value={exp.duration} onChange={e => updateExperience(exp.id, 'duration', e.target.value)} placeholder="Duration (e.g. 2022 - Present)" />
                      </div>
                      <textarea className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm h-20 resize-none" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Description" />
                   </div>
                 ))}
                 {experiences.length === 0 && <p className="text-gray-400 text-sm italic">No experience added.</p>}
              </div>
           </div>

           {/* Projects Editor */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center">
                    <Code size={20} className="mr-2 text-indigo-500"/> Projects
                 </h3>
                 <button onClick={addProject} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center">
                    <Plus size={14} className="mr-1"/> Add Item
                 </button>
              </div>
              <div className="space-y-4">
                 {projects.map(proj => (
                   <div key={proj.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl relative group">
                      <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                         <input className="p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-bold" value={proj.title} onChange={e => updateProject(proj.id, 'title', e.target.value)} placeholder="Project Title" />
                         <input className="p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm" value={proj.role} onChange={e => updateProject(proj.id, 'role', e.target.value)} placeholder="Your Role (Optional)" />
                      </div>
                      <textarea className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm h-20 resize-none" value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} placeholder="Description" />
                   </div>
                 ))}
                 {projects.length === 0 && <p className="text-gray-400 text-sm italic">No projects added.</p>}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- Render Preview (Main View) ---
  return (
    <div className="pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CV Builder</h1>
        <div className="flex space-x-2">
           <button 
            onClick={() => {
              setExperiences(user.experience || []);
              setProjects(user.projects || []);
              setIsEditing(true);
            }}
            className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
             <Edit2 size={16} className="mr-2" /> Edit Details
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-lg hover:bg-indigo-700 disabled:opacity-70 transition-all active:scale-95"
          >
            {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* PROFESSIONAL CV TEMPLATE - A4 Layout */}
      <div id="cv-template" className="bg-white text-gray-800 shadow-2xl rounded-none md:rounded-lg overflow-hidden max-w-[210mm] mx-auto min-h-[297mm] flex flex-col print:shadow-none print:w-full print:max-w-none print:m-0">
        
        {/* Modern Header */}
        <div className="bg-[#2c3e50] text-white p-10 flex justify-between items-center">
            <div>
               <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{user.name}</h1>
               <p className="text-gray-300 text-lg font-medium tracking-wide">{user.education}</p>
            </div>
            {user.avatar && (
              <img src={user.avatar} className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-lg" alt="Profile" />
            )}
        </div>

        <div className="flex flex-1">
            {/* Sidebar (Left) */}
            <div className="w-1/3 bg-[#f8f9fa] p-8 border-r border-gray-200">
               {/* Contact */}
               <div className="mb-8">
                  <h3 className="text-sm font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Contact</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                     <div className="flex items-center"><Phone size={14} className="mr-3 text-indigo-600" /> {user.phone}</div>
                     <div className="flex items-center"><Mail size={14} className="mr-3 text-indigo-600" /> <span className="text-xs break-all">{user.email}</span></div>
                     <div className="flex items-center"><MapPin size={14} className="mr-3 text-indigo-600" /> {user.country}</div>
                  </div>
               </div>

               {/* Education */}
               <div className="mb-8">
                  <h3 className="text-sm font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Education</h3>
                  <div className="mb-4">
                     <h4 className="font-bold text-gray-900">{user.institution}</h4>
                     <p className="text-indigo-600 text-sm font-medium">{user.education}</p>
                     <p className="text-gray-500 text-xs mt-1">Academic Focus</p>
                  </div>
               </div>

               {/* Skills */}
               <div>
                  <h3 className="text-sm font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                     {user.skills.map((skill, i) => (
                        <span key={i} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded shadow-sm">{skill}</span>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Content (Right) */}
            <div className="w-2/3 p-8 space-y-8">
               
               {/* Profile */}
               <div>
                  <h3 className="text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-4 flex items-center">
                     <span className="w-8 h-1 bg-indigo-500 mr-3"></span> Profile
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed text-justify">
                     Motivated student from {user.country} with a strong academic record at {user.institution}. 
                     {user.studyPreference} looking for opportunities to grow and learn. 
                     Eager to apply learned skills in a practical environment.
                  </p>
               </div>

               {/* Experience */}
               {user.experience && user.experience.length > 0 && (
                  <div>
                      <h3 className="text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-8 h-1 bg-indigo-500 mr-3"></span> Experience
                      </h3>
                      <div className="space-y-6">
                        {user.experience.map(exp => (
                           <div key={exp.id}>
                              <div className="flex justify-between items-baseline mb-1">
                                 <h4 className="font-bold text-gray-900 text-base">{exp.role}</h4>
                                 <span className="text-xs font-bold text-gray-400 uppercase">{exp.duration}</span>
                              </div>
                              <p className="text-indigo-600 text-sm font-medium mb-2">{exp.company}</p>
                              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                           </div>
                        ))}
                      </div>
                  </div>
               )}

               {/* Projects */}
               {user.projects && user.projects.length > 0 && (
                  <div>
                      <h3 className="text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-8 h-1 bg-indigo-500 mr-3"></span> Projects
                      </h3>
                      <div className="space-y-6">
                        {user.projects.map(proj => (
                           <div key={proj.id}>
                              <h4 className="font-bold text-gray-900 text-base mb-1">{proj.title}</h4>
                              {proj.role && <p className="text-xs text-gray-400 font-bold uppercase mb-1">{proj.role}</p>}
                              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                           </div>
                        ))}
                      </div>
                  </div>
               )}

            </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2c3e50] p-4 text-center mt-auto">
           <p className="text-[10px] text-gray-400 tracking-wider">GENERATED BY STUDENTPOCKET APP</p>
        </div>

      </div>
    </div>
  );
};