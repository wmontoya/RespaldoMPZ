"use client"

import { useState } from "react"
import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { Button } from "@nextui-org/button"
import { Card, CardBody, CardFooter } from "@nextui-org/card"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal"
import { Chip } from "@nextui-org/chip"
import Link from "next/link"
import { BiArrowBack, BiCalendarAlt, BiCheckCircle, BiXCircle, BiInfoCircle, BiChevronRight, BiExpandVertical } from "react-icons/bi"
import {
    FaExclamationTriangle,
    FaShieldAlt,
    FaClipboardList,
    FaExclamationCircle,
    FaRegLightbulb,
} from "react-icons/fa"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Event, SevriProcess } from "@/types/sevri"

function SevriEvaluationHistory({ evaluation }: { evaluation: SevriProcess }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    const handleOpenModal = (event: Event) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    const formatDate = (dateInput: string | Date) => {
        try {
            const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
            return format(date, "dd MMM yyyy", { locale: es })
        } catch (error) {
            return dateInput.toString()
        }
    }

    const getImpactColor = (impact: number) => {
        if (impact <= 1) return "success"
        if (impact === 2) return "warning"
        return "danger"
    }

    const getImpactText = (impact: number) => {
        if (impact <= 1) return "Bajo"
        if (impact === 2) return "Medio"
        return "Alto"
    }

    const getAccomplishmentColor = (level: string) => {
        if (level === "yes") return "success"
        if (level === "partial") return "warning"
        return "danger"
    }

    const getAccomplishmentText = (level: string) => {
        if (level === "yes") return "Completado"
        if (level === "partial") return "Parcial"
        return "Pendiente"
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Link href="/sevri-survey/history" className="flex items-center gap-2 px-6 py-3 bg-blue-600/70 hover:bg-blue-500/70 rounded-md transition duration-300 text-white"
                >
                    <BiArrowBack className="mr-2" /> Volver
                </Link>
                <div className="flex items-center gap-2 text-white">
                    <BiCalendarAlt size={20} className="text-orange-500" />
                    <span className="text-sm font-medium">
                        {formatDate(evaluation.initial_date)} - {formatDate(evaluation.final_date)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center mb-4">
                <FaClipboardList className="text-orange-500 text-3xl mr-3" />
                <h1 className="text-3xl font-bold text-white">Proceso SEVRI</h1>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
                <Accordion 
                    selectionMode="multiple"
                    variant="bordered"
                    className="gap-2"
                    itemClasses={{
                        trigger: "bg-white px-4 py-3 hover:bg-gray-50 transition-colors rounded-t-lg",
                        content: "px-4 py-3 bg-white rounded-b-lg border border-t-0 border-gray-200"
                    }}
                >
                    {evaluation.activities.map((activity, index) => (
                        <AccordionItem
                            key={`activity-${index}`}
                            textValue={`Actividad ${index + 1}: ${activity.title}`}
                            startContent={<BiExpandVertical className="text-orange-500" />}
                            subtitle={
                                <span className="text-gray-500 text-sm">
                                    {activity.events.length} evento(s) registrado(s)
                                </span>
                            }
                            title={
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-lg">Actividad {index + 1}</span>
                                    <Chip color="warning" variant="flat" size="sm">
                                        {activity.events.length} eventos
                                    </Chip>
                                </div>
                            }
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-1">{activity.title}</h2>
                                {activity.subtitle && <p className="text-gray-600">{activity.subtitle}</p>}
                            </div>

                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                {activity.events.length > 0 ? (
                                    activity.events.map((event, j) => (
                                        <Card key={event.id} className="border-none shadow-md">
                                            <CardBody className="p-0">
                                                {/* Event header */}
                                                <div className="bg-gray-50 p-4 border-b border-l-4 border-l-orange-500">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-orange-100 p-2 rounded-full">
                                                                <FaExclamationCircle className="text-orange-500" size={16} />
                                                            </div>
                                                            <h3 className="font-bold text-gray-800">Evento {j + 1}</h3>
                                                        </div>
                                                        <Chip
                                                            color={event.acceptance === "acceptable" ? "success" : "danger"}
                                                            variant="flat"
                                                            startContent={event.acceptance === "acceptable" ? <BiCheckCircle /> : <BiXCircle />}
                                                        >
                                                            {event.acceptance === "acceptable" ? "Aceptable" : "Inaceptable"}
                                                        </Chip>
                                                    </div>
                                                    <p className="mt-2 text-gray-700">{event.description}</p>
                                                </div>

                                                {/* Event details */}
                                                <div className="p-4">
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Chip color={getImpactColor(event.impact)} variant="flat" size="sm">
                                                                Impacto: {getImpactText(event.impact)}
                                                            </Chip>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FaExclamationTriangle className="text-red-500" size={14} />
                                                                <h4 className="text-sm font-semibold text-gray-700">Consecuencias</h4>
                                                            </div>
                                                            <p className="text-sm text-gray-600 pl-6">{event.consequences}</p>
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FaRegLightbulb className="text-yellow-500" size={14} />
                                                                <h4 className="text-sm font-semibold text-gray-700">Causas</h4>
                                                            </div>
                                                            <p className="text-sm text-gray-600 pl-6">{event.causes}</p>
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FaShieldAlt className="text-green-500" size={14} />
                                                                <h4 className="text-sm font-semibold text-gray-700">Medidas de Control</h4>
                                                            </div>
                                                            <p className="text-sm text-gray-600 pl-6">{event.existent_control_measures}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>

                                            <CardFooter className="bg-gray-50 border-t px-4 py-3">
                                                {event.proposed_actions.length > 0 ? (
                                                    <Button
                                                        color="primary"
                                                        className="bg-blue-500 w-full"
                                                        onPress={() => handleOpenModal(event)}
                                                        endContent={<BiChevronRight />}
                                                    >
                                                        Ver Acciones Propuestas ({event.proposed_actions.length})
                                                    </Button>
                                                ) : (
                                                    <div className="w-full flex items-center justify-center gap-2 text-orange-500 py-1">
                                                        <BiInfoCircle size={16} />
                                                        <span className="text-sm font-medium">No posee acciones propuestas</span>
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-8 col-span-full">
                                        <BiInfoCircle size={40} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-600">No hay eventos registrados para esta actividad.</p>
                                    </div>
                                )}
                            </div>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex gap-2 items-center">
                                <FaClipboardList className="text-orange-500" />
                                <span>Acciones Propuestas</span>
                            </ModalHeader>
                            <ModalBody>
                                {selectedEvent?.proposed_actions.length ? (
                                    <div className="space-y-4">
                                        {selectedEvent.proposed_actions.map((action, index) => (
                                            <Card key={action.id || index} className="border shadow-none">
                                                <CardBody className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="font-bold text-gray-800">Acción {index + 1}</h3>
                                                        <Chip
                                                            color={getAccomplishmentColor(action.accomplishment_level)}
                                                            variant="flat"
                                                            size="sm"
                                                        >
                                                            {getAccomplishmentText(action.accomplishment_level)}
                                                        </Chip>
                                                    </div>

                                                    <p className="text-gray-700 mb-4">{action.description}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-700 mb-1">Responsable</h4>
                                                            <p className="text-gray-600">{action.responsible_name}</p>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold text-gray-700 mb-1">Fecha de acción</h4>
                                                            <p className="text-gray-600">{formatDate(action.action_date)}</p>
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <h4 className="font-semibold text-gray-700 mb-1">Indicadores</h4>
                                                            <p className="text-gray-600">{action.indicators}</p>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BiInfoCircle size={40} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-600">No hay acciones propuestas para este evento.</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default SevriEvaluationHistory
