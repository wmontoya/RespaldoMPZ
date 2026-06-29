'use client';

import { SearchList } from '../SearchList';
import useParkingMetersStore from "@/store/useParkingMeters.store";
import { PlateInformationSchema } from './PlateInformationSchema';
import { CustomCard } from 'components/General/CustomCard';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FaInfoCircle, FaStar } from 'react-icons/fa';
import Loading from '../LoadingForm/LoadingForm';
import { ModalNotification } from '../ModalNotification';

interface PlateInformationProps {
    plateSelected?: string;
    descriptionPlate?: string;
    readOnly?: boolean;
    isCard?: boolean;
}

export const PlateInformation = forwardRef(({ plateSelected, descriptionPlate, readOnly = false, isCard }: PlateInformationProps, ref) => {
    const { plateTypeList, getPlateTypes, setParkingTime, fastPlateTypeList, loading } = useParkingMetersStore();
    const [selectedPlateType, setSelectedPlateType] = useState<any>(null);
    const [newKey, setNewKey] = useState('');
    const [plateDescription, setPlateDescription] = useState("");
    const [plateNumber, setPlateNumber] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        if (plateTypeList.length === 0) {
            getPlateTypes();
        }
    }, []);

    useEffect(() => {
        if (plateSelected && plateNumber === '') {
            setPlateNumber(plateSelected.toUpperCase());
        }
        if (descriptionPlate) {
            setPlateDescription(descriptionPlate);
            const matchedType = plateTypeList.find((plate: any) => plate.Description === descriptionPlate);
            if (matchedType) {
                setSelectedPlateType(matchedType);
            }
        }
    }, [plateSelected, descriptionPlate, plateTypeList]);

    const handleSelectPlateType = (item: any) => {
        setSelectedPlateType(item);
        setParkingTime({
            plateTypeId: item ? item.Id : 0
        });
        setErrors(prev => {
            const updated = { ...prev };
            delete updated.plateType;
            return updated;
        });
    };

    const handleClearType = () => {
        setSelectedPlateType(null);
    };

    const handledPlateNumber = (value: any) => {
        const newValue = value.target.value.toUpperCase();
        setPlateNumber(newValue);
        setParkingTime({ plateNumber: newValue });

        setErrors(prev => {
            const updated = { ...prev };
            delete updated.vehiclePlate;
            return updated;
        });
    };

    const handleSubmitPlateInformation = () => {
        const formData = {
            vehiclePlate: plateNumber.toUpperCase(),
            plateType: selectedPlateType
        };

        if (descriptionPlate && selectedPlateType == null) {
            const searchPlateType = plateTypeList.find((plate: any) => plate.Description === descriptionPlate);
            formData.plateType = searchPlateType;
        }

        const validation = PlateInformationSchema.safeParse(formData);

        if (!validation.success) {
            const formattedErrors: { [key: string]: string } = {};
            validation.error.issues.forEach(issue => {
                formattedErrors[issue.path[0]] = issue.message;
            });
            setErrors(formattedErrors);
            return false;
        }

        setParkingTime({
            plateTypeId: formData.plateType.Id,
            plateNumber: formData.vehiclePlate
        });
        setSelectedPlateType(null);
        setNewKey(Math.random().toString());
        setErrors({});
        return true;
    };

    useImperativeHandle(ref, () => ({
        handleSubmitPlateInformation,
    }));

    const renderFormContent = () => {
        return readOnly ? (
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Placa del Vehículo
                        </label>
                        <div className="flex items-center w-full rounded-lg overflow-hidden border border-gray-300 bg-blue-50 dark:bg-gray-700 dark:border-gray-600">
                            <input
                                value={plateNumber}
                                type="text"
                                id="placa"
                                name="placa"
                                className="flex-1 px-3 py-2 text-sm text-gray-900 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500"
                                disabled
                            />
                            <button
                                type="button"
                                onClick={() => setShowInfoModal(true)}
                                className="px-3 py-2 border-l border-gray-300 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:border-gray-600"
                                aria-label="Información sobre la placa"
                            >
                                <FaInfoCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de Placa
                        </label>
                        <input
                            value={plateDescription}
                            type="text"
                            id="tipoPlaca"
                            name="tipoPlaca"
                            className="bg-blue-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            disabled
                        />
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 w-full">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Placa del Vehículo
                    </label>
                    <div className="flex items-center w-full rounded-lg overflow-hidden">
                        <input
                            onChange={handledPlateNumber}
                            value={plateNumber}
                            type="text"
                            id="placa"
                            name="placa"
                            className="bg-blue-50 border-l border-t border-b border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="AAA123"
                        />
                        <button
                            type="button"
                            onClick={() => setShowInfoModal(true)}
                            className="px-3 py-2 border-l border-t border-b border-r border-gray-300 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 rounded-r-lg"
                            aria-label="Información sobre la placa"
                        >
                            <FaInfoCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    {errors.vehiclePlate && <p className="text-red-500 text-sm">{errors.vehiclePlate}</p>}
                </div>
                <div>
                    <SearchList
                        key={newKey}
                        filtered={plateDescription}
                        items={plateTypeList}
                        filterLabel="Description"
                        label="Tipo de Placa"
                        onSelect={handleSelectPlateType}
                        onClear={handleClearType}
                    />
                    <div className="rounded-md mt-2">
                        {fastPlateTypeList.map((type, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setPlateDescription(type.Description);
                                    handleSelectPlateType(type);
                                }}
                                className="inline-flex items-center mr-1 px-1 py-1 mb-1 text-[10px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                            >
                                <FaStar color="orange" style={{ stroke: 'gray', strokeWidth: 50, marginRight: 3 }} />
                                {type.SubDescription ? type.SubDescription : type.Description}
                            </button>
                        ))}
                    </div>
                    {errors.plateType && <p className="text-red-500 text-sm">{errors.plateType}</p>}
                </div>
            </div>
        );
    };

    return (
        <div>
            {isCard ? (
                <CustomCard title="Información de la Placa" className="p-4" showHelpButton={false}>
                    {renderFormContent()}
                </CustomCard>
            ) : (
                <div>{renderFormContent()}</div>
            )}
            {loading && <Loading />}
            <ModalNotification
                isOpenModal={showInfoModal}
                closeModal={() => setShowInfoModal(false)}
                title="Información"
                notificationType="info"
                message={
                    <div className="text-left text-md text-gray-700 dark:text-gray-200">
                        <p className="font-medium">
                            Solo debe ingresar el número de placa. Tome en cuenta las siguientes indicaciones:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Debe tener un máximo de <strong>6 caracteres</strong>.</li>
                            <li>No se permiten <strong>guiones</strong> o <strong>espacios vacíos</strong>.</li>
                            <li>No incluya el tipo de placa como <strong>CL</strong>, <strong>M</strong>, <strong>TSJ</strong>, etc.</li>
                        </ul>
                    </div>
                }
                showCancelButton={false}
                showAprobeButton={true}
                confirmText="Entendido"
            />
        </div>
    );
});

PlateInformation.displayName = "PlateInformation";
