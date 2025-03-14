import { View, Text, Modal } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import Entypo from '@expo/vector-icons/Entypo';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Label } from "@/redux/stateServiceTypes";
import { printLabel } from "@/components/Printer/BluetoothPrinterImg";
import { setLabelPrint } from "@/redux/dataSlice";
import Toast from "react-native-toast-message";

type LabelImgShotProps = {
    isVisible?: boolean;
    onClose?: () => void;
    print?: (img: string) => void;
};


const LabelImgShot = ({ isVisible, onClose, print }: LabelImgShotProps) => {
    const label = useSelector<RootState, Label | null>(state => state.data.labelData);
    const dispatch = useDispatch<AppDispatch>();
    const [showView, setShowView] = useState(false);
    //const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const ref = useRef<ViewShot>(null);
    const DateNow = moment().format('DD.MM.YY');

    const shot = async () => {
        try {
            if (ref.current) {
                const uri = await captureRef(ref, {
                    format: "jpg",
                    quality: 1.0,
                    result: 'tmpfile',
                    width: 512,
                    height: 200
                });
                //setCapturedUri(uri);
                return uri

            }
        } catch (error) {
            Toast.show({
                type: "error",  // Can be 'success', 'error', 'info'
                text1: "Failed to capture image!",
                position: "bottom",
                visibilityTime: 3000,
            })
            console.error("Snapshot failed", error);
            return null
        }
    };

    /* const printImage = async() => {
        if (capturedUri) {
            //print(capturedUri)
            const uri =  await shot();
            print && print(uri ? uri : 'kkk')
            console.log("Printing Image URL:", capturedUri);
            ToastAndroid.show("Printing...", ToastAndroid.SHORT);
        }
    }; */
    const sendPrint = async () => {
        const uri = await shot();
        await printLabel(uri ? uri : null, label);
        dispatch(setLabelPrint(null));
        setShowView(false);
    };

    useEffect(() => {
        if (label) {
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

    return (
        <Modal visible={showView} animationType="slide" transparent>
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 10, alignItems: 'center' }}>

                    <ViewShot ref={ref} >
                        <View style={{ backgroundColor: '#ffffff', width: 280, height: 100, }}>
                            <View style={{ flexDirection: 'row', }}>
                                <MaterialCommunityIcons name="pine-tree" size={17} color="black" />
                                <Text style={{ fontSize: 17, fontWeight: '900', lineHeight: 17, color: 'rgb(0, 0, 0)' }}>{label?.product_name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 'auto', alignItems: 'baseline' }}>
                                <Entypo name="ruler" size={16} color="black" style={{ transform: 'rotate(135deg)', }} />
                                <Text style={{ fontSize: 16, fontWeight: '800', alignSelf: 'baseline' }}>{label?.characteristic_name}</Text>
                            </View>



                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, marginTop: 3 }}>
                                <Text style={{ fontSize: 14, fontWeight: '900' }}> {label?.storageName}</Text>
                                <Text style={{ fontSize: 14, fontWeight: '900' }}> {DateNow}</Text>
                            </View>
                            <View style={{ backgroundColor: 'rgb(0, 0, 0)', height: 3, width: '100%' }}></View>
                        </View>
                    </ViewShot>

                    {/* <Button title="Capture Image" onPress={shot} />
                    {capturedUri && (
                        <>
                            <Image source={{ uri: capturedUri }} style={{ width: 200, height: 100, marginVertical: 10, borderColor: 'red', borderWidth: 1 }} />
                            <Button title="Print Image" onPress={printImage} />
                        </>
                    )}
                    <Button title="Close" onPress={onClose} /> */}
                </View>
            </View>
        </Modal>
    );
};

export default LabelImgShot;