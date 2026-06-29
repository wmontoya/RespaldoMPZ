import { useSurveyState } from '@/store/matureModel/surveyStore'
import { Question } from '@/types/autoevaluationSurvey'
import React from 'react'
import { BsCheck2Circle } from 'react-icons/bs'
function QuestionBadge({ question, numberBadge }: { question: Question, numberBadge: number }) {
    const { actualQuestion } = useSurveyState()
    const unansweredStyle = 'rounded-md border-primary-600 border hover:text-white transition-all hover:bg-primary-500 text-primary-600'
    const answeredStyle = 'rounded-md bg-green-500 hover:bg-green-400 text-green-100'
    const selectedStyle = 'rounded-md bg-primary-600 text-white'
    const selected = question.id === actualQuestion.id
    const answered = false
    return (
        <button type='button'
            className={`py-1 px-2 rounded ${selected ? selected : answered ? answeredStyle : unansweredStyle} ${selected && selectedStyle}`}>
            {answered && !selected ? <BsCheck2Circle /> : numberBadge}
        </button>
    )
}

export default QuestionBadge