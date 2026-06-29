
import { useEvaluationState } from "@/store/matureModel/evaluationStore"
import { useSurveyState } from "@/store/matureModel/surveyStore"
import { useEffect } from "react"

export function useMatureModel() {
    const { getActualEvaluation } = useEvaluationState()

    const { setIsLoading } = useSurveyState()
    const fetchEvaluation = async () => {
        setIsLoading(true)
        await getActualEvaluation()
        setIsLoading(false)
    }
    useEffect(() => {
        fetchEvaluation()
    }, [])
}