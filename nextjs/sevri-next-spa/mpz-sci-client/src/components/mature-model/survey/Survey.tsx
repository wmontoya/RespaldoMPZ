import React, { useEffect, useState } from 'react'

import './Survey.css'
import { BsCursor } from 'react-icons/bs'
import SectionNavigator from './SectionNavigator'
import QuestionNavigator from './QuestionNavigator'
import { showConfirmAlert } from '@/utils'
import Button from '../../globals/button/Button'
import { useEvaluationState } from '@/store/matureModel/evaluationStore'
import { useSurveyState } from '@/store/matureModel/surveyStore'
import NavigationButtons from '../navigationButtons/NavigationButtons'
import Option from './Option'
import { calculateScore, evaluationIsCompleted, getQuestionAnswer } from '@/utils/util'
import { DepartmentEvaluation } from '@/types'
import { AnswerQueueData } from '@/types/fetch'
import { useGlobalState } from '@/store/globalState'
import { useDisclosure } from '@nextui-org/modal'
import ProposedActionsForm from './ProposedActionsForm'
import Modal from '@/components/globals/Modal'
import { Tooltip } from '@nextui-org/tooltip'
import { FaPlus } from 'react-icons/fa'

function Survey() {
  const { actualEvaluation, finishEvaluation } = useEvaluationState()
  const { actualQuestion, setQuestionAnswer, setActualQuestion } = useSurveyState()
  const { department_id } = useGlobalState()
  const [answersQueue, setAnswersQueue] = useState<AnswerQueueData[]>([])
  const { isOpen, onClose, onOpen } = useDisclosure()
  useEffect(() => {
    setQuestionAnswer(getQuestionAnswer(actualQuestion, department_id, actualEvaluation.id))
  }, [actualQuestion])
  useEffect(() => {
    const question = actualEvaluation.sections.flatMap(section => section.questions).find(question => question.id === actualQuestion.id)
    if (question) {
      setActualQuestion(question)
    }
  }, [actualEvaluation])
  const finishSurvey = async () => {
    const data: DepartmentEvaluation = {
      department_id: department_id,
      evaluation_id: actualEvaluation.id,
      score: calculateScore(actualEvaluation, department_id),
      state: 'finished'
    }
    await finishEvaluation(data)
  }
  const sendSurvey = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    showConfirmAlert("¿Estás seguro de que deseas enviar esta encuesta?", "Esta acción no se puede deshacer", () => finishSurvey())
  }
  return (
    <form className="w-full bg-white border text-primary-600 justify-center py-4 px-8 rounded-lg shadow-md shadow-gray-300">
      <div className='flex justify-between'>
        <Tooltip className='capitalize' content="Agregar Acciones Propuestas">
          <button type='button' className='bg-green-600 hover:bg-green-700 text-white rounded py-1 px-2' onClick={onOpen}><FaPlus size={20} /></button>
        </Tooltip>
        <Tooltip content="Finalizar">
          <button type='button' className='bg-primary-700 hover:bg-primary-800 text-white rounded py-1 px-2' onClick={sendSurvey}><BsCursor size={20} /></button>
        </Tooltip>
      </div>
      <legend className='text-center text-xl font-extrabold'>{actualEvaluation.title}</legend>
      <SectionNavigator />
      {
        <>
          <h4 className='font-bold text-lg my-2'>{actualQuestion?.title}</h4>
          <p className='text-dark_primary-200 mb-2'>{actualQuestion.description}</p>
        </>
      }
      <div className='space-y-4 min-h-56'>
        {actualQuestion.options && actualQuestion?.options.map(option => (
          <Option
            answersQueue={answersQueue}
            setAnswersQueue={setAnswersQueue}
            key={option.id}
            option={option}
          />
        ))}
      </div>
      <QuestionNavigator />
      <NavigationButtons />
      <Modal size='full' isOpen={isOpen} onClose={onClose} id='addProposedActionModal' title='Acciones Propuestas'>
        <ProposedActionsForm onClose={onClose} />
      </Modal>
    </form>
  )
}

export default Survey