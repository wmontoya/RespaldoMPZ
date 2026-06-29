"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { FaHistory, FaClipboardCheck, FaSpinner } from "react-icons/fa";

import Card from "@/components/autoevaluation-survey/card/Card";

import { useMatureModel } from "@/hooks/useMatureModel";
import { useSevri } from "@/hooks/useSevri";
import { useSurvey } from "@/hooks/useSurvey";

import { useAutoevaluationState } from "@/store/autoevaluationSurveys/autoevaluationSurveysStore";
import { useSurveyState as useMatureModelState } from "@/store/matureModel/surveyStore";
import { useSurveyState } from "@/store/autoevaluationSurveys/surveyStore";
import { useEvaluationState } from "@/store/matureModel/evaluationStore";
import { useSevriStore } from "@/store/sevriModel/sevriStore";
import { useGlobalState } from "@/store/globalState";

const Home = () => {
  useMatureModel();
  useSevri();
  useSurvey();

  const { isLoading: autoEvaluationLoading } = useSurveyState();
  const { isLoading: matureModelLoading } = useMatureModelState();
  const { actualEvaluation } = useEvaluationState();
  const { actualSevriProcess } = useSevriStore();
  const { actualSurvey } = useAutoevaluationState();
  const { loadFromLocalStorage } = useGlobalState();

  const noSurveysAvailable = !(
    actualEvaluation.id ||
    actualSevriProcess.id ||
    actualSurvey.id
  );
  const isLoading = autoEvaluationLoading || matureModelLoading;

  // useEffect(() => {
  //   loadFromLocalStorage();
  // }, []);

  return (
    <div className="bg-gradient-to-b from-[#001440] to-[#00102E] min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Selecciona una Evaluación
          </h1>
          <p className="text-blue-200 text-lg">
            Sistema de evaluación y seguimiento
          </p>
        </div>
        <div className="bg-[#001a4d]/50 rounded-xl p-6 backdrop-blur-sm shadow-xl mb-10">
          <div className="flex flex-wrap justify-center gap-4 mb-8 border-b border-blue-800/50 pb-6">
            <Link
              href="/follow_up"
              className="flex items-center px-5 py-2.5 bg-gray-700/80 text-gray-100 rounded-lg hover:bg-gray-600 transition duration-300 group"
            >
              <FaClipboardCheck className="mr-2 group-hover:scale-110 transition-transform" />
              <span>Módulo de Seguimiento</span>
            </Link>
            <Link
              href="/menu-Evaluations/history"
              className="flex items-center px-5 py-2.5 bg-blue-600/80 text-white rounded-lg hover:bg-blue-500 transition duration-300 group"
            >
              <FaHistory className="mr-2 group-hover:scale-110 transition-transform" />
              <span>Ver Historial</span>
            </Link>
          </div>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin text-4xl text-blue-300">
                <FaSpinner />
              </div>
            </div>
          )}
          {!isLoading && noSurveysAvailable && (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
                <p className="text-orange-400 text-xl font-medium">
                  No hay procesos de evaluación por el momento
                </p>
                <p className="text-orange-300/70 mt-2">
                  Las Evaluaciones disponibles aparecerán aquí cuando estén
                  listas
                </p>
              </div>
            </div>
          )}
          {!isLoading && !noSurveysAvailable && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualSevriProcess.id && (
                <Card
                  icon={{ url: "/icons/survey-red.svg", size: 50 }}
                  href="/sevri-survey"
                  className="bg-white/95 hover:bg-white shadow-lg transition-all hover:translate-y-[-2px]"
                >
                  <h2 className="text-xl font-semibold">Evaluación SEVRI</h2>
                  <p className="text-gray-600">
                    Seguimiento del análisis en riesgos, medidas
                  </p>
                </Card>
              )}
              {actualSurvey.id && (
                <Card
                  icon={{ url: "/icons/survey-green.svg", size: 50 }}
                  href="/autoevaluation-surveys"
                  className="bg-white/95 hover:bg-white shadow-lg transition-all hover:translate-y-[-2px]"
                >
                  <h2 className="text-xl font-semibold">
                    Evaluación de Autoevaluación
                  </h2>
                  <p className="text-gray-600">
                    Retroalimentación sobre la evaluación de diversos factores
                  </p>
                </Card>
              )}
              {actualEvaluation.id && (
                <Card
                  icon={{ url: "/icons/survey-blue.svg", size: 50 }}
                  href="/mature-model"
                  className="bg-white/95 hover:bg-white shadow-lg transition-all hover:translate-y-[-2px]"
                >
                  <h2 className="text-xl font-semibold">
                    Evaluación del Modelo de Madurez
                  </h2>
                  <p className="text-gray-600">
                    Calificación del nivel de madurez de la empresa
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center">
          <Image
            className="mx-auto mb-4"
            src="/mpz-logo.png"
            alt="Municipalidad de Pérez Zeledón"
            width={150}
            height={150}
          />
          <p className="text-blue-200/70 text-sm">
            &copy; {new Date().getFullYear()} Municipalidad de Pérez Zeledón
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
