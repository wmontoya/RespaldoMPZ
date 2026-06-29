import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { Stepper } from '../Stepper';
import { formatAmount } from '@/utils/converter';
import { PaymentWarningMessage } from '../PaymentWarningMessage';
import { ModalNotification } from 'components/General/ModalNotification';
import { PaymentWalletMessage } from '../PaymentWallet';

interface PaymentConfirmationFormProps {
  parkingTime: any;
  formData: {
    isTermsAccepted: boolean;
  };
  errors: any;
  isModalOpen: boolean;
  closeModal: () => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const PaymentConfirmationForm: React.FC<PaymentConfirmationFormProps> = ({
  parkingTime,
  formData,
  errors,
  isModalOpen,
  closeModal,
  handleCheckboxChange,
  handleSubmit
}) => {
  const router = useRouter();
  return (
    <form onSubmit={handleSubmit}>
      {!parkingTime.ticketNumber && <Stepper startTime={parkingTime.startTime} endTime={parkingTime.endTime} />}

      <h2 className="text-center text-2xl tracking-tight font-bold text-gray-900 dark:text-white border rounded-lg p-2 dark:bg-gray-700 bg-gray-200">
        Monto a cancelar:
        <span className="block text-center text-2xl tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
          {formatAmount(parkingTime.amount)}
        </span>
      </h2>

      <div className="flex items-center justify-center w-full mt-6">
        <PaymentWarningMessage />
      </div>

      <div className="flex items-center justify-center w-full mt-6">
        <PaymentWalletMessage />
      </div>

      <div className="flex items-center justify-center mb-10 mt-4">
        <div className="flex items-center h-5 mt-[3px]">
          <input
            id="isTermsAccepted"
            type="checkbox"
            name="isTermsAccepted"
            checked={formData.isTermsAccepted}
            onChange={handleCheckboxChange}
            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
          />
        </div>
        <div>
          <label htmlFor="isTermsAccepted" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Acepto los &nbsp;
            <Link href="https://www.perezzeledon.go.cr/index.php/municipalidad/documentos-y-descargas/archivos-generales/informacion.html?download=18135:terminos-y-condiciones-para-la-cancelacion-de-boletas-de-parquimetros" className="text-blue-600 hover:underline dark:text-blue-500">Términos y Condiciones</Link>
          </label>
          {errors.isTermsAccepted && <div className="text-red-500 ml-2">{errors.isTermsAccepted._errors[0]}</div>}
        </div>
      </div>

      <div className="flex w-full justify-between mt-6 mb-4">
        <button
          className="py-2.5 px-5 w-40 text-green-800 mr-2 text-sm font-medium focus:outline-none text-center inline-flex items-center bg-white rounded-lg border border-gray-200 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
          onClick={() => { router.push('/compras'); }}
        >
          <FaArrowLeft className="mx-2" size={20} />
          Volver a Consulta
        </button>
        <button
          disabled={parkingTime.amount === 0}
          type="submit"
          className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center
            ${parkingTime.amount === 0 ? 'bg-gray-400 cursor-not-allowed' :
            'bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'}`}
        >
          <FaCreditCard className="mr-2" /> Pagar
        </button>
      </div>

      <ModalNotification
        title="¡Se presentó un error!"
        message={<div dangerouslySetInnerHTML={{ __html: errors }} />}
        notificationType="error"
        cancelText="Cancel"
        isOpenModal={isModalOpen}
        closeModal={closeModal}
        showAprobeButton={false}
      />
    </form>
  );
};