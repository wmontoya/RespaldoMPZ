import { ParkingRate } from "@/types/parkingRate";
import { ParkingTime } from "@/types/parkingTime";
import { PlateType } from "@/types/plateType";
import { ParkingResponse } from "@/types/response";
import { create } from "zustand";

interface StoreState {
  activeStatus: any;
  parkingRateList: Array<ParkingRate>;
  plateTypeList: Array<PlateType>;
  fastPlateTypeList: Array<any>;
  parkingTime: ParkingTime;
  getParkingRates: () => void;
  getParkingTime: () => Promise<ParkingResponse>;
  getPayment: (temporalId: string) => Promise<ParkingResponse>;
  setPayment: () => Promise<ParkingResponse>;
  getInfractions: () => Promise<ParkingResponse>;
  getPlateTypes: () => void;
  setParkingTime: (newParkingTime: Partial<ParkingTime>) => void;
  resetParkingTime: () => void;
  getClientIP: () => void;
  getActive: () => Promise<ParkingResponse>;
  getTime: (plateNumber: string, plateTypeId: string) => Promise<ParkingResponse>;
  loading: boolean;
  error: string | null;
}

const initialParkingTime: ParkingTime = {
  plateTypeId: 0,
  plateNumber: "",
  plateDetailId: 0,
  parkingRateId: [],
  startTime: new Date(),
  endTime: new Date(),
  email: "",
  phone: "",
  id: "",
  lastName: "",
  name: "",
  amount: 0,
  ticketNumber: "",
  subscription: "",
  ip: ""
};

const useParkingMetersStore = create<StoreState>((set, get) => ({
  activeStatus: null,
  parkingRateList: [],
  plateTypeList: [],
  fastPlateTypeList: [],
  parkingTime: { ...initialParkingTime },
  loading: false,
  sessionId: "",
  error: null,
  getParkingRates: async () => {
    const { parkingRateList } = get();
    if (parkingRateList && parkingRateList.length > 0) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/parking-rate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch parking rates");
      }

      const data = await response.json();

      set({ parkingRateList: data.data, loading: false });
    } catch (error) {
      set({ parkingRateList: [], error: (error as Error).message, loading: false });
    }
  },
  getPlateTypes: async () => {
    const { plateTypeList } = get();

    if (plateTypeList && plateTypeList.length > 0) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/plate-type`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch plate types");
      }

      const data = await response.json();
      const filterDescriptions = ["PARTICULARES", "MOTOCICLETAS", "CARGA LIVIANA", "PERMISOS DE TAXI", "CARGA PESADA"];

      const particularOrder = [
        "PARTICULAR",
        "PARTICULAR-COUPÉ",
        "PARTICULAR-SEDAN",
        "PARTICULAR-RURAL",

      ];

      const filteredPlateTypes = data.data
        .filter((plateType: { Description: string }) =>
          filterDescriptions.includes(plateType.Description)
        )
        .flatMap((plateType: { Description: string }) => {
          if (plateType.Description === "CARGA PESADA") {
            return [{ ...plateType, SubDescription: "CAMIÓN" }];
          } else if (plateType.Description === "PARTICULARES") {
            return particularOrder.map(sub => ({
              ...plateType,
              SubDescription: sub
            }));
          } else {
            return [plateType];
          }
        })
        .sort((a: { Description: string; SubDescription: string; }, b: { Description: string; SubDescription: string; }) => {
          if (a.Description === "PARTICULARES" && b.Description === "PARTICULARES") {
            return particularOrder.indexOf(a.SubDescription) - particularOrder.indexOf(b.SubDescription);
          }
          if (a.Description === "PARTICULARES") return -1;
          if (b.Description === "PARTICULARES") return 1;
          return 0;
        });

      set({ plateTypeList: data.data, loading: false, fastPlateTypeList: filteredPlateTypes });
    } catch (error) {
      console.error(error);

      set({ plateTypeList: [], error: (error as Error).message, loading: false });
    }
  },
  getParkingTime: async (): Promise<ParkingResponse> => {
    const { parkingTime } = get();
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/parking-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        },
        body: JSON.stringify(parkingTime),
      });

      if (!response.ok) {
        throw new Error("Failed to post parking time");
      }

      const result = await response.json();

      localStorage.setItem("plate_number", parkingTime.plateNumber);
      localStorage.setItem("plate_type_id", parkingTime.plateTypeId.toString());
      set({ loading: false });
      return JSON.parse(JSON.stringify(result));

    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: (error as Error).message
      };
    }
  },
  getInfractions: async (): Promise<ParkingResponse> => {
    const currentParkingTime = get().parkingTime;
    set({ loading: true, error: null });
    let upperCasePlateNumber = currentParkingTime.plateNumber.toUpperCase();

    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/infraction?plateNumber=${upperCasePlateNumber}&plateTypeId=${currentParkingTime.plateTypeId}&ticketNumber=${currentParkingTime.ticketNumber}&isToday=false`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to post to get infraction");
      }

      const result = await response.json();

      set({ loading: false });
      return result;

    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: (error as Error).message
      };
    }
  },
  getPayment: async (temporalId: string): Promise<ParkingResponse> => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/payment?temporalId=${temporalId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to post to get infraction");
      }

      const result = await response.json();

      set({ loading: false });
      return result;

    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: (error as Error).message
      };
    }
  },
  setPayment: async (): Promise<ParkingResponse> => {

    set({ loading: true, error: null });
    const { parkingTime } = get();
    
    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        },
        body: JSON.stringify({
          ticket_number: parkingTime.ticketNumber,
          email: parkingTime.email,
          identification: parkingTime.id,
          ip: parkingTime.ip,
          phone: parkingTime.phone,
          name: parkingTime.name,
          last_name: parkingTime.lastName
        })
      });

      if (!response.ok) {
        throw new Error("Failed to post to set infraction");
      }

      const result = await response.json();

      set({ loading: false });
      return result;

    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: (error as Error).message
      };
    }
  },
  setParkingTime: (newParkingTime: Partial<ParkingTime>) => {
    set((state) => ({
      parkingTime: { ...state.parkingTime, ...newParkingTime },
    }));
  },
  resetParkingTime: () => {
    set({ parkingTime: { ...initialParkingTime } });
  },
  getClientIP: async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      set((state) => ({
        parkingTime: { ...state.parkingTime, ip: data.ip },
      }));
    } catch (error) {
      console.error('Error fetching IP:', error);
    }
  },
  getActive: async (): Promise<ParkingResponse> => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/parameter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        },
        body: JSON.stringify({ "parameterName": "parking_meters.Is_Active" }),
      });
      if (!response.ok) {
        throw new Error("Failed to post parking time");
      }

      const result = await response.json();

      set({ loading: false, activeStatus: result.data.Value });
      return JSON.parse(JSON.stringify(result));

    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: (error as Error).message
      };
    }
  },
  getTime: async (plateNumber: string, plateTypeId: string): Promise<ParkingResponse> => {

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_API_REQUEST}/api/v1/parking-meters/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.perezzeledon.go.cr",
        },
        body: JSON.stringify({ plateNumber: plateNumber, plateTypeId: plateTypeId })
      });

      if (!response.ok) {
        throw new Error("Failed to post parking time");
      }

      const result = await response.json();

      set({ loading: false });
      return result;

    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  },

}));

export default useParkingMetersStore;


