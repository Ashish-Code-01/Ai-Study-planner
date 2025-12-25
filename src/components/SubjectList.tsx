import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Subject } from '../types';

interface SubjectListProps {
  subjects: Subject[];
  onDeleteSubject: (id: string) => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
};

const difficultyColors = {
  hard: 'bg-purple-100 text-purple-700',
  medium: 'bg-blue-100 text-blue-700',
  easy: 'bg-teal-100 text-teal-700',
};

export function SubjectList({ subjects, onDeleteSubject }: SubjectListProps) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Subjects</h3>
      <div className="space-y-3">
        {subjects.map((subject) => {
          const daysUntilExam = Math.ceil(
            (new Date(subject.examDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={subject.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">{subject.name}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[subject.priority]}`}>
                    {subject.priority} priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[subject.difficulty]}`}>
                    {subject.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {daysUntilExam} days
                  </span>
                </div>
              </div>
              <button
                onClick={() => onDeleteSubject(subject.id)}
                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
