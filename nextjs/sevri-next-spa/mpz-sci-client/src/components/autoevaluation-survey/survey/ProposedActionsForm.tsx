import CustomAutoComplete from '@/components/globals/CustomAutoComplete';
import { useAutoevaluationState } from '@/store/autoevaluationSurveys/autoevaluationSurveysStore';
import { useGlobalState } from '@/store/globalState';
import { useSharedStore } from '@/store/shared/sharedStore';
import { Survey } from '@/types/autoevaluationSurvey';
import { showConfirmAlert, showInfoMixinAlert } from '@/utils';
import { getInitialValuesProposedActions, proposedActionsValidationSchema } from '@/utils/schemas/autoEvaluation/proposedActionsForm';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { BiSave, BiTrash } from 'react-icons/bi';

function ProposedActionsForm({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const { users } = useSharedStore();
  const { user_id } = useGlobalState();
  const { createProposedActions, actualSurvey } = useAutoevaluationState();

  const handleSubmit = (values: Survey) => {
    const proposedActions = values.proposed_actions.map(action => ({
      ...action,
      responsible_email: users.find(user => user.name === action.responsible_name)?.email || '',
    }));
    createProposedActions(proposedActions);
    showInfoMixinAlert('Guardando', 'Guardando acciones propuestas', 'info', 'bottom-end');
  };

  const handleDelete = (remove: () => void) => {
    showConfirmAlert('¿Está seguro de eliminar esta acción?', 'Esta acción no se puede deshacer', remove);
  };

  const handleSubmitAndClose = (values: Survey) => {
    handleSubmit(values)
    onClose()
  }

  return (
    <div className="p-6 bg-green shadow-md rounded-lg">
      <Formik
        initialValues={getInitialValuesProposedActions(actualSurvey)}
        onSubmit={handleSubmit}
        validationSchema={proposedActionsValidationSchema}
      >
        {({ values }) => (
          <Form>

            <div className="flex justify-between items-center">
              <div className='flex w-full items-center justify-between'>
                <div className='flex gap-2 items-center'>
                  <h1 className="text-2xl font-bold">Acciones Propuestas</h1>
                </div>
                {values.proposed_actions.length > 0 && (
                  <div className="flex gap-2">
                    <button type="submit" className="flex items-center transition-all justify-center py-2 px-3 bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:rounded">Guardar <BiSave size={25} /></button>
                    <button type="button" onClick={() => handleSubmitAndClose(values)} className="flex items-center transition-all justify-center py-2 px-3 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white cursor-pointer hover:rounded ml-2">Guardar y Cerrar <BiSave size={25} /></button>
                  </div>
                )}
              </div>
            </div>

            <FieldArray name="proposed_actions">
              {({ push, remove }) => (
                <>
                  <div className="flex space-x-2 overflow-x-auto mb-4">
                    {values.proposed_actions.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${activeTab === index
                          ? 'bg-indigo-600 text-white'
                          : 'border border-indigo-600 text-indigo-600'
                          }`}
                        onClick={() => setActiveTab(index)}
                      >
                        Acción {index + 1}
                      </button>
                    ))}
                  </div>

                  {values.proposed_actions.map((action, index) => (
                    activeTab === index && (
                      <div key={index} className="space-y-4 mb-4 p-4 border rounded-md shadow-sm">
                        <div>
                          <label className="block text-gray-700">Descripción de la acción a realizar</label>
                          <Field className="w-full p-2 border rounded" name={`proposed_actions.${index}.description`} as="textarea" />
                          <ErrorMessage name={`proposed_actions.${index}.description`} component="div" className="text-red-500 text-sm" />
                        </div>
                        {/* <div>
                          <label className="block text-gray-700">Justificación</label>
                          <Field className="w-full p-2 border rounded" name={`proposed_actions.${index}.justification`} as="textarea" />
                          <ErrorMessage name={`proposed_actions.${index}.justification`} component="div" className="text-red-500 text-sm" />
                        </div> */}
                        <div>
                          <label className="block text-gray-700">Indicadores de cumplimiento</label>
                          <Field className="w-full p-2 border rounded" name={`proposed_actions.${index}.indicators`} as="textarea" />
                          <ErrorMessage name={`proposed_actions.${index}.indicators`} component="div" className="text-red-500 text-sm" />
                        </div>
                        <div>
                          <CustomAutoComplete
                            allowCustomValue
                            label="Responsable"
                            name={`proposed_actions.${index}.responsible_name`}
                            placeholder="Seleccione un responsable"
                            options={users.map(user => ({ value: user.name, label: user.name }))}
                          />
                          <ErrorMessage name={`proposed_actions.${index}.responsible_name`} component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="relative">
                          <label
                            className="block text-gray-700 cursor-pointer"
                            onClick={() => document.getElementById(`date-input-${index}`)?.focus()}
                          >
                            Fecha de la acción
                          </label>
                          <Field className="bg-gray-50 shadow rounded w-full text-sm h-10 p-3" name={`proposed_actions.${index}.action_date`} type="date" onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.showPicker()} />
                          <ErrorMessage
                            name={`proposed_actions.${index}.action_date`}
                            component="div"
                            className="text-red-500 text-sm"
                          />
                        </div>
                        {values.proposed_actions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDelete(() => {
                              remove(index);
                              setActiveTab(prev => (prev > 0 ? prev - 1 : 0));
                            })}
                            className="flex items-center text-red-600 border border-red-600 px-3 py-2 rounded hover:bg-red-600 hover:text-white transition"
                          >
                            <BiTrash className="mr-2" /> Eliminar
                          </button>
                        )}
                      </div>
                    )
                  ))}
                  <div className="flex justify-center items-center mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        push({
                          user_id,
                          survey_id: actualSurvey.id,
                          description: '',
                          indicators: '',
                          responsible_name: '',
                          accomplishment_level: 'no',
                          action_date: new Date().toISOString(),
                        });
                        setActiveTab(values.proposed_actions.length);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Agregar Siguiente Acción
                    </button>
                  </div>

                </>
              )}
            </FieldArray>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ProposedActionsForm;