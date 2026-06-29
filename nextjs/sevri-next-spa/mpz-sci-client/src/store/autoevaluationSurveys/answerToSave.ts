import create from 'zustand';
import { Answer } from '@/types/autoevaluationSurvey';

type SurveyStore = {
    answer: Answer | null;
    setAnswer: (answer: Answer) => void;
    resetAnswer: () => void;
};

export const useSurveyStore = create<SurveyStore>((set) => ({
    answer: null,
    setAnswer: (answer: Answer) => set({ answer }),
    resetAnswer: () => set({ answer: null }),
}));



interface QuestionStore {
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
}

export const useQuestionStore = create<QuestionStore>((set) => ({
  currentQuestionIndex: 0,
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index })
}))
