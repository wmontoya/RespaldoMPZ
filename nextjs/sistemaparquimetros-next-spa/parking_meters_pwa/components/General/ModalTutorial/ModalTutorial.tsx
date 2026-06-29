"use client"
import { type ReactElement, useEffect } from "react"
import {
  FaRegLightbulb,
  FaRegTimesCircle,
  FaRegCheckCircle,
  FaInfoCircle,
  FaBook,
  FaExternalLinkAlt,
  FaClock,
  FaListOl,
} from "react-icons/fa"

interface Tutorial {
  id: number
  title: string
  description: string
  duration: string
  steps: number
  difficulty: "Básico" | "Intermedio" | "Avanzado"
  url: string
}

interface ModalTutorialProps {
  showCancelButton?: boolean
  showAprobeButton?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  isOpenModal: boolean
  closeModal: () => void
  showTutorials?: boolean
  tutorials?: Tutorial[]
}

const defaultTutorials: Tutorial[] = [
  {
    id: 1,
    title: "Instalar Apliación en Android",
    description: "Aprende a instalar la aplicación en tu dispositivo Android",
    duration: "2 minutos",
    steps: 5,
    difficulty: "Básico",
    url: "https://www.perezzeledon.go.cr/index.php?option=com_content&view=article&id=404",
  },
  {
    id: 2,
    title: "Instalar Apliación en IOS",
    description: "Aprende a instalar la aplicación en tu dispositivo iOS",
    duration: "2 minutos",
    steps: 4,
    difficulty: "Básico",
    url: "https://www.perezzeledon.go.cr/index.php?option=com_content&view=article&id=405",
  },
  {
    id: 3,
    title: "Compra de Boletas de Parquímetro y Pago de Multas",
    description: "Guía completa para comprar tiempo de parquímetro y pagar multas",
    duration: "5 minutos",
    steps: 5,
    difficulty: "Intermedio",
    url: "https://www.perezzeledon.go.cr/index.php?option=com_content&view=article&id=406",
  },
]

export function ModalTutorial({
  isOpenModal,
  closeModal,
  tutorials = defaultTutorials,
}: ModalTutorialProps) {
  useEffect(() => {
    if (!isOpenModal) {
      closeModal()
    }
  }, [isOpenModal, closeModal])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Básico":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
      case "Avanzado":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const handleTutorialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      {isOpenModal && (
        <div id="popup-modal" className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-50">
         <div className="relative p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white z-10"
              >
                <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>


                <div className="p-6">
                  <div className="text-center mb-6">
                    <FaRegLightbulb size={60} className="mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
                    <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      Manuales Disponibles
                    </h1>
                  </div>

                  <div className="space-y-4 mb-6">
                    {tutorials.map((tutorial) => (
                      <div
                        key={tutorial.id}
                        onClick={() => handleTutorialClick(tutorial.url)}
                        className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{tutorial.title}</h3>
                              <span
                                className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(tutorial.difficulty)}`}
                              >
                                {tutorial.difficulty}
                              </span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                              {tutorial.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <FaClock className="w-3 h-3" />
                                <span>{tutorial.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaListOl className="w-3 h-3" />
                                <span>{tutorial.steps} pasos</span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900 transition-colors">
                            <FaExternalLinkAlt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={closeModal}
                      type="button"
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-200 rounded-lg border border-gray-400 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              
            </div>
          </div>
        </div>
      )}
    </>
  )
}