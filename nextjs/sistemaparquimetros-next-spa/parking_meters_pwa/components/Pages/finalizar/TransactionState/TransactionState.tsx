import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaPrint } from 'react-icons/fa';
import useParkingMetersStore from "@/store/useParkingMeters.store";
import { formatAmount } from "@/utils/converter";
import Loading from "components/General/LoadingForm/LoadingForm";

interface TransactionStateProps {
    tempInvoice: any;
}
interface datosParaFinalizar {
    infraction: string;
    date: string;
    status: string;
    amount: string;
    identification: string;
    phone: string;
    email: string;
    name: string;
    surname: string;
    temporalInvoice: string;
    description: string;
    detail: string;
}

export const TransactionState = ({ tempInvoice }: TransactionStateProps) => {
    const router = useRouter();
    const { getPayment, loading } = useParkingMetersStore();
    const [losDatosFinalizar, setLosDatosFinalizar] = useState<datosParaFinalizar | null>(null);
    const hasFetched = useRef(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        let standaloneCheck = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standaloneCheck);

        const fetchData = async () => {
            if (!hasFetched.current && tempInvoice != null) {
                hasFetched.current = true;
                let datos = await getPayment(tempInvoice);
                if (datos.data.status === 'REGISTRADO') {
                    setTimeout(fetchData, 5000);
                } else {
                    let losDatosFinales = datos.data;
                    setLosDatosFinalizar({
                        infraction: losDatosFinales.ticket_number,
                        date: losDatosFinales.date.split("T")[0],
                        status: losDatosFinales.status,
                        amount: formatAmount(parseFloat(losDatosFinales.amount)),
                        identification: losDatosFinales.identification,
                        email: losDatosFinales.email,
                        phone: losDatosFinales.phone,
                        temporalInvoice: tempInvoice,
                        name: losDatosFinales.name,
                        surname: losDatosFinales.surname,
                        description: losDatosFinales.description,
                        detail: losDatosFinales.details || ''
                    });
                }
            }
        };

        fetchData();
    }, [tempInvoice]);

    const goToConsulta = () => {
        sessionStorage.removeItem("tempId");
        router.push({ pathname: "/" });
    };

    const imprimaLaFactura = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    return (
        <>
            <section>
                <div>
                    <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
                        <p className="mb-5 font-light text-gray-700 sm:text-xl dark:text-gray-400">
                            A su correo se hará llegar un comprobante de esta transacción. Si desea resolver alguna inquietud, contáctenos al teléfono
                            <b>
                                <a href="tel:+22206686"> 2220-6686 </a>
                            </b>
                            o al correo
                            <b>
                                <a href="mailto:informatica@mpz.go.cr"> informatica@mpz.go.cr</a>
                            </b>.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <ul className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <li className="flex justify-between items-center w-full px-7 border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                            <div className="flex justify-between w-full items-baseline py-3">
                                <h3 className="text-2xl font-semibold flex-wrap">Estado de la transacción</h3>
                                <button
                                    type="button"
                                    className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 focus:outline-none focus:ring-[#F7BE38]/50 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 dark:focus:ring-[#F7BE38]/50"
                                    onClick={imprimaLaFactura}
                                >
                                    <FaPrint /> <span className="sr-only">Icon description</span>
                                </button>
                            </div>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Factura:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.temporalInvoice}</span>
                        </li>
                        {losDatosFinalizar?.infraction && (
                            <li className="flex justify-start items-center w-full px-4 py-4">
                                <label className="font-extrabold px-3">Boleta:</label>
                                <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.infraction}</span>
                            </li>
                        )}
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Nombre:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{`${losDatosFinalizar?.name || ''} ${losDatosFinalizar?.surname || ''}`.trim()}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Fecha de pago:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.date}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Estado:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.status}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Monto:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.amount}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Cédula:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.identification}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Teléfono:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.phone}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4">
                            <label className="font-extrabold px-3">Correo electrónico:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-1">{losDatosFinalizar?.email}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4 rounded-b-lg">
                            <label className="font-extrabold px-3">Detalle de pago:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.detail}</span>
                        </li>
                        <li className="flex justify-start items-center w-full px-4 py-4 rounded-b-lg">
                            <label className="font-extrabold px-3">Descripción:</label>
                            <span className="text-gray-700 dark:text-gray-300 px-3">{losDatosFinalizar?.description}</span>
                        </li>
                    </ul>
                </div>

                <div className="flex justify-center items-center mt-6 gap-10 flex-wrap">
                    {!isStandalone && (
                        <button
                            onClick={goToConsulta}
                            type="button"
                            className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        >
                            Volver
                        </button>
                    )}

                    {isStandalone ? (
                        <button
                            onClick={goToConsulta}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >
                            Finalizar
                        </button>
                    ) : (
                        <Link
                            href="https://perezzeledon.go.cr/"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >
                            Finalizar
                        </Link>
                    )}
                </div>

                {loading && <Loading />}
            </section>
        </>
    );
};
