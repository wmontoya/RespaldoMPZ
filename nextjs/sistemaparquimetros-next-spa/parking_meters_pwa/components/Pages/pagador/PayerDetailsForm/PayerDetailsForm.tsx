import React, { useState } from 'react';

interface PayerDetailsProps {
  formData: { id: string; idType: string; name: string; lastName: string };
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
  inputRefs: {
    id: React.RefObject<HTMLInputElement>;
    idType: React.RefObject<HTMLInputElement>;
    name: React.RefObject<HTMLInputElement>;
    lastName: React.RefObject<HTMLInputElement>;
  };
}

export const PayerDetailsForm: React.FC<PayerDetailsProps> = ({
  formData,
  errors,
  handleInputChange,
  inputRefs,
}) => {
  const [documentType, setDocumentType] = useState<'fisica' | 'juridica' | 'pasaporte'>('fisica');

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'fisica' | 'juridica' | 'pasaporte';
    setDocumentType(value);
    handleInputChange(e);
  };

  return (
    <div>
      {/* Select tipo de documento */}
      <div className="mb-4">
        <label
          htmlFor="documentType"
          className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Tipo de Documento
        </label>
        <select
          id="documentType"
          name="idType"
          value={formData.idType}
          onChange={handleDocumentTypeChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
        >
          <option value="fisica">Cédula Física</option>
          <option value="juridica">Cédula Jurídica</option>
          <option value="pasaporte">Pasaporte</option>
        </select>
      </div>

      {/* Campo de identificación */}
      <div>
        <label
          htmlFor="id"
          className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Número de {documentType === 'fisica'
            ? 'Cédula Física'
            : documentType === 'juridica'
            ? 'Cédula Jurídica'
            : 'Pasaporte'}
        </label>
        <input
          ref={inputRefs.id}
          autoFocus
          type="text"
          name="id"
          id="id"
          value={formData.id}
          onChange={handleInputChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
          placeholder="Ingrese el número"
        />
        {errors.id && <div className="text-red-500">{errors.id}</div>}
      </div>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 md:grid-cols-8 md:gap-4 mt-4">
        <div className={`${documentType === 'fisica' || documentType === 'pasaporte' ? 'col-span-4' : 'col-span-8'}`}>
          <label
            htmlFor="name"
            className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Nombre
          </label>
          <input
            ref={inputRefs.name}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
          />
          {errors.name && <div className="text-red-500">{errors.name}</div>}
        </div>

        {documentType !== 'juridica' && (
          <div className="col-span-4">
            <label
              htmlFor="lastName"
              className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Apellidos
            </label>
            <input
              ref={inputRefs.lastName}
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            />
            {errors.lastName && <div className="text-red-500">{errors.lastName}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
