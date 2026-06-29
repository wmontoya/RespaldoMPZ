"use client"

import CustomAutoComplete from "@/components/globals/CustomAutoComplete"
import { useGlobalState } from "@/store/globalState"
import { useSharedStore } from "@/store/shared/sharedStore"
import type { Event, ProposedAction } from "@/types/sevri"
import { showConfirmAlert, showInfoMixinAlert } from "@/utils"
import { eventValidationSchema, proposedActionsValidationSchema } from "@/utils/schemas/sevri/eventForm"
import { ErrorMessage, Field, FieldArray } from "formik"
import type React from "react"
import { useState } from "react"
import { BiArrowBack, BiSave, BiTrash, BiPlus, BiNotepad, BiCheckSquare, BiUser, BiCalendar } from "react-icons/bi"
import { FaArrowLeft } from "react-icons/fa"

function ProposedActions({
    setFollowModule,
    handleSubmitAndClose,
    values,
    handleSubmit
}: {
    setFollowModule: React.Dispatch<React.SetStateAction<boolean>>
    handleSubmit: (values: Event) => void
    handleSubmitAndClose: (values: Event) => void
    values: Event
}) {
    const { users } = useSharedStore()
    const [activeTab, setActiveTab] = useState(0)
    const { user_id } = useGlobalState()

    const handleDelete = (remove: () => void) => {
        showConfirmAlert("¿Está seguro de eliminar esta acción?", "Esta acción no se puede deshacer", () => {
            remove()
        })
    }
    const validateSubmit = (values: Event, submit: (values: Event) => void) => {
        const incompleteActions = values.proposed_actions.filter((action) => !isActionComplete(action))
        if (incompleteActions.length > 0) {
            showInfoMixinAlert(
                "Acciones incompletas",
                `Hace falta completar campos en la accion ${values.proposed_actions.indexOf(incompleteActions[0]) + 1}`,
                "error",
            )
            return false
        }
        submit(values)
        return true
    }

    const isActionComplete = (action: ProposedAction) => {
        try {
            proposedActionsValidationSchema.validateSync(action, { abortEarly: false })
            return true
        } catch (error) {
            return false
        }
        // return (
        //     action.description.trim() !== "" &&
        //     action.indicators.trim() !== "" &&
        //     action.responsible_name.trim() !== "" &&
        //     action.action_date.toString().trim() !== "" 
        // )
    }

    return (
        <div className="bg-white">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
                <button
                    onClick={() => setFollowModule(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-md"
                >
                    <FaArrowLeft size={16} />
                    <span>Volver</span>
                </button>
                <h1 className="text-xl font-bold text-center">Acciones Propuestas</h1>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => validateSubmit(values, handleSubmit)}

                        className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2 flex items-center gap-1"
                    >
                        <span>Guardar</span>
                        <BiSave size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => validateSubmit(values, handleSubmitAndClose)}
                        className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded px-3 py-2 flex items-center gap-1"
                    >
                        <span>Guardar y Cerrar</span>
                        <BiSave size={16} />
                    </button>
                </div>
            </div>

            <FieldArray name="proposed_actions">
                {({ push, remove }) => (
                    <div>
                        {/* Action Tabs - Moved below the header with clear separation */}
                        <div className="mb-4">
                            <div className="flex space-x-2">
                                {values.proposed_actions.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`px-4 py-2 text-sm font-medium rounded ${activeTab === index ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        onClick={() => setActiveTab(index)}
                                    >
                                        Acción {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Form */}
                        {values.proposed_actions.map(
                            (action, index) =>
                                activeTab === index && (
                                    <div key={index} className="space-y-4 border rounded-md p-4">
                                        <div>
                                            <label className="flex items-center text-gray-700 mb-1">
                                                <BiNotepad className="mr-2 text-indigo-600" size={16} />
                                                Descripción de la acción a realizar
                                            </label>
                                            <Field
                                                className="w-full p-2 border rounded"
                                                name={`proposed_actions.${index}.description`}
                                                as="textarea"
                                                rows={3}
                                                required
                                            />
                                            <ErrorMessage
                                                name={`proposed_actions.${index}.description`}
                                                component="div"
                                                className="text-red-500 text-xs mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center text-gray-700 mb-1">
                                                <BiCheckSquare className="mr-2 text-indigo-600" size={16} />
                                                Indicadores de cumplimiento
                                            </label>
                                            <Field
                                                className="w-full p-2 border rounded"
                                                name={`proposed_actions.${index}.indicators`}
                                                as="textarea"
                                                rows={3}
                                                required
                                            />
                                            <ErrorMessage
                                                name={`proposed_actions.${index}.indicators`}
                                                component="div"
                                                className="text-red-500 text-xs mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center text-gray-700 mb-1">
                                                <BiUser className="mr-2 text-indigo-600" size={16} />
                                                Responsable
                                            </label>
                                            <CustomAutoComplete
                                                label=""
                                                allowCustomValue
                                                name={`proposed_actions.${index}.responsible_name`}
                                                placeholder="Seleccione un responsable"
                                                options={users.map((user) => ({ value: user.name, label: user.name }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center text-gray-700 mb-1">
                                                <BiCalendar className="mr-2 text-indigo-600" size={16} />
                                                Fecha de la acción
                                            </label>
                                            <div className="relative">
                                                <Field
                                                    className="w-full p-2 border rounded"
                                                    name={`proposed_actions.${index}.action_date`}
                                                    type="date"
                                                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.showPicker()}
                                                    required
                                                />
                                            </div>
                                            <ErrorMessage
                                                name={`proposed_actions.${index}.action_date`}
                                                component="div"
                                                className="text-red-500 text-xs mt-1"
                                            />
                                        </div>

                                        {values.proposed_actions.length > 1 && (
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(() => {
                                                            remove(index)
                                                            setActiveTab((prev) => (prev > 0 ? prev - 1 : 0))
                                                        })
                                                    }
                                                    className="text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-600 hover:text-white"
                                                >
                                                    <BiTrash className="inline mr-1" size={14} /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ),
                        )}
                        <div className="flex justify-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    if (values.proposed_actions.length > 0 && !isActionComplete(values.proposed_actions[activeTab])) {
                                        showInfoMixinAlert(
                                            "Acción incompleta",
                                            "Por favor verifique los campos antes de continuar",
                                            "error",
                                        )
                                        return
                                    }
                                    push({
                                        user_id,
                                        description: "",
                                        indicators: "",
                                        responsible_name: "",
                                        accomplishment_level: "no",
                                        action_date: "",
                                    })
                                    setActiveTab(values.proposed_actions.length)
                                }}
                                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 flex items-center"
                            >
                                <BiPlus className="mr-1" size={16} />
                                Agregar Acción
                            </button>
                        </div>
                    </div>
                )}
            </FieldArray>
        </div>
    )
}

export default ProposedActions

