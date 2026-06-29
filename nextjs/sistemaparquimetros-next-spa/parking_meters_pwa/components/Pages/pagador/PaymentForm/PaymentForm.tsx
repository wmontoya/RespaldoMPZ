import React, { useEffect, useRef, useState } from 'react';
import { CustomCard } from 'components/General/CustomCard';
import { paymentFormSchema } from './PaymentFormSchema';
import useParkingMetersStore from '@/store/useParkingMeters.store';
import { useRouter } from 'next/router';
import Loading from 'components/General/LoadingForm/LoadingForm';
import { PayerDetailsForm } from '../PayerDetailsForm';
import { ContactInfoForm } from '../ContactInfoForm';
import { PlateSummary } from '../PlateSummary';
import { PaymentConfirmationForm } from '../PaymentConfirmationForm';
import { usePushNotifications } from '@/hooks/usePushNotification';

export const PaymentForm = () => {
  const { subscribeToPushNotifications } = usePushNotifications();
  const { plateTypeList, parkingTime, setParkingTime, getParkingTime, loading, getClientIP, setPayment } = useParkingMetersStore();
  const router = useRouter();
  const [isIncognito, setIsIncognito] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('payerFormData');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.idType = parsed.idType || 'fisica';
      parsed.isTermsAccepted = false;
      return parsed;
    }
    return saved
      ? JSON.parse(saved)
      : {
        email: '',
        phone: '',
        isTermsAccepted: false,
        id: '',
        idType: 'fisica',
        name: '',
        lastName: '',
        amount: 0
      };
  });


  useEffect(() => { getClientIP(); }, [getClientIP]);
  const [errors, setErrors] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inputRefs = {
    id: useRef<HTMLInputElement>(null),
    idType: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    const updatedData = { ...formData, [name]: newValue };

    setFormData(updatedData);

    const result = paymentFormSchema.safeParse(updatedData);

    if (!result.success) {
      const fieldErrors = result.error.format();
      const currentFieldError = (fieldErrors as Record<string, any>)[name]?._errors?.[0] || '';

      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [name]: currentFieldError,
      }));
    } else {
      setErrors((prevErrors: any) => ({ ...prevErrors, [name]: '' }));
    }


    localStorage.setItem('payerFormData', JSON.stringify(updatedData));
  };


  const savePersonalData = () => {
    setParkingTime({
      email: formData.email,
      id: formData.id,
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone
    });
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      savePersonalData();

      const result = paymentFormSchema.safeParse(formData);
      if (!result.success) {
        const formattedErrors = result.error.format();
        const firstErrorField = Object.keys(formattedErrors)[1];
        if (firstErrorField && firstErrorField in inputRefs) {
          inputRefs[firstErrorField as keyof typeof inputRefs]?.current?.focus();
        }
        setErrors(formattedErrors);
        throw new Error('Por favor, corrige los campos marcados.');
      }

      if (typeof sessionStorage === 'undefined') {
        throw new Error('El almacenamiento local no está disponible.');
      }

      if (!parkingTime) {
        throw new Error('Información de ticket inválida.');
      }

      let response;

      if (parkingTime.ticketNumber === '') {

        if ('serviceWorker' in navigator && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const swPath = process.env.NODE_ENV === 'development' ? '/sw.js' : '/apps/parking/sw.js';
          const registration = await navigator.serviceWorker.register(swPath);
          if (!registration) {
            throw new Error('Error al registrar el service worker.');
          }

          const responseSubscription = await subscribeToPushNotifications();
          if (!responseSubscription.success || !responseSubscription.data) {
            throw new Error( 'Error en la suscripción de notificaciones.');
          }

          setParkingTime({ subscription: responseSubscription.data });

          response = await getParkingTime();
          if (!response || !response.success || !response.data || !response.data.payment_id || !response.data.collector) {
            throw new Error('Error al obtener el tiempo de parqueo.');
          }
        } else {
          setParkingTime({ subscription: '' });

          response = await getParkingTime();
          if (!response || !response.success || !response.data || !response.data.payment_id || !response.data.collector) {
            throw new Error('Error al obtener el tiempo de parqueo.');
          }
        }
      } else {
        response = await setPayment();
        if (!response || !response.success || !response.data || !response.data.payment_id || !response.data.collector) {
          throw new Error('Error al establecer el pago. Detalle de error: ' + response.data?.error);
        }
      }

      sessionStorage.setItem('tempId', response.data.payment_id);
      router.push(response.data.collector);

    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      setIsModalOpen(true);
      setErrors('Ocurrió un error inesperado.');
    }
  };


  const selectedPlateType = plateTypeList
    .filter((plateType: any) => plateType.Id === parkingTime.plateTypeId).map((plateClass: any) => {
      const filteredPlateDetail = plateClass.PlateDetails.find(
        (detail: any) => detail.Id === parkingTime.plateDetailId
      ) || plateClass.PlateDetails[0];
      return {
        ...plateClass,
        PlateDetails: filteredPlateDetail
      };
    })[0];

  useEffect(() => {
    const fetchSubscription = async () => {
      if (parkingTime.ticketNumber === '') {
        if ('Notification' in window) {
          Notification.requestPermission();
          if (Notification.permission === 'granted') {
            setIsNotification(false);
            if ('serviceWorker' in navigator) {
              try {
                await navigator.serviceWorker.register(process.env.NODE_ENV === 'development' ? '/sw.js' : '/apps/parking/sw.js');
                let responseSubscription = await subscribeToPushNotifications();
                if (responseSubscription.success && responseSubscription.message === "incognito") {
                  setIsIncognito(true);
                }
              } catch (error: any) {
                setIsModalOpen(true);
                setErrors(error.message);
              }
            }
          } else {
            setIsNotification(true);
          }
        }
      }

    };
    fetchSubscription();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5">
      <div className="col-span-1 md:col-span-3 md:col-start-2">
        {isIncognito && <CustomCard className="p-4" classNameCard="!bg-red-500 dark:!bg-red-500 text-white mb-3 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold">Modo incógnito detectado</h3>
          <p className="text-sm">Las notificaciones solo estarán disponibles a través de su correo electrónico.</p>
        </CustomCard>}

        {isNotification && <CustomCard className="p-4" classNameCard="!bg-red-500 dark:!bg-red-500 text-white mb-3 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold">Permisos de notificación deshabilitados</h3>
          <p className="text-sm">Las notificaciones no están habilitadas para la aplicación. Si usas Edge, activa las notificaciones haciendo clic en el ícono de campana en la esquina superior derecha.</p>
        </CustomCard>}

        <CustomCard title='Perfil de Pago' className='p-4' >
          <form>
            <PayerDetailsForm inputRefs={inputRefs} formData={formData} errors={errors} handleInputChange={handleInputChange} />
            <ContactInfoForm inputRefs={inputRefs} formData={formData} errors={errors} handleInputChange={handleInputChange} />
          </form>
        </CustomCard>

        {selectedPlateType && <CustomCard title='Datos de la Placa' classNameCard='mt-3' className='p-4'>
          <form>
            <PlateSummary selectedPlateType={selectedPlateType} parkingTime={parkingTime} />
          </form>
        </CustomCard>
        }
        <CustomCard title='Datos del Pago' classNameCard='mt-3 mb-5' className='p-4'>
          <PaymentConfirmationForm
            parkingTime={parkingTime}
            formData={formData}
            errors={errors}
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            handleCheckboxChange={handleCheckboxChange}
            handleSubmit={handleSubmit}
          />
        </CustomCard>
        {loading && <Loading />}
      </div>
    </div>
  );
};
