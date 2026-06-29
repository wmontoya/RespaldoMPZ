"use client"
import { useEffect, useRef, useState } from "react"
import { BiInfoCircle, BiRightArrowAlt, BiSave, BiErrorCircle } from "react-icons/bi"
import { AiOutlineExclamationCircle, AiOutlineTool, AiOutlineWarning } from "react-icons/ai"
import { ErrorMessage, Field, Form, Formik } from "formik"
import type { Event } from "@/types/sevri"
import { eventValidationSchema, getInitialValuesEvent } from "@/utils/schemas/sevri/eventForm"
import { useSevriStore } from "@/store/sevriModel/sevriStore"
import { calculateNewRiskLevel, calculateRiskLevel, parseRiskLevel } from "@/utils/calc/calculateRiskLevels"
import { RiskLevelIndicator } from "./RiskLevelIndicator"
import { showInfoMixinAlert } from "@/utils"
import { useSharedStore } from "@/store/shared/sharedStore"
import { MdCategory } from "react-icons/md"
import { FaListAlt } from "react-icons/fa"
import { HiOutlineClipboardList } from "react-icons/hi"
import { GiDiceSixFacesFive } from "react-icons/gi"
import { RiErrorWarningLine } from "react-icons/ri"
import { BsPersonCheck, BsEmojiSmile } from "react-icons/bs"
import ProposedActions from "./ProposedActions"
import { useValidation } from "@/hooks/useValidation"

function EventForm({ event, onClose }: { event?: Event; onClose: () => void }) {
    const { eventTypes, saveEvent, actualActivity } = useSevriStore();
    const { users } = useSharedStore();
    const [followModule, setFollowModule] = useState(false);
    const [eventModified, setEventModified] = useState<Event | undefined>(event);

    const { validationErrors, validate, errorContainerRef } = useValidation<Event>(eventValidationSchema);

    const handleSubmit = async (values: Event) => {
        if (!(await validate(values))) return false;

        const newValues =
            values.new_risk_level === "low"
                ? ({
                    ...values,
                    id: eventModified?.id,
                    event_classification_id: Number(values.event_classification_id),
                    event_specification_id: Number(values.event_specification_id),
                    event_type_id: Number(values.event_type_id),
                    proposed_actions: [],
                    acceptance: "acceptable" as "acceptable" | "unacceptable",
                } as Event)
                : ({
                    ...values,
                    id: eventModified?.id,
                    proposed_actions: values.proposed_actions.map((action) => ({
                        ...action,
                        responsible_email: users.find(
                            (user) => user.name.trim() === action.responsible_name.trim()
                        )?.email,
                    })),
                    event_classification_id: Number(values.event_classification_id),
                    event_specification_id: Number(values.event_specification_id),
                    event_type_id: Number(values.event_type_id),
                    acceptance: "unacceptable" as "acceptable" | "unacceptable",
                } as Event);

        showInfoMixinAlert("Guardando", "Guardando evento", "info");
        saveEvent(newValues)
            .then((response) => {
                if (!response) return;
                setEventModified(response);
            })
            .catch(() => {
                showInfoMixinAlert("Error", "Error al guardar el evento", "error");
            });
        return true;
    };

    const handleSubmitAndClose = async (values: Event) => {
        if (await handleSubmit(values)) {
            onClose();
        }
    };

    const handleGoToProposedActions = async (values: Event, validateForm: () => Promise<any>, setFieldValue: any) => {
        const errors = await validateForm();
        const nonProposedActionsErrors = Object.keys(errors).filter(
            (key) => key !== "proposed_actions"
        );
        if (nonProposedActionsErrors.length === 0) {
            if (values.proposed_actions.length === 0) {
                setFieldValue("proposed_actions", [
                    {
                        user_id: "",
                        description: "",
                        indicators: "",
                        responsible_name: "",
                        accomplishment_level: "no",
                        action_date: "",
                    },
                ]);
            }
            setFollowModule(true);
        } else {
            showInfoMixinAlert(
                "Campos incompletos",
                `Por favor complete todos los campos requeridos antes de continuar.`,
                "error"
            );
        }
    };

    return (
        <div className="px-4 rounded">
            <Formik
                initialValues={getInitialValuesEvent(actualActivity.id.toString(), eventModified)}
                onSubmit={handleSubmit}
                validationSchema={eventValidationSchema}
            >
                {({ values, setFieldValue, validateForm }) => {
                    const newRiskLevel = calculateNewRiskLevel(
                        values.probability,
                        values.impact,
                        values.aptitude,
                        values.actitude,
                    )
                    return (
                        <Form>
                            {followModule ? (
                                <ProposedActions
                                    handleSubmit={handleSubmit}
                                    handleSubmitAndClose={handleSubmitAndClose}
                                    setFollowModule={setFollowModule}
                                    values={values}
                                />
                            ) : (
                                <>
                                    {validationErrors.length > 0 && (
                                        <div ref={errorContainerRef} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                            <div className="flex items-center mb-2">
                                                <BiErrorCircle className="text-red-500 mr-2" size={20} />
                                                <h3 className="font-semibold text-sm">Por favor complete los siguientes campos:</h3>
                                            </div>
                                            <ul className="list-disc pl-5 text-xs space-y-1">
                                                {validationErrors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded p-4">
                                        <div className="mb-6"></div>
                                        <div className="mb-6">
                                            <label className="flex items-center text-sm font-semibold mb-2 text-gray-800">
                                                <AiOutlineExclamationCircle className="mr-2 text-blue-500 text-xl" />
                                                Evento (¿Qué es lo que puede suceder?)
                                            </label>
                                            <Field
                                                className="w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 transition-all"
                                                name="description"
                                                as="textarea"
                                                placeholder="Describe el evento posible..."
                                                required
                                            />
                                            <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div className="mb-6">
                                            <label className="flex items-center text-sm font-semibold mb-2 text-gray-800">
                                                <AiOutlineTool className="mr-2 text-green-500 text-xl" />
                                                Causa (¿Qué causas hacen que suceda el evento?)
                                            </label>
                                            <Field
                                                className="w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                                                name="causes"
                                                as="textarea"
                                                placeholder="Especifica las causas posibles..."
                                                required
                                            />
                                            <ErrorMessage name="causes" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div className="mb-6">
                                            <label className="flex items-center text-sm font-semibold mb-2 text-gray-800">
                                                <AiOutlineWarning className="mr-2 text-red-500 text-xl" />
                                                Consecuencias (¿Qué consecuencias podrían ocurrir?)
                                            </label>
                                            <Field
                                                className="w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                                name="consequences"
                                                as="textarea"
                                                placeholder="Indica las consecuencias probables..."
                                                required
                                            />
                                            <ErrorMessage name="consequences" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-4">
                                            <div className="w-full relative">
                                                <label htmlFor="event_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                    <span className="flex items-center gap-2 font-bold">
                                                        <MdCategory className="text-blue-500" />
                                                        Tipo de evento
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <Field
                                                        as="select"
                                                        name="event_type_id"
                                                        id="event_type_id"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                    >
                                                        <option disabled value="0" className="text-gray-400">
                                                            Seleccione una opción
                                                        </option>
                                                        {eventTypes
                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                            .map((type) => (
                                                                <option key={type.id} value={type.id}>
                                                                    {type.name}
                                                                </option>
                                                            ))}
                                                    </Field>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <MdCategory className="text-blue-400" />
                                                    </div>
                                                </div>
                                                <ErrorMessage name="event_type_id" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            <div className="w-full">
                                                <Field name="event_type_id">
                                                    {({ field, form }: { field: any; form: any }) => {
                                                        const selectedType = eventTypes.find((type) => type.id == field.value)
                                                        const classifications = selectedType
                                                            ? selectedType.classifications.sort((a, b) =>
                                                                  a.description.localeCompare(b.description)
                                                              )
                                                            : []

                                                        return (
                                                            <div className="relative">
                                                                <label
                                                                    htmlFor="event_classification_id"
                                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                                >
                                                                    <span className="flex items-center gap-2 font-bold">
                                                                        <FaListAlt className="text-blue-500" />
                                                                        Clasificación
                                                                    </span>
                                                                </label>
                                                                <div className="relative">
                                                                    <Field
                                                                        as="select"
                                                                        name="event_classification_id"
                                                                        id="event_classification_id"
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                                    >
                                                                        <option disabled value="0" className="text-gray-400">
                                                                            Seleccione una opción
                                                                        </option>
                                                                        {classifications.map((classification) => (
                                                                            <option key={classification.id} value={classification.id}>
                                                                                {classification.description}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <FaListAlt className="text-blue-400" />
                                                                    </div>
                                                                </div>
                                                                <ErrorMessage
                                                                    name="event_classification_id"
                                                                    component="div"
                                                                    className="text-red-500 text-xs mt-1"
                                                                />
                                                            </div>
                                                        )
                                                    }}
                                                </Field>
                                            </div>

                                            <div className="w-full">
                                                <Field name="event_classification_id">
                                                    {({ field, form }: { field: any; form: any }) => {
                                                        const selectedType = eventTypes.find((type) => type.id == form.values.event_type_id)
                                                        const selectedClassification = selectedType
                                                            ? selectedType.classifications.find((classification) => classification.id == field.value)
                                                            : null
                                                        const specifications = selectedClassification
                                                            ? selectedClassification.specifications.sort((a, b) =>
                                                                  a.description.localeCompare(b.description)
                                                              )
                                                            : []

                                                        return (
                                                            <div className="relative">
                                                                <label
                                                                    htmlFor="event_specification_id"
                                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                                >
                                                                    <span className="flex items-center gap-2 font-bold">
                                                                        <HiOutlineClipboardList className="text-blue-500" />
                                                                        Especificación
                                                                    </span>
                                                                </label>
                                                                <div className="relative">
                                                                    <Field
                                                                        as="select"
                                                                        name="event_specification_id"
                                                                        id="event_specification_id"
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                                    >
                                                                        <option disabled value="0" className="text-gray-400">
                                                                            Seleccione una opción
                                                                        </option>
                                                                        {specifications.map((specification) => (
                                                                            <option key={specification.id} value={specification.id}>
                                                                                {specification.description}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <HiOutlineClipboardList className="text-blue-400" />
                                                                    </div>
                                                                </div>
                                                                <ErrorMessage
                                                                    name="event_specification_id"
                                                                    component="div"
                                                                    className="text-red-500 text-xs mt-1"
                                                                />
                                                            </div>
                                                        )
                                                    }}
                                                </Field>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-4">
                                            <div className="w-full relative">
                                                <label htmlFor="probability" className="block text-sm font-medium text-green-700 mb-1">
                                                    <span className="flex items-center gap-2 font-bold">
                                                        <GiDiceSixFacesFive className="text-green-500" />
                                                        Probabilidad
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        id="probability"
                                                        name="probability"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                        value={values.probability}
                                                        onChange={(e) => {
                                                            const value = Number.parseInt(e.target.value)
                                                            setFieldValue("probability", value)
                                                            setFieldValue("risk_level", parseRiskLevel(calculateRiskLevel(value * values.impact)))
                                                            setFieldValue(
                                                                "new_risk_level",
                                                                parseRiskLevel(
                                                                    calculateNewRiskLevel(value, values.impact, values.aptitude, values.actitude),
                                                                ),
                                                            )
                                                            if (parseRiskLevel(calculateNewRiskLevel(values.probability, values.impact, values.aptitude, values.actitude)) === "low") {
                                                                setFieldValue("proposed_actions", [])
                                                            }
                                                        }}
                                                    >
                                                        <option disabled value="0" className="text-gray-400">
                                                            Seleccione una opción
                                                        </option>
                                                        <option value="1">Bajo</option>
                                                        <option value="2">Medio</option>
                                                        <option value="3">Alto</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <GiDiceSixFacesFive className="text-blue-400" />
                                                    </div>
                                                </div>
                                                <ErrorMessage name="probability" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            <div className="w-full relative">
                                                <label htmlFor="impact" className="block text-sm font-medium text-red-700 mb-1">
                                                    <span className="flex items-center gap-2 font-bold">
                                                        <RiErrorWarningLine className="text-red-500" />
                                                        Impacto
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        id="impact"
                                                        name="impact"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                        value={values.impact}
                                                        onChange={(e) => {
                                                            const value = Number.parseInt(e.target.value)
                                                            setFieldValue("impact", value)
                                                            setFieldValue(
                                                                "risk_level",
                                                                parseRiskLevel(calculateRiskLevel(values.probability * value)),
                                                            )
                                                            setFieldValue(
                                                                "new_risk_level",
                                                                parseRiskLevel(
                                                                    calculateNewRiskLevel(values.probability, value, values.aptitude, values.actitude),
                                                                ),
                                                            )
                                                            if (parseRiskLevel(calculateNewRiskLevel(values.probability, values.impact, values.aptitude, values.actitude)) === "low") {
                                                                setFieldValue("proposed_actions", [])
                                                            }
                                                        }}
                                                    >
                                                        <option disabled value="0" className="text-gray-400">
                                                            Seleccione una opción
                                                        </option>
                                                        <option value="1">Bajo</option>
                                                        <option value="2">Medio</option>
                                                        <option value="3">Alto</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <RiErrorWarningLine className="text-blue-400" />
                                                    </div>
                                                </div>
                                                <ErrorMessage name="impact" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>
                                            <RiskLevelIndicator
                                                label="Nivel de riesgo"
                                                level={calculateRiskLevel(values.probability * values.impact)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <p className="font-bold text-gray-700 text-sm mb-1 flex items-center gap-2">
                                                <FaListAlt className="text-blue-500" />
                                                Medidas de Control Existentes
                                            </p>
                                            <Field
                                                className="w-full p-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                name="existent_control_measures"
                                                type="text"
                                                as="textarea"
                                            />
                                            <ErrorMessage
                                                name="existent_control_measures"
                                                component="div"
                                                className="text-red-500 text-sm mt-1"
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-4">
                                            {/* Aptitud */}
                                            <div className="w-full relative">
                                                <label htmlFor="aptitude" className="block text-sm font-medium mb-1">
                                                    <span className="flex items-center gap-2 font-bold text-gray-700">
                                                        <BsPersonCheck
                                                            className={`${values.aptitude === "positive" ? "text-green-500" : values.aptitude === "negative" ? "text-red-500" : "text-gray-400"}`}
                                                        />
                                                        Aptitud
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        id="aptitude"
                                                        name="aptitude"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                        value={values.aptitude}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            setFieldValue("aptitude", value)
                                                            setFieldValue(
                                                                "new_risk_level",
                                                                parseRiskLevel(
                                                                    calculateNewRiskLevel(values.probability, values.impact, value, values.actitude),
                                                                ),
                                                            )
                                                            if (parseRiskLevel(calculateNewRiskLevel(values.probability, values.impact, values.aptitude, values.actitude)) === "low") {
                                                                setFieldValue("proposed_actions", [])
                                                            }
                                                        }}
                                                    >
                                                        <option disabled value="0">
                                                            Seleccione una opción
                                                        </option>
                                                        <option value="positive">Positivo</option>
                                                        <option value="negative">Negativo</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <BsPersonCheck
                                                            className={`${values.aptitude === "positive" ? "text-green-500" : values.aptitude === "negative" ? "text-red-500" : "text-gray-400"}`}
                                                        />
                                                    </div>
                                                </div>
                                                <ErrorMessage name="aptitude" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            {/* Actitud */}
                                            <div className="w-full relative">
                                                <label htmlFor="actitude" className="block text-sm font-medium mb-1">
                                                    <span className="flex items-center gap-2 font-bold text-gray-700">
                                                        <BsEmojiSmile
                                                            className={`${values.actitude === "positive" ? "text-green-500" : values.actitude === "negative" ? "text-red-500" : "text-gray-400"}`}
                                                        />
                                                        Actitud
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        id="actitude"
                                                        name="actitude"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
                                                        value={values.actitude}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            setFieldValue("actitude", value)
                                                            setFieldValue(
                                                                "new_risk_level",
                                                                parseRiskLevel(
                                                                    calculateNewRiskLevel(values.probability, values.impact, values.aptitude, value),
                                                                ),
                                                            )
                                                            if (parseRiskLevel(calculateNewRiskLevel(values.probability, values.impact, values.aptitude, values.actitude)) === "low") {
                                                                setFieldValue("proposed_actions", [])
                                                            }
                                                        }}
                                                    >
                                                        <option disabled value="0">
                                                            Seleccione una opción
                                                        </option>
                                                        <option value="positive">Positivo</option>
                                                        <option value="negative">Negativo</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <BsEmojiSmile
                                                            className={`${values.actitude === "positive" ? "text-green-500" : values.actitude === "negative" ? "text-red-500" : "text-gray-400"}`}
                                                        />
                                                    </div>
                                                </div>
                                                <ErrorMessage name="actitude" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            <RiskLevelIndicator label="Nuevo nivel de riesgo" level={newRiskLevel} />
                                        </div>
                                    </div>
                                    {values.new_risk_level === "low" ? (
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="submit"
                                                className="flex items-center transition-all justify-center py-2 px-3 bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:rounded"
                                            >
                                                Guardar <BiSave size={25} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSubmitAndClose(values)}
                                                className="flex items-center transition-all justify-center py-2 px-3 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white cursor-pointer hover:rounded ml-2"
                                            >
                                                Guardar y Cerrar <BiSave size={25} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex border border-yellow-600 text-yellow-600 my-4 items-center py-2 px-3 gap-2">
                                                <BiInfoCircle size={25} />
                                                <p>
                                                    Este riesgo requiere acciones pertinentes para su control, favor indicarlas en el módulo de
                                                    seguimiento utilizando la opción <span className="font-bold"> [Acciones Propuestas] </span>
                                                </p>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleGoToProposedActions(values, validateForm, setFieldValue)}
                                                    type="button"
                                                    className="flex items-center transition-all justify-center py-2 px-3 bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:rounded"
                                                >
                                                    Acciones Propuestas <BiRightArrowAlt size={25} />
                                                </button>
                                            </div>

                                        </>
                                    )}
                                </>
                            )}
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default EventForm
