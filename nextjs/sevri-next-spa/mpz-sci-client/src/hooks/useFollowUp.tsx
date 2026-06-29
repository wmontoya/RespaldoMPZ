
import { useFollowUpState } from "@/store/follow_up/followUpStore"
import { useEffect } from "react"

export function useFollowUp() {
    const { getAutoEvaluationProposedActions, getMatureModelProposedActions, getSevriProposedActions } = useFollowUpState()
    const fetchFollowUp = async () => {
        await Promise.all([getAutoEvaluationProposedActions(), getMatureModelProposedActions(), getSevriProposedActions()])
    }
    useEffect(() => {
        fetchFollowUp()
    }, [])
}