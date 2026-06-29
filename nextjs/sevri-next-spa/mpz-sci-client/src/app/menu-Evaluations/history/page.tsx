"use client"

import Image from "next/image"
import Link from "next/link"
import { BiArrowBack, BiHistory } from "react-icons/bi"
import { BsFillClipboardCheckFill } from "react-icons/bs"

const Home = () => {
  return (
    <div className="bg-[#001440] min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-start mb-4">
          <Link
            href={"/menu-Evaluations"}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600/70 hover:bg-blue-500/70 rounded-md transition duration-300"
          >
            <BiArrowBack className="mr-2" /> Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Selecciona una Encuesta</h1>
          <p className="text-gray-300">Sistema de encuestas y seguimiento</p>
        </div>

        <div className="border-t border-gray-700 my-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/sevri-survey/history"
            className="hover:scale-105 bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 flex flex-col h-full"
          >
            <div className="p-6 flex-1">
              <div className="flex items-start">
                <div className="flex-1">
                  <h2 className="text-blue-600 text-xl font-bold mb-1">Evaluación SEVRI</h2>
                  <p className="text-gray-700 text-sm">Seguimiento del análisis en riesgos, medidas</p>
                </div>
                <div>
                  <Image src="/icons/survey-red.svg" alt="SEVRI" width={50} height={50} />
                </div>
              </div>
            </div>
            <div className="mt-auto bg-blue-50 p-2 text-center">
              <Link
                href="/sevri-survey/history"
                className="block w-full text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Ver historial
              </Link>
            </div>
          </Link>

          <Link
            href="/autoevaluation-surveys/history"
            className="hover:scale-105 bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 flex flex-col h-full"
          >
            <div className="p-6 flex-1">
              <div className="flex items-start">
                <div className="flex-1">
                  <h2 className="text-green-600 text-xl font-bold mb-1">Encuesta de Autoevaluación</h2>
                  <p className="text-gray-700 text-sm">Retroalimentación sobre la evaluación de diversos factores</p>
                </div>
                <div>
                  <Image src="/icons/survey-green.svg" alt="Autoevaluación" width={50} height={50} />
                </div>
              </div>
            </div>
            <div className="mt-auto bg-green-50 p-2 text-center">
              <Link
                href="/autoevaluation-surveys/history"
                className="block w-full text-green-600 hover:text-green-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Ver historial
              </Link>
            </div>
          </Link>

          <Link
            href="/mature-model/history"
            className="hover:scale-105 bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 flex flex-col h-full"
          >
            <div className="p-6 flex-1">
              <div className="flex items-start">
                <div className="flex-1">
                  <h2 className="text-blue-600 text-xl font-bold mb-1">Modelo de Madurez</h2>
                  <p className="text-gray-700 text-sm">Calificación del nivel de madurez de la empresa</p>
                </div>
                <div>
                  <Image src="/icons/survey-blue.svg" alt="Modelo de Madurez" width={50} height={50} />
                </div>
              </div>
            </div>
            <div className="mt-auto bg-blue-50 p-2 text-center">
              <Link
                href="/mature-model/history"
                className="block w-full text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Ver historial
              </Link>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <Image
            className="mx-auto mb-4"
            src="/mpz-logo.png"
            alt="Municipalidad de Pérez Zeledón"
            width={120}
            height={120}
          />
          <p className="text-gray-400">© 2025 Municipalidad de Pérez Zeledón</p>
        </footer>
      </div>
    </div>

  )
}

export default Home

