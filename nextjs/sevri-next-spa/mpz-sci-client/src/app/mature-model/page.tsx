'use client'
import React from "react";
import { FormNavigator, Survey } from "@/components";
import { useEvaluationState } from "@/store/matureModel/evaluationStore";
import { useSurveyState } from "@/store/matureModel/surveyStore";
import Loader from "@/components/globals/loader/Loader";
import Card from "@/components/globals/card/Card";
import { BsCheck2Circle } from "react-icons/bs";
import { AiTwotoneFund } from "react-icons/ai";
import { useGlobalState } from "@/store/globalState";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { useShared } from "@/hooks/useShared";
import { useMatureModel } from "@/hooks/useMatureModel";


export default function MatureModel() {
  useShared()
  useMatureModel()
  const { actualEvaluation } = useEvaluationState()
  const { department_id } = useGlobalState()
  const { isLoading, isFinished } = useSurveyState()

  if (actualEvaluation.departments && !actualEvaluation.departments.find((department) => department.id == department_id)) return (
    <div className="block justify-center h-full mt-52">
      <Card icon={<AiTwotoneFund size={30} color="green" />} title="No hay evaluaciones pendientes" description="Por ahora la empresa no está en proceso de evaluación, gracias por todo" />
      <div className="flex justify-center mt-2">
        <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
      </div>
    </div>
  )
  if (isFinished) return (
    <div className="block justify-center h-full mt-52">
      <Card icon={<BsCheck2Circle size={30} color="green" />} title="Evaluación completada" description="Ya completaste esta evaluación" />
      <div className="flex justify-center mt-2">
        <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
      </div>
    </div>
  )
  if (isLoading) return (
    <>
      <h1 className="text-3xl text-center font-extrabold text-primary-600 w-full h-full mt-52">Cargando...</h1>
      <Loader />
    </>
  )
  if (!isLoading && !actualEvaluation.id) {
    return <div className="block justify-center h-full mt-52">
      <Card icon={<AiTwotoneFund size={30} color="green" />} title="No hay evaluaciones pendientes" description="Por ahora la empresa no está en proceso de evaluación, gracias por todo" />
      <div className="flex justify-center mt-2">
        <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
      </div>
    </div>
  }

  return (
    <main>
      <div className="flex justify-start mt-4 w-[95%] mx-auto">
        <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
      </div>
      <div className="flex gap-5 m-5">
        <>
          <aside className="hidden sm:block sticky self-start top-5 ">
            <FormNavigator />
          </aside>
          <section className="w-full">
            <Survey />
          </section>
        </>
      </div>
    </main>
  );
}
