import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { PlateInformation } from 'components/General/PlateInformation';
import { FaCarSide, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import React from 'react';
import { CustomTab } from 'components/General/CustomTab';
import { CustomCard } from 'components/General/CustomCard';
import { TimeInformation } from '../TimeInformation';

export const BuyTime = () => {
	const timeInfoRef = useRef<{ handleSubmitTimeInformation: () => boolean }>(null);
	const plateInfoRef = useRef<{ handleSubmitPlateInformation: () => boolean }>(null);
	const [plateDescription, setPlateDescription] = useState("");
	const [plateNumber, setPlateNumber] = useState("");
	const router = useRouter();
	
	useEffect(() => {
		const storedPlateInfo = localStorage.getItem("plateInfo");
		if (storedPlateInfo) {
			const parsedPlateInfo = JSON.parse(storedPlateInfo);
			if (parsedPlateInfo.length > 0) {
				for (const plateInfo of parsedPlateInfo) {
					if (plateInfo.favorite == true) {
						setPlateNumber(plateInfo.plateNumber);
						setPlateDescription(plateInfo.plateType?.Description);
					}
				}
			}
		}
	}, []);

	const handleTimeInformationSubmit = () => {
	
		let isCorrectInfoPlate = false;
		let isCorrectInfoTime = false;
		if (plateInfoRef.current) {
			isCorrectInfoPlate = plateInfoRef.current.handleSubmitPlateInformation();
		}
		if (timeInfoRef.current) {
			isCorrectInfoTime = timeInfoRef.current.handleSubmitTimeInformation();
		}

		if (isCorrectInfoPlate && isCorrectInfoTime) {
			router.push('/pagador');
		}
	};

	const tabs = [
		{ label: 'Favorito', isActive: true, icon: <FaStar color="orange" size={18} /> },
		{ label: 'Otros', icon: <FaCarSide color="orange" size={19} /> },
	];
	return (
		<>
			<div>
				<CustomTab tabs={tabs}>
					<CustomCard title='Vehículo Favorito' className='p-4' showHelpButton={true}>
						<PlateInformation ref={plateInfoRef} readOnly={true} plateSelected={plateNumber} descriptionPlate={plateDescription} />
					</CustomCard>

					<PlateInformation ref={plateInfoRef} readOnly={false} isCard={true} />
				</CustomTab>
				<TimeInformation ref={timeInfoRef} />
			</div>
			<div className="flex w-full justify-center my-6">
				<button disabled={false} onClick={handleTimeInformationSubmit} className="flex flex-row items-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800" >
					<FaMoneyBillWave className="mr-2 h-[25px] w-[25px]" /> Pagar
				</button>
			</div>
		</>
	);
}