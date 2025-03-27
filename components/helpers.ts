import { format } from "date-fns/format";
import { BluetoothStatus } from "react-native-bluetooth-status";

export function getUkrainianPart(name: string): string {
    const parts = name.split(",");
    return parts.length > 1 ? parts[1].trim() : name;
};

export const checkBluetoothEnabled = async () => {
    const isEnabled = await BluetoothStatus.state();
    return isEnabled;
};

export const formatDate = (timestamp: string): string => { 
    return format(timestamp, 'dd.MM.y - HH:mm');
}