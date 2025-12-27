import { useState, useEffect } from 'react';
import { Brain, TrendingUp } from 'lucide-react';
import { Subject, StudyPlan, TaskStatus, ViewMode, Priority, Difficulty } from './types';
import { generateStudyPlan, rescheduleSkippedTasks } from './utils/planGenerator';
import { storage } from './utils/localStorage';
import { SubjectForm } from './components/SubjectForm';
import { SubjectList } from './components/SubjectList';
import { PlanView } from './components/PlanView';

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [plan, setPlan] = useState<StudyPlan>({});
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  useEffect(() => {
    const savedSubjects = storage.getSubjects();
    const savedPlan = storage.getPlan();
    setSubjects(savedSubjects);
    setPlan(savedPlan);
  }, []);

  const handleAddSubject = (subjectData: {
    name: string;
    priority: Priority;
    difficulty: Difficulty;
    examDate: string;
    dailyHours: number;
  }) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      ...subjectData,
      createdAt: new Date().toISOString(),
    };

    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    storage.saveSubjects(updatedSubjects);

    const newPlan = generateStudyPlan(updatedSubjects);
    setPlan(newPlan);
    storage.savePlan(newPlan);
  };

  const handleDeleteSubject = (id: string) => {
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    setSubjects(updatedSubjects);
    storage.saveSubjects(updatedSubjects);

    const newPlan = generateStudyPlan(updatedSubjects);
    setPlan(newPlan);
    storage.savePlan(newPlan);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const updatedPlan = { ...plan };
    let taskFound = false;

    Object.keys(updatedPlan).forEach((dateStr) => {
      updatedPlan[dateStr] = updatedPlan[dateStr].map((task) => {
        if (task.id === taskId) {
          taskFound = true;
          return { ...task, status };
        }
        return task;
      });
    });

    if (taskFound && status === 'skipped') {
      const rescheduledPlan = rescheduleSkippedTasks(updatedPlan, subjects);
      setPlan(rescheduledPlan);
      storage.savePlan(rescheduledPlan);
    } else {
      setPlan(updatedPlan);
      storage.savePlan(updatedPlan);
    }
  };

  const getStats = () => {
    const allTasks = Object.values(plan).flat();
    const completed = allTasks.filter((t) => t.status === 'completed').length;
    const working = allTasks.filter((t) => t.status === 'working').length;
    const pending = allTasks.filter((t) => t.status === 'pending').length;
    const totalHours = allTasks.reduce((sum, t) => sum + t.hours, 0);
    const completedHours = allTasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.hours, 0);

    return { completed, working, pending, totalHours, completedHours };
  };

  const stats = getStats();
  const progress = stats.totalHours > 0 ? (stats.completedHours / stats.totalHours) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AI Study Planner
              </h1>
              <p className="text-gray-600 mt-1">Smart scheduling for exam success</p>
            </div>
          </div>

          {subjects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Your Progress</h3>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                  <span className="text-sm font-bold text-blue-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{stats.working}</div>
                  <div className="text-sm text-blue-600">Working</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                  <div className="text-2xl font-bold text-violet-700">{stats.completedHours.toFixed(1)}h</div>
                  <div className="text-sm text-violet-600">Hours Done</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 space-y-6">
            <SubjectForm onAddSubject={handleAddSubject} />
            <SubjectList subjects={subjects} onDeleteSubject={handleDeleteSubject} />
          </div>

          <div className="lg:col-span-2">
            <PlanView
              plan={plan}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
