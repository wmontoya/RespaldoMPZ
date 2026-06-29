import React from "react";
import { ReactElement, useEffect } from "react";
import { FaRegLightbulb , FaRegTimesCircle, FaRegCheckCircle, FaInfoCircle  } from 'react-icons/fa';

interface ModalNotificationProps {
  title?: string;
  message: ReactElement;
  notificationType?: "success" | "error" | "warning" | "info";
  showCancelButton?: boolean;
  showAprobeButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isOpenModal: boolean;
  closeModal: () => void;
}

const icons = {
  success: (
    <FaRegCheckCircle size={90} className="mx-auto mt-6 mb-4 text-green-500 dark:text-green-500" />
  ),
  error: (
    <FaRegTimesCircle size={90} className="mx-auto mt-6 mb-4 text-red-500 dark:text-red-500" />
  ),
  warning: (
    <FaRegLightbulb  size={90} className="mx-auto mt-6 mb-4 text-yellow-500 dark:text-yellow-400" />
  ),
  info: (
    <FaInfoCircle  size={90} className="mx-auto mt-6 mb-4 text-blue-500 dark:text-blue-400" />
  ),
};

const titles = (title: string) => ({
  success: (
    <h1 className="mb-5 text-xl font-bold text-green-500 dark:text-green-400">{title}</h1>
  ),
  error: (
    <h1 className="mb-5 text-xl font-bold text-red-500 dark:text-red-400">{title}</h1>
  ),
  warning: (
    <h1 className="mb-5 text-xl font-bold text-yellow-500 dark:text-yellow-400">{title}</h1>
  ),
  info: (
    <h1 className="mb-5 text-xl font-bold text-blue-500 dark:text-blue-400">{title}</h1>
  ),
});


export function ModalNotification({
  title,
  message,
  notificationType = "warning",
  showCancelButton = true,
  showAprobeButton = true,
  confirmText = "Yes, I'm sure",
  cancelText = "No, cancel",
  onConfirm,
  onCancel,
  isOpenModal,
  closeModal,
}: ModalNotificationProps) {

  useEffect(() => {
    if (!isOpenModal) {
      closeModal();
    }
  }, [isOpenModal, closeModal]);

  return (
    <>
      {isOpenModal && (
        <div
          id="popup-modal"
          className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                {icons[notificationType]}
                {title && (titles(title)[notificationType])}
                <h3 className="mb-5 text-md font-normal text-black dark:text-gray-100">{message}</h3>
                {showAprobeButton && (<button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    closeModal();
                  }}
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  {confirmText}
                </button>)}
                {showCancelButton && (
                  <button
                    onClick={() => {
                      if (onCancel) onCancel();
                      closeModal();
                    }}
                    type="button"
                    className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-200 rounded-lg border border-gray-400 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    {cancelText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
