import React, { useEffect, useState } from 'react';
import { CustomCard } from 'components/General/CustomCard';
import useParkingMetersStore from '@/store/useParkingMeters.store';
import { CustomButton } from 'components/General/CustomButton';
import { FaCreditCard } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { formatDate } from '@/utils/converter';

export const TimeList = () => {
  const { getTime } = useParkingMetersStore();
  const router = useRouter();
  const [data, setData] = useState<{
    plate_number: string;
    plate_type_id: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [nextTime, setNextTime] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const plateNumber = localStorage.getItem('plate_number');
      const plateTypeId = localStorage.getItem('plate_type_id');

      if (!plateNumber || !plateTypeId) {
        setMessage('Sin tiempo comprado');
        return;
      }

      const localData = {
        plate_number: plateNumber,
        plate_type_id: plateTypeId,
      };

      setData(localData);

      const timeResponse = await getTime(localData.plate_number, localData.plate_type_id);

      if (timeResponse.success && timeResponse.data) {
        const { minutes, seconds, nextTime } = timeResponse.data;
        const totalMilliseconds = (minutes * 60 + seconds) * 1000;

        if (nextTime) {
          setNextTime(nextTime);
        }

        setTimeLeft(totalMilliseconds);
      } else {
        setMessage('Error al obtener tiempo');
      }
    };

    fetchData();
  }, [getTime]);

  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return 'Sin tiempo disponible para la placa';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleMoreTimeSubmit = () => {
    router.push('/compras');
  };

  return (
    <div>
      <CustomCard title="Tiempo Activo" classNameCard="mb-4" showHelpButton={true}>
        <div className="relative overflow-x-auto shadow-md rounded-b-xl">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 text-center">Placa</th>
                <th className="px-6 py-3 text-center">Tiempo Restante</th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                  <td className="px-6 py-4">{data.plate_number}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {timeLeft !== null && timeLeft > 0
                      ? formatCountdown(timeLeft)
                      : message || 'Sin tiempo disponible para la placa'}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center">
                    {message || 'Cargando datos...'}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="px-6 py-4 text-start text-red-600">
                  <strong>Nota:</strong> Se mostrará únicamente el tiempo restante de la boleta más reciente comprada.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CustomCard>

       {nextTime && (<CustomCard title="Siguiente Boleta Activa" classNameCard="mb-4">
        <div className="relative overflow-x-auto shadow-md rounded-b-xl">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 text-center">Placa</th>
                <th className="px-6 py-3 text-center">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                  <td className="px-6 py-4">{data.plate_number}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                   
                      <>
                        {formatDate(new Date(nextTime), "all")}
                      </>
                    
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center">
                    {message || 'Cargando datos...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CustomCard>)}

      <div className="flex justify-center mt-4">
        <CustomButton
          onClick={handleMoreTimeSubmit}
          color="blue"
          Icon={FaCreditCard}
          actionButton="Comprar más tiempo"
          className="px-6 py-2.5 me-2 ms-4 mb-4"
        />
      </div>
    </div>
  );
};
