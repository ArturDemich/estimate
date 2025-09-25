import { NativeModules } from 'react-native';

const { PrinterPuty } = NativeModules;

export default {
  printImage: (base64Image: string, widthMm?: number, heightMm?: number, copies?: number): Promise<string> => PrinterPuty.printImage(base64Image, widthMm ?? -1, heightMm ?? -1, copies),
  connectPrinter: (macAddress: string): Promise<string> => PrinterPuty.connectPrinter(macAddress),
  disconnectPrinter: (): Promise<string> => PrinterPuty.disconnectPrinter(),
};
