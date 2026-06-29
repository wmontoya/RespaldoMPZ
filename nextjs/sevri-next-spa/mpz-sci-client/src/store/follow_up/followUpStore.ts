import { fetchData } from "@/utils/fetchData";
import { ProposedAction as MatureModelProposedActions } from "@/types";
import { ProposedAction as AutoEvaluationProposedAction } from "@/types/autoevaluationSurvey";
import { ResponseAPI, ProposedAction as SevriProposedActions } from "@/types/sevri";
import { create } from 'zustand'
import { useGlobalState } from "../globalState";
export type ModelFilters = {
    autoEvaluation: boolean
    matureModel: boolean
    sevri: boolean
}
type StatusFilters = {
    complete: boolean
    incomplete: boolean
    partial: boolean
}
interface FollowUpStore {
    savedStatusFilters: StatusFilters
    setSavedStatusFilters: (filters: StatusFilters) => void
    savedModelFilters: ModelFilters
    setSavedModelFilters: (filters: ModelFilters) => void
    resetFilters: () => void
    sevriProposedActions: SevriProposedActions[]
    matureModelProposedActions: MatureModelProposedActions[]
    autoEvaluationProposedActions: AutoEvaluationProposedAction[]
    getSevriProposedActions: () => Promise<SevriProposedActions[] | null>
    getMatureModelProposedActions: () => Promise<MatureModelProposedActions[] | null>
    getAutoEvaluationProposedActions: () => Promise<AutoEvaluationProposedAction[] | null>
    updateSevriProposedAction: (data: SevriProposedActions) => Promise<SevriProposedActions | null>
    updateAutoEvaluationProposedAction: (data: AutoEvaluationProposedAction) => Promise<AutoEvaluationProposedAction | null>
    updateMatureModelProposedAction: (data: MatureModelProposedActions) => Promise<MatureModelProposedActions | null>
}
const DEFAULT_MODEL_FILTERS: ModelFilters = {
    autoEvaluation: true,
    matureModel: true,
    sevri: true,
}
const DEFAULT_STATUS_FILTERS: StatusFilters = {
    complete: false,
    incomplete: true,
    partial: true,
}

export const useFollowUpState = create<FollowUpStore>((set, get) => ({
    sevriProposedActions: [],
    matureModelProposedActions: [],
    autoEvaluationProposedActions: [],
    savedStatusFilters: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("savedStatusFilters") || JSON.stringify(DEFAULT_STATUS_FILTERS)) : DEFAULT_STATUS_FILTERS,
    savedModelFilters: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("savedModelFilters") || JSON.stringify(DEFAULT_MODEL_FILTERS)) : DEFAULT_MODEL_FILTERS,
    setSavedStatusFilters: (filters: StatusFilters) => {
        set({ savedStatusFilters: filters })
        localStorage.setItem("savedStatusFilters", JSON.stringify(filters))
    },
    setSavedModelFilters: (filters: ModelFilters) => {
        set({ savedModelFilters: filters })
        localStorage.setItem("savedModelFilters", JSON.stringify(filters))
    },
    resetFilters: () => {
        set({ savedStatusFilters: DEFAULT_STATUS_FILTERS, savedModelFilters: DEFAULT_MODEL_FILTERS })
        localStorage.setItem("savedStatusFilters", JSON.stringify(DEFAULT_STATUS_FILTERS))
        localStorage.setItem("savedModelFilters", JSON.stringify(DEFAULT_MODEL_FILTERS))
    },
    updateMatureModelProposedAction: async (data: MatureModelProposedActions) => {
        const response = await fetchData<ResponseAPI<MatureModelProposedActions>>( `/api/v1/evaluations/proposedActions/${data.id}`, "PUT", {
            method: 'PUT',
            body: JSON.stringify(data)
        })
        if (response.status !== 200) return null
        const updatedProposedAction = response.data
        const matureModelProposedActions = get().matureModelProposedActions.map(proposedAction => proposedAction.id === updatedProposedAction.id ? updatedProposedAction : proposedAction)
        set({ matureModelProposedActions })
        return updatedProposedAction
    },
    updateAutoEvaluationProposedAction: async (data: AutoEvaluationProposedAction) => {
        const response = await fetchData<ResponseAPI<AutoEvaluationProposedAction>>( `/api/v1/autoevaluation/proposedActions/${data.id}`, "PUT", {
            method: 'PUT',
            body: JSON.stringify(data)
        })
        if (response.status !== 200) return null
        const updatedProposedAction = response.data
        const autoEvaluationProposedActions = get().autoEvaluationProposedActions.map(proposedAction => proposedAction.id === updatedProposedAction.id ? updatedProposedAction : proposedAction)
        set({ autoEvaluationProposedActions })
        return updatedProposedAction
    },
    updateSevriProposedAction: async (data: SevriProposedActions) => {
        const response = await fetchData<ResponseAPI<SevriProposedActions>>( `/api/v1/sevri/proposedActions/${data.id}`, "PUT", {
            method: 'PUT',
            body: JSON.stringify(data)
        })
       
        if (response.status !== 200) return null
        const updatedProposedAction = response.data
        const sevriProposedActions = get().sevriProposedActions.map(proposedAction => proposedAction.id === updatedProposedAction.id ? updatedProposedAction : proposedAction)
        set({ sevriProposedActions })
        return updatedProposedAction
    },
    getSevriProposedActions: async () => {
        const response = await fetchData<ResponseAPI<SevriProposedActions[]>>( `/api/v1/sevri/proposedActions?department_id=${useGlobalState.getState().department_id}`)
        if (response.status !== 200) return null
        set({ sevriProposedActions: response.data })
        return response.data
    },
    getMatureModelProposedActions: async () => {
        const response = await fetchData<ResponseAPI<MatureModelProposedActions[]>>( `/api/v1/evaluations/proposedActions?department_id=${useGlobalState.getState().department_id}`)
        if (response.status !== 200) return null
        set({ matureModelProposedActions: response.data })
        return response.data
    },
    getAutoEvaluationProposedActions: async () => {
        const response = await fetchData<ResponseAPI<AutoEvaluationProposedAction[]>>( `/api/v1/autoevaluation/proposedActions?department_id=${useGlobalState.getState().department_id}`)
        if (response.status !== 200) return null
        set({ autoEvaluationProposedActions: response.data })
        return response.data
    },
}))