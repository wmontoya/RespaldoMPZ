export interface PlateDetail {
    id: number;
    classCode: string;
    governmentCode: string;
}

export interface PlateType {
    id: number;
    description: string;
    plateDetail: Array<PlateDetail>;
}