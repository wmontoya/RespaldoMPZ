import { ModalNotification } from "components/General/ModalNotification";

import RateRow from "./RateRow";
import { formatAmount } from "@/utils/converter";
import { useTicketCounter } from "@/hooks/UseTicketCounter";

export const TicketCounter = ({ startDate }: { startDate: Date }) => {
    const {
        rateIds,
        parkingRateList,
        isModalOpen,
        countOccurrences,
        getTotalPrice,
        increment,
        decrement,
    } = useTicketCounter(startDate);

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-white">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tiempo</th>
                            <th scope="col" className="px-6 py-3 text-center">Cantidad de Boletas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parkingRateList.map(item => (
                            <RateRow
                                key={item.id}
                                item={item}
                                count={countOccurrences(rateIds, item.id)}
                                onIncrement={() => increment(item.id)}
                                onDecrement={() => decrement(item.id)}
                            />
                        ))}
                        <tr className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            <td className="px-6 pt-4 font-bold text-red-500 text-md">Total de Boletas</td>
                            <td className="px-6 pt-4 font-bold text-red-500 text-md text-center">
                                {rateIds.length}
                            </td>
                        </tr>
                        <tr className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            <td className="px-6 pb-4 font-bold text-red-500 text-lg">Monto Total</td>
                            <td className="px-6 pb-4 font-bold text-red-500 text-lg text-center">
                                {formatAmount(getTotalPrice())}
                            </td>
                        </tr>
                    </tbody>
                    {isModalOpen && (
                        <tfoot>
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-yellow-500 text-sm bg-yellow-50 dark:bg-yellow-900">
                                    Actualmente estaría superando el horario final de las <strong>5 PM</strong>.
                                </td>
                            </tr>
                        </tfoot>
                    )}

                </table>
            </div>
        </div>
    );
};
