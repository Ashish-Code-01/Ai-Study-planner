import { Subject, StudyTask, Priority, Difficulty, StudyPlan } from '../types';

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1,
};

const difficultyHours = {
  hard: 3,
  medium: 2,
  easy: 1,
};

export function generateStudyPlan(subjects: Subject[]): StudyPlan {
  const plan: StudyPlan = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  subjects.forEach((subject) => {
    const examDate = new Date(subject.examDate);
    examDate.setHours(0, 0, 0, 0);

    const daysUntilExam = Math.max(
      1,
      Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    const totalHours = difficultyHours[subject.difficulty] * priorityWeight[subject.priority] * 10;
    const hoursPerDay = Math.max(0.5, totalHours / daysUntilExam);

    let remainingHours = totalHours;
    let currentDate = new Date(today);

    while (remainingHours > 0 && currentDate <= examDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const sessionHours = Math.min(hoursPerDay, remainingHours);

      const task: StudyTask = {
        id: `${subject.id}-${dateStr}`,
        subjectId: subject.id,
        subjectName: subject.name,
        date: dateStr,
        hours: Math.round(sessionHours * 10) / 10,
        status: 'pending',
        priority: subject.priority,
        difficulty: subject.difficulty,
      };

      if (!plan[dateStr]) {
        plan[dateStr] = [];
      }
      plan[dateStr].push(task);

      remainingHours -= sessionHours;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return plan;
}

export function rescheduleSkippedTasks(
  plan: StudyPlan,
  subjects: Subject[]
): StudyPlan {
  const newPlan = { ...plan };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  Object.keys(newPlan).forEach((dateStr) => {
    const taskDate = new Date(dateStr);
    const skippedTasks = newPlan[dateStr].filter(
      (task) => task.status === 'skipped' && taskDate < today
    );

    skippedTasks.forEach((skippedTask) => {
      const subject = subjects.find((s) => s.id === skippedTask.subjectId);
      if (!subject) return;

      const examDate = new Date(subject.examDate);
      examDate.setHours(0, 0, 0, 0);

      let nextDate = new Date(today);
      let rescheduled = false;

      while (nextDate <= examDate && !rescheduled) {
        const nextDateStr = nextDate.toISOString().split('T')[0];

        if (!newPlan[nextDateStr]) {
          newPlan[nextDateStr] = [];
        }

        const dayTotalHours = newPlan[nextDateStr].reduce(
          (sum, t) => sum + t.hours,
          0
        );

        if (dayTotalHours < 8) {
          const newTask: StudyTask = {
            ...skippedTask,
            id: `${skippedTask.subjectId}-${nextDateStr}-rescheduled`,
            date: nextDateStr,
            status: 'pending',
            originalDate: dateStr,
          };
          newPlan[nextDateStr].push(newTask);
          rescheduled = true;
        }

        nextDate.setDate(nextDate.getDate() + 1);
      }
    });
  });

  return newPlan;
}

export function getDateRangeForView(
  viewMode: 'daily' | 'weekly' | 'monthly',
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  switch (viewMode) {
    case 'daily':
      break;
    case 'weekly':
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
      break;
    case 'monthly':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      break;
  }

  return { start, end };
}
