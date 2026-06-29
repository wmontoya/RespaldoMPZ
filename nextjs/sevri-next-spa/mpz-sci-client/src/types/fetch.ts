export type MethodType = "GET" | "POST" | "PUT" | "DELETE";
export interface BodyType {
    method: MethodType,
    body: string
}
export interface AnswerQueueData{
    action: MethodType,
    question_id: number,
  }