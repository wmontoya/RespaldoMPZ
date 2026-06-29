import { useAutoevaluationState } from "@/store/autoevaluationSurveys/autoevaluationSurveysStore"
import { useSurveyState } from "@/store/autoevaluationSurveys/surveyStore"
import { useEffect } from "react"

export function useSurvey() {
    const { setIsLoading, isLoading } = useSurveyState()
    const { getActualSurvey } = useAutoevaluationState()
    const fetchSurvey = async () => {
        setIsLoading(true)
        await getActualSurvey()
        setIsLoading(false)
    }
    useEffect(() => {
        fetchSurvey()
    }, [])
    return { isLoading }
}