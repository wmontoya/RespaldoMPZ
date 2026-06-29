import * as Yup from "yup";
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

export interface FileAttachment {
    attachment: string; 
    name: string;
    attachment_type: string;
}

export interface FollowUpFormProps {
    id?: number;
    description: string;
    indicators: string;
    observations: string;
    accomplishment_level: "yes" | "no" | "partial";
    evaluation_id?: number;
    survey_id?: number;
    event_id?: number;
    user_id?: number;
    responsible_name: string;
    responsible_email: string;
    action_date: Date;
    justification: string;
    modelType: "autoEvaluation" | "matureModel" | "sevri";

    attachments?: FileAttachment[]; // Cambia de uno solo a un arreglo
}

export const proposedActionsValidationSchema = Yup.object({
    // observations: Yup.string().required('Las observaciones son requeridas'),
    accomplishment_level: Yup.string().required('El nivel de cumplimiento es requerido'),
});

export const getInitialValuesProposedActions = (proposedAction: FollowUpFormProps) => {
    const initialValues = {
        id: proposedAction?.id,
        user_id: proposedAction?.user_id,
        observations: proposedAction?.observations || '',
        description: proposedAction?.description || '',
        accomplishment_level: proposedAction?.accomplishment_level || 'no',
        evaluation_id: proposedAction?.evaluation_id,
        survey_id: proposedAction?.survey_id,
        event_id: proposedAction?.event_id,
        modelType: proposedAction?.modelType,
    };

    return initialValues as FollowUpFormProps;
};