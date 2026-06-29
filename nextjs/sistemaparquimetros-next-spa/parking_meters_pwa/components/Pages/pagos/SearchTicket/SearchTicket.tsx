'use client';

import useParkingMetersStore from "@/store/useParkingMeters.store";
import { SearchTicketSchema } from './SearchTicketSchema';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export const SearchTicket = forwardRef((_, ref) => {
    const { getPlateTypes, setParkingTime } = useParkingMetersStore();
    const [ticketNumber, setTicketNumber] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => { getPlateTypes(); }, []);

    const handledTicketNumber = (value: any) => {
        setTicketNumber(value.target.value);
    }

    const handleSubmitSearchTicket = () => {
        const formData = {
            ticketNumber: ticketNumber,
        };

        const validation = SearchTicketSchema.safeParse(formData);

        if (!validation.success) {
            const formattedErrors: { [key: string]: string } = {};
            validation.error.issues.forEach(issue => {
                formattedErrors[issue.path[0]] = issue.message;
            });
            setErrors(formattedErrors);
            return false;
        }
        setParkingTime({
            ticketNumber: ticketNumber
        });
        setErrors({});
        return true;
    };

    useImperativeHandle(ref, () => ({
        handleSubmitSearchTicket,
    }));

    return (
        <div>
            <div className="grid grid-cols-1 mb-4 w-full">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Número de Boleta
                    </label>
                    <input
                        onChange={handledTicketNumber}
                        value={ticketNumber}
                        type="text"
                        id="ticketNumber"
                        name="ticketNumber"
                        className="bg-blue-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="1112233"
                    />
                    <p className="text-sm">Para realizar búsquedas por boleta, digite los valores sin espacios ni guiones.</p>
                    {errors.ticketNumber && <p className="text-red-500 text-sm">{errors.ticketNumber}</p>}
                </div>
            </div>
        </div>
    );
});

SearchTicket.displayName = "SearchTicket";