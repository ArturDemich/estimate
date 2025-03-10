import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Button,
    Alert,
    PermissionsAndroid,
    Platform,
    ScrollView,
    Modal,
    StyleSheet,
    ToastAndroid
} from "react-native";
import { BLEPrinter, IBLEPrinter, } from '@conodene/react-native-thermal-receipt-printer-image-qr';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Label } from "@/redux/stateServiceTypes";
import Toast from "react-native-toast-message";

export const printLabel = async (img: string | null, label: Label | null) => {
    if (!img || !label) {
        Alert.alert("No Image", "Please try more.");
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
            type: "success",  // Can be 'success', 'error', 'info'
            text1: "Друк...",
            position: "bottom",
            //visibilityTime: 3000,
            
        })
    } catch (error) {
        console.error("Print failed:", error);
        Alert.alert("Error", "Failed to print.");
    }
};


const BluetoothPrintImg: React.FC = () => {
    const [printers, setPrinters] = useState<IBLEPrinter[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<IBLEPrinter | null>(null);
    const [labelShow, setLabelShow] = useState(false);
    const [printerShow, setPrinterShow] = useState(false);

    useEffect(() => {
        requestBluetoothPermissions();
    }, []);

    /** Requests Bluetooth Permissions (Android 12+) */
    const requestBluetoothPermissions = async () => {
        if (Platform.OS === "android" && Platform.Version >= 31) {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]);

                if (
                    granted["android.permission.BLUETOOTH_SCAN"] !== PermissionsAndroid.RESULTS.GRANTED ||
                    granted["android.permission.BLUETOOTH_CONNECT"] !== PermissionsAndroid.RESULTS.GRANTED
                ) {
                    Alert.alert("Permission Denied", "Bluetooth permissions are required to scan and connect.");
                    return;
                }
            } catch (error) {
                console.error("Failed to request Bluetooth permissions:", error);
                return;
            }
        }

        initBluetooth();
    };

    /** Initializes Bluetooth Printer */
    const initBluetooth = () => {
        BLEPrinter.init()
            .then(() => BLEPrinter.getDeviceList().then(setPrinters))
            .catch((error) => console.error("Bluetooth init failed:", error));
    };

    /** Connects to Selected Printer */
    const connectToPrinter = async (printer: IBLEPrinter) => {
        try {
            await BLEPrinter.connectPrinter(printer.inner_mac_address);
            setSelectedPrinter(printer);
            Alert.alert("Connected!", `Printer: ${printer.device_name}`);
        } catch (error) {
            console.error("Connection failed:", error);
            Alert.alert("Error", "Failed to connect to the printer.");
        }
    };

    /** Prints a Test Receipt */
    const testPrint = async (img: string) => {
        if (!selectedPrinter) {
            Alert.alert("No Printer", "Please connect to a printer first.");
            return;
        }
        try {
            BLEPrinter.printImage(
                img,
                {
                    imageWidth: 300,  // 380 max for 50mm; 300 for 40mm
                    imageHeight: 120,  //200 max for 30mm
                },
            );
            BLEPrinter.printText(
                //"\x1B\x33\x08" +  // Line spacing smaller value (8 dots ≈ 1mm)
                //"\x1B\x24\x00\x3C" + // Move right 60dot
                //"\x1B\x61\x01" +  // Center alignment
                //"\x1B\x24\x00\x3C" + // Move right 60dot
                //"\x1B\x45\x01" +  // Bold ON
                //`Test print sent\n` +
                //"\x1B\x45\x01" +  // Bold ON
                //"\x1B\x61\x01" +  // Center alignment
                // "WRB, H280-300, SPIRAL\n" //+
                //'\x1b\x6c' +
                //"\x1B\x24\x00\x00" +
                //"\x1B\x69" +
                //"\n" +
                "\x1B\x64\x01" +
                "\x1B\x61\x01" +  // Center barcode
                "\x1D\x6B\x08" + "2100000062195" + "\x00" +  // Barcode
                "2100000062195" //+ 
                // "\x1B\x61\x01" +  // Center alignment
                // "\x1D\x21\x00" +  // Standard font size (smaller to fit)
                // "Дубриничі " //+ " 04.03.25"
                //"\x1B\x24\x1E\x04" + "04.03.25"
                // "\x1D\x0C"  //feed 
                //"\x1B\x64" + "\x1B\x63" 
                //"\x1C\x28\x4C\x02\x42"
                //"\x1D\x28\x41\x02\x00\x42\x51"
                //"\x1B\x64" + "\x1B\x63\x34\x01"

                //"\x1D\x0C" + "\x1B\x64\x00" 
                //"\x1B\x0C"
            );
            // setLabelShow(false)

            Alert.alert("Success", "Test print sent.");
        } catch (error) {
            console.error("Print failed:", error);
            Alert.alert("Error", "Failed to print.");
        }
    };

    return (
        <>
            <TouchableVibrate onPressOut={() => setPrinterShow(!printerShow)}>
                <MaterialCommunityIcons name="printer-wireless" size={24} color="black" />
            </TouchableVibrate>
            <Modal visible={printerShow} animationType="slide" transparent onRequestClose={() => setPrinterShow(false)}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: 'red' }}>Available Printers:</Text>
                        <ScrollView style={{ gap: 8, display: 'flex', }}>
                            {printers.map((printer) => (
                                <Button
                                    key={printer.inner_mac_address}
                                    title={`Connect to ${printer.device_name}`}
                                    onPress={() => connectToPrinter(printer)}

                                />
                            ))}
                        </ScrollView>

                        {selectedPrinter && (
                            <View style={{ marginTop: 20 }}>
                                <Text>Connected to: {selectedPrinter.device_name}</Text>
                                <Button title="🖨️ Print Test Receipt" onPress={() => setLabelShow(true)} />
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default BluetoothPrintImg;



const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    modalView: {
        width: "80%",
        height: "60%",
        flexDirection: "column",
        margin: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 5,
        paddingTop: 5,
        alignItems: "center",
        justifyContent: "center",
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
})