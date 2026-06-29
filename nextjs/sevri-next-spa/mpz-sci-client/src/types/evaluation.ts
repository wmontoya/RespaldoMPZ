export interface Evaluation {
    id: number
    title: string
    initial_date: string
    final_date: string
    status: EvaluationStatus
    sections: Section[]
    departments: Department[]
    proposed_actions: ProposedAction[]
}
export interface Department {
    id: number
    name: string
    evaluation_id: number
    answers: Answer[]
}
export interface Section {
    id: number
    name: string
    description: string
    questions: Question[]
}
export interface Question {
    id: number
    title: string
    options: Option[]
    section_id: number
    description: string
}
export interface Option {
    id: number,
    description: string,
    value: number
    question_id: Question,
    answers: Answer[]
}
export interface DepartmentEvaluation {
    department_id: number
    evaluation_id: number
    score: number
    state: string
}
export interface Answer {
    id?: number
    option_id: number
    department_id: number,
    evaluation_id: number,
}
export interface ProposedAction {
    id: number
    user_id: number
    evaluation_id: number
    description: string
    indicators: string
    responsible_email: string
    responsible_name: string
    accomplishment_level: 'yes' | 'no' | 'partial'
    justification: string
    action_date: Date
}
export type EvaluationStatus = 'active' | 'inactive'