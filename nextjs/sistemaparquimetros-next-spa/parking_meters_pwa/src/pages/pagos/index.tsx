import useParkingMetersStore from "@/store/useParkingMeters.store";
import { CustomButton } from "components/General/CustomButton";
import { CustomCard } from "components/General/CustomCard";
import { CustomTab } from "components/General/CustomTab";
import { Page } from "components/General/Page";
import { PlateInformation } from "components/General/PlateInformation";
import { SearchTicket } from "components/Pages/pagos/SearchTicket";
import { TableResult } from "components/Pages/pagos/TableResult";
import React, { useEffect, useRef, useState } from "react";
import { FaFileAlt, FaParking, FaSearch, FaStar } from "react-icons/fa";
import withAuthRedirect from "../hoc";


function PagosPage() {
  const { getInfractions, resetParkingTime } = useParkingMetersStore();
  const plateInfoRef = useRef<{ handleSubmitPlateInformation: () => boolean }>(null);
  const searchTicketRef = useRef<{ handleSubmitSearchTicket: () => boolean }>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [infractionList, setInfractionList] = useState<Array<any>>([]);
  const [plateDescription, setPlateDescription] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [isRequest, setIsRequest] = useState(false);

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

  const handleTimeInformationSubmit = async () => {
    let isCorrectInfoPlate = false;
    let isTikectSearch = false;

    if (plateInfoRef.current) {
      isCorrectInfoPlate = plateInfoRef.current.handleSubmitPlateInformation();
      if (isCorrectInfoPlate) {
        setIsRequest(true);
        let infraction = await getInfractions();
        if (infraction.success) {
          setInfractionList(infraction.data);
        }
      }
    }

    if (searchTicketRef.current) {
      isTikectSearch = searchTicketRef.current.handleSubmitSearchTicket();
      if (isTikectSearch) {
        setIsRequest(true);
        let infraction = await getInfractions();
        if (infraction.success) {
          setInfractionList(infraction.data);
        }
      }
    }
  };

  const onTabChange = () => {
    resetParkingTime();
    setIsRequest(false);
  };

  const tabs = [
    { label: "Favorito", icon: <FaStar color="orange" size={19} /> },
    { label: "Por Placa", icon: <FaParking color="orange" size={19} /> },
    { label: "Por Boleta", icon: <FaFileAlt color="orange" size={19} /> },
  ];

  return (
    <div>
      <Page>
        <CustomCard title="Pago de Infracciones" showHelpButton={true} className="m-4">
          <CustomTab tabs={tabs} onTabChange={onTabChange}>
            <div>
              <PlateInformation
                key={`tab-${1}`}
                ref={plateInfoRef}
                readOnly={true}
                plateSelected={plateNumber}
                descriptionPlate={plateDescription}
              />
            </div>
            <div>
              <PlateInformation key={`tab-${2}`} ref={plateInfoRef} />
            </div>
            <div>
              <SearchTicket ref={searchTicketRef} />
            </div>
          </CustomTab>
          <div className="flex w-full justify-end my-1">
            <CustomButton
              onClick={handleTimeInformationSubmit}
              color={"blue"}
              Icon={FaSearch}
              actionButton="Consultar"
              className="px-6 py-2.5 me-2 ms-4 mb-4"
            />
          </div>
        </CustomCard>
        {isRequest && <TableResult infractionList={infractionList} activeRow={activeRow} setActiveRow={setActiveRow} />}
      </Page>
    </div>
  );
}

export default withAuthRedirect(PagosPage);
