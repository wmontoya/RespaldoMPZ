
import React from 'react'
import { useSurveyState } from '@/store/autoevaluationSurveys/surveyStore'
import { Axie } from '@/types/autoevaluationSurvey'
function SectionNavigator({ axie }: { axie: Axie }) {
    const { actualSection, setActualSection } = useSurveyState()

    return (
        <div className="radio-inputs mt-5 overflow-auto">
            {axie.sections.map(section => (
                <label className="radio" key={section.id}>
                    <input checked={actualSection == section.id} onChange={() => setActualSection(section.id)} type="radio" name="radio" />
                    <span className="name">{section.title}</span>
                </label>
            ))}
        </div>
    )
}

export default SectionNavigator