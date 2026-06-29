import { Answer, DepartmentEvaluation, Evaluation, ProposedAction } from "@/types";
import { fetchData } from "@/utils/fetchData";
import { create } from 'zustand'
import { useSurveyState } from "./surveyStore";
import { useGlobalState } from "../globalState";
interface EvaluationStore {
    actualEvaluation: Evaluation
    historyEvaluations: Evaluation[]
    actualHistoryEvaluation: Evaluation
    getActualHistoryEvaluation: (id: number) => Promise<Evaluation | null>
    getHistoryEvaluations: () => Promise<Evaluation[] | null>
    setActualEvaluation: (evaluation: Evaluation) => void
    getActualEvaluation: () => Promise<Evaluation | null>
    createAnswer: (answer: Answer) => Promise<Answer | null>
    updateAnswer: (answer: Answer, id: number) => Promise<Answer | null>
    finishEvaluation: (data: DepartmentEvaluation) => Promise<boolean>
    verifyEvaluation: (data: DepartmentEvaluation) => Promise<boolean>
    createProposedActions: (action: ProposedAction[]) => Promise<ProposedAction[] | null>
}
export const useEvaluationState = create<EvaluationStore>((set, get) => ({
    historyEvaluations: [],
    actualHistoryEvaluation: {} as Evaluation,
    getActualHistoryEvaluation: async (id) => {
        const evaluation = await fetchData<Evaluation>(`/api/v1/evaluations/byId?id=${id}`)
        if (evaluation.title) set({ actualHistoryEvaluation: evaluation })
        return evaluation
    },
    getHistoryEvaluations: async () => {
        const department_id = useGlobalState.getState().department_id
        const evaluations = await fetchData<Evaluation[]>(`/api/v1/evaluations?department_id=${department_id}`)
        if (!evaluations.length) return null
        set({ historyEvaluations: evaluations })
        return evaluations
    },
    createProposedActions: async (action) => {
        const response = await fetchData<ProposedAction[]>("/api/v1/evaluations/proposedActions", "POST", {
            method: "POST",
            body: JSON.stringify(action),
        })
        set((state) => ({
            actualEvaluation: {
                ...state.actualEvaluation,
                proposed_actions: response
            }
        }))
        return response
    },
    verifyEvaluation: async (data) => {
        const response = await fetchData<DepartmentEvaluation>(`/api/v1/evaluations/verify`, 'PUT', {
            method: "PUT",
            body: JSON.stringify(data),
        })
        const { setIsFinished } = useSurveyState.getState()
        setIsFinished(response.state === 'finished')
        if (response.state !== 'finished') return true
        return false
    },
    finishEvaluation: async (data) => {
        const response = await fetchData<DepartmentEvaluation>("/api/v1/evaluations/completed", "PUT", {
            method: "PUT",
            body: JSON.stringify(data),
        })
        if (response.state === 'finished') {
            const { setIsFinished } = useSurveyState.getState()
            setIsFinished(true)
            return true
        }
        return false
    },
    actualEvaluation: {} as Evaluation,
    setActualEvaluation: (evaluation) => set({ actualEvaluation: evaluation }),
    getActualEvaluation: async () => {
        const evaluation = await fetchData<Evaluation>("/api/v1/evaluations/actual")
        if (!evaluation.title) return null
        const { verifyEvaluation } = useEvaluationState.getState()
        const { department_id } = useGlobalState.getState()
        if (await verifyEvaluation({ evaluation_id: evaluation.id, department_id, score: 0, state: '' }))
            set({ actualEvaluation: evaluation })
        return evaluation
    },
    createAnswer: async (answer) => {
        const newAnswer = await fetchData<Answer>("/api/v1/evaluations/answers", "POST", {
            method: "POST",
            body: JSON.stringify(answer),
        })
        if (newAnswer.option_id) {
            set((state) => ({
                actualEvaluation: {
                    ...state.actualEvaluation,
                    sections: state.actualEvaluation.sections.map(section => ({
                        ...section,
                        questions: section.questions.map(question => ({
                            ...question,
                            options: question.options.map(option => {
                                if (option.id === newAnswer.option_id) {
                                    return { ...option, answers: [...option.answers, newAnswer] }
                                }
                                return option
                            })
                        }))
                    }))
                }
            }));
            return newAnswer
        }
        return null
    },
    updateAnswer: async (answer, id) => {
        const updatedAnswer = await fetchData<Answer>(`/api/v1/evaluations/answers/${id}`, "PUT", {
            method: "PUT",
            body: JSON.stringify(answer),
        })
        if (updatedAnswer.id) {
            set((state) => ({
                actualEvaluation: {
                    ...state.actualEvaluation,
                    sections: state.actualEvaluation.sections.map(section => ({
                        ...section,
                        questions: section.questions.map(question => ({
                            ...question,
                            options: question.options.map(option => ({
                                ...option,
                                answers: option.answers.filter(answer => answer.id !== updatedAnswer.id)
                                    .concat(option.id === updatedAnswer.option_id ? [updatedAnswer] : [])
                            }))
                        }))
                    }))
                }
            }));
            return updatedAnswer
        }

        return null
    }

}))