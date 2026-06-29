import React, { useEffect, useState } from 'react'
import { Section } from '@/types'
import { QuestionBadge } from '../formNavigator'
import { useEvaluationState } from '@/store/matureModel/evaluationStore'
import { useSurveyState } from '@/store/matureModel/surveyStore'
function QuestionNavigator() {

  const [actualSection, setActualSection] = useState<Section>()
  const { actualEvaluation } = useEvaluationState()
  const { actualQuestion } = useSurveyState()
  useEffect(() => {
    const section = actualEvaluation.sections.find(section => section.questions.find(question => question.id === actualQuestion.id))
    setActualSection(section)
  }, [actualQuestion])
  return (
    <div className=" bg-white border text-primary-600  py-2 px-3 rounded-lg shadow-md shadow-gray-300 mx-auto w-56 my-5">
      <div className='flex sm:justify-between justify-center gap-5'>
        {actualSection?.questions.map((question, index) => (
          <QuestionBadge numberBadge={index + 1} key={question.id} question={question} />
        ))}
      </div>
    </div>
  )
}

export default QuestionNavigator