import React, { useState, useEffect, memo } from "react";
import {
    View,
    Text,
    Alert,
    PermissionsAndroid,
    Platform,
    Modal,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Dimensions,
    Switch,
} from "react-native";
import { BLEPrinter, IBLEPrinter, } from '@conodene/react-native-thermal-receipt-printer-image-qr';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Label } from "@/redux/stateServiceTypes";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { connectPrinter, setDevices, setAutoPrint } from "@/redux/dataSlice";
import { myToast } from "@/utils/toastConfig";
import EmptyList from "@/components/ui/EmptyList";
import { checkBluetoothEnabled } from "@/components/helpers";
import { Entypo } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const KEYLableStorage = 'labelWeight';

export const printLabel = async (img: string | null, label: Label | null) => {
    if (!img || !label) {
        Alert.alert("Немає зображення", "Спробуйте ще раз або перезавантажте додаток");
        return;
    }
    const size = await SecureStore.getItemAsync(KEYLableStorage) || '40';
    const barcode = label.barcode !== '0' ? label.barcode : null;
    for (let i = 0; i < label.qtyPrint; i++) {
        print(img, barcode, size)
    }
};

const print = (img: string, barcode: string | null, size: string) => {
    const sizeWidth = Number(size) === 40 ? 300 : 380;
    try {
        BLEPrinter.printImage(
            img,
            {
                imageWidth: sizeWidth,  // 380 max for 50mm; 300 for 40mm
                imageHeight: 120,  //200 max for 30mm
            },
        );
        BLEPrinter.printText(
            "\x1B\x33\x00\n" +
            "\x1B\x61\x01" +  // Center barcode
            `${barcode && "\x1D\x6B\x02" + barcode + "\x00"}` +  // Barcode
            barcode
        );
        Toast.show({
            type: "customToast",  // Can be 'success', 'error', 'info'
            text1: "Друк...",
            position: "bottom",
            visibilityTime: 3000,
            bottomOffset: 90,
        })
    } catch (error) {
        console.error("Print failed:", error);
        Alert.alert("Error", "Failed to print.");
    }
};

enum SizeLabel {
    Fifty = 50,
    Forty = 40,
};


const BluetoothPrintImg = () => {
    const dispatch = useDispatch<AppDispatch>();
    const pairedDevices = useSelector<RootState, IBLEPrinter[]>((state) => state.data.pairedDevices);
    const connectedPrinter = useSelector<RootState, IBLEPrinter | null>((state) => state.data.connectedPrinter);
    const autoPrint = useSelector<RootState, boolean>((state) => state.data.autoPrint);
    const [printerShow, setPrinterShow] = useState(false);
    const screenHeight = Dimensions.get("window").height;
    const modalPosition = screenHeight - screenHeight * 0.6;
    const [selectedSizeLabel, setSelectedSizeLabel] = useState<SizeLabel | null>(null);

    const handleOpenModal = async () => {
        const isBluetoothOn = await checkBluetoothEnabled();
        if (!isBluetoothOn) {
            myToast({ type: "customError", text1: `Bluetooth не включений!`, text2: 'Включіть Bluetooth в налаштуваннях телефона.', visibilityTime: 4000 })
            return;
        }
        checkLabelSizeStor()
        setPrinterShow(true)
    };

    const checkLabelSizeStor = async () => {
        if (Platform.OS !== 'web') {
            const size = await SecureStore.getItemAsync(KEYLableStorage);
            if (size) {
                !selectedSizeLabel && setSelectedSizeLabel(Number(size))
            } else {
                await SecureStore.setItemAsync(KEYLableStorage, '40');
                setSelectedSizeLabel(40)
            }
        }
    };

    const handleSetSizeLabel = async (size: number) => {
        if (Platform.OS !== 'web') {
            await SecureStore.setItemAsync(KEYLableStorage, size.toString());
            setSelectedSizeLabel(size)
        }
    };

    const handleSwitch = () => {
        dispatch(setAutoPrint(!autoPrint))
    };

    useEffect(() => {
        printerShow && requestBluetoothPermissions();
    }, [printerShow]);

    const requestBluetoothPermissions = async () => {
        if (Platform.OS === "android" && Platform.Version >= 31) {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]);

                if (granted["android.permission.BLUETOOTH_SCAN"] !== PermissionsAndroid.RESULTS.GRANTED ||
                    granted["android.permission.BLUETOOTH_CONNECT"] !== PermissionsAndroid.RESULTS.GRANTED
                ) {
                    Alert.alert("Дозвіл для Bluetooth відмовлено", "Надайте дозвіл додатку для використання Bluetooth в налаштуваннях.");
                    return;
                }
            } catch (error) {
                console.error("Failed to request Bluetooth permissions:", error);
                return;
            }
        }

        (BLEPrinter as any).removeListeners = () => { }; // suppress the warning 
        (BLEPrinter as any).addListener = () => { }; // suppress the warning 

        pairedDevices.length === 0 && initBluetooth();
    };

    /** Initializes Bluetooth Printer */
    const initBluetooth = () => {
        console.log('initBluetooth', pairedDevices)
        BLEPrinter.init()
            .then(() => BLEPrinter.getDeviceList().then((data) => dispatch(setDevices(data))))
            .catch((error) => console.error("Bluetooth init failed:", error));
    };

    /** Connects to Selected Printer */
    const connectToPrinter = async (printer: IBLEPrinter) => {
        if (connectedPrinter != null) {
            dispatch(connectPrinter(null))
        }
        try {
            await BLEPrinter
                .connectPrinter(printer.inner_mac_address,)
                .then((data) => {
                    dispatch(connectPrinter(data))
                    myToast({ type: "customToast", text1: `Підключено принтер: ${printer.device_name}`, position: 'top' })
                })
                .catch((error) => {
                    console.log(error)
                    myToast({ type: "customError", text1: `Не підключено! Перевірь чи увімкнено принтер.`, visibilityTime: 4000, position: 'top' })
                });

        } catch (error) {
            console.error("Connection failed:", error);
            Alert.alert("Error", "Failed to connect to the printer.");
        }
    };
    console.log('BluetoothPrintImg', screenHeight)


    return (
        <>
            <TouchableVibrate onPressOut={handleOpenModal}>
                {(!connectedPrinter && !autoPrint) && <MaterialCommunityIcons name="printer-settings" size={24} color="black" />}
                {(!connectedPrinter && autoPrint || connectedPrinter && autoPrint) && <MaterialCommunityIcons name="printer-eye" size={24} color={connectedPrinter ? 'rgba(106, 159, 53, 0.95)' : "black"} />}
                {(connectedPrinter && !autoPrint) && <MaterialCommunityIcons name="printer-wireless" size={24} color={connectedPrinter ? 'rgba(106, 159, 53, 0.95)' : "black"} />}
            </TouchableVibrate>
            <Modal visible={printerShow} animationType="slide" transparent onRequestClose={() => setPrinterShow(false)}>
                <View style={[styles.centeredView,]}>
                    <View style={[styles.modalView, { top: modalPosition - 3 }]}>
                        <Text style={styles.modalTitle}>Раніше підключені пристрої:</Text>
                        <FlatList
                            data={pairedDevices}
                            keyExtractor={(item) => item.inner_mac_address.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.deviceItem}>
                                    <Text style={styles.deviceName}>{item.device_name}</Text>
                                    {connectedPrinter?.inner_mac_address === item.inner_mac_address ?
                                        <TouchableVibrate style={styles.deviceBtnDisc} onPress={() => BLEPrinter.closeConn().then(() => dispatch(connectPrinter(null)))}>
                                            <Text style={styles.deviceBtnText}>Відключити</Text>
                                        </TouchableVibrate>
                                        :
                                        <ConnectBtn connectToPrinter={() => connectToPrinter(item)} />
                                    }
                                </View>
                            )}
                            style={{ width: "100%", maxHeight: 220, paddingRight: 5, paddingBottom: 40 }}
                            contentContainerStyle={{ gap: 8 }}
                            ListEmptyComponent={<EmptyList text="Немає раніше підключених пристроїв" />}
                        />

                        {connectedPrinter && (
                            <View style={{ marginTop: 10, flexDirection: 'row', alignSelf: 'flex-start' }}>
                                <Text style={{ fontWeight: 500, color: 'grey' }}>підключено до: </Text>
                                <Text style={styles.connectedTitle}> {connectedPrinter.device_name}</Text>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 5}}>
                            <View style={styles.labeleSizeBlock}>
                                <Text style={{ fontWeight: 500, color: 'grey' }}>Обери розмір етикетки:</Text>
                                <TouchableVibrate
                                    style={[styles.labeleSizeItem, selectedSizeLabel === SizeLabel.Fifty && styles.labeleSizeLock]}
                                    onPress={() => handleSetSizeLabel(SizeLabel.Fifty)}
                                    disabled={selectedSizeLabel === SizeLabel.Fifty}
                                >
                                    <MaterialCommunityIcons name="sticker-text-outline" size={24} color="rgb(83, 83, 83)" />
                                    <Text style={styles.labeleSizeText}>50x30mm</Text>
                                    {selectedSizeLabel === SizeLabel.Fifty && <Entypo name="check" size={24} color='rgba(106, 159, 53, 0.95)' />}
                                </TouchableVibrate>


                                <TouchableVibrate
                                    style={[styles.labeleSizeItem, selectedSizeLabel === SizeLabel.Forty && styles.labeleSizeLock]}
                                    onPress={() => handleSetSizeLabel(SizeLabel.Forty)}
                                    disabled={selectedSizeLabel === SizeLabel.Forty}
                                >
                                    <MaterialCommunityIcons name="sticker-text-outline" size={24} color="rgb(83, 83, 83)" />
                                    <Text style={styles.labeleSizeText}>40x30mm</Text>
                                    {selectedSizeLabel === SizeLabel.Forty && <Entypo name="check" size={24} color='rgba(106, 159, 53, 0.95)' />}
                                </TouchableVibrate>
                            </View>

                            <View style={{ alignItems: 'flex-start', }}>
                                <Text style={{ fontWeight: 500, color: 'grey', marginTop: 8, }}>Вімкнути автодрук:</Text>
                                <View style={{ flexDirection: 'row', gap: 5, marginTop: 10, alignSelf: 'center' }}>
                                    <MaterialCommunityIcons name="printer-eye" size={28} color={autoPrint ? 'rgba(106, 159, 53, 0.95)' : "black"} />
                                    <Switch
                                        trackColor={{ false: '#767577', true: 'rgba(106, 159, 53, 0.95)' }}
                                        thumbColor={'#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={handleSwitch}
                                        value={autoPrint}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default memo(BluetoothPrintImg);

const ConnectBtn = ({ connectToPrinter }: { connectToPrinter: () => Promise<void> }) => {
    const [connect, setConnect] = useState(false);
    const handlePress = async () => {
        setConnect(true)
        connectToPrinter().then(() => setConnect(false))
    };
    return (
        <TouchableVibrate style={[styles.deviceBtn, connect && { backgroundColor: 'rgba(201, 201, 201, 0.92)' }]} onPress={handlePress}>
            {connect ? <ActivityIndicator size='large' color='#ff6f61' /> : <Text style={styles.deviceBtnText}>Підключити</Text>}
        </TouchableVibrate>
    )
};



const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        alignItems: "center",
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalView: {
        height: "60%",
        flexDirection: "column",
        margin: 1,
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        paddingTop: 5,
        alignItems: "center",
        shadowColor: "rgba(255, 255, 255, 0.4)",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: "15%",
        maxHeight: "70%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    deviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "rgb(232, 232, 232)",
        borderWidth: 1,
        minHeight: 50,
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 5,
        paddingVertical: 5,
        elevation: 10,
        shadowColor: "rgba(255, 255, 255, 0.5)",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 7,
        opacity: 0.9
    },
    deviceName: {
        fontWeight: 500,
        maxWidth: 190
    },
    deviceBtn: {
        backgroundColor: 'rgba(106, 159, 53, 0.95)',
        borderRadius: 5,
        justifyContent: 'center',
        height: 40,
        padding: 5,
        elevation: 1,
        shadowColor: "rgba(255, 255, 255, 0.5)",
        width: 90,
        alignItems: 'center'
    },
    deviceBtnText: {
        fontSize: 13,
        fontWeight: 500,
        color: 'rgb(249, 249, 249)',

    },
    deviceBtnDisc: {
        backgroundColor: "rgb(247, 80, 9)",
        borderRadius: 5,
        justifyContent: 'center',
        height: 40,
        padding: 5,
        elevation: 0,
        shadowColor: "rgba(255, 255, 255, 0.5)",
        width: 90,
        alignItems: 'center'
    },
    connectedTitle: {
        fontWeight: 600,
        textAlign: 'left',
        justifyContent: 'flex-start'
    },
    labeleSizeBlock: {
        alignSelf: 'flex-start',
        marginTop: 8,
        //gap: 15,
    },
    labeleSizeItem: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        width: 160,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(131, 131, 131, 0.18)",
        borderRadius: 5,
        shadowColor: "rgba(131, 131, 131, 0.67)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    labeleSizeText: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: 500,
    },
    labeleSizeLock: {
        elevation: 0,
        borderColor: 'unset',
        borderWidth: 0,
        shadowColor: 'unset',
        backgroundColor: "rgba(255, 255, 255, 0.39)",
    },
})