
import { Survey } from "@/types/autoevaluationSurvey";
import * as Yup from "yup";
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
export const proposedActionsValidationSchema = Yup.object({
    proposed_actions: Yup.array().of(Yup.object().shape({
        description: Yup.string().required('La descripción es requerida'),
        indicators: Yup.string().required('Los indicadores son requeridos'),
        responsible_name: Yup.string().notOneOf(["0"], 'Se debe asignar un responsable').required('El responsable es requerido'),
        accomplishment_level: Yup.string().required('El nivel de cumplimiento es requerido'),
        // justification: Yup.string().required('La justificación es requerida'),
        action_date: Yup.date().required('La fecha de acción es requerida').min(new Date(), "La fecha de acción no  puede ser anterior o igual al dia de hoy").max(oneYearFromNow, 'La fecha de acción no puede exceder un año a partir de hoy')
    }))
});
export const getInitialValuesProposedActions = (survey: Survey) => {
    return {
        proposed_actions: survey.proposed_actions || [],
    } as unknown as Survey
}
