
import React, { useState } from 'react';
import { Database, FieldType, DbField } from '../types';
import { Plus, Database as DbIcon, Trash2, Table, Wand2, X, Save, ChevronRight, Search, LayoutList, DatabaseBackup, Filter, Download, MoreHorizontal } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CREATOR_NAME } from '../constants';

interface DatabaseManagerProps {
  databases: Database[];
  setDatabases: (db: Database[]) => void;
  isVerified: boolean;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ databases, setDatabases, isVerified }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDb, setSelectedDb] = useState<Database | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDb, setNewDb] = useState<Partial<Database>>({
    name: '',
    description: '',
    schema: []
  });

  const addField = () => {
    const field: DbField = { name: '', type: FieldType.STRING, required: true };
    setNewDb({ ...newDb, schema: [...(newDb.schema || []), field] });
  };

  const updateField = (index: number, updates: Partial<DbField>) => {
    const schema = [...(newDb.schema || [])];
    schema[index] = { ...schema[index], ...updates };
    setNewDb({ ...newDb, schema });
  };

  const removeField = (index: number) => {
    const schema = (newDb.schema || []).filter((_, i) => i !== index);
    setNewDb({ ...newDb, schema });
  };

  const generateSchema = async () => {
    if (!newDb.description) {
        alert("Enter system objective for AI analysis.");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `As a database architect, generate an optimal SQL database schema in JSON for: ${newDb.description}.
            Return an array of objects: {"name": string, "type": "String"|"Number"|"Boolean"|"Date", "required": boolean}.
            ONLY return the JSON array.`,
            config: { responseMimeType: "application/json" }
        });
        const generatedSchema = JSON.parse(response.text);
        setNewDb({ ...newDb, schema: generatedSchema });
    } catch (e) {
        alert("AI Engine failed to generate schema. Please specify manual fields.");
    } finally {
        setIsGenerating(false);
    }
  };

  const saveDatabase = () => {
    if (!newDb.name || !newDb.schema?.length) return;
    const db: Database = {
      id: Date.now().toString(),
      name: newDb.name,
      description: newDb.description || '',
      schema: newDb.schema as DbField[],
      records: [],
      createdAt: Date.now()
    };
    setDatabases([...databases, db]);
    setShowCreate(false);
    setNewDb({ name: '', description: '', schema: [] });
  };

  return (
    <div className="pb-24 animate-fade-in w-full max-w-7xl mx-auto">
      {/* Standardized Toolbar Alignment */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-10 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
            <DatabaseBackup className="mr-4 text-indigo-600" size={32} /> Database Architect
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">System Console • {CREATOR_NAME}</p>
        </div>
        <div className="flex space-x-3">
            <button className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><Filter size={20} /></button>
            <button className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><Search size={20} /></button>
            <button 
                onClick={() => setShowCreate(true)}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
            >
                <Plus size={18} className="mr-2" /> New Instance
            </button>
        </div>
      </div>

      {!selectedDb ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {databases.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white dark:bg-[#0f172a] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                <DbIcon size={64} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Nodes Discovered</p>
                <button onClick={() => setShowCreate(true)} className="mt-6 text-indigo-600 text-xs font-black uppercase tracking-widest border-b border-indigo-600 pb-1">Initialize Architecture</button>
            </div>
          )}
          {databases.map(db => (
            <div 
              key={db.id}
              onClick={() => setSelectedDb(db)}
              className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 cursor-pointer group shadow-sm hover:shadow-xl transition-all hover:-translate-y-2"
            >
              <div className="flex justify-between mb-8">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                    <Table size={28} />
                  </div>
                  <button className="text-slate-200 group-hover:text-slate-400 transition-colors"><MoreHorizontal size={24} /></button>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{db.name}</h3>
              <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-8 leading-relaxed">{db.description}</p>
              
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-6">
                <span>{db.records.length} Records</span>
                <span className="text-indigo-600 flex items-center">Open Node <ChevronRight size={14} className="ml-1" /></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <button onClick={() => setSelectedDb(null)} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 transition-all">
                        <X size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedDb.name}</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">Architecture Node active</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center transition-colors hover:bg-slate-50">
                        <Download size={16} className="mr-2" /> Export
                    </button>
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg shadow-indigo-100 dark:shadow-none transition-transform active:scale-95">
                        <Plus size={16} className="mr-2" /> Add Record
                    </button>
                </div>
            </div>

            <div className="p-10 overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                            {selectedDb.schema.map(field => (
                                <th key={field.name} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                                    {field.name}
                                </th>
                            ))}
                            <th className="p-6 border-b border-slate-100 dark:border-slate-800"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {selectedDb.records.length === 0 ? (
                            <tr>
                                <td colSpan={selectedDb.schema.length + 1} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    Grid architecture initialized. No data segments committed.
                                </td>
                            </tr>
                        ) : (
                            selectedDb.records.map((record, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    {selectedDb.schema.map(field => (
                                        <td key={field.name} className="p-6 text-sm font-black text-slate-700 dark:text-slate-300">
                                            {record[field.name]?.toString() || '-'}
                                        </td>
                                    ))}
                                    <td className="p-6 text-right">
                                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Synchronized Creation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-fade-in">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh] border border-white/20 dark:border-slate-800">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Provision System Node</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">Identity: System Architect</p>
                    </div>
                    <button onClick={() => setShowCreate(false)} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all border border-slate-100 dark:border-slate-800"><X size={24} /></button>
                </div>

                <div className="p-12 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 no-scrollbar">
                    <div className="space-y-10">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4">Node Identity</label>
                            <input 
                                type="text" 
                                className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] outline-none text-lg font-black tracking-tight dark:text-white transition-all"
                                placeholder="e.g. MasterSync_V1"
                                value={newDb.name}
                                onChange={e => setNewDb({...newDb, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4">Logic Objective</label>
                            <textarea 
                                rows={4}
                                className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] outline-none text-sm font-bold resize-none dark:text-white transition-all"
                                placeholder="Describe the database's purpose for AI schema analysis..."
                                value={newDb.description}
                                onChange={e => setNewDb({...newDb, description: e.target.value})}
                            />
                            <button 
                                onClick={generateSchema}
                                disabled={isGenerating}
                                className="mt-4 w-full border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-50 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                <Wand2 size={16} className={`mr-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? 'Analyzing Logic...' : 'AI Logic Hypothesize'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Grid Segments</label>
                            <button onClick={addField} className="text-indigo-600 font-black text-[10px] tracking-widest">+ MANUAL FIELD</button>
                         </div>
                         <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                            {newDb.schema?.length === 0 ? (
                                <div className="text-center py-20 opacity-20">
                                    <LayoutList size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No segments defined</p>
                                </div>
                            ) : (
                                newDb.schema?.map((field, i) => (
                                    <div key={i} className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-scale-up">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-transparent outline-none text-xs font-black dark:text-white uppercase tracking-wider"
                                            placeholder="FIELD_NAME"
                                            value={field.name}
                                            onChange={e => updateField(i, { name: e.target.value })}
                                        />
                                        <select 
                                            className="bg-white dark:bg-slate-800 text-[9px] font-black p-2 rounded-xl outline-none border border-slate-100 dark:border-slate-700 uppercase"
                                            value={field.type}
                                            onChange={e => updateField(i, { type: e.target.value as FieldType })}
                                        >
                                            {Object.values(FieldType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <button onClick={() => removeField(i)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))
                            )}
                         </div>
                    </div>
                </div>

                <div className="p-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={saveDatabase}
                        disabled={!newDb.name || !newDb.schema?.length}
                        className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                    >
                        Deploy to System Node
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
