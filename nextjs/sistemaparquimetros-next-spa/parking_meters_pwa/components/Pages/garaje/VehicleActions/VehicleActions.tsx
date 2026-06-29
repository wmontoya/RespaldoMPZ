import useParkingMetersStore from "@/store/useParkingMeters.store";
import { PlateInfo } from "@/types/plateInfo";

interface VehicleActionsProps {
    plateInfoRef: React.MutableRefObject<{ handleSubmitPlateInformation: () => boolean } | null>;
    plateInfo: PlateInfo[];
    setPlateInfo: React.Dispatch<React.SetStateAction<PlateInfo[]>>;
    parkingTime: any;
    plateTypeList: any[];
    setIsOpen: (value: boolean) => void;
}

export const VehicleActions = ({
    plateInfoRef,
    plateInfo,
    setPlateInfo,
    setIsOpen,
}: VehicleActionsProps) => {
    const { parkingTime, plateTypeList, setParkingTime } = useParkingMetersStore();

    const handleAddVehicle = () => {

        const submitSuccess = plateInfoRef.current?.handleSubmitPlateInformation();
        let storedPlateInfo = JSON.parse(localStorage.getItem("plateInfo") || "[]");
        if (submitSuccess) {
            const newVehicle = {
                plateNumber: parkingTime.plateNumber,
                plateType: plateTypeList.find((type:any) => type.Id === parkingTime.plateTypeId),
                favorite: storedPlateInfo.length == 0,
            };

            const updatedPlateInfo = [...plateInfo, newVehicle];
            setPlateInfo(updatedPlateInfo);
            localStorage.setItem("plateInfo", JSON.stringify(updatedPlateInfo));
            setIsOpen(false);
            setParkingTime({
                plateTypeId: undefined,
                plateNumber: ""
            });
        }
    };

    const handleEditVehicle = (info: any) => {
        const updatedPlateInfo = plateInfo.map((item:any) =>
            item.plateNumber === info.plateNumber && item.plateType?.Id === info.plateType?.Id
                ? { ...item, plateNumber: parkingTime.plateNumber, plateType: plateTypeList.find((type:any) => type.Id === parkingTime.plateTypeId) }
                : item
        );

        setPlateInfo(updatedPlateInfo);
        localStorage.setItem("plateInfo", JSON.stringify(updatedPlateInfo));
        setIsOpen(false);
        setParkingTime({
            plateTypeId: undefined,
            plateNumber: ""
        });
    };

    const handleDeleteVehicle = (plateSelected: any) => {

        const updatedPlateInfo = plateInfo.filter(
            (info:any) => info.plateNumber !== plateSelected.plateNumber || info.plateType?.Id !== plateSelected.plateType?.Id
        );
        const wasFavorite = plateSelected.favorite;
        if (wasFavorite) {
            const hasFavorite = updatedPlateInfo.some((info) => info.favorite);
            if (!hasFavorite && updatedPlateInfo.length > 0) {
                updatedPlateInfo[0].favorite = true;
            }
        }
        setPlateInfo(updatedPlateInfo);
        localStorage.setItem("plateInfo", JSON.stringify(updatedPlateInfo));
        setIsOpen(false);
    };

    return { handleAddVehicle, handleEditVehicle, handleDeleteVehicle };
};

export default VehicleActions;