import React, { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { CustomButton } from "../CustomButton";
import { ModalTutorial } from "../ModalTutorial";

interface CustomCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  classNameCard?: string;
  showHelpButton?: boolean;
  onHelpClick?: () => void;
}

export const CustomCard = ({
  title,
  children,
  className,
  classNameCard,
  showHelpButton = false
}: CustomCardProps) => {
      const [showModal, setShowModal] = useState(false);

  return (
    <section className={`card bg-white rounded-xl shadow-md dark:bg-gray-800 dark:border-gray-700 ${classNameCard}`}>
      {showModal && (
                      <ModalTutorial
                        isOpenModal={showModal}
                        closeModal={() => {
                          setShowModal(false);
                        }}
                      />
                    )}
      {title && (
        <div className="card-header bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-700 dark:to-gray-600 p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center w-full">
              {title}
            </h5>
            {showHelpButton && (
              <div className="absolute right-4">
                <CustomButton
                  color="grayoutline"
                  actionButton=""
                  onClick={() => setShowModal(true)}
                  className="w-10 h-10 p-2 rounded-full"
                  Icon={FaQuestionCircle}
                  iconClassName="text-white dark:text-yellow-400 m-auto"
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className={`card-body ${className}`}>
        <div className="flex flex-col justify-between leading-normal">
          {children}
        </div>
      </div>
    </section>
  );
};

export default CustomCard;
