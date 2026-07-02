import * as SecureStore from 'expo-secure-store';
import { getLatinPart, getUkrainianPart } from '@/components/helpers';

export const KEY_LABEL_SIZE = 'labelWeight';
export const KEY_PRINTER_TYPE = 'printerType';
export const KEY_LABEL_GAP = 'labelGap';
export const KEY_LABEL_HEIGHT = 'labelHeight';
export const KEY_LABEL_IMG_X = 'labelImgX';
export const KEY_LABEL_IMG_Y = 'labelImgY';
export const KEY_LABEL_IMG_WIDTH = 'labelImgWidth';
export const KEY_LABEL_ESC_LEFT = 'labelEscLeft';
export const KEY_LABEL_ESC_WIDTH = 'labelEscWidth';
export const KEY_LABEL_NAME_MODE = 'labelNameMode';

export enum SizeLabel {
    Fifty = 50,
    Forty = 40,
}

export enum PrinterType {
    TSC = 'TSC',
    ESC = 'ESC',
}

export enum LabelNameMode {
    Full = 'full',
    Ukrainian = 'ukr',
    Latin = 'latin',
}

export interface PrinterDevice {
    device_name: string;
    inner_mac_address: string;
}

export interface LabelPrintSettings {
    labelWidthMm: number;
    gap: number;
    height: number;
    imgX: number;
    imgY: number;
    imgWidth: number | null;
    escLeft: number | null;
    escWidth: number | null;
    labelNameMode: LabelNameMode;
}

const DEFAULTS = {
    gap: '3',
    height: '30',
    imgX: '0',
    imgY: '10',
    imgWidth: '',
    escLeft: '',
    escWidth: '',
    labelNameMode: LabelNameMode.Ukrainian,
};

export function formatPlantNameForLabel(name: string, mode: LabelNameMode): string {
    const ukrainian = getUkrainianPart(name);
    const latin = getLatinPart(name);

    switch (mode) {
        case LabelNameMode.Ukrainian:
            return ukrainian;
        case LabelNameMode.Latin:
            return latin;
        case LabelNameMode.Full:
        default:
            if (latin && ukrainian && latin !== ukrainian) {
                return `${latin}, ${ukrainian}`;
            }
            return ukrainian || latin || name;
    }
}

export function parsePairedDevices(raw: string[]): PrinterDevice[] {
    return raw.reduce<PrinterDevice[]>((acc, item) => {
        try {
            const device = JSON.parse(item);
            if (device.address) {
                acc.push({
                    device_name: device.name || 'Unknown',
                    inner_mac_address: device.address,
                });
            }
        } catch {
            // ignore malformed entries
        }
        return acc;
    }, []);
}

export const LABEL_PRINTER_DPI = 203;
export const LABEL_DESIGN_WIDTH = 300;

export function getLabelPixelWidth(labelWidthMm: number): number {
    return Math.round((labelWidthMm / 25.4) * LABEL_PRINTER_DPI);
}

export function getLabelPixelHeight(heightMm: number): number {
    return Math.round((heightMm / 25.4) * LABEL_PRINTER_DPI);
}

export function getLabelImageWidth(screenWidth: number, labelSizeMm: number): number {
    let originalImgWidth: number;
    switch (screenWidth) {
        case 800:
            originalImgWidth = 880;
            break;
        case 490:
            originalImgWidth = 522;
            break;
        case 411:
            originalImgWidth = 433;
            break;
        case 392:
            originalImgWidth = 415;
            break;
        default:
            originalImgWidth = screenWidth * 1.055;
            break;
    }
    const scale = labelSizeMm / 50;
    return Math.floor(originalImgWidth * scale);
}

export function normalizeBarcode(barcode: string): string {
    return barcode.replace(/\s/g, '').trim();
}

export function isValidEan13(barcode: string): boolean {
    const normalized = normalizeBarcode(barcode);
    if (!/^\d{13}$/.test(normalized)) return false;

    const digits = normalized.split('').map(Number);
    const sum = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 1 : 3), 0);
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[12];
}

export function getBarcodeFormat(barcode: string): 'EAN13' | 'CODE128' {
    const normalized = normalizeBarcode(barcode);
    return isValidEan13(normalized) ? 'EAN13' : 'CODE128';
}

export function getBarcodeEncodeValue(barcode: string, format: 'EAN13' | 'CODE128'): string {
    const normalized = normalizeBarcode(barcode);
    if (format === 'EAN13') {
        return normalized.slice(0, 12);
    }
    return normalized;
}

export function formatBarcodeDisplay(barcode: string, format: 'EAN13' | 'CODE128'): string {
    const normalized = normalizeBarcode(barcode);
    if (format === 'EAN13' && normalized.length === 13) {
        return `${normalized[0]} ${normalized.slice(1, 7)} ${normalized.slice(7)}`;
    }
    return normalized;
}

const EAN13_MODULES = 95;
const CODE128_MODULES_PER_CHAR = 11;
const CODE128_MODULES_OVERHEAD = 35;
const BARCODE_QUIET_ZONE = 20;

function estimateCode128Modules(value: string): number {
    return value.length * CODE128_MODULES_PER_CHAR + CODE128_MODULES_OVERHEAD;
}

export function getBarcodeSingleBarWidth(
    format: 'EAN13' | 'CODE128',
    encodeValue: string,
    availableWidth: number,
): number {
    const modules = format === 'EAN13' ? EAN13_MODULES : estimateCode128Modules(encodeValue);
    const fit = Math.floor((availableWidth - BARCODE_QUIET_ZONE) / modules);
    return Math.min(Math.max(fit, 2), 3);
}

export async function ensureLabelSettingsStored(): Promise<void> {
    const keys = [
        [KEY_LABEL_SIZE, '40'],
        [KEY_PRINTER_TYPE, PrinterType.TSC],
        [KEY_LABEL_GAP, DEFAULTS.gap],
        [KEY_LABEL_HEIGHT, DEFAULTS.height],
        [KEY_LABEL_IMG_X, DEFAULTS.imgX],
        [KEY_LABEL_IMG_Y, DEFAULTS.imgY],
        [KEY_LABEL_NAME_MODE, DEFAULTS.labelNameMode],
    ] as const;

    for (const [key, value] of keys) {
        const current = await SecureStore.getItemAsync(key);
        if (!current) {
            await SecureStore.setItemAsync(key, value);
        }
    }
}

export async function loadLabelPrintSettings(screenWidth?: number): Promise<LabelPrintSettings> {
    await ensureLabelSettingsStored();

    const labelWidthMm = Number(await SecureStore.getItemAsync(KEY_LABEL_SIZE) || '40');
    const gap = Number(await SecureStore.getItemAsync(KEY_LABEL_GAP) || DEFAULTS.gap);
    const height = Number(await SecureStore.getItemAsync(KEY_LABEL_HEIGHT) || DEFAULTS.height);
    const imgX = Number(await SecureStore.getItemAsync(KEY_LABEL_IMG_X) || DEFAULTS.imgX);
    const imgY = Number(await SecureStore.getItemAsync(KEY_LABEL_IMG_Y) || DEFAULTS.imgY);

    const imgWidthRaw = await SecureStore.getItemAsync(KEY_LABEL_IMG_WIDTH);
    const escLeftRaw = await SecureStore.getItemAsync(KEY_LABEL_ESC_LEFT);
    const escWidthRaw = await SecureStore.getItemAsync(KEY_LABEL_ESC_WIDTH);
    const nameModeRaw = await SecureStore.getItemAsync(KEY_LABEL_NAME_MODE);

    const autoImgWidth = getLabelPixelWidth(labelWidthMm);
    const labelNameMode = Object.values(LabelNameMode).includes(nameModeRaw as LabelNameMode)
        ? (nameModeRaw as LabelNameMode)
        : LabelNameMode.Ukrainian;

    return {
        labelWidthMm,
        gap,
        height,
        imgX,
        imgY,
        imgWidth: imgWidthRaw ? Number(imgWidthRaw) : autoImgWidth,
        escLeft: escLeftRaw ? Number(escLeftRaw) : (labelWidthMm === SizeLabel.Forty ? 40 : 0),
        escWidth: escWidthRaw ? Number(escWidthRaw) : (labelWidthMm === SizeLabel.Forty ? 320 : 390),
        labelNameMode,
    };
}

export async function saveLabelSetting(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
}
