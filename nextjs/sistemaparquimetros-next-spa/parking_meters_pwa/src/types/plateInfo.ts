import { PlateType } from "./plateType";

export interface PlateInfo {
    plateNumber: string;
    plateType?: PlateType;
    favorite?: boolean;
}