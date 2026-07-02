declare module 'react-native-bluetooth-escpos-printer' {
    import { NativeModule } from 'react-native';

    export const BluetoothManager: {
        isBluetoothEnabled(): Promise<boolean>;
        enableBluetooth(): Promise<string[]>;
        scanDevices(): Promise<string>;
        connect(address: string): Promise<string>;
        unpaire(address: string): Promise<string>;
        EVENT_DEVICE_ALREADY_PAIRED: string;
        EVENT_DEVICE_FOUND: string;
        EVENT_DEVICE_DISCOVER_DONE: string;
        EVENT_CONNECTION_LOST: string;
        EVENT_UNABLE_CONNECT: string;
        EVENT_CONNECTED: string;
        EVENT_BLUETOOTH_NOT_SUPPORT: string;
    };

    export const BluetoothEscposPrinter: NativeModule & {
        printerInit(): Promise<void>;
        printPic(base64: string, options?: { width?: number; left?: number }): void;
        printText(text: string, options?: Record<string, unknown>): Promise<void>;
    };

    export const BluetoothTscPrinter: NativeModule & {
        printLabel(options: Record<string, unknown>): Promise<void>;
        DIRECTION: { FORWARD: number; BACKWARD: number };
        TEAR: { ON: string; OFF: string };
        BITMAP_MODE: { OVERWRITE: number; OR: number; XOR: number };
    };
}
