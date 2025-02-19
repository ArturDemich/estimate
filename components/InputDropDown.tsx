import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    findNodeHandle,
    UIManager,
    Keyboard,
} from "react-native";
import { Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { PlantItemRespons, PlantNameDB } from "@/redux/stateServiceTypes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsNameDB, getPlantsNameThunk } from "@/redux/thunks";
import { addPlant, fetchDocuments, fetchPlants } from "@/db/db.native";
import { getUkrainianPart } from "./helpers";
import { useLocalSearchParams, useRouter } from "expo-router";

interface InputDropDownProps {
    docId: string;
    close: () => void;
};

export default function InputDropDown({ docId, close }: InputDropDownProps) {
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

    const navigateToPlantScreen = (name: string, id: string) => {
        router.push({
            pathname: "/plant",
            params: { plantName: name, plantId: id, docId: docId},
          });
    };
    const checkIfPlantExists = async (plantid: string) => {
        return docPlantsList.some(plant => plant.product_id === plantid);
    };
    const handleCreatePlant = async (name: string, id: string) => {
        console.log('handleCreatePlant()__START', )
        const existingPlant = await checkIfPlantExists(id);
        console.log('handleCreatePlant()__exist', existingPlant)

    if (existingPlant) {
        // If the plant already exists, navigate to the plant's screen
        console.log('handleCreatePlant()__navigateToPlantScreen',)
        navigateToPlantScreen(name, id);
    } else {
        // If the plant does not exist, create it
        await addPlant(Number(docId), { id, name });
        console.log('handleCreatePlant()addPlant',)
        // Optionally, fetch updated list or dispatch to update the store
        //await dispatch(getPlantsNameDB({ docId: Number(docId) }));

        // After adding the plant, navigate to the newly created plant's screen
        navigateToPlantScreen(name, id);
    }
    
    // Close the dropdown after handling the plant
    close();
    };

    const uniquePlants = Array.from(
        new Map(searchPlantsList.map((item) => [item.product.name, item])).values()
    );

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
            console.log('InputDropDown222')
            clearTimeout(typingTimeout.current);
        }

        if (input.trim() !== "" && input.length > 3 && dropdownVisible) {
            console.log('InputDropDown333')
            typingTimeout.current = setTimeout(() => {
                dispatch(getPlantsNameThunk({ name: input, barcode: '' }));
            }, 1000);
        }
    }, [input, dispatch]);

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
                    value={getUkrainianPart(input)}
                    placeholder={input ? "" : "Оберіть назву рослини"}
                    placeholderTextColor="#A0A0AB"
                />
                {input ? (
                    <TouchableOpacity
                        onPress={() => {
                            setInput("");
                            setDropdownVisible(false);
                        }}
                        style={styles.clearButton}
                    >
                        <EvilIcons name="close-o" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
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
                                maxHeight: keyboardOpen ? 160 : 370,
                            },
                        ]}
                    >
                        <FlatList
                            data={uniquePlants}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pressItemList}
                                    onPress={async () => {
                                        //setInput(item.product.name);
                                        await handleCreatePlant(item.product.name, item.product.id)
                                        //setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={{ fontSize: 15, }}>{getUkrainianPart(item.product.name)}</Text>
                                </TouchableOpacity>
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
    },
    clearButtonText: {
        fontSize: 12,
        color: "#333",
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
