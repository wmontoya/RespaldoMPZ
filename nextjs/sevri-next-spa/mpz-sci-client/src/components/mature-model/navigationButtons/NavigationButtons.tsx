import { useEvaluationState } from '@/store/matureModel/evaluationStore'
import { useSurveyState } from '@/store/matureModel/surveyStore'
import React, { useEffect, useState } from 'react'
import Button from '../../globals/button/Button'
import { BsCaretLeft, BsCaretRight } from 'react-icons/bs'
import { useShortcutEvent } from '@/hooks/useShortCutEvent'
import { getLastQuestionWithoutAnswer } from '@/utils/util'
import { useGlobalState } from '@/store/globalState'

function NavigationButtons() {
    const { actualEvaluation } = useEvaluationState()
    const questionIds = actualEvaluation.sections.flatMap(section => section.questions.map(question => question.id))
    const { actualQuestion, setActualQuestion } = useSurveyState()
    const { department_id } = useGlobalState()
    const lastQuestion = getLastQuestionWithoutAnswer(actualEvaluation, department_id)
    const [questionId, setQuestionId] = useState(lastQuestion?.id ?? questionIds[0])
    useShortcutEvent('ArrowRight', () => setQuestionId(questionIds[questionIds.indexOf(questionId) + 1] ?? questionIds[0]))
    useShortcutEvent('ArrowLeft', () => setQuestionId(questionIds[questionIds.indexOf(questionId) - 1] ?? questionIds[questionIds.length - 1]))
    useEffect(() => {
        setQuestionId(actualQuestion.id)
    }, [actualQuestion])
    useEffect(() => {
        const question = actualEvaluation?.sections.flatMap(section => section.questions).find(question => question.id === questionId)
        if (question) {
            setActualQuestion(question)
        }
    }, [questionId])

    return (
        <div className='flex gap-4 justify-end mt-5'>
            {actualQuestion.id && <>
                <Button onClick={() => setQuestionId(questionIds[questionIds.indexOf(questionId) - 1] ?? questionIds[questionIds.length - 1])} type='button' direction='left'><BsCaretLeft size={20} /> Anterior</Button>
                <Button type='button' onClick={() => setQuestionId(questionIds[questionIds.indexOf(questionId) + 1] ?? questionIds[0])} direction='right'>Siguiente <BsCaretRight size={20} /></Button>
            </>}

        </div>
    )
}

export default NavigationButtons