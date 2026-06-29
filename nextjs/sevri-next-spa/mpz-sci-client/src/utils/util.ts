import { Evaluation, Question } from "@/types"
import { Survey } from "@/types/autoevaluationSurvey";
import { AnswerQueueData, MethodType } from "@/types/fetch";
export const getQuestionAnswer = (question: Question, departmentId: number, evaluationId: number) => {
    if (question.options) {
        const validAnswers = question.options
            .flatMap(option => option.answers)
            .filter(answer => answer && answer.department_id === departmentId && answer.evaluation_id === evaluationId);
        return validAnswers.length > 0 ? validAnswers[0] : null;
    }
    return null;
}

export const getLastQuestionWithoutAnswer = (evaluation: Evaluation, department_id: number): Question | undefined => {
    const questionWithoutAnswer = evaluation.sections.reduce<Question | undefined>((acc, section) => {
        if (acc) return acc;
        const foundQuestion = section.questions.find(question => question.options.every(option => option.answers.every(answer => answer.department_id !== department_id || answer.evaluation_id !== evaluation.id)));
        return foundQuestion || acc;
    }, undefined);
    return questionWithoutAnswer;
};
export const calculateScore = (evaluation: Evaluation, department_id: number): number => {
    const department = evaluation.departments.find(department => department.id === department_id);
    if (!department) return 0;
    const answers = evaluation.sections.flatMap(section => section.questions).flatMap(question => question.options).flatMap(option => option.answers).filter(answer => answer.department_id === department_id && answer.evaluation_id === evaluation.id);
    const score = answers.reduce((acc, answer) => {
        const option = evaluation.sections.flatMap(section => section.questions).flatMap(question => question.options).find(option => option.id === answer.option_id);
        return acc + (option ? Number(option.value) : 0);
    }, 0);
    const maxScore = answers.length * 5;
    return (score / maxScore) * 100;
}
export const evaluationIsCompleted = (evaluation: Evaluation, department_id: number): boolean => {
    const answers = evaluation.sections.flatMap(section => section.questions).flatMap(question => question.options).flatMap(option => option.answers).filter(answer => answer.department_id === department_id && answer.evaluation_id === evaluation.id);
    return answers.length === evaluation.sections.flatMap(section => section.questions).length
}
export const autoevaluationIsCompleted = (evaluation: Survey, department_id: number): boolean => {
    // Obtener todas las preguntas de la evaluación
    const allQuestions = evaluation.axies.flatMap(axie =>
        axie.sections.flatMap(section =>
            section.questions.map(question => ({
                axie_id: axie.id,
                section_id: section.id,
                question_id: question.id
            }))
        )
    );

    // Obtener todas las respuestas del departamento para la evaluación
    const departmentAnswers = evaluation.axies.flatMap(axie =>
        axie.sections.flatMap(section =>
            section.questions.flatMap(question =>
                question.answers.filter(answer =>
                    answer.department_id === department_id && answer.survey_id === evaluation.id
                )
            )
        )
    );

    // Verificar si cada pregunta tiene una respuesta correspondiente
    const isCompleted = allQuestions.every(question => 
        departmentAnswers.some(answer =>
            answer.axie_id === question.axie_id &&
            // answer. === question.section_id &&
            answer.question_id === question.question_id
        )
    );

    return isCompleted;
}
export const verifyAnswerQueue = (question_id: number, action: MethodType, answersQueue: AnswerQueueData[]) => answersQueue.find(answer => answer.question_id === question_id && answer.action === action)