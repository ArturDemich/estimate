import { View, Text, Modal } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { useEffect, useRef, useState } from "react";
import Entypo from '@expo/vector-icons/Entypo';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Label } from "@/redux/stateServiceTypes";
import { printLabel } from "@/components/Printer/BluetoothPrinterImg";
import { setLabelPrint } from "@/redux/dataSlice";
import Toast from "react-native-toast-message";
import { format } from "date-fns/format";
import Barcode from 'react-native-barcode-svg';
import {
    formatBarcodeDisplay,
    formatPlantNameForLabel,
    getBarcodeEncodeValue,
    getBarcodeFormat,
    getBarcodeSingleBarWidth,
    getLabelPixelHeight,
    getLabelPixelWidth,
    LABEL_DESIGN_WIDTH,
    LabelNameMode,
    loadLabelPrintSettings,
    normalizeBarcode,
} from "@/components/Printer/printerConstants";

const PUTY_LABEL_WIDTH = 280;
const PUTY_LABEL_HEIGHT = 150;

const LabelImgShot = () => {
    const label = useSelector<RootState, Label | null>(state => state.data.labelData);
    const isPrinterPuty = useSelector<RootState, boolean>((state) => state.data.isPrinterPuty);
    const dispatch = useDispatch<AppDispatch>();
    const connectedPrinter = useSelector<RootState, RootState['data']['connectedPrinter']>((state) => state.data.connectedPrinter);
    const [showView, setShowView] = useState(false);
    const [readyToCapture, setReadyToCapture] = useState(false);
    const [renderWidth, setRenderWidth] = useState(LABEL_DESIGN_WIDTH);
    const [renderHeight, setRenderHeight] = useState(120);
    const [labelNameMode, setLabelNameMode] = useState<LabelNameMode>(LabelNameMode.Ukrainian);
    const ref = useRef<ViewShot>(null);
    const printedRef = useRef(false);
    const DateNow = format(new Date(), 'dd.MM.y');

    const rawBarcode = label?.barcode && label.barcode !== '0' ? label.barcode : null;
    const barcode = rawBarcode ? normalizeBarcode(rawBarcode) : null;
    const barcodeFormat = barcode ? getBarcodeFormat(barcode) : 'CODE128';
    const barcodeValue = barcode ? getBarcodeEncodeValue(barcode, barcodeFormat) : '';
    const scale = renderWidth / LABEL_DESIGN_WIDTH;
    const labelWidth = isPrinterPuty ? PUTY_LABEL_WIDTH : renderWidth;
    const labelHeight = isPrinterPuty ? PUTY_LABEL_HEIGHT : renderHeight;
    const barcodeAreaWidth = labelWidth - Math.round(12 * scale);
    const barcodeBarWidth = barcode
        ? getBarcodeSingleBarWidth(barcodeFormat, barcodeValue, barcodeAreaWidth)
        : 2;

    useEffect(() => {
        if (!showView) {
            setReadyToCapture(false);
            printedRef.current = false;
            return;
        }

        const loadLayout = async () => {
            const settings = await loadLabelPrintSettings();
            setLabelNameMode(settings.labelNameMode);

            if (isPrinterPuty) {
                setRenderWidth(PUTY_LABEL_WIDTH);
                setRenderHeight(PUTY_LABEL_HEIGHT);
                return;
            }

            const width = settings.imgWidth ?? getLabelPixelWidth(settings.labelWidthMm);
            const height = getLabelPixelHeight(settings.height);
            setRenderWidth(width);
            setRenderHeight(height);
        };

        loadLayout();
        const timer = setTimeout(() => setReadyToCapture(true), 500);
        return () => clearTimeout(timer);
    }, [showView, isPrinterPuty]);

    const shot = async () => {
        try {
            if (!ref.current) return null;

            if (isPrinterPuty) {
                return await captureRef(ref, {
                    format: "jpg",
                    quality: 1.0,
                    result: 'tmpfile',
                });
            }

            return await captureRef(ref, {
                format: "png",
                quality: 1.0,
                result: 'base64',
            });
        } catch (error) {
            Toast.show({
                type: "customError",
                text1: "Failed to capture image!",
                position: "bottom",
                bottomOffset: 150,
                visibilityTime: 3000,
            });
            console.error("Snapshot failed", error);
            return null;
        }
    };

    const sendPrint = async () => {
        const uri = await shot();
        setShowView(false);
        setReadyToCapture(false);
        await printLabel(uri ? uri : null, label, isPrinterPuty);
        dispatch(setLabelPrint(null));
    };

    useEffect(() => {
        if (label) {
            if (!connectedPrinter) {
                Toast.show({
                    type: "customError",
                    text1: "Принтер не підключено!",
                    text2: "Підключи принтер в меню 🖨️",
                    position: "bottom",
                    bottomOffset: 150,
                    visibilityTime: 4000,
                });
                dispatch(setLabelPrint(null));
                return;
            }
            setShowView(true);
        }
    }, [label]);

    useEffect(() => {
        if (!showView || !readyToCapture || printedRef.current) return;
        printedRef.current = true;
        sendPrint();
    }, [showView, readyToCapture]);

    const textStyle = {
        includeFontPadding: false as const,
        allowFontScaling: false as const,
        color: '#000000',
    };

    const displayProductName = label?.product_name
        ? formatPlantNameForLabel(label.product_name, labelNameMode)
        : '';

    return (
        <Modal visible={showView} animationType="slide" transparent>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <View style={{ backgroundColor: '#fff', padding: isPrinterPuty ? 5 : 0, borderRadius: 10, marginBottom: 5, alignItems: 'center' }}>
                    <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
                        <View
                            collapsable={false}
                            style={{
                                backgroundColor: '#ffffff',
                                width: labelWidth,
                                height: labelHeight,
                                paddingHorizontal: isPrinterPuty ? 0 : Math.round(6 * scale),
                            }}
                        >
                            <View style={{ flexDirection: 'row', paddingTop: isPrinterPuty ? 5 : Math.round(2 * scale) }}>
                                <MaterialCommunityIcons name="pine-tree" size={Math.round(17 * scale)} color="black" />
                                <Text
                                    numberOfLines={2}
                                    style={{
                                        ...textStyle,
                                        fontSize: Math.round((isPrinterPuty ? 15 : 16) * scale),
                                        fontWeight: '900',
                                        flex: 1,
                                        lineHeight: Math.round(17 * scale),
                                    }}
                                >
                                    {displayProductName}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: Math.round(6 * scale), alignItems: 'baseline' }}>
                                <Entypo name="ruler" size={Math.round(16 * scale)} color="black" style={{ transform: 'rotate(135deg)' }} />
                                <Text
                                    numberOfLines={2}
                                    style={{
                                        ...textStyle,
                                        fontSize: Math.round((isPrinterPuty ? 13 : 15) * scale),
                                        fontWeight: '800',
                                        flex: 1,
                                        lineHeight: Math.round(17 * scale),
                                    }}
                                >
                                    {label?.characteristic_name}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Math.round(4 * scale) }}>
                                <Text style={{ ...textStyle, fontSize: Math.round(13 * scale), fontWeight: '900' }}>{label?.storageName}</Text>
                                <Text style={{ ...textStyle, fontSize: Math.round(13 * scale), fontWeight: '900' }}>{DateNow}</Text>
                            </View>
                            <View style={{ backgroundColor: '#000000', height: Math.max(2, Math.round(2 * scale)), width: '100%', marginTop: Math.round(3 * scale) }} />

                            {barcode ? (
                                <View style={{ width: '100%', alignItems: 'center', marginTop: Math.round(6 * scale) }}>
                                    <Barcode
                                        value={barcodeValue}
                                        format={barcodeFormat}
                                        height={Math.round((isPrinterPuty ? 40 : 38) * scale)}
                                        singleBarWidth={barcodeBarWidth}
                                        lineColor="#000000"
                                        backgroundColor="#FFFFFF"
                                    />
                                    <Text
                                        style={{
                                            ...textStyle,
                                            width: '100%',
                                            textAlign: 'center',
                                            fontSize: Math.round(11 * scale),
                                            marginTop: Math.round(3 * scale),
                                            fontWeight: '700',
                                        }}
                                    >
                                        {formatBarcodeDisplay(barcode, barcodeFormat)}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </ViewShot>
                </View>
            </View>
        </Modal>
    );
};

export default LabelImgShot;
