import React, { useState, useMemo } from 'react';
import type { Student } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';

interface AllCandidatesTableProps {
  students: Student[];
}

interface ResumeModalProps {
  content: string;
  studentName: string;
  onClose: () => void;
}

const ResumeModal: React.FC<ResumeModalProps> = ({ content, studentName, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-fadeIn">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Resume: {studentName}</h3>
          <p className="text-xs text-slate-500">Review candidate details</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-grow p-6 overflow-y-auto bg-white font-mono text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
        {content || 'No resume uploaded by this candidate yet.'}
      </div>
      <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-lg">
        <button onClick={onClose} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition">Close</button>
      </div>
    </div>
  </div>
);

export const AllCandidatesTable: React.FC<AllCandidatesTableProps> = ({ students }) => {
  const [viewingResume, setViewingResume] = useState<{ content: string; name: string } | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.skills.some(skill => skill.toLowerCase().includes(q))
    );
  }, [students, query]);

  if (students.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">All Candidates</h2>
        <p className="text-slate-500">No registered students yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">All Candidates</h2>
          <p className="text-sm text-slate-500">Every registered student, including new sign-ups, updates live from your candidate pool.</p>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or skill..."
          className="w-full sm:w-72 px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Skills</th>
              <th scope="col" className="px-6 py-3">Location</th>
              <th scope="col" className="px-6 py-3">Resume</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.student_id} className="bg-white border-b hover:bg-slate-50 transition-colors align-top">
                <th scope="row" className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{student.name}</th>
                <td className="px-6 py-4">{student.email}</td>
                <td className="px-6 py-4">
                  {student.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {student.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">{skill}</span>
                      ))}
                      {student.skills.length > 4 && (
                        <span className="px-2 py-0.5 text-xs text-slate-400 font-semibold">+{student.skills.length - 4} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills added yet</span>
                  )}
                </td>
                <td className="px-6 py-4">{student.location || 'N/A'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setViewingResume({ content: student.resumeText, name: student.name })}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 rotate-180" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingResume && (
        <ResumeModal
          content={viewingResume.content}
          studentName={viewingResume.name}
          onClose={() => setViewingResume(null)}
        />
      )}
    </div>
  );
};
