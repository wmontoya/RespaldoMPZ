import type React from "react"
import { FaRegFile, FaTimes, FaCalendarAlt, FaUser, FaEnvelope } from "react-icons/fa"
import { BiPlus, BiNotepad, BiCheckCircle, BiListUl, BiEdit } from "react-icons/bi"
import { downloadFile } from "@/utils/files"
import { Formik, Form, Field, ErrorMessage } from "formik"
import {
    type FollowUpFormProps,
    getInitialValuesProposedActions,
    proposedActionsValidationSchema,
} from "@/utils/schemas/followUp/proposedActionsForm"
import useCrudFollowUp from "@/hooks/useCrudFollowUp"
import { showLoadingAlert } from "@/utils"

function FollowUpForm({ proposedAction, handleClose }: { proposedAction: FollowUpFormProps; handleClose: () => void }) {
    const { handleSubmit, fileInputRef, files, setFiles } = useCrudFollowUp(proposedAction)

    const handleIconClick = () => fileInputRef.current?.click()

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files))
        }
    }

    const handleCloseAndSubmit = async (values: FollowUpFormProps) => {
        showLoadingAlert("Guardando y cerrando...", "Estamos guardando por favor espere")
        if (await handleSubmit(values)) handleClose()
    }

    const handleFileRemove = (fileToRemove: File) => {
        setFiles(files.filter(file => file !== fileToRemove))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    if (!proposedAction) return null

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "yes":
                return "Completa"
            case "no":
                return "Incompleta"
            case "partial":
                return "Parcial"
            default:
                return "Desconocido"
        }
    }

    return (
        <Formik
            initialValues={getInitialValuesProposedActions(proposedAction)}
            validationSchema={proposedActionsValidationSchema}
            onSubmit={handleSubmit}
        >
            {({ setFieldValue, values }) => (
                <Form className="bg-blue-50 rounded-lg">
                    <div className="p-4 border-b border-blue-100">
                        <h2 className="text-xl font-bold text-gray-800">Detalles de la Acción Propuesta</h2>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2 space-y-1">
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center text-gray-700 mb-1">
                                        <BiNotepad className="text-blue-600 mr-2" size={16} />
                                        <span className="font-medium">Descripción:</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{proposedAction.description}</p>
                                </div>

                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center text-gray-700 mb-1">
                                        <BiListUl className="text-blue-600 mr-2" size={16} />
                                        <span className="font-medium">Indicadores:</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{proposedAction.indicators}</p>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        <div className="flex items-center text-gray-700 mb-1">
                                            <FaUser className="text-blue-600 mr-2" size={14} />
                                            <span className="font-medium text-sm">Responsable:</span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{proposedAction.responsible_name}</p>
                                    </div>

                                    <div className="flex gap-1">
                                        <div className="flex items-center text-gray-700 mb-1">
                                            <FaEnvelope className="text-blue-600 mr-2" size={14} />
                                            <span className="font-medium text-sm">Email:</span>
                                        </div>
                                        {proposedAction.responsible_email ? (
                                            <a
                                                href={`mailto:${proposedAction.responsible_email}`}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                {proposedAction.responsible_email}
                                            </a>
                                        ) : (
                                            <p className="text-gray-700 text-sm">No disponible</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="flex items-center text-gray-700 mb-1">
                                            <FaCalendarAlt className="text-blue-600 mr-2" size={14} />
                                            <span className="font-medium text-sm">Fecha de Acción:</span>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            {new Date(proposedAction.action_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="flex items-center text-gray-700 mb-1">
                                            <BiCheckCircle className="text-blue-600 mr-2" size={14} />
                                            <span className="font-medium text-sm">Nivel de Cumplimiento:</span>
                                        </div>
                                        <p className="text-sm font-medium">
                                            <span
                                                className={`
                                                ${proposedAction.accomplishment_level === "yes"
                                                        ? "text-green-600"
                                                        : proposedAction.accomplishment_level === "partial"
                                                            ? "text-yellow-600"
                                                            : "text-red-600"
                                                    }
                                            `}>
                                                {getStatusLabel(proposedAction.accomplishment_level)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-2 bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow">
                            <label htmlFor="observations" className="block text-gray-700 font-medium mb-2 items-center">
                                <BiNotepad className="mr-2 text-blue-600" size={18} />
                                Observaciones:
                            </label>
                            <Field
                                id="observations"
                                name="observations"
                                as="textarea"
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                            />
                            <ErrorMessage name="observations" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div className="mb-2 shadow bg-white p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center mb-2 gap-2">
                                <label className="block text-gray-700 font-medium mb-2 items-center">
                                    <FaRegFile className="mr-2 text-blue-600" size={18} />
                                    Adjuntar Archivos:
                                </label>
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center">
                                                <FaRegFile className="text-blue-600 mr-2" size={16} />
                                                <p
                                                    className="hover:underline text-blue-700 cursor-pointer flex-grow text-sm"
                                                    onClick={() => downloadFile(file)}
                                                >
                                                    {file.name}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileRemove(file)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleIconClick}
                                className="flex items-center gap-1 text-green-600 border border-green-300 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors text-sm"
                            >
                                {files.length > 0 ? <BiEdit size={18} /> : <BiPlus size={18} />}
                                {files.length > 0 ? "Cambiar archivos" : "Agregar archivos"}
                            </button>

                            <input
                                accept=".doc,.docx,.ppt,.pptx,.pdf,.txt,.xls,.xlsx"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={fileInputRef}
                                type="file"
                                multiple
                            />

                        </div>


                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow">
                            <label className="block text-gray-700 font-medium mb-3 items-center">
                                <BiCheckCircle className="mr-2 text-blue-600" size={18} />
                                Estado:
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center cursor-pointer">
                                    <Field type="radio" name="accomplishment_level" value="yes" className="hidden peer" />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center transition-all duration-300 peer-checked:bg-green-500 peer-checked:border-green-500">
                                        <svg
                                            className="w-3 h-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="3"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <span className="ml-2 text-gray-700">Completa</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <Field type="radio" name="accomplishment_level" value="no" className="hidden peer" />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center transition-all duration-300 peer-checked:bg-red-500 peer-checked:border-red-500">
                                        <svg
                                            className="w-3 h-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="3"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <span className="ml-2 text-gray-700">Incompleta</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <Field type="radio" name="accomplishment_level" value="partial" className="hidden peer" />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center transition-all duration-300 peer-checked:bg-yellow-500 peer-checked:border-yellow-500">
                                        <svg
                                            className="w-3 h-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="3"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <span className="ml-2 text-gray-700">Parcial</span>
                                </label>
                            </div>
                            <ErrorMessage name="accomplishment_level" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                    </div>
                    <div className="p-4 border-t border-blue-100 flex justify-end gap-3">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                        >
                            <BiCheckCircle className="mr-1" size={18} />
                            Guardar
                        </button>
                        <button
                            onClick={() => handleCloseAndSubmit(values)}
                            type="button"
                            className="border border-green-500 text-green-600 px-4 py-2 rounded hover:bg-green-50 transition-colors flex items-center"
                        >
                            <BiCheckCircle className="mr-1" size={18} />
                            Guardar y Cerrar
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default FollowUpForm

