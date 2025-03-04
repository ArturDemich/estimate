import { PlantDetails, PlantDetailsResponse } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { memo, useEffect, useRef, useState, } from "react";
import { Alert, Dimensions, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { connect, useDispatch } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteCharacteristic, updateCharacteristic } from "@/db/db.native";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import PressableVibrate from "@/components/ui/PressableVibrate";
import { updateLocalCharacteristic } from "@/redux/dataSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const nullId = '00000000-0000-0000-0000-000000000000';

interface RenderPlantDetailProps {
    item: PlantDetailsResponse;
    existPlantProps: PlantDetails | null;
    reloadList: () => void;
    numRow: number;
    flatListRef?: () => void;
};

const RenderPlantDetail = ({ item, numRow, existPlantProps, reloadList, flatListRef }: RenderPlantDetailProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const selected = existPlantProps?.characteristic_id === item.characteristic_id;
    console.log('__RenderPlantDetail___ #ff6f61')
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });
    const itemRef = useRef<View>(null);
    const inputRef = useRef<TextInput>(null);
    const screenHeight = Dimensions.get("window").height;
    const [isEditing, setIsEditing] = useState(false);
    const [printQty, setPrintQty] = useState<string | number>(1);

   
    const handleUpdateQtyOne = async (currentQty: number) => {
        const success = await updateCharacteristic(item.id, currentQty);
        if (success) {
            dispatch(updateLocalCharacteristic({ id: item.id, currentQty: currentQty }));
        } else {
            console.error("Failed to update characteristic in DB.");
        }
    };

    const handleChangeQty = async (currentQty: string) => {
        const parsedQty = Number(currentQty);
        if ((item.currentQty === 0 && parsedQty < item.currentQty) || Number.isNaN(parsedQty)) {
            Alert.alert(`Значення не можк бути відємним ${currentQty}`);
            setIsEditing(false);
            return
        }
        dispatch(updateLocalCharacteristic({ id: item.id, currentQty: Number(currentQty) }));
    };

    const handleLongPress = () => {
        if (itemRef.current) {
            itemRef.current.measureInWindow((x, y, width, height) => {
                setMenuSize({ width, height });
                setMenuPosition({ x, y });
                setShowMenu(true);
            });
        }
    };

    const handleDelete = async () => {
        console.log("Delete action for", item);
        await deleteCharacteristic(item.id);
        await reloadList()
        setShowMenu(false);
    };

    const handlePrint = () => {
        console.log("Print action for", item.characteristic_name, menuPosition, screenHeight);
        // setShowMenu(false);
    };

    useEffect(() => {
        if (isEditing) {
            flatListRef && flatListRef()
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isEditing]);

    return (
        <PressableVibrate ref={itemRef} style={[styles.documentItem, selected && styles.selectedItem]} onLongPress={handleLongPress} >
            {selected && <View style={styles.shadowOverlay} />}
            <View style={{ flex: 1, }}>
                <View style={{ display: "flex", flexDirection: "row", maxWidth: '100%' }}>
                    <Text style={styles.itemNum}>{numRow}.</Text>
                    <Text style={styles.itemSize}>{
                        item.characteristic_id === nullId || null ? 'Немає характеристики' : item.characteristic_name
                    }</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: "column", flex: 1, paddingRight: 0 }}>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between', }}>
                            <View style={{ gap: 4, flexDirection: "row", }}>
                                <View style={styles.btnRes}>
                                    <Text>склад:</Text>
                                </View>
                                <Text style={[styles.itemQty, { color: "#70707B" }]}>{item.quantity}5555{item.unit_name}</Text>
                            </View>

                            {isEditing ? (
                                <TextInput
                                    ref={inputRef}
                                    style={styles.inputQty}
                                    value={item.currentQty.toString()}
                                    onChangeText={handleChangeQty}
                                    keyboardType="numeric"
                                    selectTextOnFocus={item.currentQty === 0}
                                    onBlur={() => handleUpdateQtyOne(item.currentQty).then(() => setIsEditing(false))}
                                />
                            ) : (
                                <PressableVibrate
                                    style={styles.editableQty}
                                    onPress={() => setIsEditing(true)}
                                >
                                    <MaterialCommunityIcons name="pen-lock" size={16} color="black" />
                                    <Text style={styles.itemQty}>{item.currentQty}{item.unit_name}</Text>
                                </PressableVibrate>
                            )}
                        </View>
                    </View>

                </View>
            </View>
            <TouchableVibrate style={styles.btnPlus} onPress={() => handleUpdateQtyOne(item.currentQty + 1)} onLongPress={() => handleUpdateQtyOne(item.currentQty - 1)}>
            
                <Text style={styles.btnPlusText}>+1</Text>
            </TouchableVibrate>

            {showMenu && (
                <Modal transparent animationType="fade">
                    <PressableVibrate
                        style={styles.modalOverlay}
                        onPress={() => setShowMenu(false)}
                    >
                        <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x, width: menuSize.width, height: menuSize.height }]}>
                           <View style={{alignSelf: 'flex-end'}}>
                            <TouchableVibrate style={styles.menuItem} onPress={handleDelete}>
                                <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
                                <Text style={[styles.menuText, { color: '#EF4444' }]}>Видалити</Text>
                            </TouchableVibrate>
                            </View>

                            <View style={{ flexDirection: 'row', backgroundColor: '#ffffffdb', gap: 4, padding: 5, borderRadius: 5}}>
                                <TextInput
                                    style={styles.inputPrint}
                                    value={printQty.toString()}
                                    onChangeText={setPrintQty}
                                    keyboardType="numeric"
                                />

                                <TouchableVibrate
                                    style={styles.menuItem}
                                    onPress={handlePrint}
                                >
                                    <MaterialIcons name="print" size={24} color="black" />
                                    <Text style={styles.menuText}>Друк</Text>
                                </TouchableVibrate>
                            </View>
                        </View>
                    </PressableVibrate>
                </Modal>
            )}
        </PressableVibrate>
    )
}

const mapStateToProps = (state: RootState) => ({
    existPlantProps: state.data.existPlantProps,
})

export default connect(mapStateToProps)(memo(RenderPlantDetail, (prevProps, nextProps) => {
    console.log('__RenderPlantDetail___ MEMO_', prevProps.item.currentQty, nextProps.item.currentQty, prevProps.existPlantProps?.characteristic_id, nextProps.existPlantProps?.characteristic_id);

    return (
        prevProps.item.currentQty === nextProps.item.currentQty &&
        prevProps.existPlantProps?.characteristic_id === nextProps.existPlantProps?.characteristic_id &&
        prevProps.item.characteristic_id === nextProps.item.characteristic_id
    );
}));


const styles = StyleSheet.create({
    documentItem: {
        backgroundColor: "#fff",
        opacity: 0.9,
        justifyContent: "center",
        minHeight: 40,
        borderRadius: 5,
        margin: 7,
        padding: 5,
        elevation: 10,
        shadowColor: "black",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 7,
        flexDirection: 'row',
        gap: 4,
    },
    btnPlus: {
        backgroundColor: 'rgb(106, 159, 53)',
        shadowColor: "rgba(0, 0, 0, 0.7)",
        width: 40,
        height: 40,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        alignSelf: 'center'
    },
    btnPlusText: {
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 16,
        fontWeight: 600,
    },
    btnRes: {
        padding: 4,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    itemQty: {
        alignSelf: "center",
        fontSize: 14,
    },
    itemSize: {
        fontSize: 14,
        lineHeight: 14,
        fontWeight: "600",
        padding: 5,
        color: "rgb(41, 41, 41)",
    },
    itemNum: {
        alignSelf: "center",
        fontSize: 13,
        color: "grey",
        marginTop: -3,
    },
    selectedItem: {
        shadowColor: "rgba(0,0,0,0.8)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
    },
    shadowOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(87, 245, 2, 0.43)",
        borderRadius: 5,
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    menuContainer: {
        position: "absolute",
        backgroundColor: "#ffffffdb",
        borderRadius: 5,
        padding: 3,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    menuItem: {
        paddingVertical: 8,
        paddingRight: 5,
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: 5,
        alignSelf: 'flex-end',
        height: 38,
        shadowColor: "rgba(0, 0, 0, 0.9)",
        //shadowOpacity: 0.3,
        //shadowOffset: { width: 0, height: 2 },
        //shadowRadius: 4,
        elevation: 5,
    },
    menuText: {
        fontSize: 16,
    },
    inputQty: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 8,
        fontSize: 14,
        minWidth: 50,
        maxWidth: 100,
        minHeight: 30,
        paddingVertical: 0,
        textAlign: "center",
        backgroundColor: "#fff",
    },
    inputPrint: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 4,
        fontSize: 14,
        width: 50,
        height: 40,
        paddingVertical: 0,
        textAlign: "center",
        alignSelf: 'flex-end',
        backgroundColor: "#fff",
    },
    editableQty: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minHeight: 30,
    },
});