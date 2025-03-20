import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { addCharacteristic } from "@/db/db.native";
import { PlantDetails, PlantItemRespons } from "@/redux/stateServiceTypes";
import { getPlantsDetailsDB } from "@/redux/thunks";
import { setExistPlantProps } from "@/redux/dataSlice";
import Entypo from '@expo/vector-icons/Entypo';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { EvilIcons } from "@expo/vector-icons";
import EmptyList from "@/components/ui/EmptyList";
import ManualDetailsAdd from "@/components/PlantScreen/ManualDetailsAdd";
import { newSIZE, nullID, unitPC } from "@/types/typesScreen";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface AddDetailsProps {
    plantDBid: string;
    docId: string;
    productId: string;
};

export default function AddDetailsModal({ plantDBid, docId, productId }: AddDetailsProps) {
    const dispatch = useDispatch<AppDispatch>();
    const params = useLocalSearchParams();
    const palntDetails = useSelector<RootState, PlantDetails[]>((state) => state.data.dBPlantDetails);
    const plants: PlantItemRespons[] = useSelector((state: RootState) => state.data.searchPlantName);
    const dataPlant = plants?.length > 0 ? plants.filter((item) => item.product.id === productId) : [];
    console.log('AddDetailsModal', params?.barcode,)
    const [show, setShow] = useState(false);
    const [input, setInput] = useState("");
    const [manual, setManual] = useState(false);

    const handleClose = () => {
        setShow(false);
    };

    const serachDetail = (data: PlantItemRespons[]) => {
        return data.filter((item) => {
            return (
                item.characteristic.name.toLowerCase().includes(input.toLowerCase())
            );
        });
    };

    const isCharacteristicAdded = (characteristicId: string, charName?: string) => {
        if (characteristicId) {
            return palntDetails.some((detail) => detail.characteristic_id === characteristicId);
        } else if (charName) {
            return palntDetails.some((detail) => detail.characteristic_name === charName);
        }

    };

    const addManualDetails = async (plantDetail: string) => {
        const detail: PlantItemRespons = {
            product: {
                name: '',
                id: ''
            },
            characteristic: {
                name: plantDetail,
                id: newSIZE
            },
            unit: {
                name: unitPC.name,
                id: nullID
            },
            barcode: '0',
            quantity: 0,
        }
        if (isCharacteristicAdded('', plantDetail)) {
            dispatch(setExistPlantProps({
                plant_id: Number(plantDBid),
                characteristic_id: newSIZE,
                characteristic_name: plantDetail,
                unit_id: unitPC.name,
                unit_name: unitPC.id,
                barcode: '0',
                quantity: 0
            }))
            setShow(false);
            return;
        }
        const addCharact = await addCharacteristic(Number(plantDBid), detail);
        if (addCharact != null) await dispatch(getPlantsDetailsDB({ palntId: Number(plantDBid), docId: Number(docId) }));

        setShow(false);
    };

    const addDetails = async (plantNameDBId: number, plantItem: PlantItemRespons) => {
        if (isCharacteristicAdded(plantItem.characteristic.id)) {
            dispatch(setExistPlantProps({
                plant_id: plantNameDBId,
                characteristic_id: plantItem.characteristic.id,
                characteristic_name: plantItem.characteristic.name,
                unit_id: plantItem.unit.id,
                unit_name: plantItem.unit.name,
                barcode: plantItem.barcode,
                quantity: plantItem.quantity ? plantItem.quantity : 0
            }))
            setShow(false);
            return;
        }
        const addCharact = await addCharacteristic(plantNameDBId, plantItem);
        if (addCharact != null) await dispatch(getPlantsDetailsDB({ palntId: Number(plantDBid), docId: Number(docId) }));

        setShow(false);
    };

    useEffect(() => {
        if (params.barcode) {
            if (plants.length === 1 && plants.some((item) => item.barcode === params.barcode)) {
                addDetails(Number(plantDBid), plants[0])
            }
        }
    }, [])

    return (
        <>
            <View style={styles.containerNBTN}>
                <TouchableVibrate
                    style={styles.buttonStep}
                    onPress={() => setShow(!show)}
                >
                    <Entypo name="add-to-list" size={24} color="#131316" />
                </TouchableVibrate>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={show}
                onRequestClose={() => handleClose()}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {manual ?
                            <ManualDetailsAdd add={(value: string) => addManualDetails(value)} />
                            :
                            <>
                                <Text
                                    style={styles.textStr}
                                    allowFontScaling={true}
                                    maxFontSizeMultiplier={1}
                                >
                                    Оберіть х-ка:
                                </Text>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={(text) => setInput(text)}
                                        value={input}
                                        placeholder={input ? "" : "Введіть текст для пошуку"}
                                        placeholderTextColor="#A0A0AB"
                                    />
                                    {input ? (
                                        <TouchableVibrate
                                            onPress={() => {
                                                setInput("");
                                            }}
                                            style={styles.clearButton}
                                        >
                                            <EvilIcons name="close-o" size={24} color="#FFFFFF" style={{ lineHeight: 24 }} />
                                        </TouchableVibrate>
                                    ) : null}
                                </View>

                                <FlatList
                                    data={input !== '' ? serachDetail(dataPlant) : dataPlant}
                                    keyExtractor={(item) => item.characteristic.id}
                                    renderItem={({ item }) => (
                                        <TouchableVibrate
                                            style={styles.listItem}
                                            onPress={() => addDetails(Number(plantDBid), item)}
                                        >
                                            <Text style={styles.listItemName}>{item.characteristic.name}</Text>
                                            <Text style={styles.listItemQty}>{item.quantity} 0 {item.unit.name}</Text>
                                        </TouchableVibrate>
                                    )}
                                    style={{ width: '100%' }}
                                    keyboardShouldPersistTaps="handled"
                                    ListEmptyComponent={<EmptyList text="Співпадінь не знайдено" />}
                                />
                            </>
                        }


                        <View style={styles.btnBlock}>
                            <TouchableVibrate
                                onPress={() => handleClose()}
                                style={styles.buttonClose}
                            >
                                <EvilIcons name="close" size={24} color="#FFFFFF" style={{ lineHeight: 24 }} />
                            </TouchableVibrate>
                            <View style={styles.switchBlock}>
                                <Switch
                                    trackColor={{ false: '#767577', true: '"rgba(255, 111, 97, 1)"' }}
                                    thumbColor={'#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() => setManual(!manual)}
                                    value={manual}
                                />
                                <MaterialCommunityIcons name="draw-pen" size={24} color={manual ? "rgba(255, 111, 97, 1)" : "rgb(125, 125, 125)"} />
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    listItem: {
        paddingVertical: 15,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        width: "100%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    listItemName: {
        fontSize: 16,
        alignSelf: "center",
        display: 'flex',
        flex: 2
    },
    listItemQty: {
        fontSize: 16,
        alignSelf: 'flex-end',
        textAlign: 'right',
        display: 'flex',
        flex: 1
    },
    containerNBTN: {
        elevation: 5,
        position: "absolute",
        right: 12,
        bottom: 10,
        zIndex: 10
    },
    buttonStep: {
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.99)',
        borderColor: '#E4E4E7',
        borderWidth: 1,
        height: 44,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        opacity: 0.97,
        elevation: 10,
        shadowColor: "#131316",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 3,
        zIndex: 10
    },
    centeredView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00002329",
    },
    suggestionsContainer: {
        backgroundColor: "white",
        borderRadius: 5,
        elevation: 3,
    },
    modalView: {
        width: "80%",
        flexDirection: "column",
        margin: 1,
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 5,
        paddingTop: 5,
        alignItems: "center",
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: "35%",
        maxHeight: "70%",
    },
    btnBlock: {
        flexDirection: "row",
        width: "100%",
        marginTop: 5,
        justifyContent: 'space-between'
    },
    buttonClose: {
        borderRadius: 8,
        elevation: 3,
        padding: 4,
        alignSelf: "flex-end",
        backgroundColor: "rgba(199, 199, 199, 0.99)",
        justifyContent: "center",
        alignItems: 'center',
    },
    textStr: {
        fontWeight: "600",
        fontSize: 14,
        padding: 5,
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
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 45,
        backgroundColor: "#f6f6f6",
        marginBottom: 5,
        marginTop: 5,
    },
    clearButton: {
        position: "absolute",
        right: 10,
        top: 13,
        backgroundColor: "#A0A0AB",
        borderRadius: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    },
    switchBlock: {
        flexDirection: 'row',
        padding: 5,
    },
});
