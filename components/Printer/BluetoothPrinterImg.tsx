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
} from "react-native";
import { BLEPrinter, IBLEPrinter, } from '@conodene/react-native-thermal-receipt-printer-image-qr';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Label } from "@/redux/stateServiceTypes";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { connectPrinter, setDevices } from "@/redux/dataSlice";
import { muToast } from "@/utils/toastConfig";
import EmptyList from "@/components/ui/EmptyList";
import { checkBluetoothEnabled } from "@/components/helpers";

export const printLabel = async (img: string | null, label: Label | null) => {
    if (!img || !label) {
        Alert.alert("Немає зображення", "Спробуйте ще раз або перезавантажте додаток");
        return;
    }
    const barcode = label.barcode !== '0' ? label.barcode : null;
    for (let i = 0; i < label.qtyPrint; i++) {
        print(img, barcode)
    }
};

const print = (img: string, barcode: string | null) => {
    try {
        BLEPrinter.printImage(
            img,
            {
                imageWidth: 380,  // 380 max for 50mm; 300 for 40mm
                imageHeight: 120,  //200 max for 30mm
            },
        );
        BLEPrinter.printText(
            "\x1B\x33\x00\n" +
            "\x1B\x61\x01" +  // Center barcode
            `${barcode && "\x1D\x6B\x08" + barcode + "\x00"}` +  // Barcode
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

const BluetoothPrintImg = () => {
    const dispatch = useDispatch<AppDispatch>();
    const pairedDevices = useSelector<RootState, IBLEPrinter[]>((state) => state.data.pairedDevices);
    const connectedPrinter = useSelector<RootState, IBLEPrinter | null>((state) => state.data.connectedPrinter);
    const [printerShow, setPrinterShow] = useState(false);
    const screenHeight = Dimensions.get("window").height;
    const modalPosition = screenHeight - screenHeight * 0.6;

    const handleOpenModal = async () => {
        const isBluetoothOn = await checkBluetoothEnabled();
        if (!isBluetoothOn) {
            muToast({ type: "customError", text1: `Bluetooth не включений!`, text2: 'Включіть Bluetooth в налаштуваннях телефона.', visibilityTime: 4000 })
            return;
        }
        setPrinterShow(!printerShow)
    }

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

        // Initialize Bluetooth only if permissions are granted and Bluetooth is ON
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
        if(connectedPrinter != null) {
            dispatch(connectPrinter(null))
        }
        try {
            await BLEPrinter
                .connectPrinter(printer.inner_mac_address,)
                .then((data) => {
                    dispatch(connectPrinter(data))
                    muToast({ type: "customToast", text1: `Підключено принтер: ${printer.device_name}`, position: 'top' })
                })
                .catch((error) => {
                    console.log(error)
                    muToast({ type: "customError", text1: `Не підключено! Перевірь чи увімкнено принтер.`, visibilityTime: 4000, position: 'top' })
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
                <MaterialCommunityIcons name="printer-wireless" size={24} color="black" />
            </TouchableVibrate>
            <Modal visible={printerShow} animationType="slide" transparent onRequestClose={() => setPrinterShow(false)}>
                <View style={[styles.centeredView, ]}>
                    <View style={[styles.modalView, {top: modalPosition - 3}]}>
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
                                <Text>підключено до: </Text>
                                <Text style={styles.connectedTitle}> {connectedPrinter.device_name}</Text>
                            </View>
                        )}
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
        <TouchableVibrate style={styles.deviceBtn} onPress={handlePress}>
            {connect ? <ActivityIndicator /> : <Text style={styles.deviceBtnText}>Підключити</Text>}
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
        //width: "80%",
        height: "60%",
        flexDirection: "column",
        margin: 1,
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        //borderRadius: 10,
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
        backgroundColor: "rgba(3, 172, 20, 0.95)",
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
})