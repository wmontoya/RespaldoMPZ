import { Evaluation } from "@/types";


export const matureFormat = (evaluation: Evaluation): boolean =>
    evaluation.sections &&
    evaluation.sections.length >= 4 &&
    evaluation.sections.every(section =>
        section.questions &&
        section.questions.length >= 3 &&
        section.questions.every(question =>
            question.options &&
            question.options.length >= 5
        )
    );

export const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
        description: "Evento",
        causes: "Causa",
        consequences: "Consecuencias",
        event_type_id: "Tipo de evento",
        event_classification_id: "Clasificación",
        event_specification_id: "Especificación",
        probability: "Probabilidad",
        impact: "Impacto",
        aptitude: "Aptitud",
        actitude: "Actitud",
        existent_control_measures: "Medidas de Control Existentes",
    }

    return fieldLabels[fieldName] || fieldName
}