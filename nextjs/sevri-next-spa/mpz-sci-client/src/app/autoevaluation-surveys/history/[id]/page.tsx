'use client'
import { useEffect } from "react";
import Loader from "@/components/globals/loader/Loader";
import { useAutoevaluationState } from "@/store/autoevaluationSurveys/autoevaluationSurveysStore";
import AutoEvaluationHistory from "@/components/autoevaluation-survey/history/AutoEvaluationHistory";

const AutoEvaluationHistoryPage = ({ params }: { params: { id: number } }) => {
    const { actualHistorySurvey, getActualHistorySurvey } = useAutoevaluationState();
    useEffect(() => {
        getActualHistorySurvey(params.id);
    }, []);

    return (
        <div>
            {actualHistorySurvey.id ?
                <AutoEvaluationHistory evaluation={actualHistorySurvey} />
                : <Loader />}
        </div>
    );
};

export default AutoEvaluationHistoryPage;
