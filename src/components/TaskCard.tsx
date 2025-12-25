import { Clock, AlertCircle, CheckCircle2, PlayCircle, SkipForward } from 'lucide-react';
import { StudyTask, TaskStatus } from '../types';

interface TaskCardProps {
  task: StudyTask;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const priorityColors = {
  high: 'from-red-500 to-red-600',
  medium: 'from-orange-500 to-orange-600',
  low: 'from-green-500 to-green-600',
};

const statusIcons = {
  pending: Clock,
  working: PlayCircle,
  completed: CheckCircle2,
  skipped: SkipForward,
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  working: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  skipped: 'bg-orange-100 text-orange-700 border-orange-200',
};

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const StatusIcon = statusIcons[task.status];
  const statuses: TaskStatus[] = ['pending', 'working', 'completed', 'skipped'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${priorityColors[task.priority]}`}
            />
            <h4 className="font-semibold text-gray-800">{task.subjectName}</h4>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{task.hours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span className="capitalize">{task.difficulty}</span>
            </div>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border ${statusColors[task.status]} flex items-center gap-1.5 text-sm font-medium`}>
          <StatusIcon className="w-4 h-4" />
          <span className="capitalize">{task.status}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(task.id, status)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
              task.status === status
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {task.originalDate && (
        <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
          Rescheduled from {new Date(task.originalDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
