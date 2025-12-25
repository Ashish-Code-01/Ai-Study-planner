export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'pending' | 'working' | 'completed' | 'skipped';
export type ViewMode = 'daily' | 'weekly' | 'monthly';

export interface Subject {
  id: string;
  name: string;
  priority: Priority;
  difficulty: Difficulty;
  examDate: string;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  hours: number;
  status: TaskStatus;
  priority: Priority;
  difficulty: Difficulty;
  originalDate?: string;
}

export interface StudyPlan {
  [date: string]: StudyTask[];
}
