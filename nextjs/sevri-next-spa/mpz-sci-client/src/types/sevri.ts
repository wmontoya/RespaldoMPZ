type risk_level = "low" | "medium" | "high"
type positive_negative = "positive" | "negative"
type status_type = "active" | "inactive" | "in_progress" | "completed"
export interface SevriProcess {
    id: number
    activities: Activity[]
    initial_date: Date
    final_date: Date
    status: status_type
}
export interface ResponseAPI<T> {
    data: T
    status: number
    message: string
}
export interface Event {
    id: number
    activity_id: number
    description: string
    causes: string
    consequences: string
    event_type_id: number
    event_classification_id: number
    event_specification_id: number
    probability: number
    impact: number
    existent_control_measures: string
    risk_level: risk_level
    actitude: positive_negative
    aptitude: positive_negative
    new_risk_level: risk_level
    acceptance: "acceptable" | 'unacceptable'
    creation_date: string
    last_update: string
    status: status_type
    proposed_actions: ProposedAction[]

}
export interface Activity {
    id: number
    title: string
    subtitle: string
    activity_date: Date
    dependency: string
    procedure_to_follow: string
    events: Event[]
    department_id: number
    sevri_process_id: number
}
export interface EventType {
    id: number
    name: string
    description: string
    classifications: Classification[]
}
export interface Classification {
    id: number
    description: string
    specifications: Specification[]
}
export interface Specification {
    id: number
    description: string
    classification: number
    event: number
}
export interface ProposedAction {
    id: number
    event_id: number
    description: string
    indicators: string
    observation?: string
    attachments?: FileAttachment[]; 
    responsible_email: string
    responsible_name: string
    accomplishment_level: 'yes' | 'no' | 'partial'
    justification: string
    action_date: Date
}



export interface FileAttachment {
    attachment: string; 
    name: string;
    attachment_type: string;
}


export interface User {
    id: number
    email: string
    name: string
}