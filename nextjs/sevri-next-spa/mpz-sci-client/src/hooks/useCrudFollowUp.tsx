import { useRef, useState, useEffect } from 'react';
import { showInfoMixinAlert } from '@/utils';
import { useFollowUpState } from '@/store/follow_up/followUpStore';
import { FollowUpFormProps } from '@/utils/schemas/followUp/proposedActionsForm';
import { ProposedAction as MatureModelProposedActions } from "@/types";
import { ProposedAction as AutoEvaluationProposedAction } from "@/types/autoevaluationSurvey";
import { ProposedAction as SevriProposedActions } from "@/types/sevri";

const useCrudFollowUp = (proposedAction: FollowUpFormProps) => {
    const { updateSevriProposedAction, updateAutoEvaluationProposedAction, updateMatureModelProposedAction } = useFollowUpState();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (proposedAction.attachments?.length) {
            const loadedFiles = proposedAction.attachments.map(att => {
                return new File(
                    [Buffer.from(att.attachment, 'base64')], 
                    att.name, 
                    { type: att.attachment_type }
                );
            });
            setFiles(loadedFiles);
        }
    }, [proposedAction]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files)); 
        }
    };

    const handleFileRemove = (fileToRemove: File) => {
        setFiles(files.filter(file => file !== fileToRemove)); 
    };

    const handleSubmit = async (values: FollowUpFormProps) => {
        let fileData = {};
        if (files.length > 0) {
         
            const attachments = await Promise.all(
                files.map(async (file) => {
                    return {
                        attachment: Buffer.from(await file.arrayBuffer()).toString('base64'),
                        name: file.name,
                        attachment_type: file.type,
                    };
                })
            );
            fileData = { attachments };
        }

        values = { ...values, ...fileData };
        let response;
        if (values.modelType === "matureModel") {
            const data = {
                survey_id: proposedAction.survey_id,
                id: proposedAction.id,
                user_id: proposedAction.user_id,
                accomplishment_level: values.accomplishment_level,
                action_date: values.action_date,
                description: values.description,
                event_id: values.event_id,
                indicators: values.indicators,
                justification: values.justification,
                responsible_email: values.responsible_email,
                responsible_name: values.responsible_name,
                attachments: values.attachments, 
                observations: values.observations,
                evaluation_id: proposedAction.evaluation_id,
            } as MatureModelProposedActions;
            response = await updateMatureModelProposedAction(data);
        } else if (values.modelType === "autoEvaluation") {
            const data = {
                survey_id: proposedAction.survey_id,
                id: proposedAction.id,
                user_id: proposedAction.user_id,
                accomplishment_level: values.accomplishment_level,
                action_date: values.action_date,
                description: values.description,
                event_id: values.event_id,
                indicators: values.indicators,
                justification: values.justification,
                responsible_email: values.responsible_email,
                responsible_name: values.responsible_name,
                attachments: values.attachments, 
                observations: values.observations,
            } as AutoEvaluationProposedAction;
            response = await updateAutoEvaluationProposedAction(data);
        } else if (values.modelType === "sevri") {
            const data = {
                id: proposedAction.id,
                accomplishment_level: values.accomplishment_level,
                action_date: values.action_date,
                description: values.description,
                event_id: values.event_id,
                indicators: values.indicators,
                justification: values.justification,
                responsible_email: values.responsible_email,
                responsible_name: values.responsible_name,
                observations: values.observations,
                attachments: values.attachments, 
            } as SevriProposedActions;
            
            response = await updateSevriProposedAction(data);
        }
        if (!response) {
            showInfoMixinAlert("Error", "No se pudo actualizar la acción propuesta", "error");
            return false;
        }
        showInfoMixinAlert("Acción Propuesta Actualizada", "La acción propuesta ha sido actualizada exitosamente", "success", );
        return true;
    };

    return {
        handleSubmit,
        fileInputRef,
        file,
        setFile,
        files, 
        setFiles,
    };
};

export default useCrudFollowUp;