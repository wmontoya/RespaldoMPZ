'use client'
import React, { useEffect, useState } from "react";
import { useEvaluationState } from "@/store/matureModel/evaluationStore";
import { useSurveyState } from "@/store/matureModel/surveyStore";
import Loader from "@/components/globals/loader/Loader";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { useShared } from "@/hooks/useShared";

export default function MatureModel() {
  useShared();
  const { getHistoryEvaluations, historyEvaluations } = useEvaluationState();
  const { isLoading, setIsLoading } = useSurveyState();
  const [filter, setFilter] = useState("");

  const fetchEvaluation = async () => {
    setIsLoading(true);
    await getHistoryEvaluations();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const handleFilterChange = (e: any) => {
    setFilter(e.target.value);
  };

  const filteredEvaluations = historyEvaluations?.filter((evaluation) => {
    const searchTerm = filter.toLowerCase();
    const titleMatch = evaluation.title.toLowerCase().includes(searchTerm);
    const startDateMatch = new Date(evaluation.initial_date).toLocaleDateString('es-ES').includes(searchTerm);
    const endDateMatch = new Date(evaluation.final_date).toLocaleDateString('es-ES').includes(searchTerm);

    return titleMatch || startDateMatch || endDateMatch;
  });

  if (isLoading)
    return (
      <section className={`mx-auto p-10 min-h-screen from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b flex items-center justify-center text-white`}>
        <h1 className="text-3xl text-center font-extrabold text-primary-600 w-full h-full mt-52">Cargando...</h1>
        <Loader />
      </section>
    );

  if (!isLoading && !historyEvaluations.length) {
    return (
      <section className={`mx-auto p-10 min-h-screen from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b flex items-center justify-center text-white`}>
        <div className="block">
          <h2 className="text-lg font-bold">No hay datos por mostrar</h2>
          <div className="flex justify-center mt-2">
            <Link href={"/menu-Evaluations/history"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300">
              <BiArrowBack />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`mx-auto p-10 min-h-screen from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b text-white`}>
      <div className="w-full flex justify-start mb-4">
        <Link href={"/menu-Evaluations/history"} className="p-2 bg-primary-800 rounded transition-all hover:bg-primary-700 hover:rounded-none cursor-pointer">
          <BiArrowBack size={20} />
        </Link>
      </div>
      <h1 className="text-center text-2xl font-bold text-orange-500">Historial de evaluaciones del modelo de madurez</h1>

      <div className="mt-5 flex justify-left ml-7">
        <input
          type="text"
          placeholder="Buscar por título o fecha..."
          value={filter}
          onChange={handleFilterChange}
          className="px-4 py-2 w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 text-black"
        />
      </div>

      <div className="flex justify-center items-center mt-3">
        <div className="grid grid-cols-1 w-full gap-5">
          {filteredEvaluations.length > 0 ? (
            filteredEvaluations.map((evaluation, index) => (
              <Link
                key={index}
                href={`history/${evaluation.id}`}
                className={`bg-white hover:bg-slate-200 h-40 place-content-center rounded-md scale-95 hover:scale-100 ease-in-out duration-100 text-balance text-primary-800 font-semibold shadow-sm shadow-dark_primary-900 border-b-8 border-primary-400 hover:border-primary-800`}
              >
                <div className="flex flex-row justify-between items-center px-5">
                  <div className="flex flex-col">
                    <h1 className="text-2xl">{evaluation.title}</h1>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Fecha inicial:{" "}
                        <span className="font-semibold">{new Date(evaluation.initial_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha final:{" "}
                        <span className="font-semibold">{new Date(evaluation.final_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <h1 className="text-center mt-2 text-xl font-extrabold">No hay evaluaciones registradas</h1>
          )}
        </div>
      </div>
    </section>
  );
}
