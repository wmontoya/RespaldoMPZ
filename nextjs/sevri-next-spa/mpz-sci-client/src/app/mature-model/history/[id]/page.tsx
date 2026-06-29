'use client'
import { useEffect } from "react";

import { useEvaluationState } from "@/store/matureModel/evaluationStore";
import Survey from "@/components/mature-model/history/MatureModelEvaluation";
import Loader from "@/components/globals/loader/Loader";

const MatureModelHistory = ({ params }: { params: { id: number } }) => {
    const { getActualHistoryEvaluation, actualHistoryEvaluation } = useEvaluationState();
    useEffect(() => {
        getActualHistoryEvaluation(params.id);
        // getActivity(params.id);
    }, []);

    return (
        <div>
            {actualHistoryEvaluation.id ?
                <Survey evaluation={actualHistoryEvaluation} />
                : <Loader />}


            {/* <ActivityForm activity={actualActivity} /> */}
        </div>
    );
};

export default MatureModelHistory;
