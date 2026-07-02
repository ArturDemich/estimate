import React, { useState, useEffect, memo, useRef } from "react";
import {
    View,
    Text,
    Alert,
    PermissionsAndroid,
    Platform,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Switch,
    Pressable,
    Vibration,
    ScrollView,
    KeyboardAvoidingView,
    TextInput,
    LayoutAnimation,
    UIManager,
} from "react-native";
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    BluetoothTscPrinter,
} from "react-native-bluetooth-escpos-printer";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Label } from "@/redux/stateServiceTypes";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { connectPrinter, setAutoPrint, setDevices, setPrinterPuty } from "@/redux/dataSlice";
import { myToast } from "@/utils/toastConfig";
import EmptyList from "@/components/ui/EmptyList";
import { Entypo } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import PrinterPuty from "@/components/Printer/PrinterPuty";
import {
    KEY_LABEL_SIZE,
    KEY_PRINTER_TYPE,
    KEY_LABEL_GAP,
    KEY_LABEL_HEIGHT,
    KEY_LABEL_IMG_X,
    KEY_LABEL_IMG_Y,
    KEY_LABEL_IMG_WIDTH,
    KEY_LABEL_ESC_LEFT,
    KEY_LABEL_ESC_WIDTH,
    KEY_LABEL_NAME_MODE,
    PrinterDevice,
    PrinterType,
    LabelNameMode,
    SizeLabel,
    LabelPrintSettings,
    loadLabelPrintSettings,
    saveLabelSetting,
    ensureLabelSettingsStored,
    parsePairedDevices,
} from "@/components/Printer/printerConstants";

const DEFAULT_GAP = '3';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SettingField = ({
    label,
    value,
    onChange,
    placeholder,
    onFocus,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    onFocus?: () => void;
}) => (
    <View style={styles.settingField}>
        <Text style={styles.settingLabel}>{label}</Text>
        <TextInput
            style={styles.settingInput}
            value={value}
            onChangeText={onChange}
            onFocus={onFocus}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor="#aaa"
        />
    </View>
);

export const printLabel = async (img: string | null, label: Label | null, isPrinterPuty: boolean) => {
    if (!img || !label) {
        Alert.alert("Немає зображення", "Спробуйте ще раз або перезавантажте додаток");
        return;
    }
    const size = await SecureStore.getItemAsync(KEY_LABEL_SIZE) || '40';
    const printerType = await SecureStore.getItemAsync(KEY_PRINTER_TYPE) || PrinterType.TSC;
    const settings = await loadLabelPrintSettings(Math.floor(Dimensions.get('window').width));

    if (isPrinterPuty) {
        await onPrintImagePuty(img, Number(size), settings.height, label.qtyPrint);
        return;
    }

    for (let i = 0; i < label.qtyPrint; i++) {
        await printEscpos(img, settings, printerType as PrinterType);
    }
};

const onPrintImagePuty = async (base64Image: string, w: number, h: number, copies: number) => {
    Toast.show({
        type: "customToast",
        text1: "Друк...",
        position: "bottom",
        visibilityTime: 3000,
        bottomOffset: 130,
    });

    try {
        const res = await PrinterPuty.printImage(base64Image, w, h, copies);

        Toast.show({
            type: "customToast",
            text1: "Надруковано!",
            position: "bottom",
            visibilityTime: 1000,
            bottomOffset: 130,
        });

        return res;
    } catch (err: any) {
        console.error("Error", err.message);
        Alert.alert("Error", err.message);
        throw err;
    }
};

const printEscPos = async (base64Image: string, settings: LabelPrintSettings) => {
    await BluetoothEscposPrinter.printPic(base64Image, {
        width: settings.escWidth ?? 390,
        left: settings.escLeft ?? 0,
    });
    await BluetoothEscposPrinter.printText("\x1D\x0C", {});
};

const printTsc = async (base64Image: string, settings: LabelPrintSettings) => {
    await BluetoothTscPrinter.printLabel({
        width: settings.labelWidthMm,
        height: settings.height,
        gap: settings.gap,
        direction: BluetoothTscPrinter.DIRECTION.FORWARD,
        reference: [0, 0],
        tear: BluetoothTscPrinter.TEAR.ON,
        sound: 1,
        image: [{
            x: settings.imgX,
            y: settings.imgY,
            mode: BluetoothTscPrinter.BITMAP_MODE.OVERWRITE,
            width: settings.imgWidth ?? 300,
            image: base64Image,
        }],
    });
};

const printEscpos = async (base64Image: string, settings: LabelPrintSettings, printerType: PrinterType) => {
    try {
        Toast.show({
            type: "customToast",
            text1: "Друк...",
            position: "bottom",
            visibilityTime: 3000,
            bottomOffset: 130,
        });

        if (printerType === PrinterType.TSC) {
            await printTsc(base64Image, settings);
        } else {
            await printEscPos(base64Image, settings);
        }
    } catch (error) {
        console.error("Print failed:", error);
        Alert.alert("Error", "Failed to print.");
    }
};

const BluetoothPrintImg = () => {
    const dispatch = useDispatch<AppDispatch>();
    const pairedDevices = useSelector<RootState, PrinterDevice[]>((state) => state.data.pairedDevices);
    const connectedPrinter = useSelector<RootState, PrinterDevice | null>((state) => state.data.connectedPrinter);
    const autoPrint = useSelector<RootState, boolean>((state) => state.data.autoPrint);
    const isPrinterPuty = useSelector<RootState, boolean>((state) => state.data.isPrinterPuty);
    const [printerShow, setPrinterShow] = useState(false);
    const [optionsExpanded, setOptionsExpanded] = useState(false);
    const [printSettingsExpanded, setPrintSettingsExpanded] = useState(false);
    const settingsScrollRef = useRef<ScrollView>(null);
    const [selectedSizeLabel, setSelectedSizeLabel] = useState<SizeLabel | null>(null);
    const [printerType, setPrinterType] = useState<PrinterType>(PrinterType.TSC);
    const [labelGap, setLabelGap] = useState('3');
    const [labelHeight, setLabelHeight] = useState('30');
    const [labelImgX, setLabelImgX] = useState('0');
    const [labelImgY, setLabelImgY] = useState('10');
    const [labelImgWidth, setLabelImgWidth] = useState('');
    const [labelEscLeft, setLabelEscLeft] = useState('');
    const [labelEscWidth, setLabelEscWidth] = useState('');
    const [labelNameMode, setLabelNameMode] = useState<LabelNameMode>(LabelNameMode.Ukrainian);

    const handleOpenModal = async () => {
        Vibration.vibrate(5);
        const isBluetoothOn = isPrinterPuty
            ? await PrinterPuty.isBluetoothEnabled()
            : await BluetoothManager.isBluetoothEnabled();

        if (!isBluetoothOn) {
            myToast({
                type: "customError",
                text1: `Bluetooth не включений!`,
                text2: 'Включіть Bluetooth в налаштуваннях телефона.',
                visibilityTime: 4000,
            });
            return;
        }
        checkLabelSettings();
        setOptionsExpanded(false);
        setPrintSettingsExpanded(false);
        setPrinterShow(true);
    };

    const toggleOptions = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPrintSettingsExpanded(false);
        setOptionsExpanded((v) => !v);
    };

    const togglePrintSettings = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOptionsExpanded(false);
        setPrintSettingsExpanded((v) => !v);
    };

    const closeModal = () => {
        setPrinterShow(false);
        setOptionsExpanded(false);
        setPrintSettingsExpanded(false);
    };

    const checkLabelSettings = async () => {
        if (Platform.OS === 'web') return;

        await ensureLabelSettingsStored();

        const size = await SecureStore.getItemAsync(KEY_LABEL_SIZE);
        const type = await SecureStore.getItemAsync(KEY_PRINTER_TYPE);
        const gap = await SecureStore.getItemAsync(KEY_LABEL_GAP);
        const height = await SecureStore.getItemAsync(KEY_LABEL_HEIGHT);
        const imgX = await SecureStore.getItemAsync(KEY_LABEL_IMG_X);
        const imgY = await SecureStore.getItemAsync(KEY_LABEL_IMG_Y);
        const imgWidth = await SecureStore.getItemAsync(KEY_LABEL_IMG_WIDTH);
        const escLeft = await SecureStore.getItemAsync(KEY_LABEL_ESC_LEFT);
        const escWidth = await SecureStore.getItemAsync(KEY_LABEL_ESC_WIDTH);
        const nameMode = await SecureStore.getItemAsync(KEY_LABEL_NAME_MODE);

        if (size) setSelectedSizeLabel(Number(size) as SizeLabel);
        else {
            await saveLabelSetting(KEY_LABEL_SIZE, '40');
            setSelectedSizeLabel(SizeLabel.Forty);
        }

        if (type) setPrinterType(type as PrinterType);
        else {
            await saveLabelSetting(KEY_PRINTER_TYPE, PrinterType.TSC);
            setPrinterType(PrinterType.TSC);
        }

        setLabelGap(gap || DEFAULT_GAP);
        setLabelHeight(height || '30');
        setLabelImgX(imgX || '0');
        setLabelImgY(imgY || '10');
        setLabelImgWidth(imgWidth || '');
        setLabelEscLeft(escLeft || '');
        setLabelEscWidth(escWidth || '');
        setLabelNameMode(
            Object.values(LabelNameMode).includes(nameMode as LabelNameMode)
                ? (nameMode as LabelNameMode)
                : LabelNameMode.Ukrainian
        );
    };

    const handleSetSizeLabel = async (size: number) => {
        if (Platform.OS !== 'web') {
            await saveLabelSetting(KEY_LABEL_SIZE, size.toString());
            setSelectedSizeLabel(size as SizeLabel);
        }
    };

    const handleSetPrinterType = async (type: PrinterType) => {
        if (Platform.OS !== 'web') {
            await saveLabelSetting(KEY_PRINTER_TYPE, type);
            setPrinterType(type);
        }
    };

    const handleSetLabelNameMode = async (mode: LabelNameMode) => {
        if (Platform.OS !== 'web') {
            await saveLabelSetting(KEY_LABEL_NAME_MODE, mode);
            setLabelNameMode(mode);
        }
    };

    const handleSaveSetting = async (key: string, value: string, setter: (v: string) => void) => {
        setter(value);
        if (Platform.OS !== 'web') {
            await saveLabelSetting(key, value);
        }
    };

    const handleSwitchPrinterPuty = () => {
        Vibration.vibrate(5);
        isPrinterPuty && closeConnectPrinter();
        dispatch(setPrinterPuty(!isPrinterPuty));
    };

    const handleSwitchAutoPrint = () => {
        Vibration.vibrate(5);
        dispatch(setAutoPrint(!autoPrint));
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

        pairedDevices.length === 0 && initBluetooth();
    };

    const initBluetooth = async () => {
        try {
            const raw = await BluetoothManager.enableBluetooth();
            dispatch(setDevices(parsePairedDevices(raw || [])));
        } catch (error) {
            console.error("Bluetooth init failed:", error);
        }
    };

    const connectToPrinter = async (printer: PrinterDevice) => {
        if (connectedPrinter != null) {
            dispatch(connectPrinter(null));
        }
        try {
            if (isPrinterPuty) {
                await PrinterPuty.connectPrinter(printer.inner_mac_address);
                let connected = false;

                for (let i = 0; i < 10; i++) {
                    const isConnected = await PrinterPuty.checkPrinterStatus();
                    if (isConnected) {
                        connected = true;
                        break;
                    }
                    await new Promise(res => setTimeout(res, 500));
                }

                if (connected) {
                    dispatch(connectPrinter(printer));
                    myToast({
                        type: "customToast",
                        text1: `✅ Підключено принтер: ${printer.device_name}`,
                        position: "top",
                    });
                } else {
                    myToast({
                        type: "customError",
                        text1: "❌ Не підключено! Перевірь чи увімкнено принтер.",
                        visibilityTime: 4000,
                        position: "top",
                    });
                }
            } else {
                await BluetoothManager.connect(printer.inner_mac_address);
                dispatch(connectPrinter(printer));
                myToast({
                    type: "customToast",
                    text1: `✅ Підключено принтер: ${printer.device_name}`,
                    position: "top",
                });
            }
        } catch (error) {
            console.error("Connection failed:", error);
            myToast({
                type: "customError",
                text1: "❌ Не підключено! Перевірь чи увімкнено принтер.",
                visibilityTime: 4000,
                position: "top",
            });
        }
    };

    const closeConnectPrinter = async () => {
        if (isPrinterPuty) {
            await PrinterPuty.disconnectPrinter();
        }
        dispatch(connectPrinter(null));
    };

    return (
        <>
            <TouchableVibrate style={styles.openBtn} onPressOut={handleOpenModal}>
                {(!connectedPrinter && !autoPrint) && <MaterialCommunityIcons name="printer-settings" size={24} color="black" />}
                {(!connectedPrinter && autoPrint || connectedPrinter && autoPrint) && <MaterialCommunityIcons name="printer-eye" size={24} color={connectedPrinter ? 'rgba(106, 159, 53, 0.95)' : "black"} />}
                {(connectedPrinter && !autoPrint) && <MaterialCommunityIcons name="printer-wireless" size={24} color={connectedPrinter ? 'rgba(106, 159, 53, 0.95)' : "black"} />}
            </TouchableVibrate>
            <Modal visible={printerShow} animationType="slide" transparent onRequestClose={closeModal}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.centeredView}>
                        <Pressable style={styles.backdrop} onPress={closeModal} />
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Раніше підключені пристрої:</Text>
                            </View>
                            <ScrollView
                                style={styles.modalScroll}
                                contentContainerStyle={styles.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator
                            >
                                <View style={styles.deviceList}>
                                    {pairedDevices.length === 0 ? (
                                        <EmptyList text="Немає раніше підключених пристроїв" />
                                    ) : (
                                        pairedDevices.map((item) => (
                                            <Pressable key={item.inner_mac_address} style={styles.deviceItem}>
                                                <Text style={styles.deviceName}>{item.device_name}</Text>
                                                {connectedPrinter?.inner_mac_address === item.inner_mac_address ?
                                                    <TouchableVibrate style={styles.deviceBtnDisc} onPress={closeConnectPrinter}>
                                                        <Text style={styles.deviceBtnText}>Відключити</Text>
                                                    </TouchableVibrate>
                                                    :
                                                    <ConnectBtn connectToPrinter={() => connectToPrinter(item)} />
                                                }
                                            </Pressable>
                                        ))
                                    )}
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <View style={styles.bottomDrawer}>
                                    <TouchableVibrate style={styles.drawerToggle} onPress={toggleOptions}>
                                        <MaterialCommunityIcons
                                            name={connectedPrinter ? "printer-wireless" : "printer-off"}
                                            size={22}
                                            color={connectedPrinter ? 'rgba(106, 159, 53, 0.95)' : '#888'}
                                        />
                                        <Text style={styles.drawerToggleText} numberOfLines={1}>
                                            {connectedPrinter
                                                ? `Підключено: ${connectedPrinter.device_name}`
                                                : 'Не підключено'}
                                        </Text>
                                        <Entypo
                                            name={optionsExpanded ? "chevron-down" : "chevron-up"}
                                            size={22}
                                            color="#666"
                                        />
                                    </TouchableVibrate>
                                    {optionsExpanded && (
                                        <ScrollView
                                            style={styles.optionsDrawerBody}
                                            contentContainerStyle={styles.optionsDrawerContent}
                                            keyboardShouldPersistTaps="handled"
                                            nestedScrollEnabled
                                            showsVerticalScrollIndicator
                                        >
                                            <Text style={styles.optionsSectionTitle}>Розмір етикетки</Text>
                                            <View style={styles.labelSizeRow}>
                                                <TouchableVibrate
                                                    style={[styles.labeleSizeItem, selectedSizeLabel === SizeLabel.Fifty && styles.labeleSizeLock]}
                                                    onPress={() => handleSetSizeLabel(SizeLabel.Fifty)}
                                                    disabled={selectedSizeLabel === SizeLabel.Fifty}
                                                >
                                                    <MaterialCommunityIcons name="sticker-text-outline" size={22} color="rgb(83, 83, 83)" />
                                                    <Text style={styles.labeleSizeText}>50x30mm</Text>
                                                    {selectedSizeLabel === SizeLabel.Fifty && <Entypo name="check" size={20} color='rgba(106, 159, 53, 0.95)' />}
                                                </TouchableVibrate>
                                                <TouchableVibrate
                                                    style={[styles.labeleSizeItem, selectedSizeLabel === SizeLabel.Forty && styles.labeleSizeLock]}
                                                    onPress={() => handleSetSizeLabel(SizeLabel.Forty)}
                                                    disabled={selectedSizeLabel === SizeLabel.Forty}
                                                >
                                                    <MaterialCommunityIcons name="sticker-text-outline" size={22} color="rgb(83, 83, 83)" />
                                                    <Text style={styles.labeleSizeText}>40x30mm</Text>
                                                    {selectedSizeLabel === SizeLabel.Forty && <Entypo name="check" size={20} color='rgba(106, 159, 53, 0.95)' />}
                                                </TouchableVibrate>
                                            </View>

                                            <View style={styles.switchRow}>
                                                <View style={styles.switchLabel}>
                                                    <MaterialCommunityIcons name="printer" size={22} color={isPrinterPuty ? "rgba(255, 111, 97, 1)" : "black"} />
                                                    <Text style={[styles.switchLabelText, isPrinterPuty && styles.switchLabelPuty]}>PUTY</Text>
                                                </View>
                                                <Switch
                                                    trackColor={{ false: '#767577', true: "rgba(255, 111, 97, 1)" }}
                                                    thumbColor={'#f4f3f4'}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={handleSwitchPrinterPuty}
                                                    value={isPrinterPuty}
                                                />
                                            </View>

                                            <View style={styles.switchRow}>
                                                <View style={styles.switchLabel}>
                                                    <MaterialCommunityIcons name="printer-eye" size={22} color={autoPrint ? 'rgba(106, 159, 53, 0.95)' : "black"} />
                                                    <Text style={styles.switchLabelText}>Автодрук</Text>
                                                </View>
                                                <Switch
                                                    trackColor={{ false: '#767577', true: 'rgba(106, 159, 53, 0.95)' }}
                                                    thumbColor={'#f4f3f4'}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={handleSwitchAutoPrint}
                                                    value={autoPrint}
                                                />
                                            </View>

                                            <Text style={styles.optionsSectionTitle}>Назва рослини на етикетці</Text>
                                            <View style={styles.nameModeRow}>
                                                <TouchableVibrate
                                                    style={[styles.nameModeItem, labelNameMode === LabelNameMode.Full && styles.nameModeActive]}
                                                    onPress={() => handleSetLabelNameMode(LabelNameMode.Full)}
                                                >
                                                    <Text style={styles.nameModeText}>Лат + укр</Text>
                                                </TouchableVibrate>
                                                <TouchableVibrate
                                                    style={[styles.nameModeItem, labelNameMode === LabelNameMode.Ukrainian && styles.nameModeActive]}
                                                    onPress={() => handleSetLabelNameMode(LabelNameMode.Ukrainian)}
                                                >
                                                    <Text style={styles.nameModeText}>Тільки укр</Text>
                                                </TouchableVibrate>
                                                <TouchableVibrate
                                                    style={[styles.nameModeItem, labelNameMode === LabelNameMode.Latin && styles.nameModeActive]}
                                                    onPress={() => handleSetLabelNameMode(LabelNameMode.Latin)}
                                                >
                                                    <Text style={styles.nameModeText}>Lat only</Text>
                                                </TouchableVibrate>
                                            </View>

                                            {!isPrinterPuty && (
                                                <>
                                                    <Text style={styles.optionsSectionTitle}>Протокол</Text>
                                                    <View style={styles.protocolRow}>
                                                        <TouchableVibrate
                                                            style={[styles.printerTypeItem, printerType === PrinterType.TSC && styles.printerTypeActive]}
                                                            onPress={() => handleSetPrinterType(PrinterType.TSC)}
                                                        >
                                                            <Text style={styles.printerTypeText}>TSC</Text>
                                                        </TouchableVibrate>
                                                        <TouchableVibrate
                                                            style={[styles.printerTypeItem, printerType === PrinterType.ESC && styles.printerTypeActive]}
                                                            onPress={() => handleSetPrinterType(PrinterType.ESC)}
                                                        >
                                                            <Text style={styles.printerTypeText}>ESC</Text>
                                                        </TouchableVibrate>
                                                    </View>
                                                </>
                                            )}
                                        </ScrollView>
                                    )}
                                </View>

                                {!isPrinterPuty && (
                                    <View style={styles.bottomDrawer}>
                                        <TouchableVibrate style={styles.drawerToggle} onPress={togglePrintSettings}>
                                            <MaterialCommunityIcons name="tune-vertical" size={22} color="rgba(106, 159, 53, 0.95)" />
                                            <Text style={[styles.drawerToggleText, styles.drawerToggleTextAccent]}>
                                                Налаштування друку (gap, відступи...)
                                            </Text>
                                            <Entypo
                                                name={printSettingsExpanded ? "chevron-down" : "chevron-up"}
                                                size={22}
                                                color="rgba(106, 159, 53, 0.95)"
                                            />
                                        </TouchableVibrate>
                                        {printSettingsExpanded && (
                                            <ScrollView
                                                ref={settingsScrollRef}
                                                style={styles.settingsDrawerBody}
                                                contentContainerStyle={styles.settingsScrollContent}
                                                keyboardShouldPersistTaps="handled"
                                                nestedScrollEnabled
                                                showsVerticalScrollIndicator
                                                automaticallyAdjustKeyboardInsets
                                            >
                                                <SettingField label="Gap між етикетками (мм)" value={labelGap} onChange={(v) => handleSaveSetting(KEY_LABEL_GAP, v, setLabelGap)} onFocus={() => settingsScrollRef.current?.scrollToEnd({ animated: true })} />
                                                <SettingField label="Висота етикетки (мм)" value={labelHeight} onChange={(v) => handleSaveSetting(KEY_LABEL_HEIGHT, v, setLabelHeight)} />
                                                <SettingField label="X зображення" value={labelImgX} onChange={(v) => handleSaveSetting(KEY_LABEL_IMG_X, v, setLabelImgX)} />
                                                <SettingField label="Y зображення" value={labelImgY} onChange={(v) => handleSaveSetting(KEY_LABEL_IMG_Y, v, setLabelImgY)} />
                                                <SettingField label="Ширина зображення (px)" value={labelImgWidth} onChange={(v) => handleSaveSetting(KEY_LABEL_IMG_WIDTH, v, setLabelImgWidth)} placeholder="авто" />
                                                <SettingField label="ESC відступ зліва (px)" value={labelEscLeft} onChange={(v) => handleSaveSetting(KEY_LABEL_ESC_LEFT, v, setLabelEscLeft)} placeholder="авто" />
                                                <SettingField label="ESC ширина (px)" value={labelEscWidth} onChange={(v) => handleSaveSetting(KEY_LABEL_ESC_WIDTH, v, setLabelEscWidth)} placeholder="авто" />
                                            </ScrollView>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};

export default memo(BluetoothPrintImg);

const ConnectBtn = ({ connectToPrinter }: { connectToPrinter: () => Promise<void> }) => {
    const [connect, setConnect] = useState(false);
    const handlePress = async () => {
        setConnect(true);
        connectToPrinter().then(() => setConnect(false));
    };
    return (
        <TouchableVibrate style={[styles.deviceBtn, connect && { backgroundColor: 'rgba(201, 201, 201, 0.92)' }]} onPress={handlePress}>
            {connect ? <ActivityIndicator size='large' color='#ff6f61' /> : <Text style={styles.deviceBtnText}>Підключити</Text>}
        </TouchableVibrate>
    );
};

const MODAL_MAX_HEIGHT = Dimensions.get('window').height * 0.58;
const OPTIONS_DRAWER_MAX_HEIGHT = MODAL_MAX_HEIGHT * 0.38;
const SETTINGS_DRAWER_MAX_HEIGHT = MODAL_MAX_HEIGHT * 0.38;

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalView: {
        maxHeight: MODAL_MAX_HEIGHT,
        flexDirection: "column",
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingTop: 8,
        alignItems: "center",
        elevation: 5,
        width: '100%',
        overflow: 'hidden',
    },
    modalHeader: {
        width: '100%',
        flexShrink: 0,
    },
    modalScroll: {
        width: '100%',
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
    },
    modalScrollContent: {
        paddingBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    deviceList: {
        width: '100%',
        gap: 8,
        paddingRight: 5,
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
    modalFooter: {
        width: '100%',
        flexShrink: 0,
    },
    bottomDrawer: {
        width: '100%',
        flexShrink: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(131, 131, 131, 0.25)',
        backgroundColor: 'rgba(245, 245, 245, 0.6)',
    },
    drawerToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    drawerToggleText: {
        fontSize: 14,
        fontWeight: 600,
        color: '#333',
        flex: 1,
    },
    drawerToggleTextAccent: {
        color: 'rgba(106, 159, 53, 0.95)',
    },
    optionsDrawerBody: {
        maxHeight: OPTIONS_DRAWER_MAX_HEIGHT,
    },
    optionsDrawerContent: {
        paddingHorizontal: 8,
        paddingBottom: 10,
        gap: 8,
    },
    optionsSectionTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: 'grey',
        marginTop: 4,
    },
    labelSizeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    switchLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    switchLabelText: {
        fontSize: 14,
        fontWeight: 500,
    },
    switchLabelPuty: {
        color: "rgba(255, 111, 97, 1)",
    },
    protocolRow: {
        flexDirection: 'row',
        gap: 8,
    },
    nameModeRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 4,
    },
    nameModeItem: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(131, 131, 131, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
    },
    nameModeActive: {
        borderColor: 'rgba(106, 159, 53, 0.95)',
        backgroundColor: 'rgba(106, 159, 53, 0.15)',
    },
    nameModeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    labeleSizeItem: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        flex: 1,
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
        marginRight: 10,
    },
    labeleSizeLock: {
        elevation: 0,
        borderColor: 'unset',
        borderWidth: 0,
        shadowColor: 'unset',
        backgroundColor: "rgba(255, 255, 255, 0.39)",
    },
    printerTypeItem: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "rgba(131, 131, 131, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    printerTypeActive: {
        borderColor: 'rgba(106, 159, 53, 0.95)',
        backgroundColor: 'rgba(106, 159, 53, 0.15)',
    },
    printerTypeText: {
        fontSize: 14,
        fontWeight: 600,
    },
    openBtn: {
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.06)",
        borderRadius: 5,
        shadowColor: 'rgba(143, 143, 143, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 5
    },
    advancedSettings: {
        marginTop: 12,
        width: '100%',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(131, 131, 131, 0.2)',
    },
    advancedTitle: {
        fontWeight: 600,
        color: 'grey',
        marginBottom: 8,
    },
    settingsScrollContent: {
        paddingHorizontal: 8,
        paddingBottom: 12,
        gap: 10,
    },
    settingsDrawerBody: {
        maxHeight: SETTINGS_DRAWER_MAX_HEIGHT,
    },
    settingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    settingField: {
        width: '100%',
    },
    settingLabel: {
        fontSize: 12,
        color: 'grey',
        marginBottom: 2,
    },
    settingInput: {
        borderWidth: 1,
        borderColor: 'rgba(131, 131, 131, 0.3)',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
});
