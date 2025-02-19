export interface LoginData {
    login: string;
    pass: string;
};
export interface TokenResponse {
    token: string;
    name: string;
    allowPersonalMessages: boolean;
};
export interface AuthSlice {
    status: string;
    isAuthenticated: boolean;
    token: TokenResponse | {},
};

export enum LoadingStatus {
    Loading = 'Loading',
    Succeeded = 'Succeeded',
    Failed = 'Failed'
};

export interface Storages {
    id: string;
    name: string;
    is_group: boolean;
    id_parent: string;
};
export interface PlantItemRespons {
    product: { id: string; name: string; };
    characteristic: { id: string; name: string; };
    unit: { id: string; name: string; };
    barcode: string;
    quantity?: number;
};
export interface PlantNameDB {
    product_id: string;
    product_name: string;
    document_id: number;
    id: number;
};
export interface PlantDetails {
    plant_id: number;
    characteristic_id: string;
    characteristic_name: string;
    unit_id: string;
    unit_name: string;
    barcode: number;
    quantity: number;
};

export interface DataSlice {
    digStorages: Storages[];
    searchPlantName: PlantItemRespons[];
    dBPlantsName: PlantNameDB[];
    dBPlantDetails: PlantDetails[]
};

export interface PalntNameInput {
    name: string;
    barcode: string;
};