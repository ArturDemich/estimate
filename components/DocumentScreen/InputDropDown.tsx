import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
    findNodeHandle,
    UIManager,
    Keyboard,
    ActivityIndicator,
} from "react-native";
import { Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { PlantItemRespons, PlantNameDB } from "@/redux/stateServiceTypes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsNameThunk } from "@/redux/thunks";
import { addPlant } from "@/db/db.native";
import { getUkrainianPart } from "../helpers";
import { useRouter } from "expo-router";
import BarcodeScanner from "../BarcodeScanner";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { myToast } from "@/utils/toastConfig";

interface InputDropDownProps {
    docId: string;
    docName: string;
    close: () => void;
    handleSetScanning: (val: boolean) => void;
    isScanning: boolean;
};

export default function InputDropDown({ docId, close, docName, handleSetScanning, isScanning }: InputDropDownProps) {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const searchPlantsList = useSelector<RootState, PlantItemRespons[]>((state) => state.data.searchPlantName);
    const docPlantsList = useSelector<RootState, PlantNameDB[]>((state) => state.data.dBPlantsName);
    const [input, setInput] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    const inputRef = useRef<TextInput>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const [barcode, setBarcode] = useState("");
    const [isSendSearch, setSendSearch] = useState(false);

    const showDropdown = () => {
        if (inputRef.current) {
            const handle = findNodeHandle(inputRef.current);
            if (handle) {
                UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                    setDropdownPosition({ top: pageY + height, left: pageX, width, });
                });
            }
        }
    };

    const navigateToPlantScreen = (name: string, id: number | null, productId?: string,) => {
        router.push({
            pathname: "/plant",
            params: { plantName: name, plantId: id, docId: docId, productId: productId, barcode, docName },
        });
    };
    const checkIfPlantExists = async (productid: string) => {
        const plant = docPlantsList.find(plant => plant.product_id === productid);
        return plant ? { existId: plant.id, productId: plant.product_id } : null
    };
    const handleCreatePlant = async (name: string, productId: string) => {
        const existingPlant = await checkIfPlantExists(productId);
        if (existingPlant) {
            navigateToPlantScreen(name, existingPlant.existId, existingPlant.productId);
        } else {
            const addingId = await addPlant(Number(docId), { id: productId, name });
            navigateToPlantScreen(name, addingId, productId);
        }
        close();
    };

    const handleSetSearch = async (name?: string, barcode?: string) => {
        setSendSearch(true);
        try {
            return await dispatch(getPlantsNameThunk({ name: name ? name : '', barcode: barcode ? barcode : '' })).unwrap();
        } catch (error: any) {
            console.error("Search Error:", error);
            myToast({
                type: "customError",
                text1: "Список рослин не отримано!",
                text2: error,
                visibilityTime: 6000,
                position: 'bottom',
                bottomOffset: 50
            });
        } finally {
            setSendSearch(false);
        }
    }

    const uniquePlants = Array.from(
        searchPlantsList ? new Map(searchPlantsList.map((item) => [item.product.name, item])).values() : []
    );

    function isNumericBarcode(barcode: string): boolean {
        return /^\d+$/.test(barcode);
    }

    useLayoutEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardOpen(true);
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardOpen(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        if (input.trim() !== "" && input.length > 3 && dropdownVisible) {
            typingTimeout.current = setTimeout(() => { handleSetSearch(input) }, 1000);
        }
        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [input, dispatch,]);

    useEffect(() => {
        if (!barcode) return;

        const fetchPlantByBarcode = async () => {
            try {
                if (isNumericBarcode(barcode)) {
                    const data = await handleSetSearch('', barcode);
                    if (data?.length === 1) {
                        handleCreatePlant(data[0].product.name, data[0].product.id);
                    }
                } else {
                    await dispatch(getPlantsNameThunk({ name: barcode, barcode: '' })).unwrap();
                }
            } catch (error: any) {
                const errorMessage = error?.message || "Unknown error occurred";
                console.error("Barcode search error:", error);
                myToast({
                    type: "customError",
                    text1: "Помилка пошук по баркоду!",
                    text2: errorMessage,
                    visibilityTime: 6000,
                    position: 'bottom',
                    bottomOffset: 50
                });
            }
        };

        fetchPlantByBarcode();
    }, [barcode]);

    return (
        <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    onChangeText={(text) => {
                        setInput(text);
                        setDropdownVisible(!!text);
                        showDropdown();
                    }}
                    onFocus={showDropdown}
                    onBlur={() => setDropdownVisible(false)}
                    value={input}
                    placeholder={input ? "" : "Оберіть назву рослини"}
                    placeholderTextColor="#A0A0AB"
                />

                {isScanning && (
                    <BarcodeScanner
                        onScan={(scannedData) => {
                            setBarcode(scannedData);
                            setInput(scannedData)
                            handleSetScanning(false);
                        }}
                        onClose={() => handleSetScanning(false)}
                    />
                )}
                {input ? (
                    <TouchableVibrate
                        onPress={() => {
                            setInput("");
                            setDropdownVisible(false);
                        }}
                        style={styles.clearButton}
                    >
                        <EvilIcons name="close-o" size={24} color="#FFFFFF" style={{ lineHeight: 24 }} />
                    </TouchableVibrate>
                ) : null}
            </View>

            {dropdownVisible && dropdownPosition && (
                <Portal>
                    <View
                        style={[
                            styles.listContainer,
                            {
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                                maxHeight: keyboardOpen ? 60 : 370,
                            },
                        ]}
                    >
                        {isSendSearch ?
                            <ActivityIndicator size="large" color="rgba(255, 111, 97, 1)" />
                            :
                            <FlatList
                                data={uniquePlants}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableVibrate
                                        style={styles.pressItemList}
                                        onPress={async () => {
                                            await handleCreatePlant(item.product.name, item.product.id)
                                        }}
                                    >
                                        <Text style={{ fontSize: 15, }}>{getUkrainianPart(item.product.name)}</Text>
                                    </TouchableVibrate>
                                )}
                                ItemSeparatorComponent={() => (
                                    <View style={{ borderBottomWidth: 1, borderColor: "#E4E4E7", }} />
                                )}
                                ListFooterComponent={() => (
                                    <View style={{ borderBottomWidth: 1, borderColor: "#E4E4E7", }} />
                                )}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingBottom: 10 }}
                            />
                        }
                    </View>
                </Portal>
            )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    inputWrapper: {
        position: "relative",
        width: "100%",
        marginTop: 10,
        marginBottom: 10,
    },
    inputContainer: {
        position: "relative",
        width: "100%",
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#E4E4E7",
        width: "100%",
        height: 50,
        padding: 10,
        paddingRight: 45,
        backgroundColor: "#f6f6f6",
        marginBottom: 5,
    },
    clearButton: {
        position: "absolute",
        right: 10,
        top: 15,
        backgroundColor: "#A0A0AB",
        borderRadius: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    },
    listContainer: {
        position: "absolute",
        backgroundColor: "#FFFFFF",
        zIndex: 110,
        elevation: 10,
        borderRadius: 3,
        maxHeight: 370,
        minHeight: 170,
        shadowColor: "#959595",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 3,
        padding: 5,
    },
    pressItemList: {
        paddingBottom: 8,
        paddingTop: 8,
        paddingLeft: 8,
    }
});
