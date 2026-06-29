import { formatDate } from "@/utils/converter";
import { FaRegCalendarAlt, FaRegCalendarPlus, FaRegCalendarMinus } from 'react-icons/fa';
import React from "react";

interface CustomCardProps {
  startTime: Date | undefined;
  endTime: Date | undefined;
}
export const Stepper = ({ startTime, endTime }: CustomCardProps) => {
  return (
    <div className="flex flex-wrap justify-center items-center my-8 p-0 md:min-w-[440px]">
      <div className="w-full md:w-1/3 p-2 flex items-center justify-center md:justify-end text-blue-600 dark:text-blue-500 space-x-2.5 rtl:space-x-reverse">
        <span className="flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full shrink-0 dark:border-blue-500">
          <FaRegCalendarAlt />
        </span>
        <span>
          <h3 className="font-medium leading-tight w-[102px] whitespace-nowrap">Fecha</h3>
          <p className="text-sm"><strong>{formatDate(startTime, 'date')}</strong></p>
        </span>
      </div>
      <div className="w-full md:w-1/3 p-2 flex items-center justify-center text-gray-500 dark:text-gray-400 space-x-2.5 rtl:space-x-reverse">
        <span className="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0 dark:border-gray-400">
          <FaRegCalendarPlus />
        </span>
        <span>
          <h3 className="font-medium leading-tight w-[102px] whitespace-nowrap ">Hora de inicio</h3>
          <p className="text-sm"><strong>{formatDate(startTime, 'time')}</strong></p>
        </span>
      </div>
      <div className="w-full md:w-1/3 p-2 flex items-center justify-center md:justify-start text-gray-500 dark:text-gray-400 space-x-2.5 rtl:space-x-reverse">
        <span className="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0 dark:border-gray-400">
          <FaRegCalendarMinus />
        </span>
        <span>
          <h3 className="font-medium leading-tight w-[102px] whitespace-nowrap">Hora de fin</h3>
          <p className="text-sm"><strong>{formatDate(endTime, 'time')}</strong></p>
        </span>
      </div>
    </div>
  );
};
export default Stepper;
