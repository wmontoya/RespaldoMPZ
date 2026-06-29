"use client"
import { useSevriStore } from "@/store/sevriModel/sevriStore"
import Link from "next/link"
import { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import type { Activity, Event } from "@/types/sevri"
import { activityValidationSchema, getInitialValuesActivity } from "@/utils/schemas/sevri/activityForm"
import { useRouter } from "next/navigation"
import { useGlobalState } from "@/store/globalState"
import Modal from "@/components/globals/Modal"
import { useDisclosure } from "@nextui-org/modal"
import EventForm from "./EventForm"
import { FaArrowLeft, FaPen, FaSave, FaPlus, FaTrashAlt, FaSearch, FaClipboardCheck, FaEllipsisH } from "react-icons/fa"

const ActivityForm = ({ activity }: { activity?: Activity }) => {
    const { saveActivity, deleteEvent, actualSevriProcess } = useSevriStore()
    const [editMode, setEditMode] = useState(activity ? false : true)
    const { department_id, department_name } = useGlobalState()
    const { isOpen, onClose, onOpen } = useDisclosure()
    const { isOpen: isOpenDelete, onClose: onCloseDelete, onOpen: onOpenDelete } = useDisclosure()
    const [event, setEvent] = useState<Event | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null)

    const router = useRouter()

    const handleSubmit = (values: Activity) => {
        saveActivity(values).then((result) => {
            setEditMode(false)
            router.push(`/sevri-survey/${result?.id}`)
        })
    }

    const handleOpen = (onOpen: () => void, event?: Event) => {
        setEvent(event ?? null)
        onOpen()
    }

    const handleDelete = (event_id: number) => {
        onCloseDelete()
        deleteEvent(event_id)
    }

    const toggleEventExpansion = (eventId: number) => {
        if (expandedEvent === eventId) {
            setExpandedEvent(null)
        } else {
            setExpandedEvent(eventId)
        }
    }

    const filteredEvents =
        activity?.events?.filter((event) => {
            const eventDescription = event.description?.toLowerCase() || ""
            return eventDescription.includes(searchTerm.toLowerCase())
        }) || []

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return ""
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#001440] to-[#00102E]">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <header className="flex items-center justify-between mb-6">
                <Link
                        href="/sevri-survey"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-md"
                    >
                        <FaArrowLeft size={16} />
                        <span>Volver</span>
                    </Link>

                    <h1 className="text-xl md:text-2xl font-bold text-white text-center">Información de la Actividad</h1>

                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-md"
                        >
                            <FaPen size={16} />
                            <span>Editar</span>
                        </button>
                    )}
                </header>
                <div className="bg-[#0a1f4d] rounded-xl shadow-xl overflow-hidden mb-6 border border-[#1a3366]">
                    <div className="p-5">
                        {editMode ? (
                            <Formik
                                initialValues={getInitialValuesActivity(
                                    department_name,
                                    department_id.toString(),
                                    actualSevriProcess.id,
                                    activity,
                                )}
                                validationSchema={activityValidationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                <Form className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-blue-200 mb-1">
                                                Actividad
                                            </label>
                                            <Field
                                                id="title"
                                                type="text"
                                                name="title"
                                                placeholder="Ingrese la actividad"
                                                className="w-full px-3 py-2 bg-[#0c2456] text-white border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <ErrorMessage name="title" component="div" className="mt-1 text-red-400 text-sm" />
                                        </div>

                                        <div>
                                            <label htmlFor="subtitle" className="block text-sm font-medium text-blue-200 mb-1">
                                                Descripción
                                            </label>
                                            <Field
                                                id="subtitle"
                                                type="text"
                                                name="subtitle"
                                                placeholder="Ingrese la descripción"
                                                className="w-full px-3 py-2 bg-[#0c2456] text-white border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <ErrorMessage name="subtitle" component="div" className="mt-1 text-red-400 text-sm" />
                                        </div>
                                    </div>

                                    {/* <div>
                                        <label htmlFor="dependency" className="block text-sm font-medium text-blue-200 mb-1">
                                            Dependencia
                                        </label>
                                        <Field
                                            id="dependency"
                                            type="text"
                                            name="dependency"
                                            placeholder="Dependencia"
                                            className="w-full px-3 py-2 bg-[#081c45] text-gray-400 border border-blue-500/20 rounded-lg cursor-not-allowed"
                                            disabled
                                        />
                                    </div> */}

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-300 shadow-md"
                                        >
                                            <FaSave size={16} />
                                            <span>Guardar </span>
                                        </button>
                                    </div>
                                </Form>
                            </Formik>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h2 className="text-sm font-medium text-blue-300 mb-1">Título:</h2>
                                    <p className="text-lg font-semibold text-white bg-[#0c2456] p-2 rounded-lg">
                                        {activity?.title || "—"}
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-sm font-medium text-blue-300 mb-1">Subtítulo:</h2>
                                    <p className="text-lg font-semibold text-white bg-[#0c2456] p-2 rounded-lg">
                                        {activity?.subtitle || "—"}
                                    </p>
                                </div>

                                {/* <div className="md:col-span-2">
                                    <h2 className="text-sm font-medium text-blue-300 mb-1">Dependencia:</h2>
                                    <p className="text-lg font-semibold text-white bg-[#0c2456] p-2 rounded-lg">
                                        {activity?.dependency || "—"}
                                    </p>
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Events Section */}
                {activity?.id && (
                    <div className="bg-[#0a1f4d] rounded-xl shadow-xl overflow-hidden border border-[#1a3366]">
                        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaClipboardCheck className="text-white" size={16} />
                                <h2 className="text-lg font-bold text-white">Eventos de la actividad</h2>
                            </div>

                            <button
                                onClick={() => handleOpen(onOpen)}
                                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-300 shadow-md text-sm"
                            >
                                <FaPlus size={12} />
                                <span>Crear</span>
                            </button>
                        </div>

                        <div className="p-3 border-b border-[#1a3366]">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" size={14} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar evento..."
                                    className="w-full pl-9 pr-3 py-2 bg-[#0c2456] text-white rounded-lg border border-[#1a3366] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {filteredEvents.length > 0 ? (
                                <ul className="divide-y divide-[#1a3366]">
                                    {filteredEvents.map((event, index) => (
                                        <li key={index} className="p-3 hover:bg-[#0c2456] transition-colors">
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => toggleEventExpansion(event.id || index)}
                                                    className="flex items-center gap-2 flex-1 text-left"
                                                >
                                                    <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded-md flex-shrink-0">
                                                        {expandedEvent === (event.id || index) ? (
                                                            <FaEllipsisH size={12} />
                                                        ) : (
                                                            <FaClipboardCheck size={12} />
                                                        )}
                                                    </div>
                                                    <p className="text-white text-sm font-medium">
                                                        {expandedEvent === (event.id || index)
                                                            ? event.description
                                                            : truncateText(event.description || "", 40)}
                                                    </p>
                                                </button>

                                                <div className="flex gap-1 ml-2">
                                                    <button
                                                        onClick={() => handleOpen(onOpen, event)}
                                                        className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                                                        aria-label="Editar evento"
                                                    >
                                                        <FaPen size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpen(onOpenDelete, event)}
                                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                                                        aria-label="Eliminar evento"
                                                    >
                                                        <FaTrashAlt size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="py-8 px-4 text-center">
                                    <div className="bg-[#0c2456] rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                        <FaClipboardCheck className="text-blue-400 text-lg" />
                                    </div>
                                    <h2 className="text-lg font-medium text-blue-300">No hay eventos registrados</h2>
                                    <p className="text-blue-200/70 mt-1 text-sm">
                                        {searchTerm ? "No se encontraron resultados" : "Cree un nuevo evento con el botón 'Crear'"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {filteredEvents.length > 0 && (
                            <div className="bg-[#0c2456] px-4 py-2 text-xs text-blue-300 border-t border-[#1a3366]">
                                {filteredEvents.length} {filteredEvents.length === 1 ? "evento" : "eventos"} encontrados
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal size="md" isOpen={isOpenDelete} onClose={onCloseDelete} id="deleteEventModal" title="¿Eliminar evento?">
                <div className="p-4">
                    <p className="text-gray-700 mb-4 text-sm">
                        ¿Está seguro que desea eliminar este evento? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCloseDelete}
                            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleDelete(event?.id ?? 0)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isDismissable={false}
                size="full"
                isOpen={isOpen}
                onClose={onClose}
                id="addEventModal"
                title="Información del Evento"
            >
                <EventForm onClose={onClose} event={event ?? undefined} />
            </Modal>
        </div>
    )
}

export default ActivityForm
