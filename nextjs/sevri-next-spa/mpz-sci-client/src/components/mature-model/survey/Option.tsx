import { useGlobalState } from '@/store/globalState'
import { useEvaluationState } from '@/store/matureModel/evaluationStore'
import { useSurveyState } from '@/store/matureModel/surveyStore'
import { Answer, Option as OptionData } from '@/types'
import { AnswerQueueData } from '@/types/fetch'
import { showInfoAlert } from '@/utils'
import { verifyAnswerQueue } from '@/utils/util'
import React from 'react'

function Option({ option, answersQueue, setAnswersQueue }: { option: OptionData, answersQueue: AnswerQueueData[], setAnswersQueue: (value: AnswerQueueData[]) => void }) {
    const { createAnswer, updateAnswer, actualEvaluation } = useEvaluationState()
    const { questionAnswer, setQuestionAnswer } = useSurveyState()
    const { department_id } = useGlobalState()
    const saveOption = async () => {
        if (option.id === questionAnswer?.option_id) return
        const answer: Answer = {
            option_id: option.id,
            department_id: department_id,
            evaluation_id: actualEvaluation.id
        }
        if (questionAnswer?.id) {
            setAnswersQueue([...answersQueue, { question_id: option.question_id.id, action: "PUT" }])
            handleUpdate(answer, questionAnswer?.id)
        } else if (!questionAnswer && !verifyAnswerQueue(option.question_id.id, "POST", answersQueue)) {
            setAnswersQueue([...answersQueue, { question_id: option.question_id.id, action: "POST" }])
            handleCreate(answer)
        }
        setQuestionAnswer({ ...answer })
    }
    const handleUpdate = async (answer: Answer, id: number) => {
        const response = await updateAnswer(answer, id)
        if (!response) {
            showInfoAlert("Algo salió mal", "Error al actualizar la respuesta")
        }
    }
    const handleCreate = async (answer: Answer) => {
        const response = await createAnswer(answer)
        if (!response) {
            showInfoAlert("Algo salió mal", "Error al crear la respuesta")
        }
    }
    return (
        <div onClick={saveOption} key={option.id} className={`rounded-lg bg-gray-50 transition-all hover:scale-[1.03] cursor-pointer shadow  py-4 px-8 ${questionAnswer?.option_id === option.id ? "bg-primary-600 text-white" : "active:bg-gray-100 active:shadow-none hover:bg-gray-100"}`}>
            <div>
                <p>{option.description}</p>
            </div>
        </div>
    )
}

export default Option