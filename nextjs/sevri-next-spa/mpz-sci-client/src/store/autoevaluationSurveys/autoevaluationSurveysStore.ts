import { Answer, Axie, DepartmentSurvey, ProposedAction, Survey } from "@/types/autoevaluationSurvey";
import { fetchData } from "@/utils/fetchData";
import { create } from "zustand";
import { useSurveyState } from "../matureModel/surveyStore";
import { useGlobalState } from "../globalState";

interface AutoevaluationSurveyStore {
  actualSurvey: Survey;
  actualAxie: Axie
  historySurveys: Survey[];
  actualHistorySurvey: Survey;
  getActualHistorySurvey: (id: number) => Promise<Survey | null>;
  getHistorySurveys: () => Promise<Survey[] | null>;
  setActualAxie: (actualAxie: Axie) => void;
  setActualSurvey: (actualSurvey: Survey) => void;
  saveAnswer: (answer: Answer) => Promise<Answer | null>;
  getActualSurvey: () => Promise<Survey | null>;
  getAxie: (id: number) => Promise<Axie | null>;
  finishEvaluation: (data: any) => Promise<boolean>;
  verifyEvaluation: (data: any) => Promise<boolean>;
  createProposedActions: (action: ProposedAction[]) => Promise<ProposedAction[] | null>;
}
export const useAutoevaluationState = create<AutoevaluationSurveyStore>((set) => ({
  actualSurvey: {} as Survey,
  axie_id: 0,
  actualAxie: {} as Axie,
  historySurveys: [],
  actualHistorySurvey: {} as Survey,
  getActualHistorySurvey: async (id) => {
    const survey = await fetchData<Survey>(`/api/v1/autoevaluation/byId?id=${id}`)
    if (survey.title) set({ actualHistorySurvey: survey })
    return survey
  },
  getHistorySurveys: async () => {
    const department_id = useGlobalState.getState().department_id
    const surveys = await fetchData<Survey[]>(`/api/v1/autoevaluation?department_id=${department_id}`)
    if (!surveys.length) return null
    set({ historySurveys: surveys })
    return surveys
  },
  createProposedActions: async (action) => {
    const response = await fetchData<ProposedAction[]>('/api/v1/autoevaluation/proposedActions', 'POST', {
      method: 'POST',
      body: JSON.stringify(action)
    })
    set((state) => ({
      actualSurvey: {
        ...state.actualSurvey,
        proposed_actions: response
      }
    }))
    return response
  },
  setActualAxie: (actualAxie: Axie) => {
    set({ actualAxie });
  },
  getAxie: async (id: number) => {
    const axie = await fetchData<Axie>(`/api/v1/autoevaluation/axie/${id}`)
    if (!axie.title) return null
    set({ actualAxie: axie });
    return axie;
  },
  setActualSurvey: (actualSurvey: Survey) => {
    set({ actualSurvey });
  },
  saveAnswer: async (answer: Answer) => {
    if (answer.id) {
      const response = await fetchData<Answer>(`/api/v1/autoevaluation/answers/${answer.id}`, "PUT", {
        body: JSON.stringify(answer),
        method: "PUT",
      });

      if (response.id) {
        set((state) => ({
          actualSurvey: {
            ...state.actualSurvey,
            axies: state.actualSurvey.axies.map(axie => ({
              ...axie,
              sections: axie.sections.map(section => ({
                ...section,
                questions: section.questions.map(question => ({
                  ...question,
                  answers: question.answers.map(ans => ans.id === response.id ? response : ans)
                }))
              }))
            }))
          },
          actualAxie: {
            ...state.actualAxie,
            sections: state.actualAxie.sections.map(section => ({
              ...section,
              questions: section.questions.map(question => ({
                ...question,
                answers: question.answers.map(ans => ans.id === response.id ? response : ans)
              }))
            }))
          }
        }))
        return response
      }
      return null
    }
    const response = await fetchData<Answer>("/api/v1/autoevaluation/answers", "POST", {
      body: JSON.stringify(answer),
      method: "POST",
    });
    if (response.id) {
      set((state) => ({
        actualSurvey: {
          ...state.actualSurvey,
          axies: state.actualSurvey.axies.map(axie => ({
            ...axie,
            sections: axie.sections.map(section => ({
              ...section,
              questions: section.questions.map(question => {
                if (question.id === response.question_id) {
                  return {
                    ...question,
                    answers: [...question.answers, response]
                  }
                }
                return question
              })
            }))
          }))
        },
        actualAxie: {
          ...state.actualAxie,
          sections: state.actualAxie.sections.map(section => ({
            ...section,
            questions: section.questions.map(question => {
              if (question.id === response.question_id) {
                return {
                  ...question,
                  answers: [...question.answers, response]
                }
              }
              return question
            })
          }))
        }
      }))
    }
    return response
  },
  finishEvaluation: async (data) => {
    const response = await fetchData<DepartmentSurvey>("/api/v1/autoevaluation/completed", "PUT", {
      body: JSON.stringify(data),
      method: "PUT",
    });
    if (response.status === 'finished') {
      const { setIsAutoEvaluationFinished } = useSurveyState.getState()
      setIsAutoEvaluationFinished(true)
      return true;
    }
    return false;
  },
  verifyEvaluation: async (data) => {
    const response = await fetchData<DepartmentSurvey>("/api/v1/autoevaluation/verify", "PUT", {
      body: JSON.stringify(data),
      method: "PUT",
    });
    const { setIsAutoEvaluationFinished } = useSurveyState.getState()
    setIsAutoEvaluationFinished(response.status === 'finished')
    if (response.status !== 'finished') return true
    return false
  },
  getActualSurvey: async () => {
    const survey = await fetchData<Survey>("/api/v1/autoevaluation/actual")
    if (!survey.title) return null
    const { verifyEvaluation } = useAutoevaluationState.getState();
    const { department_id } = useGlobalState.getState();
    if (await verifyEvaluation({ survey_id: survey.id, department_id, score: 0, state: '' })) {
      set({ actualSurvey: survey });
    }
    return survey;
  },
}));