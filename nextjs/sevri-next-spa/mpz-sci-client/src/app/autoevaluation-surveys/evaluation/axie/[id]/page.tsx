'use client'
import Survey from "@/components/autoevaluation-survey/survey/Survey";
import Loader from "@/components/globals/loader/Loader";
import { useAutoevaluationState } from "@/store/autoevaluationSurveys/autoevaluationSurveysStore";
import { useSurveyState } from "@/store/autoevaluationSurveys/surveyStore";
import { useEffect, useState } from "react";
const SurveyPage = ({ params }: { params: { id: number } }) => {
    const { getAxie, actualAxie } = useAutoevaluationState()
    const { isLoading } = useSurveyState()
    useEffect(() => {
        getAxie(params.id)
    }, [])
    if (isLoading) return (
        <>
            <h1 className="text-3xl text-center font-extrabold text-primary-600 w-full h-full mt-52">Cargando...</h1>
            <Loader />
        </>
    )
    return (
        <section className="w-full">
            {!isLoading && actualAxie.id && <Survey axie={actualAxie} />}
        </section>
    );
};
export default SurveyPage;