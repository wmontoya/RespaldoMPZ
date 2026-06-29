import { Event } from '@/types/sevri';
import * as Yup from 'yup';
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
export const proposedActionsValidationSchema = Yup.object({
    description: Yup.string()
        .trim("La descripción no puede contener solo espacios")
        .required('La descripción es requerida'),
    indicators: Yup.string()
        .trim("Los indicadores no pueden contener solo espacios")
        .required('Los indicadores son requeridos'),
    responsible_name: Yup.string()
        .trim("El nombre del responsable no puede contener solo espacios")
        .notOneOf(["0"], 'Debe asignar un responsable válido')
        .required('El responsable es requerido'),
    action_date: Yup.date()
        .required('La fecha de acción es requerida')
        .min(new Date(), "La fecha de acción no puede ser anterior o igual al día de hoy")
        .max(oneYearFromNow, 'La fecha de acción no puede exceder un año a partir de hoy'),
});
export const eventValidationSchema = Yup.object({
    acceptance: Yup.string()
        .trim("La aceptación no puede contener solo espacios")
        .required('La aceptación es requerida'),
    actitude: Yup.string()
        .trim("La actitud no puede contener solo espacios")
        .not(["0"], "Debe seleccionar una actitud válida")
        .required('La actitud es requerida'),
    aptitude: Yup.string()
        .trim("La aptitud no puede contener solo espacios")
        .not(["0"], "Debe seleccionar una aptitud válida")
        .required('La aptitud es requerida'),
    causes: Yup.string()
        .trim("Las causas no pueden contener solo espacios")
        .required('Las causas son requeridas'),
    consequences: Yup.string()
        .trim("Las consecuencias no pueden contener solo espacios")
        .required('Las consecuencias son requeridas'),
    creation_date: Yup.string()
        .trim("La fecha de creación no puede contener solo espacios")
        .required('La fecha de creación es requerida'),
    description: Yup.string()
        .trim("La descripción no puede contener solo espacios")
        .required('La descripción es requerida'),
    event_classification_id: Yup.number()
        .not([0], "Debe seleccionar una clasificación válida")
        .required('La clasificación es requerida'),
    event_specification_id: Yup.number()
        .not([0], "Debe seleccionar una especificación válida")
        .required('La especificación es requerida'),
    event_type_id: Yup.number()
        .not([0], "Debe seleccionar un tipo de evento válido")
        .required('El tipo de evento es requerido'),
    impact: Yup.number()
        .not([0], "Debe seleccionar un impacto válido")
        .required('El impacto es requerido'),
    probability: Yup.number()
        .not([0], "Debe seleccionar una probabilidad válida")
        .required('La probabilidad es requerida'),
    risk_level: Yup.string()
        .trim("El nivel de riesgo no puede contener solo espacios")
        .required('El nivel de riesgo es requerido'),
    status: Yup.string()
        .trim("El estado no puede contener solo espacios")
        .required('El estado es requerido'),
    new_risk_level: Yup.string()
        .trim("El nuevo nivel de riesgo no puede contener solo espacios")
        .required('El nuevo nivel de riesgo es requerido'),
    proposed_actions: Yup.array().of(
        Yup.object().shape({
            description: Yup.string()
                .trim("La descripción no puede contener solo espacios")
                .required('La descripción es requerida'),
            indicators: Yup.string()
                .trim("Los indicadores no pueden contener solo espacios")
                .required('Los indicadores son requeridos'),
            responsible_name: Yup.string()
                .trim("El nombre del responsable no puede contener solo espacios")
                .notOneOf(["0"], 'Debe asignar un responsable válido')
                .required('El responsable es requerido'),
            action_date: Yup.date()
                .required('La fecha de acción es requerida')
                .min(new Date(), "La fecha de acción no puede ser anterior o igual al día de hoy")
                .max(oneYearFromNow, 'La fecha de acción no puede exceder un año a partir de hoy'),
        })
    ),
});
export const getInitialValuesEvent = (activity_id: string, editedEvent?: Event) => {
    return {
        activity_id: Number(activity_id),
        acceptance: editedEvent?.acceptance || "acceptable",
        actitude: editedEvent?.actitude || "0",
        aptitude: editedEvent?.aptitude || "0",
        causes: editedEvent?.causes || "",
        consequences: editedEvent?.consequences || "",
        creation_date: editedEvent?.creation_date || new Date().toISOString(),
        description: editedEvent?.description || "",
        event_classification_id: editedEvent?.event_classification_id || 0,
        event_specification_id: editedEvent?.event_specification_id || 0,
        event_type_id: editedEvent?.event_type_id || 0,
        id: editedEvent?.id || undefined,
        impact: editedEvent?.impact || 0,
        last_update: new Date().toISOString(),
        probability: editedEvent?.probability || 0,
        risk_level: editedEvent?.risk_level || "low",
        status: editedEvent?.status || "active",
        existent_control_measures: editedEvent?.existent_control_measures || "",
        new_risk_level: editedEvent?.new_risk_level || "low",
        proposed_actions: editedEvent?.proposed_actions || [],

    } as Event
}