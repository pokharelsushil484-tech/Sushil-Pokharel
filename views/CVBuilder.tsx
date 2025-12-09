
import React, { useState } from 'react';
import { UserProfile, Experience, Project, Certification, Award, Language } from '../types';
import { Mail, Phone, MapPin, Download, Loader2, Lock, Plus, Trash2, Edit2, Check, Briefcase, GraduationCap, Code, Award as AwardIcon, Globe, Heart, FileText, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [personalStatement, setPersonalStatement] = useState(user.personalStatement || user.studyPreference || '');
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [experiences, setExperiences] = useState<Experience[]>(user.experience || []);
  const [projects, setProjects] = useState<Project[]>(user.projects || []);
  const [certifications, setCertifications] = useState<Certification[]>(user.certifications || []);
  const [awards, setAwards] = useState<Award[]>(user.awards || []);
  const [languages, setLanguages] = useState<Language[]>(user.languages || []);
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [profession, setProfession] = useState(user.profession || '');

  // UI State for Accordion in Editor
  const [activeSection, setActiveSection] = useState<string | null>('statement');

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
      profession,
      personalStatement,
      skills,
      experience: experiences,
      projects,
      certifications,
      awards,
      languages,
      interests
    });
    setIsEditing(false);
  };

  // Generic List Handlers
  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now().toString(), role: 'New Role', company: 'Company', duration: 'YYYY - YYYY', description: 'Description' }]);
  };
  const addProject = () => {
    setProjects([...projects, { id: Date.now().toString(), title: 'New Project', role: 'Lead', description: 'Description' }]);
  };
  const addCertification = () => {
    setCertifications([...certifications, { id: Date.now().toString(), name: 'Certificate Name', issuer: 'Issuer', date: 'YYYY' }]);
  };
  const addAward = () => {
    setAwards([...awards, { id: Date.now().toString(), title: 'Award Title', date: 'YYYY', description: 'Achievement details' }]);
  };
  const addLanguage = () => {
    setLanguages([...languages, { id: Date.now().toString(), language: 'New Language', proficiency: 'Basic' }]);
  };
  
  // Render Helpers for Editor
  const SectionHeader = ({ id, title, icon: Icon }: any) => (
    <div 
      onClick={() => setActiveSection(activeSection === id ? null : id)}
      className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${activeSection === id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-800 hover:bg-gray-50'}`}
    >
        <div className="flex items-center font-bold text-gray-700 dark:text-gray-200">
            <Icon size={18} className="mr-3 text-indigo-500" /> {title}
        </div>
        {activeSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </div>
  );

  // --- Render Editor ---
  if (isEditing) {
    return (
      <div className="pb-20 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit CV</h1>
          <button 
            onClick={saveChanges}
            className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg hover:bg-green-700 transition-all active:scale-95"
          >
            <Check size={16} className="mr-2" /> Save Changes
          </button>
        </div>

        <div className="space-y-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
           
           {/* Profession / Title */}
           <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Professional Title</label>
                <input 
                   className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                   value={profession}
                   onChange={e => setProfession(e.target.value)}
                   placeholder="e.g. Mechanical Engineer, Computer Science Student"
                />
           </div>

           {/* Personal Statement */}
           <SectionHeader id="statement" title="Personal Statement" icon={FileText} />
           {activeSection === 'statement' && (
               <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                   <textarea 
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-32 text-sm"
                      placeholder="Write a brief professional summary..."
                      value={personalStatement}
                      onChange={e => setPersonalStatement(e.target.value)}
                   />
               </div>
           )}

           {/* Skills */}
           <SectionHeader id="skills" title="Key Skills" icon={Check} />
           {activeSection === 'skills' && (
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  <textarea 
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm mb-2"
                    placeholder="Enter skills separated by commas (e.g. Leadership, Python, Public Speaking)"
                    value={skills.join(', ')}
                    onChange={e => setSkills(e.target.value.split(',').map(s => s.trim()))}
                  />
                  <p className="text-xs text-gray-400">Separate skills with commas.</p>
              </div>
           )}

           {/* Experience */}
           <SectionHeader id="exp" title="Work Experience" icon={Briefcase} />
           {activeSection === 'exp' && (
               <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
                   {experiences.map((exp, idx) => (
                       <div key={exp.id} className="p-4 border rounded-xl relative bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700">
                           <button onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))} className="absolute top-2 right-2 text-red-400"><Trash2 size={16}/></button>
                           <div className="grid grid-cols-2 gap-2 mb-2">
                              <input className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={exp.role} onChange={e => { const n = [...experiences]; n[idx].role = e.target.value; setExperiences(n); }} placeholder="Role" />
                              <input className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={exp.company} onChange={e => { const n = [...experiences]; n[idx].company = e.target.value; setExperiences(n); }} placeholder="Company" />
                              <input className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white col-span-2" value={exp.duration} onChange={e => { const n = [...experiences]; n[idx].duration = e.target.value; setExperiences(n); }} placeholder="Duration" />
                           </div>
                           <textarea className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={exp.description} onChange={e => { const n = [...experiences]; n[idx].description = e.target.value; setExperiences(n); }} placeholder="Description" />
                       </div>
                   ))}
                   <button onClick={addExperience} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center"><Plus size={16} className="mr-1"/> Add Experience</button>
               </div>
           )}

           {/* Projects */}
           <SectionHeader id="proj" title="Projects" icon={Code} />
           {activeSection === 'proj' && (
               <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
                   {projects.map((proj, idx) => (
                       <div key={proj.id} className="p-4 border rounded-xl relative bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700">
                           <button onClick={() => setProjects(projects.filter(p => p.id !== proj.id))} className="absolute top-2 right-2 text-red-400"><Trash2 size={16}/></button>
                           <input className="w-full p-2 text-sm border rounded mb-2 dark:bg-gray-800 dark:text-white font-bold" value={proj.title} onChange={e => { const n = [...projects]; n[idx].title = e.target.value; setProjects(n); }} placeholder="Project Title" />
                           <input className="w-full p-2 text-sm border rounded mb-2 dark:bg-gray-800 dark:text-white" value={proj.role} onChange={e => { const n = [...projects]; n[idx].role = e.target.value; setProjects(n); }} placeholder="Your Role" />
                           <textarea className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={proj.description} onChange={e => { const n = [...projects]; n[idx].description = e.target.value; setProjects(n); }} placeholder="Description" />
                       </div>
                   ))}
                   <button onClick={addProject} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center"><Plus size={16} className="mr-1"/> Add Project</button>
               </div>
           )}

           {/* Certifications */}
           <SectionHeader id="cert" title="Certifications" icon={AwardIcon} />
           {activeSection === 'cert' && (
               <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
                   {certifications.map((cert, idx) => (
                       <div key={cert.id} className="p-4 border rounded-xl relative bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2">
                           <button onClick={() => setCertifications(certifications.filter(c => c.id !== cert.id))} className="absolute top-2 right-2 text-red-400"><Trash2 size={16}/></button>
                           <input className="col-span-2 p-2 text-sm border rounded dark:bg-gray-800 dark:text-white font-bold" value={cert.name} onChange={e => { const n = [...certifications]; n[idx].name = e.target.value; setCertifications(n); }} placeholder="Certificate Name" />
                           <input className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={cert.issuer} onChange={e => { const n = [...certifications]; n[idx].issuer = e.target.value; setCertifications(n); }} placeholder="Issuer" />
                           <input className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={cert.date} onChange={e => { const n = [...certifications]; n[idx].date = e.target.value; setCertifications(n); }} placeholder="Date" />
                       </div>
                   ))}
                   <button onClick={addCertification} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center"><Plus size={16} className="mr-1"/> Add Certificate</button>
               </div>
           )}

           {/* Awards */}
           <SectionHeader id="award" title="Awards & Achievements" icon={GraduationCap} />
           {activeSection === 'award' && (
               <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
                   {awards.map((award, idx) => (
                       <div key={award.id} className="p-4 border rounded-xl relative bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700">
                           <button onClick={() => setAwards(awards.filter(a => a.id !== award.id))} className="absolute top-2 right-2 text-red-400"><Trash2 size={16}/></button>
                           <div className="flex gap-2 mb-2">
                              <input className="flex-1 p-2 text-sm border rounded dark:bg-gray-800 dark:text-white font-bold" value={award.title} onChange={e => { const n = [...awards]; n[idx].title = e.target.value; setAwards(n); }} placeholder="Award Title" />
                              <input className="w-24 p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={award.date} onChange={e => { const n = [...awards]; n[idx].date = e.target.value; setAwards(n); }} placeholder="Date" />
                           </div>
                           <textarea className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={award.description} onChange={e => { const n = [...awards]; n[idx].description = e.target.value; setAwards(n); }} placeholder="Description" />
                       </div>
                   ))}
                   <button onClick={addAward} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center"><Plus size={16} className="mr-1"/> Add Award</button>
               </div>
           )}

           {/* Languages */}
           <SectionHeader id="lang" title="Languages" icon={Globe} />
           {activeSection === 'lang' && (
               <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
                   {languages.map((lang, idx) => (
                       <div key={lang.id} className="flex gap-2 items-center">
                           <input className="flex-1 p-2 text-sm border rounded dark:bg-gray-800 dark:text-white" value={lang.language} onChange={e => { const n = [...languages]; n[idx].language = e.target.value; setLanguages(n); }} placeholder="Language" />
                           <select 
                            className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white"
                            value={lang.proficiency}
                            onChange={e => { const n = [...languages]; n[idx].proficiency = e.target.value as any; setLanguages(n); }}
                           >
                               <option>Native</option>
                               <option>Fluent</option>
                               <option>Intermediate</option>
                               <option>Basic</option>
                           </select>
                           <button onClick={() => setLanguages(languages.filter(l => l.id !== lang.id))} className="text-red-400 p-2"><Trash2 size={16}/></button>
                       </div>
                   ))}
                   <button onClick={addLanguage} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center"><Plus size={16} className="mr-1"/> Add Language</button>
               </div>
           )}

           {/* Interests */}
           <SectionHeader id="interest" title="Interests" icon={Heart} />
           {activeSection === 'interest' && (
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  <textarea 
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm mb-2"
                    placeholder="Enter interests separated by commas (e.g. Reading, Football, Traveling)"
                    value={interests.join(', ')}
                    onChange={e => setInterests(e.target.value.split(',').map(s => s.trim()))}
                  />
              </div>
           )}
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
              // Sync state with user data before editing
              setProfession(user.profession || '');
              setPersonalStatement(user.personalStatement || user.studyPreference || '');
              setSkills(user.skills || []);
              setExperiences(user.experience || []);
              setProjects(user.projects || []);
              setCertifications(user.certifications || []);
              setAwards(user.awards || []);
              setLanguages(user.languages || []);
              setInterests(user.interests || []);
              setIsEditing(true);
            }}
            className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
             <Edit2 size={16} className="mr-2" /> Edit CV
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
            <div className="flex-1">
               <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{user.name}</h1>
               <p className="text-gray-300 text-lg font-medium tracking-wide mb-2 uppercase">{user.profession || user.education}</p>
               {user.personalStatement && (
                   <p className="text-sm text-gray-400 leading-tight max-w-md italic opacity-90">{user.personalStatement}</p>
               )}
            </div>
            {user.avatar && (
              <img src={user.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg ml-6" alt="Profile" />
            )}
        </div>

        <div className="flex flex-1">
            {/* Sidebar (Left) */}
            <div className="w-1/3 bg-[#f8f9fa] p-8 border-r border-gray-200 flex flex-col gap-8">
               
               {/* Contact */}
               <div>
                  <h3 className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Contact</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                     <div className="flex items-center"><Phone size={14} className="mr-3 text-indigo-600 flex-shrink-0" /> {user.phone}</div>
                     <div className="flex items-center"><Mail size={14} className="mr-3 text-indigo-600 flex-shrink-0" /> <span className="text-xs break-all">{user.email}</span></div>
                     <div className="flex items-center"><MapPin size={14} className="mr-3 text-indigo-600 flex-shrink-0" /> {user.country}</div>
                  </div>
               </div>

               {/* Education */}
               <div>
                  <h3 className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Education</h3>
                  <div>
                     <h4 className="font-bold text-gray-900 text-sm">{user.institution}</h4>
                     <p className="text-indigo-600 text-xs font-medium">{user.education}</p>
                  </div>
               </div>

               {/* Skills */}
               {user.skills && user.skills.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, i) => (
                            <span key={i} className="bg-white border border-gray-200 text-gray-700 text-[10px] px-2 py-1 rounded shadow-sm font-semibold">{skill}</span>
                        ))}
                    </div>
                </div>
               )}

               {/* Languages */}
               {user.languages && user.languages.length > 0 && (
                   <div>
                       <h3 className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Language</h3>
                       <ul className="space-y-2">
                           {user.languages.map(lang => (
                               <li key={lang.id} className="text-sm flex justify-between">
                                   <span className="text-gray-700 font-medium">{lang.language}</span>
                                   <span className="text-gray-500 text-xs">{lang.proficiency}</span>
                               </li>
                           ))}
                       </ul>
                   </div>
               )}

               {/* Interests */}
               {user.interests && user.interests.length > 0 && (
                   <div>
                       <h3 className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-indigo-500 pb-1 w-10">Interests</h3>
                       <div className="text-sm text-gray-600 leading-relaxed">
                           {user.interests.join(' • ')}
                       </div>
                   </div>
               )}
            </div>

            {/* Main Content (Right) */}
            <div className="w-2/3 p-8 space-y-8">
               
               {/* Experience */}
               {user.experience && user.experience.length > 0 && (
                  <div>
                      <h3 className="text-base font-bold text-[#2c3e50] uppercase tracking-widest mb-5 flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 mr-3 rounded-full"></span> Work Experience
                      </h3>
                      <div className="space-y-6 border-l-2 border-gray-100 pl-4 ml-1">
                        {user.experience.map(exp => (
                           <div key={exp.id} className="relative">
                              <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full"></div>
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
                      <h3 className="text-base font-bold text-[#2c3e50] uppercase tracking-widest mb-5 flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 mr-3 rounded-full"></span> Key Projects
                      </h3>
                      <div className="space-y-5">
                        {user.projects.map(proj => (
                           <div key={proj.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-900 text-sm">{proj.title}</h4>
                                {proj.role && <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 font-bold uppercase">{proj.role}</span>}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                           </div>
                        ))}
                      </div>
                  </div>
               )}

               {/* Certifications */}
               {user.certifications && user.certifications.length > 0 && (
                   <div>
                       <h3 className="text-base font-bold text-[#2c3e50] uppercase tracking-widest mb-5 flex items-center">
                         <span className="w-2 h-2 bg-indigo-500 mr-3 rounded-full"></span> Certifications
                       </h3>
                       <div className="grid grid-cols-1 gap-3">
                           {user.certifications.map(cert => (
                               <div key={cert.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                                   <div>
                                       <p className="font-bold text-gray-800">{cert.name}</p>
                                       <p className="text-xs text-gray-500">{cert.issuer}</p>
                                   </div>
                                   <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{cert.date}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {/* Awards */}
               {user.awards && user.awards.length > 0 && (
                   <div>
                       <h3 className="text-base font-bold text-[#2c3e50] uppercase tracking-widest mb-5 flex items-center">
                         <span className="w-2 h-2 bg-indigo-500 mr-3 rounded-full"></span> Honors & Awards
                       </h3>
                       <div className="space-y-4">
                           {user.awards.map(award => (
                               <div key={award.id}>
                                   <div className="flex justify-between items-baseline mb-1">
                                       <h4 className="font-bold text-gray-900 text-sm">{award.title}</h4>
                                       <span className="text-xs text-gray-400 font-bold">{award.date}</span>
                                   </div>
                                   <p className="text-xs text-gray-600">{award.description}</p>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

            </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2c3e50] p-4 text-center mt-auto">
           <p className="text-[10px] text-gray-400 tracking-wider">Created by Sushil Pokharel • Generated via StudentPocket</p>
        </div>

      </div>
    </div>
  );
};
