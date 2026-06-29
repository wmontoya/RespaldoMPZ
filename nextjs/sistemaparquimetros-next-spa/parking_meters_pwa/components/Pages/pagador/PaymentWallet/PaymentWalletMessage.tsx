import React from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import Image from 'next/image'
export const PaymentWalletMessage = () => {
  return (
    <div
      id="alert-additional-content-1"
      className="p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-300 dark:border-green-800"
      role="alert"
    >
      <div className="flex items-center">
        <h3 className="text-lg font-medium flex items-center ">
          <RiErrorWarningLine /> Sugerencia
        </h3>
      </div>
      <div className="mt-2 mb-4 text-sm">
        <ul className="list-disc pl-5">
          <li>
            Te recomendamos utilizar un administrador de tarjetas de crédito o débito para guardar la información de estas de forma segura. Esto no solo mejora la seguridad, sino que también agiliza el proceso de pago.
          </li>
          <li>
            Estas herramientas están disponibles para <strong>Android</strong>, <strong>iPhone</strong> y como <strong>extensión para Google Chrome</strong>, permitiéndote acceder a tus datos de manera rápida y segura desde cualquier dispositivo.
          </li>
        </ul>

      </div>
    </div>
  );
};
