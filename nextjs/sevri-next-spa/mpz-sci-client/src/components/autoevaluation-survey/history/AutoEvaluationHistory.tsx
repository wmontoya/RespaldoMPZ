import React, { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/tabs';
import { useGlobalState } from '@/store/globalState';
import { AiOutlineDownload } from 'react-icons/ai';
import Link from 'next/link';
import { BiArrowBack } from 'react-icons/bi';
import Modal from '@/components/globals/Modal';
import { useDisclosure } from '@nextui-org/modal';
import { Survey } from '@/types/autoevaluationSurvey';

function AutoEvaluationHistory({ evaluation }: { evaluation: Survey }) {
    const [selectedSection, setSelectedSection] = useState<number>(0);
    const { department_id } = useGlobalState();
    const { isOpen, onClose, onOpen } = useDisclosure();

    const handleDownloadFile = (documentContent: string, fileName: string, fileType: string) => {
        const fileBlob = new Blob([Buffer.from(documentContent, 'base64')], { type: fileType });
        const fileUrl = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-[95%] mx-auto my-6 bg-white border border-gray-300 text-primary-600 rounded-lg shadow-lg p-5">
            <div className="flex justify-between items-center mb-5">
                <Link href={"/autoevaluation-surveys/history"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300 flex items-center">
                    <BiArrowBack size={20} />
                    <span className="ml-2">Volver</span>
                </Link>
            </div>
            <legend className="text-center text-2xl font-semibold mb-6">{evaluation.title}</legend>

            <Tabs
                aria-label="Sections Tabs"
                selectedKey={selectedSection.toString()}
                onSelectionChange={(key) => setSelectedSection(Number(key))}
                className="mb-6"
            >
                {evaluation.axies.map((axie, index) => (
                    <Tab key={index.toString()} title={axie.title}>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 mb-4">{axie.description}</p>
                            <ul className="space-y-6">
                                {axie.sections.map((section) => (
                                    <li key={section.id} className="border-b pb-4">
                                        <h3 className="text-lg font-semibold text-primary-700">{section.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{section.description}</p>
                                        <ul className="list-decimal list-inside">
                                            {section.questions.map((question) => {
                                                const answer = question.answers.find(
                                                    (answer) => answer.department_id === department_id && answer.question_id === question.id && answer.axie_id === axie.id && answer.survey_id === evaluation.id
                                                );
                                                return (
                                                    <li
                                                        key={question.id}
                                                        className="text-gray-700 list-outside mb-4"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{question.description}</span>
                                                            {answer ? (
                                                                <div className="mt-3 space-y-2">
                                                                    <p className="text-sm text-gray-500">Respuesta: <span className="font-semibold">{answer.response == "yes" ? "Sí" : "No"}</span></p>
                                                                    <p className="text-sm text-gray-500">Observación: <span className="font-semibold">{answer.observations || 'No hay observaciones.'}</span></p>
                                                                    {answer.document && (
                                                                        <button
                                                                            onClick={() => handleDownloadFile(answer.document, answer.file_name, answer.mime_type)}
                                                                            className="flex items-center text-primary-700 hover:underline mt-3"
                                                                        >
                                                                            <AiOutlineDownload size={20} className="mr-2" />
                                                                            Descargar archivo adjunto
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-red-500 mt-2">Sin respuesta</p>
                                                            )}
                                                        </div>
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

            <button
                onClick={onOpen}
                className="mt-4 w-full py-3 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition duration-300"
            >
                Ver Acciones Propuestas
            </button>

            <Modal size='5xl' onClose={onClose} isOpen={isOpen} id='proposedActionsMatureModelHistory' title="Acciones Propuestas">
                <ul className="space-y-6">
                    {evaluation.proposed_actions.length > 0 ? (
                        evaluation.proposed_actions.map((action) => (
                            <li key={action.id} className="border-b pb-4">
                                <h3 className="font-bold text-lg">{action.description}</h3>
                                <div className="text-sm text-gray-600">
                                    <p className="font-semibold">Responsable: <span className="font-normal">{action.responsible_name}</span></p>
                                    <p className="font-semibold">Indicadores: <span className="font-normal">{action.indicators}</span></p>
                                    {/* <p className="font-semibold">Justificación: <span className="font-normal">{action.justification}</span></p> */}
                                    <p className="font-semibold">Nivel de cumplimiento: <span className="font-normal">{action.accomplishment_level === "yes" ? "Sí" : action.accomplishment_level === "no" ? "No" : "Parcial"}</span></p>
                                    <p className="font-semibold">Fecha de acción: <span className="font-normal">{new Date(action.action_date).toLocaleDateString()}</span></p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-600">No hay acciones propuestas.</p>
                    )}
                </ul>
            </Modal>
        </div>
    );
}

export default AutoEvaluationHistory;