import { Answer, Question } from "@/types";
import { create } from "zustand";

interface SurveyStore {
    isLoading: boolean,
    setIsLoading: (value: boolean) => void,
    isFinished: boolean,
    isAutoEvaluationFinished: boolean
    setIsAutoEvaluationFinished: (value: boolean) => void,
    setIsFinished: (value: boolean) => void,
    actualQuestion: Question,
    questionAnswer: Answer | null,
    setActualQuestion: (question: Question) => void,
    setQuestionAnswer: (answer: Answer | null) => void,
    questionIds: number[],
    setQuestionIds: (ids: number[]) => void,
    getNextId: () => number,
    getPrevId: () => number,

}
export const useSurveyState = create<SurveyStore>((set, get) => ({
    actualQuestion: {} as Question,
    isFinished: false,
    isAutoEvaluationFinished: false,
    setIsAutoEvaluationFinished: (value) => set({ isAutoEvaluationFinished: value }),
    setIsFinished: (value) => set({ isFinished: value }),
    questionAnswer: null,
    isLoading: true,
    questionIds: [],
    setQuestionAnswer: (answer) => set({ questionAnswer: answer }),
    setActualQuestion: (question) => set({ actualQuestion: question }),
    setIsLoading: (value) => set({ isLoading: value }),
    setQuestionIds: (ids) => set({ questionIds: ids }),
    getNextId: () => {
        return 0
    },
    getPrevId: () => {
        return 0
    }

}))