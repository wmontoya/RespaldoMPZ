import React from "react";
import { PlateInformation } from "components/General/PlateInformation";
import { FaRegSave, FaRegTrashAlt, FaTimes } from "react-icons/fa";
import { PlateInfo } from "@/types/plateInfo";
import { CustomButton } from "components/General/CustomButton";

interface VehicleFormModalProps {
    isOpen: boolean;
    plateSelected: any;
    setPlateSelected: any;
    handleAddVehicle: () => void;
    handleDeleteVehicle: () => void;
    handleEditVehicle: (info: PlateInfo) => void;
    setIsOpen: (isOpen: boolean) => void;
    plateInfoRef: React.RefObject<{ handleSubmitPlateInformation: () => boolean }>;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
    isOpen,
    plateSelected,
    setPlateSelected,
    handleAddVehicle,
    handleDeleteVehicle,
    handleEditVehicle,
    setIsOpen,
    plateInfoRef,
}) => {
    const setVehicule = () => {
        let isCorrectInfoPlate = false;

        if (plateInfoRef.current) {
            isCorrectInfoPlate = plateInfoRef.current.handleSubmitPlateInformation();
        }
        if (plateSelected) {


            if (isCorrectInfoPlate) {
                handleEditVehicle(plateSelected)
            }
        }
        else {
            if (isCorrectInfoPlate) {
                handleAddVehicle()
            }
        }
    };

    return isOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-400 bg-opacity-95">
            <div className="relative w-full max-w-7xl max-h-full">
                <div className="relative bg-white rounded-xl shadow dark:bg-gray-700">
                    <CustomButton
                        color='gray'
                        onClick={() => { setIsOpen(false); setPlateSelected(null); }}
                        Icon={FaTimes}
                        className="absolute top-3 right-2.5 top-6 px-0 py-0 me-0"
                        iconClassName="mr-0"
                    />
                    <div className="pb-1">
                        <PlateInformation
                            ref={plateInfoRef}
                            isCard={true}
                            descriptionPlate={plateSelected?.plateType?.Description || ""}
                            plateSelected={plateSelected?.plateNumber || ""}
                        />
                        <div className="px-2 pt-4 pb-1 flex items-center justify-end">
                            <CustomButton
                                className="px-6 py-2.5 me-2"
                                actionButton='Guardar'
                                color='green'
                                onClick={setVehicule}
                                Icon={FaRegSave}
                            />

                            {plateSelected && (
                                <CustomButton
                                    className="px-6 py-2.5 me-2"
                                    actionButton='Eliminar'
                                    color='red'
                                    onClick={handleDeleteVehicle}
                                    Icon={FaRegTrashAlt}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default VehicleFormModal;