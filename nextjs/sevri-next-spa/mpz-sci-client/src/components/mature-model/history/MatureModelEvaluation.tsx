import React, { useState } from 'react';
import { Evaluation, Section, Question } from '@/types';
import { Tabs, Tab } from '@nextui-org/tabs';
import { useGlobalState } from '@/store/globalState';
import { AiOutlineCheck } from 'react-icons/ai';
import Link from 'next/link';
import { BiArrowBack } from 'react-icons/bi';
import Modal from '@/components/globals/Modal';
import { useDisclosure } from '@nextui-org/modal';

function Survey({ evaluation }: { evaluation: Evaluation }) {
    const [selectedSection, setSelectedSection] = useState<number>(0);
    const { department_id } = useGlobalState();
    const { isOpen, onClose, onOpen } = useDisclosure();

    return (
        <div className="w-[95%] mx-auto my-5 bg-white border text-primary-600 justify-center py-2 px-4 rounded-lg shadow-md shadow-gray-300">
            <div className="flex justify-start mt-2">
                <Link href={"/mature-model/history"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
            </div>
            <legend className="text-center text-xl font-extrabold mb-4">{evaluation.title}</legend>

            <Tabs
                aria-label="Sections Tabs"
                selectedKey={selectedSection.toString()}
                onSelectionChange={(key) => setSelectedSection(Number(key))}
                className="mb-4"
            >
                {evaluation.sections.map((section, index) => (
                    <Tab key={index.toString()} title={section.name}>
                        <div className="p-4">
                            <h2 className="text-lg font-bold mb-2">{section.name}</h2>
                            <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                            <ul className="space-y-4">
                                {section.questions.map((question) => (
                                    <li key={question.id} className="border-b pb-2">
                                        <h3 className="font-semibold">{question.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{question.description}</p>
                                        <ul className="list-disc list-inside">
                                            {question.options.map((option) => {
                                                const hasAnswer = option.answers.some(
                                                    (answer) => answer.department_id === department_id
                                                );
                                                return (
                                                    <li
                                                        key={option.id}
                                                        className={
                                                            hasAnswer
                                                                ? 'text-primary-700 font-semibold flex items-center'
                                                                : 'text-gray-700'
                                                        }
                                                    >
                                                        {hasAnswer && <AiOutlineCheck size={45} className="mr-2 text-green-500" />}
                                                        {option.description}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Tab>
                ))}
            </Tabs>

            <button onClick={onOpen} className="mt-4" color="primary">
                Ver Acciones Propuestas
            </button>
            <Modal size='5xl' onClose={onClose} isOpen={isOpen} id='proposedActionsMatureModelHistory' title="Acciones Propuestas">
                <ul className="space-y-4">
                    {evaluation.proposed_actions.length > 0 ? (
                        evaluation.proposed_actions.map((action) => (
                            <li key={action.id} className="border-b pb-2">
                                <h3 className="font-bold text-sm">{action.description}</h3>
                                <p className="text-sm font-bold text-gray-500">Responsable: <span className="font-normal">{action.responsible_name}</span></p>
                                <p className="text-sm font-bold text-gray-500">Indicadores: <span className="font-normal">{action.indicators}</span></p>
                                {/* <p className="text-sm font-bold text-gray-500">Justificación: <span className="font-normal">{action.justification}</span></p> */}
                                <p className="text-sm font-bold text-gray-500">Nivel de cumplimiento: <span className="font-normal">{action.accomplishment_level === "yes" ? "Sí" : action.accomplishment_level === "no" ? "No" : "Parcíal"}</span></p>
                                <p className="text-sm font-bold text-gray-500">Fecha de acción: <span className="font-normal">{new Date(action.action_date).toLocaleDateString()}</span></p>
                            </li>
                        ))
                    ) : (
                        <p>No hay acciones propuestas.</p>
                    )}
                </ul>
            </Modal>
        </div>
    );
}

export default Survey;
