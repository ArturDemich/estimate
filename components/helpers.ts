import { BluetoothStatus } from "react-native-bluetooth-status";

export function getUkrainianPart(name: string): string {
    const parts = name.split(",");
    return parts.length > 1 ? parts[1].trim() : name;
};

export const checkBluetoothEnabled = async () => {
    const isEnabled = await BluetoothStatus.state();
    return isEnabled;
};