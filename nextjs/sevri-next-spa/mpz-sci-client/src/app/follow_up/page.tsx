"use client"
import Link from "next/link"
import {
  BiArrowBack,
  BiFilter,
  BiCheckCircle,
  BiXCircle,
  BiMinusCircle,
  BiCalendar,
  BiInfoCircle,
  BiReset,
} from "react-icons/bi"
import { useFollowUp } from "@/hooks/useFollowUp"
import { useFollowUpState } from "@/store/follow_up/followUpStore"
import { useState, useEffect } from "react"
import Modal from "@/components/globals/Modal"
import { useDisclosure } from "@nextui-org/modal"
import type { ProposedAction as MatureModelProposedActions } from "@/types"
import type { ProposedAction as AutoEvaluationProposedAction } from "@/types/autoevaluationSurvey"
import type { ProposedAction as SevriProposedActions } from "@/types/sevri"
import FollowUpForm from "@/components/followUp/FollowUpForm"
import type { FollowUpFormProps } from "@/utils/schemas/followUp/proposedActionsForm"

const FollowUpPage = () => {
  useFollowUp()
  const { autoEvaluationProposedActions, matureModelProposedActions, sevriProposedActions } = useFollowUpState()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [action, setAction] = useState<
    SevriProposedActions | MatureModelProposedActions | AutoEvaluationProposedAction | null
  >(null)
  const { savedModelFilters, resetFilters, savedStatusFilters, setSavedModelFilters, setSavedStatusFilters } = useFollowUpState()
  const [showFilters, setShowFilters] = useState(false)

  const handleClickAction = (
    action: MatureModelProposedActions | AutoEvaluationProposedAction | SevriProposedActions,
  ) => {
    setAction(action)
    onOpen()
  }

  const filteredActions = [
    ...(savedModelFilters.autoEvaluation
      ? autoEvaluationProposedActions.map((action) => ({ ...action, modelType: "autoEvaluation" }))
      : []),
    ...(savedModelFilters.matureModel
      ? matureModelProposedActions.map((action) => ({ ...action, modelType: "matureModel" }))
      : []),
    ...(savedModelFilters.sevri ? sevriProposedActions.map((action) => ({ ...action, modelType: "sevri" })) : []),
  ].filter((action) => {
    return (
      (savedStatusFilters.complete && action.accomplishment_level === "yes") ||
      (savedStatusFilters.incomplete && action.accomplishment_level === "no") ||
      (savedStatusFilters.partial && action.accomplishment_level === "partial")
    )
  })

  const getStatusText = (status: string) => {
    switch (status) {
      case "yes":
        return "Completa"
      case "partial":
        return "Parcial"
      case "no":
        return "Incompleta"
      default:
        return "Desconocido"
    }
  }

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "yes":
        return "border-green-500"
      case "partial":
        return "border-yellow-500"
      case "no":
        return "border-red-500"
      default:
        return "border-gray-300"
    }
  }

  const getModelTypeText = (modelType: string) => {
    switch (modelType) {
      case "autoEvaluation":
        return "Autoevaluación"
      case "matureModel":
        return "Modelo de Madurez"
      case "sevri":
        return "SEVRI"
      default:
        return modelType
    }
  }

  const isOverdue = (dateString: string) => {
    const actionDate = new Date(dateString)
    const today = new Date()
    return (today.getTime() - actionDate.getTime()) / (1000 * 3600 * 24) > 0
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#001440] to-[#00102E] text-white">
      {/* Header */}
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/menu-Evaluations"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
          >
            <BiArrowBack /> Volver
          </Link>

          <h1 className="text-2xl font-bold text-center">Seguimiento de las acciones propuestas</h1>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
          >
            <BiFilter /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="bg-blue-950 rounded-lg p-4 mb-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BiFilter /> Filtros
              </h2>

              <button
                onClick={resetFilters}
                className="flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                <BiReset />
                <span>Resetear filtros</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Tipo de modelo:</h3>
                <div className="flex flex-col space-y-2">
                  {[
                    {
                      key: "autoEvaluation",
                      label: "Autoevaluación",
                      icon: <BiInfoCircle className="text-blue-300" />,
                    },
                    {
                      key: "matureModel",
                      label: "Modelo de Madurez",
                      icon: <BiInfoCircle className="text-blue-300" />,
                    },
                    { key: "sevri", label: "SEVRI", icon: <BiInfoCircle className="text-blue-300" /> },
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={savedModelFilters[key as keyof typeof savedModelFilters]}
                          onChange={() =>
                            setSavedModelFilters({
                              ...savedModelFilters,
                              [key as keyof typeof savedModelFilters]: !savedModelFilters[key as keyof typeof savedModelFilters],
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-blue-300 rounded flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                          <svg
                            className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <span>{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Estado de cumplimiento:</h3>
                <div className="flex flex-col space-y-2">
                  {[
                    { key: "complete", label: "Completa", icon: <BiCheckCircle className="text-green-500" /> },
                    { key: "partial", label: "Parcial", icon: <BiMinusCircle className="text-yellow-500" /> },
                    { key: "incomplete", label: "Incompleta", icon: <BiXCircle className="text-red-500" /> },
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={savedStatusFilters[key as keyof typeof savedStatusFilters]}
                          onChange={() =>
                            setSavedStatusFilters({
                              ...savedStatusFilters,
                              [key as keyof typeof savedStatusFilters]: !savedStatusFilters[key as keyof typeof savedStatusFilters],
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-blue-300 rounded flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                          <svg
                            className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <span>{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredActions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActions.map((action, index) => {
              const overdueStatus = action.accomplishment_level !== "yes" && isOverdue(action.action_date.toString())
              const statusText = getStatusText(action.accomplishment_level)
              const borderColor = getStatusBorderColor(action.accomplishment_level)
              return (
                <div
                  key={index}
                  onClick={() => handleClickAction(action)}
                  className={`bg-white text-blue-950 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 border-b-4 ${borderColor}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${action.accomplishment_level === "yes"
                          ? "bg-green-100 text-green-800"
                          : action.accomplishment_level === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {statusText}
                      </span>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {getModelTypeText(action.modelType as string)}
                      </span>
                    </div>

                    <p className="text-sm line-clamp-4 mb-4">{action.description}</p>

                    <div className="flex items-center text-xs text-gray-600 mt-2">
                      <BiCalendar className="mr-1" />
                      <span className={overdueStatus ? "text-red-600 font-medium" : ""}>
                        {overdueStatus ? "Vencida" : formatDate(action.action_date.toString())}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-blue-800/50 p-8 rounded-lg text-center">
              <BiInfoCircle className="mx-auto text-4xl mb-4" />
              <p className="text-xl font-medium">No hay acciones que coincidan con los filtros seleccionados</p>
              <p className="text-blue-300 mt-2">
                Intenta ajustar los criterios de filtrado o
                <button onClick={resetFilters} className="text-blue-300 underline hover:text-white ml-1">
                  resetear los filtros
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal isDismissable={false} size="full" isOpen={isOpen} onClose={onClose} id="followUpFormModal" title="">
        <FollowUpForm handleClose={onClose} proposedAction={action as unknown as FollowUpFormProps} />
      </Modal>
    </section>
  )
}

export default FollowUpPage

