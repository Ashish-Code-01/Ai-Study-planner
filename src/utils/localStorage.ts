import { Subject, StudyPlan } from '../types';

const SUBJECTS_KEY = 'study-planner-subjects';
const PLAN_KEY = 'study-planner-plan';

export const storage = {
  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(SUBJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSubjects: (subjects: Subject[]): void => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  },

  getPlan: (): StudyPlan => {
    const data = localStorage.getItem(PLAN_KEY);
    return data ? JSON.parse(data) : {};
  },

  savePlan: (plan: StudyPlan): void => {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  },
};
