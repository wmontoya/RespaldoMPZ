import React from 'react'
import {  useQuestionStore } from '../../../store/autoevaluationSurveys/answerToSave'
import { Section } from '@/types/autoevaluationSurvey'
import { FaCheck } from 'react-icons/fa'

function SurveyNavigator({ section }: { section: Section }) {
    const { currentQuestionIndex, setCurrentQuestionIndex } = useQuestionStore()
    if (!section || !section.questions?.length) return null
    return (
        <div className="text-xl font-bold mb-4 mt-2">
            <div className="text-lg font-bold rounded-md mb-3">Navigator Survey</div>
            <div className="grid grid-cols-5 gap-2 hidden sm:grid">
                {section.questions.map((question, qIndex) => {
                    const hasNoResponse = question.answers.some(answer => answer.response !==null );

                    return (
                        <button
                            key={question.id}
                            className={`p-2 text-center rounded-lg transition duration-300 
                                ${currentQuestionIndex === qIndex
                                    ? 'bg-green-500 text-white border-2 border-green-700'
                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                }
                                ${hasNoResponse ? 'bg-green-500 border-2 border-green-700' : ''}
                            `}
                            onClick={(e) => { e.preventDefault(); setCurrentQuestionIndex(qIndex) }}
                        >
                            {hasNoResponse ? (
                                <FaCheck className="w-4 h-4 mx-auto text-white" /> 
                            ) : (
                                qIndex + 1
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default SurveyNavigator;