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
import { IBLEPrinter } from "@conodene/react-native-thermal-receipt-printer-image-qr";
import { format } from "date-fns/format";
//import Barcode from "react-native-barcode-builder";
import Barcode from 'react-native-barcode-svg';


const LabelImgShot = () => {
    const label = useSelector<RootState, Label | null>(state => state.data.labelData);
    const isPrinterPuty = useSelector<RootState, boolean>((state) => state.data.isPrinterPuty);
    const dispatch = useDispatch<AppDispatch>();
    const connectedPrinter = useSelector<RootState, IBLEPrinter | null>((state) => state.data.connectedPrinter);
    const [showView, setShowView] = useState(false);
    const ref = useRef<ViewShot>(null);
    const DateNow = format(new Date(), 'dd.MM.y');

    const shot = async () => {
        try {
            if (ref.current) {
                const uri = await captureRef(ref, {
                    format: "jpg",
                    quality: 1.0,
                    result: 'tmpfile',
                    ...(isPrinterPuty ? {} : {
                        width: 512,  // for ather printers
                        height: 200  // for ather printers
                    }),
                });
                return uri
            }
        } catch (error) {
            Toast.show({
                type: "customError",  // Can be 'success', 'error', 'info'
                text1: "Failed to capture image!",
                position: "bottom",
                bottomOffset: 150,
                visibilityTime: 3000,
            })
            console.error("Snapshot failed", error);
            return null
        }
    };

    const sendPrint = async () => {
        const uri = await shot();
        setShowView(false);
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
                })
                dispatch(setLabelPrint(null));
                return;
            }
            setShowView(true)
        }
    }, [label])

    useEffect(() => {
        const interval = setInterval(() => {
            if (showView) {
                sendPrint()
            } else {
                clearInterval(interval);
            }
        }, 100)

        return () => clearInterval(interval);
    }, [showView])

    console.log("LABEL", label?.barcode)

    return (
        <Modal visible={showView} animationType="slide" transparent>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <View style={{ backgroundColor: '#fff', padding: isPrinterPuty ? 5 : 10, borderRadius: 10, marginBottom: 5, alignItems: 'center' }}>
                    <ViewShot ref={ref} >
                        <View style={{ backgroundColor: '#ffffff', width: 280, height: isPrinterPuty ? 150 : 100, }}>
                            <View style={{ flexDirection: 'row', paddingTop: isPrinterPuty ? 5 : 0 }}>
                                <MaterialCommunityIcons name="pine-tree" size={17} color="black" />
                                <Text numberOfLines={2} style={{ fontSize: isPrinterPuty ? 15 : 17, fontWeight: '900', width: 280, lineHeight: 17, color: 'rgb(0, 0, 0)' }}>{label?.product_name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 'auto', alignItems: 'baseline' }}>
                                <Entypo name="ruler" size={16} color="black" style={{ transform: 'rotate(135deg)', }} />
                                <Text numberOfLines={2} style={{ fontSize: isPrinterPuty ? 13 : 16, fontWeight: '800', alignSelf: 'baseline' }}>{label?.characteristic_name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, marginTop: 3 }}>
                                <Text style={{ fontSize: 14, fontWeight: '900' }}> {label?.storageName}</Text>
                                <Text style={{ fontSize: 14, fontWeight: '900' }}> {DateNow}</Text>
                            </View>
                            <View style={{ backgroundColor: 'rgb(0, 0, 0)', height: 3, width: '100%' }}></View>

                            <View style={{ width: '100%', minHeight: '40%', alignItems: 'center', paddingTop: 10 }}>
                                {label?.barcode && label?.barcode !== '0' && isPrinterPuty ? (
                                    <>
                                        <Barcode
                                            value={label.barcode}
                                            format="EAN13"
                                            height={35}
                                            lineColor="#000"
                                        />
                                        <Text style={{ letterSpacing: 10, fontSize: 9 }}>{label.barcode}</Text>
                                    </>
                                ) : null}
                            </View>

                        </View>
                    </ViewShot>
                </View>
            </View>
        </Modal>
    );
};

export default LabelImgShot;