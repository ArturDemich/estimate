import { IBLEPrinter } from "@conodene/react-native-thermal-receipt-printer-image-qr";

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
    is_group?: boolean;
    id_parent?: string;
};
export interface PlantItemRespons {
    product: { id: string; name: string; };
    characteristic: { id: string; name: string; };
    unit: { id: string; name: string; };
    barcode: string;
    qty: number;
};
export interface PlantNameDB {
    count_items: number;
    total_qty: number;
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
    barcode: string;
    quantity: number;
};

export interface PlantDetailsResponse extends PlantDetails {
    id: number;
    currentQty: number;
};

export interface Label {
    product_name: string;
    characteristic_name: string;
    barcode: string;
    storageName: string;
    qtyPrint: number;
};

export interface NewVersionRes {
    version: string;
    url: string;
};

export interface DataSlice {
    digStorages: Storages[];
    searchPlantName: PlantItemRespons[];
    dBPlantsName: PlantNameDB[];
    dBPlantDetails: PlantDetailsResponse[];
    existPlantProps: PlantDetails | null;
    labelData: Label | null;
    pairedDevices: IBLEPrinter[];
    connectedPrinter: IBLEPrinter | null;
    docComment: string;
    autoPrint: boolean;
    newVersion: NewVersionRes | null;
    docSent: number;
    newDetailBarcode: string | null;
    currentStorage: Storages | null;
};

export interface PalntNameInput {
    name: string;
    barcode: string;
    storageId?: string;
    inStockOnly?: boolean;
};