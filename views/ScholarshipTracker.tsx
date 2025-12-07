import React, { useState } from 'react';
import { Scholarship, ScholarshipStatus } from '../types';
import { ExternalLink, Trash2, Calendar, Search } from 'lucide-react';

interface ScholarshipProps {
  scholarships?: Scholarship[];
  setScholarships?: (items: Scholarship[]) => void;
}

export const ScholarshipTracker: React.FC<ScholarshipProps> = ({ scholarships = [], setScholarships }) => {
  // Tracker State (Mock functionality if setScholarships not provided for standalone testing)
  const [items, setItems] = useState<Scholarship[]>(scholarships);

  const updateItems = (newItems: Scholarship[]) => {
    setItems(newItems);
    if (setScholarships) setScholarships(newItems);
  };

  const deleteItem = (id: string) => {
    updateItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
           {items.length} Tracked
        </span>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <Search className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No applications tracked yet.</p>
            <p className="text-xs text-gray-400 mt-1">Add scholarship details manually to track them.</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800 pr-8">{item.name}</h3>
              <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                item.status === ScholarshipStatus.ACCEPTED ? 'bg-green-100 text-green-700' :
                item.status === ScholarshipStatus.REJECTED ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {item.status}
              </span>
              {item.deadline !== 'TBD' && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center">
                  <Calendar size={10} className="mr-1" /> {item.deadline}
                </span>
              )}
            </div>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center hover:underline">
                Visit Website <ExternalLink size={10} className="ml-1" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
