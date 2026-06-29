import React from 'react'
// import QuestionBadge from './QuestionBadge'
import { Axie } from '@/types/autoevaluationSurvey'
import QuestionBadge from './QuestionBadge'

// import { useEvaluationState } from '@/store/matureModel/evaluationStore'
function FormNavigator({ axie }: { axie: Axie }) {
    // const { actualEvaluation } = useEvaluationState()
    const sections = axie.sections
    return (
        <div className="w-60 bg-dark  border text-primary-500 justify-center py-4 px-8 rounded-lg shadow-md shadow-gray-300">
            <div className="text-lg font-bold rounded-md">
                Navigator Survey
            </div>
            <div className="rounded-md space-y-1">
                {sections && sections?.map((section, index) => (
                    <div key={index}>
                        <h3>{section.title}</h3>
                        <div className='grid grid-cols-5 gap-1'>
                            {section.questions && section?.questions?.map((question, secondIndex) => (
                                <QuestionBadge
                                    key={((index) * section.questions.length + secondIndex) + 1}
                                    numberBadge={((index) * section.questions.length + secondIndex) + 1}
                                    question={question}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FormNavigator