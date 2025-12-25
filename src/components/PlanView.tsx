import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { StudyPlan, TaskStatus, ViewMode } from '../types';
import { TaskCard } from './TaskCard';
import { getDateRangeForView } from '../utils/planGenerator';

interface PlanViewProps {
  plan: StudyPlan;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function PlanView({ plan, viewMode, onViewModeChange, onStatusChange }: PlanViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { start, end } = getDateRangeForView(viewMode, currentDate);

  const getDatesInRange = (): Date[] => {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    switch (viewMode) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }

    setCurrentDate(newDate);
  };

  const formatDateRange = (): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    if (viewMode === 'daily') {
      return start.toLocaleDateString('en-US', { weekday: 'long', ...options });
    } else if (viewMode === 'weekly') {
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    } else {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const dates = getDatesInRange();
  const tasksExist = dates.some((date) => {
    const dateStr = date.toISOString().split('T')[0];
    return plan[dateStr] && plan[dateStr].length > 0;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Study Plan</h2>
          </div>

          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <h3 className="text-lg font-semibold text-white">{formatDateRange()}</h3>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {!tasksExist ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks scheduled for this period</p>
            <p className="text-gray-400 text-sm mt-2">Add subjects to generate your study plan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const tasks = plan[dateStr] || [];

              if (tasks.length === 0 && viewMode === 'daily') {
                return (
                  <div key={dateStr} className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No tasks for this day</p>
                  </div>
                );
              }

              if (tasks.length === 0) return null;

              const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h4>
                      {isToday && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      Total: {totalHours.toFixed(1)}h
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={onStatusChange}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
