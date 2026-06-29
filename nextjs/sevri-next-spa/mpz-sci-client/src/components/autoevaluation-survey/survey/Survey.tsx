import React, { useEffect, useState } from 'react'
import '@/components/mature-model/survey/Survey.css'
import { Axie, DepartmentSurvey, Section } from '@/types/autoevaluationSurvey'
import SectionNavigator from './SectionNavigator'
import { useSurveyState } from '@/store/autoevaluationSurveys/surveyStore'
import Question from './Question'
import NavigationButtons from '../navigationButtons/NavigationButtons'
import { useAutoevaluationState } from '@/store/autoevaluationSurveys/autoevaluationSurveysStore'
import { useGlobalState } from '@/store/globalState'
import { showConfirmAlert } from '@/utils'
import { BsCursor } from 'react-icons/bs'
import { autoevaluationIsCompleted } from '@/utils/util'
import Link from 'next/link'
import { BiArrowBack } from 'react-icons/bi'
import { Tooltip } from '@nextui-org/tooltip'
import { useSurveyStore,useQuestionStore  } from '../../../store/autoevaluationSurveys/answerToSave';
import SurveyNavigator from './SurveyNavigator'


function Survey({ axie }: { axie: Axie }) {
  const { actualSection, setActualSection } = useSurveyState()
  const [section, setSection] = useState<Section | null>(null)
  const { finishEvaluation, actualSurvey, actualAxie, setActualAxie, saveAnswer } = useAutoevaluationState()
  const { department_id } = useGlobalState()
  const { currentQuestionIndex, setCurrentQuestionIndex } = useQuestionStore()
  const answer = useSurveyStore((state) => state.answer);

  useEffect(() => {
    console.log('actualAxie', currentQuestionIndex)
  }, [currentQuestionIndex])

  useEffect(() => {
    if (axie) setActualAxie(axie)
  }, [axie])

  useEffect(() => {
    if (!actualAxie) return
    const foundSection = actualAxie.sections.find(section => section.id === actualSection) || null
    setSection(foundSection)
    setCurrentQuestionIndex(0)
  }, [actualSection, actualAxie])

  const finishSurvey = async () => {
    const data: DepartmentSurvey = {
      department_id: department_id,
      survey_id: actualSurvey.id,
      score: 0,
      status: 'finished'
    }
    await finishEvaluation(data)
  }

  const save = async () => {
    if (answer) {
      const result = await saveAnswer(answer)
      if (!result) {
        showConfirmAlert("Error al enviar respuesta", "", () =>
          console.error('Error al enviar respuesta')
        )
        return false
      }
    }
    return true
  }

  const sendSurvey = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    showConfirmAlert(
      "¿Estás seguro de que deseas enviar esta encuesta?",
      "Esta acción no se puede deshacer",
      () => finishSurvey()
    )
  }

  const nextQuestion = async () => {
    if (!section) return
    const saved = await save()
    if (!saved) return

    if (currentQuestionIndex < section.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      nextSectionOrAxie()
    }
  }

  const prevQuestion = async () => {
    if (!section) return
    const saved = await save()
    if (!saved) return
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      prevSectionOrAxie()
    }
  }

  const nextSectionOrAxie = () => {
    const sectionIds = actualAxie?.sections.map(sec => sec.id) || []
    const currentSectionIndex = sectionIds.indexOf(actualSection)

    if (currentSectionIndex < sectionIds.length - 1) {
      setActualSection(sectionIds[currentSectionIndex + 1])
    } else {
      const axieList = actualSurvey.axies
      const currentAxieIndex = axieList.findIndex(a => a.id === actualAxie?.id)

      if (currentAxieIndex < axieList.length - 1) {
        const nextAxie = axieList[currentAxieIndex + 1]
        setActualAxie(nextAxie)
        setActualSection(nextAxie.sections[0]?.id ?? sectionIds[0])
      }
    }
  }

  const prevSectionOrAxie = () => {
    const sectionIds = actualAxie?.sections.map(sec => sec.id) || []
    const currentSectionIndex = sectionIds.indexOf(actualSection)

    if (currentSectionIndex > 0) {
      setActualSection(sectionIds[currentSectionIndex - 1])
    } else {
      const axieList = actualSurvey.axies
      const currentAxieIndex = axieList.findIndex(a => a.id === actualAxie?.id)

      if (currentAxieIndex > 0) {
        const prevAxie = axieList[currentAxieIndex - 1]
        setActualAxie(prevAxie)
        setActualSection(prevAxie.sections[prevAxie.sections.length - 1]?.id ?? sectionIds[0])
      }
    }
  }

  return (
    <form className="w-full bg-gray-100 border text-primary-600 justify-center py-4 px-8 rounded-lg shadow-md shadow-gray-300">
  <div className='flex justify-between'>
    <div className="flex justify-center mt-2">
      <Link
        href={"/autoevaluation-surveys"}
        className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"
      >
        <BiArrowBack />
      </Link>
    </div>
    {autoevaluationIsCompleted(actualSurvey, department_id) && (
      <Tooltip content="Finalizar">
        <button
          type='button'
          className='bg-orange-600 hover:bg-orange-700 text-white rounded py-1 px-2 items-center aligment-center'  
          onClick={sendSurvey}
        >  Finalizar Encuesta
        </button>
      </Tooltip>
    )}
  </div>

  <legend className='text-center text-xl font-extrabold'>{axie.title}</legend>
  <SectionNavigator axie={actualAxie} />

  <div className='space-y-4 min-h-56 mt-10 flex flex-row'>
    <div className="hidden lg:block w-1/6 p-4 mt-4 rounded-lg shadow-md bg-white mr-5 mb-4">
      {section && <SurveyNavigator section={section} />}
    </div>
    <div className="w-full lg:w-5/6 p-4 ">
      {section?.questions.length && (
        <Question
          key={section.questions[currentQuestionIndex].id}
          question={section.questions[currentQuestionIndex]}
        />
      )}
    </div>
  </div>
  <NavigationButtons next={nextQuestion} prev={prevQuestion} />
</form>

  )
}
export default Survey
