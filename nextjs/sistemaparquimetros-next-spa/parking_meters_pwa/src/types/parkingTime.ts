export interface ParkingTime {
    plateTypeId: number;
    plateNumber: string;
    plateDetailId: number;
    parkingRateId: Array<number>;
    startTime?: Date;
    endTime?: Date;
    email: string;
    phone: string;
    id:string;
    name:string;
    lastName:string;
    amount:number;
    ticketNumber?:string;
    subscription:string;
    ip:string;
  }