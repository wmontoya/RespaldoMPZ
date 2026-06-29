import React from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import Image from 'next/image'
export const PaymentWarningMessage = () => {
  return (
    <div
      id="alert-additional-content-1"
      className="p-4 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800"
      role="alert"
    >
      <div className="flex items-center">
        <h3 className="text-lg font-medium flex items-center ">
          <RiErrorWarningLine /> Atención
        </h3>
      </div>
      <div className="mt-2 mb-4 text-sm">
        <ul className="list-disc pl-5">
          <li>
            Al hacer click en el botón de &quot;Pagar&quot; será redirigido a una página externa en la cual deberá ingresar los datos de la tarjeta con la que
            realizará el pago indicado.
          </li>
          <li>La municipalidad <b>no almacenará ningún tipo de información que corresponda a la tarjeta con la que se realice el pago.</b></li>
          <li>Se aceptan ÚNICAMENTE tarjetas Visa y MasterCard de cualquier entidad bancaria.</li>
          <li>
            <b>Si está fuera del país, consulte con su emisor de tarjeta si puede pagar a través de ATH Costa Rica.</b>
          </li>
        </ul>
      </div>

      <div className="flex justify-center flex-wrap gap-4">
        <Image src="../images/tarjetas.png" width="100" height="150" alt="PlacetoPay" />
        <Image src="../images/placetopay.svg" width="100" height="150" alt="PlacetoPay" />
      </div>
    </div>
  );
};
