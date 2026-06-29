import React from "react";
import { FavoriteToggle } from "../FavoriteToggle";
import { IconType } from "react-icons";
import {
    FaShoppingBag,
    FaRegMoneyBillAlt,
    FaMotorcycle,
    FaTruckPickup,
    FaTruckMoving,
    FaCarSide,
    FaPlus,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { CustomButton } from "components/General/CustomButton";

interface PlateInfo {
    plateNumber: string;
    plateType?: {
        Description: string;
        Id: number;
    };
    favorite?: boolean;
}

interface VehicleTableProps {
    plateInfo: Array<PlateInfo>;
    searchTerm: string;
    handleFavoriteToggle: (index: number) => void;
    handleEditVehicle: (plateSelected: any) => void;
    handleAddVehicle?: () => void;
}

const iconMap: { [key: string]: IconType } = {
    "MOTOCICLETAS": FaMotorcycle,
    "BICIMOTOS": FaMotorcycle,
    "CARGA LIVIANA": FaTruckPickup,
    "VEHICULOS PESADOS CARGA PESADA": FaTruckMoving,
};

const imageMap: { [key: string]: string } = {
    "MOTOCICLETAS": "/images/moto.avif",
    "BICIMOTOS": "/images/bicimoto.avif",
    "CARGA LIVIANA": "/images/pickup.avif",
    "VEHICULOS PESADOS CARGA PESADA": "/images/camion.avif",
    "PERMISOS DE TAXI": "/images/taxi.avif",
};

export const VehicleTable: React.FC<VehicleTableProps> = ({
    plateInfo,
    searchTerm,
    handleFavoriteToggle,
    handleEditVehicle,
    handleAddVehicle
}) => {
    const router = useRouter();
    const { basePath } = useRouter();
    const filteredPlateInfo = plateInfo.filter((info) =>
        info.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div>
            {filteredPlateInfo.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-4 mb-4">

                    {filteredPlateInfo.map((info, index) => {
                        const typeCar = info.plateType?.Description?.toUpperCase() || "";
                        const IconComponent = iconMap[typeCar] || FaCarSide;
                        const imageUrl = `${basePath}${imageMap[typeCar] || "/images/sedan.avif"}`;
                        const gradientClass = info.favorite
                            ? "from-green-500 to-green-700"
                            : "from-blue-700 to-blue-950";

                        return (

                            <div
                                onClick={() => handleEditVehicle(info)}
                                key={index}
                                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col bg-white border-0 shadow-md overflow-hidden rounded-lg dark:bg-gray-700 dark:border-gray-200 dark:text-white hover:bg-gray-100 hover:border-gray-400 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:hover:text-white"
                            >


                                <div className="p-0 w-full">
                                    {/* Header */}
                                    <div className={`bg-gradient-to-l ${gradientClass} p-4 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="bg-white/20 text-white border-white/30 font-medium border-0 rounded-xl px-3 py-1 text-xs uppercase tracking-wide">
                                                    Vehículo Registrado
                                                </div>
                                                <button className="text-white hover:bg-white/20 p-1 h-auto">
                                                    <FavoriteToggle
                                                        isFavorite={info.favorite}
                                                        onClick={() => handleFavoriteToggle(index)}
                                                    />
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="text-white space-y-1">
                                                    <p className="font-bold text-lg">
                                                        <span className="text-white/70 font-normal">Placa: </span>{info.plateNumber}
                                                    </p>
                                                    <p className="text-sm text-white">
                                                        <span className="text-white/70 font-normal">Tipo de placa: </span>{info.plateType?.Description || "No especificado"}
                                                    </p>
                                                    <p className="text-xs text-white">
                                                        <span className="text-white/70 font-normal"></span>{info.favorite ? "Favorito" : "No favorito"}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative overflow-hidden rounded-b-lg bg-white/30 dark:bg-black/60" style={{ height: "200px" }}>
                                        <img
                                            src={imageUrl}
                                            alt="imagen"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-0 left-1 right-1 bg-black/50 text-white text-xs text-center px-2 py-1 rounded">
                                            Imagen con fines ilustrativos
                                        </div>
                                    </div>

                                    <div className="relative z-10 -mt-2 px-4 pb-4">
                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                type="button"
                                                className={`flex-1 flex items-center bg-gradient-to-r ${gradientClass} justify-center gap-2 text-white font-medium rounded-lg text-sm px-4 py-2`}
                                                onClick={(event) => {
                                                    !info.favorite && handleFavoriteToggle(index);
                                                    event.stopPropagation();
                                                    router.push("/compras");
                                                }}
                                            >
                                                <FaShoppingBag className="w-4 h-4" />
                                                Comprar
                                            </button>

                                            <button
                                                type="button"
                                                className="flex-1 flex items-center justify-center gap-2 text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600"
                                                onClick={(event) => {
                                                    !info.favorite && handleFavoriteToggle(index);
                                                    event.stopPropagation();
                                                    router.push("/pagos");
                                                }}
                                            >
                                                <FaRegMoneyBillAlt className="w-4 h-4" />
                                                Multas
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        );
                    })
                    }
                </div>
            )}
            {filteredPlateInfo.length == 0 && (
            <div className="flex items-center justify-center">
                <div className="text-center py-20">
                    <FaCarSide className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-2">Tu garaje está vacío</h2>
                    <p className="text-gray-500 mb-6">Agrega tu primer vehículo para comenzar</p>
                    <CustomButton color="blue" actionButton="Agregar Primer Vehículo" onClick={() => { handleAddVehicle && handleAddVehicle(); }} className="px-6 py-2.5 me-2 ms-4" />
                </div>
            </div>
            )}
        </div>
    );
};

export default VehicleTable;