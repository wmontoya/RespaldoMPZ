import { useRef, useState } from "react";
import { CustomCard } from "components/General/CustomCard";
import { SearchInput } from "components/General/SearchInput";
import { VehicleTable } from "../VehiculeTable/VehiculeTable";
import { VehicleFormModal } from "../VehiculeFormModal";
import useParkingMetersStore from "@/store/useParkingMeters.store";
import { PlateInfo } from "@/types/plateInfo";
import { useLocalStorageEffect } from "@/hooks/useLocalStorageEffect";
import { CustomButton } from "components/General/CustomButton";
import { VehicleActions } from "../VehicleActions";
import { FaInfoCircle,FaQuestionCircle } from "react-icons/fa";

export const Garage = () => {
    const [plateInfo, setPlateInfo] = useLocalStorageEffect("plateInfo", []);
    const { parkingTime, plateTypeList } = useParkingMetersStore();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [plateSelected, setPlateSelected] = useState<PlateInfo | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const plateInfoRef = useRef<{ handleSubmitPlateInformation: () => boolean }>(null);

    const { handleAddVehicle, handleEditVehicle, handleDeleteVehicle } = VehicleActions({
        plateInfoRef,
        plateInfo,
        setPlateInfo,
        parkingTime,
        plateTypeList,
        setIsOpen,
    });

    const handleFavoriteToggle = (index: number) => {
        const updatedPlateInfo = plateInfo.map((item: { favorite: boolean; }, i: number) =>
            i === index ? { ...item, favorite: !item.favorite } : { ...item, favorite: false }
        );
        setPlateInfo(updatedPlateInfo);
        localStorage.setItem("plateInfo", JSON.stringify(updatedPlateInfo));
    };

    return (
        <CustomCard title="Mi Garaje" showHelpButton={true} className="mb-8">
            
            {plateInfo.length > 0 ? (
                <>
                    <div className="w-full flex items-center justify-between mb-5 mt-2">
                        <CustomButton
                            color="blue"
                            actionButton="Nuevo"
                            onClick={() => setIsOpen(true)}
                            className="px-6 py-2.5 me-2 ms-4"
                        />
                        <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-8 shadow-sm mx-4">
                        <div className="flex items-center">
                            <FaInfoCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                            <p className="text-amber-800 text-sm">
                                <span className="font-semibold">Tip:</span> Haga clic en el ícono de estrella para marcarlo como su favorito
                            </p>
                        </div>
                    </div>
                </>
            ) : null}

            <VehicleTable
                plateInfo={plateInfo}
                searchTerm={searchTerm}
                handleFavoriteToggle={handleFavoriteToggle}
                handleEditVehicle={(info) => {
                    setPlateSelected(info);
                    setIsOpen(true);
                }}
                handleAddVehicle={() => {
                    setIsOpen(true);
                }}
            />

            <VehicleFormModal
                isOpen={isOpen}
                plateSelected={plateSelected}
                setPlateSelected={setPlateSelected}
                handleAddVehicle={handleAddVehicle}
                handleEditVehicle={handleEditVehicle}
                handleDeleteVehicle={() => {
                    setPlateSelected(null);
                    handleDeleteVehicle(plateSelected!)
                }}
                setIsOpen={setIsOpen}
                plateInfoRef={plateInfoRef}
            />
        </CustomCard>
    );
};
