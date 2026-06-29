export interface Survey {
  id: number;
  title: string;
  description: string;
  departments: Department[];
  axies: Axie[];
  initial_date: Date;
  final_date: Date;
  proposed_actions: ProposedAction[];
}
export interface ProposedAction {
  id: number;
  user_id: number;
  survey_id: number;
  description: string;
  indicators: string;
  responsible_email: string;
  responsible_name: string;
  accomplishment_level: "yes" | "no" | "partial";
  justification: string;
  action_date: Date;

}
export interface Department {
  id: number;
}
export interface Axie {
  id: number;
  title: string;
  survey_id: number;
  description: string;
  sections: Section[];
}
export interface Section {
  id: number;
  title: string;
  survey_id: number;
  questions: Question[];
  description: string;
  selected: boolean
}

export interface Question {
  id: number;
  title: string;
  description: string;
  section_id: number;
  answers: Answer[];
}



export interface Answer {
  response: ResponseType;
  document: string;
  file_name: string;
  mime_type: string;
  observations: string;
  question_id: number;
  axie_id: number;
  survey_id: number;
  department_id: number;
  id: number;
}
export interface DepartmentSurvey {
  department_id: number;
  survey_id: number;
  status: "pending" | "completed" | "finished";
  score: number;
}
type ResponseType = "yes" | "no";
