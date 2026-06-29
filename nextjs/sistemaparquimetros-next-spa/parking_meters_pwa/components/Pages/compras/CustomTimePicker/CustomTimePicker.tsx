'use client';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, min } from 'date-fns';
import { FaEdit } from 'react-icons/fa';
interface CustomTimePickerProps {
    selectedTime: Date;
    minTime?: Date;
    maxTime?: Date;
    label: string;
    onChangeTime: (date: Date) => void;
}

export const CustomTimePicker = ({ selectedTime, minTime, maxTime, label, onChangeTime }: CustomTimePickerProps) => {
    const [isClient, setIsClient] = useState(false);
    const [isOpenTime, setIsOpenTime] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleClickTime = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsOpenTime(!isOpenTime);
    };

    const handleChangeTime = (date: Date | null) => {
        if (date) {
            onChangeTime(date);
            setIsOpenTime(false);
        }
    };

    return (
        <div>
            {isClient && (
                <div className="pw-1 pt-2">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {label}
                        </label>
                        <button
                            className="bg-blue-50 flex items-center justify-between border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onClick={handleClickTime}
                        >
                            <span>{format(selectedTime, 'h:mm aa')}</span>
                            <FaEdit className="w-4 h-4 text-gray-600 ml-2" />
                        </button>

                        {isOpenTime && (
                            <div className="flex justify-center mt-2">
                                <DatePicker
                                    selected={selectedTime}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={5}
                                    timeCaption="Horas"
                                    dateFormat="h:mm aa"
                                    inline
                                    minTime={minTime}
                                    maxTime={maxTime}
                                    onChange={handleChangeTime}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
