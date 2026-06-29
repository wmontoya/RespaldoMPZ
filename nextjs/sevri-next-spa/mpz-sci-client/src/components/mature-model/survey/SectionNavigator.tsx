
import { useEvaluationState } from '@/store/matureModel/evaluationStore'
import { useSurveyState } from '@/store/matureModel/surveyStore'
import React, {  useEffect, useState } from 'react'
function SectionNavigator() {
    const [selectedSection, setSelectedSection] = useState(1)
    const { actualEvaluation } = useEvaluationState()
    const { actualQuestion, setActualQuestion } = useSurveyState()
    const selectSection = (sectionId: number) => {
        const section = actualEvaluation.sections.find(section => section.id === sectionId)
        if (section) {
            setActualQuestion(section.questions[0])
        }
    }
    useEffect(() => {
        const section = actualEvaluation.sections.find(section => section.questions.find(question => question.id === actualQuestion.id))
        setSelectedSection(section?.id || 1)
    }, [actualQuestion])

    return (
        <div className="radio-inputs mt-5 overflow-auto">
            {actualEvaluation?.sections.map(section => (
                <label className="radio" key={section.id}>
                    <input checked={selectedSection === section.id} onChange={() => selectSection(section.id)} type="radio" name="radio" />
                    <span className="name">{section.name}</span>
                </label>
            ))}
        </div>
    )
}

export default SectionNavigator