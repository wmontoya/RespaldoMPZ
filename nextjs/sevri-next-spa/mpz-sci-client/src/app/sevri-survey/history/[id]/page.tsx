'use client'
import { useEffect } from "react";

import Loader from "@/components/globals/loader/Loader";
import { useSevriStore } from "@/store/sevriModel/sevriStore";
import SevriEvaluationHistory from "@/components/sevri/history/SevriEvaluationHistory";

const SevriHistory = ({ params }: { params: { id: number } }) => {
    const { getActualHistorySevriProcess, actualHistorySevriProcess } = useSevriStore();
    useEffect(() => {
        getActualHistorySevriProcess(params.id);
    }, []);
    return (
        <section className={`mx-auto p-10 min-h-screen bg-[#001440] text-white`}>
            {actualHistorySevriProcess.id ?
                <SevriEvaluationHistory evaluation={actualHistorySevriProcess} />
                : <Loader />}
        </section>
    );
};

export default SevriHistory;
