"use client";
import { useAutoevaluationState } from "@/store/autoevaluationSurveys/autoevaluationSurveysStore";
import Loader from "@/components/globals/loader/Loader";
import Card from "@/components/globals/card/Card";
import { AiTwotoneFund } from "react-icons/ai";
import Frame from "@/components/autoevaluation-survey/frame/Frame";
import { useGlobalState } from "@/store/globalState";
import { BiArrowBack } from "react-icons/bi";
import Link from "next/link";
import { useSurveyState } from "@/store/autoevaluationSurveys/surveyStore";
import Modal from "@/components/globals/Modal";
import ProposedActionsForm from "@/components/autoevaluation-survey/survey/ProposedActionsForm";
import { useDisclosure } from "@nextui-org/modal";
import { Tooltip } from "@nextui-org/tooltip";
import { FaPlus } from "react-icons/fa";

const AutoevaluationSurveysPage = () => {
  const { isOpen, onClose, onOpen } = useDisclosure()

  const { actualSurvey } = useAutoevaluationState()
  const { isLoading } = useSurveyState()
  const { department_id } = useGlobalState()
  if (isLoading) return (
    <>
      <h1 className="text-3xl text-center font-extrabold text-primary-600 w-full h-full mt-52">Cargando...</h1>
      <Loader />
    </>
  )
  if (actualSurvey.departments && !actualSurvey.departments.find((department) => department.id == department_id)) return (<div className="block justify-center h-full mt-52">
    <Card icon={<AiTwotoneFund size={30} color="green" />} title="No hay evaluaciones pendientes" description="Por ahora la empresa no está en proceso de evaluación, gracias por todo" />
    <div className="flex justify-center mt-2">
      <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
    </div>
  </div>)
  if (!isLoading && !actualSurvey.id) {
    return (<div className="block justify-center h-full mt-52">
      <Card icon={<AiTwotoneFund size={30} color="green" />} title="No hay evaluaciones pendientes" description="Por ahora la empresa no está en proceso de evaluación, gracias por todo" />
      <div className="flex justify-center mt-2">
        <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
      </div>
    </div>)
  }
  return (
    <section className={`mx-auto p-10 min-h-screen from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b text-white`}>
      <div className="flex justify-start mt-2">
        <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
      </div>
      <div className='flex justify-end mt-2'>
        <Tooltip content="Agregar Acciones Propuestas">
          <button type='button' className='bg-green-600 hover:bg-green-700 text-white rounded py-1 px-2' onClick={onOpen}><FaPlus size={20} /></button>
        </Tooltip>
      </div>
      <h1 className="text-4xl font-bold text-white py-6 text-center text-balance">{actualSurvey.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {actualSurvey.axies.filter(axie => axie.sections.length !== 0).map((axie) => (
          <Frame key={axie.id} link={`/autoevaluation-surveys/evaluation/axie/${axie.id}`} axie={axie} />
        ))}
      </div>
      <div >
      <Modal id='addProposedActionsAutoEvaluation' size='full' isOpen={isOpen} onClose={onClose} title='Acciones Propuestas'>
        <ProposedActionsForm onClose={onClose} />
      </Modal>
      </div>
    </section>
  );
};

export default AutoevaluationSurveysPage;
