import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import useParkingMetersStore from '@/store/useParkingMeters.store';
import LoadingForm from 'components/General/LoadingForm/LoadingForm';
import { ModalTutorial } from 'components/General/ModalTutorial';


const withAuthRedirect = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();
    const { getActive } = useParkingMetersStore();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
      if (hasRun.current) return;
      hasRun.current = true;

      const checkActive = async () => {
        try {
          if ('Notification' in window) {
            Notification.requestPermission();
          }

          const modalStatus = localStorage.getItem("tutorialModal");
          if (modalStatus === null || modalStatus === "false") {
            setShowModal(true);
          }

          let statusValue = "false";
          const status = await getActive();
          statusValue = status?.data?.Value;

          if (statusValue === "false") {
            router.replace('/apagado');
            return;
          }

          if (router.pathname === '/') {
            const storedPlateInfo = localStorage.getItem("plateInfo");
            storedPlateInfo !== "[]" && storedPlateInfo !== null
              ? router.push('/compras')
              : router.push('/garaje');
            return;
          }

          setLoading(false);
        } catch (error) {
          router.replace('/apagado');
        }
      };

      checkActive();
    }, []);

    if (loading) return <LoadingForm />;

    return (
      <>
        {showModal && (
          <ModalTutorial
            isOpenModal={showModal}
            closeModal={() => {
              localStorage.setItem("tutorialModal", "true");
              setShowModal(false);
            }}
          />
        )}
        <WrappedComponent {...props} />
      </>
    );
  };

  return Wrapper;
};

export default withAuthRedirect;
