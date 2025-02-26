import { PlantDetails, PlantDetailsResponse } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { memo, useRef, useState, } from "react";
import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";
import { connect, useDispatch } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteCharacteristic, updateCharacteristic } from "@/db/db.native";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import PressableVibrate from "@/components/ui/PressableVibrate";
import { updateLocalCharacteristic } from "@/redux/dataSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const nullId = '00000000-0000-0000-0000-000000000000';

interface RenderPlantDetailProps {
    item: PlantDetailsResponse;
    index: number;
    existPlantProps: PlantDetails | null;
    reloadList: () => void;
};

const RenderPlantDetail = ({ item, index, existPlantProps, reloadList }: RenderPlantDetailProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const selected = existPlantProps?.characteristic_id === item.characteristic_id;
    console.log('__RenderPlantDetail___ #ff6f61')
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });
    const itemRef = useRef<View>(null);
    const screenHeight = Dimensions.get("window").height;  // Get the screen height

    const handleUpdateQty = async (qty?: number) => {
        const newQuantity = qty ? qty : item.quantity + 1;

        // 1. Update the database
        const success = await updateCharacteristic(item.id, newQuantity);

        if (success) {
            // 2. Update Redux state directly
            dispatch(updateLocalCharacteristic({ id: item.id, quantity: newQuantity }));
        } else {
            console.error("Failed to update characteristic in DB.");
        }
    }

    const handleLongPress = () => {
        if (itemRef.current) {
            itemRef.current.measureInWindow((x, y, width, height) => {
                setMenuSize({ width, height }); // Store the dimensions
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

    return (
        <PressableVibrate ref={itemRef} style={[styles.documentItem, selected && styles.selectedItem]} onLongPress={handleLongPress} >
            {selected && <View style={styles.shadowOverlay} />}
            <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
                <Text style={styles.itemNum}>{index + 1}.</Text>
                <Text style={styles.itemSize}>{
                    item.characteristic_id === nullId || null ? 'Немає характеристики' : item.characteristic_name
                }</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                <View style={{ flexDirection: "column", flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', }}>
                        <View style={{ gap: 4, flexDirection: "row", }}>
                            <View style={styles.btnRes}>
                                <Text>склад:</Text>
                            </View>
                            <Text style={[styles.itemQty, { color: "#70707B" }]}>{item.quantity}5555{item.unit_name}</Text>
                        </View>

                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                            <MaterialCommunityIcons name="pen-lock" size={16} color="black" />
                            <Text style={styles.itemQty}>{item.quantity}{item.unit_name}</Text>
                        </View>
                    </View>
                </View>
                <TouchableVibrate style={styles.btnPlus} onPress={() => handleUpdateQty()}>
                    <Text>+1</Text>
                </TouchableVibrate>
            </View>

            {showMenu && (
                <Modal transparent animationType="fade">
                    <PressableVibrate
                        style={styles.modalOverlay}
                        onPress={() => setShowMenu(false)}
                    >
                        <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x, width: menuSize.width, height: menuSize.height }]}>
                            <TouchableVibrate style={styles.menuItem} onPress={handleDelete}>
                                <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
                                <Text style={[styles.menuText, { color: '#EF4444' }]}>Видалити</Text>
                            </TouchableVibrate>
                            <TouchableVibrate
                                style={styles.menuItem}
                                onPress={handlePrint}
                            >
                                <MaterialIcons name="print" size={24} color="black" />
                                <Text style={styles.menuText}>Друк</Text>
                            </TouchableVibrate>
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
    console.log('__RenderPlantDetail___ MEMO_', prevProps.item.quantity, nextProps.item.quantity, prevProps.existPlantProps?.characteristic_id, nextProps.existPlantProps?.characteristic_id);

    return (
        prevProps.item.quantity === nextProps.item.quantity &&
        prevProps.existPlantProps?.characteristic_id === nextProps.existPlantProps?.characteristic_id &&
        prevProps.item.characteristic_id === nextProps.item.characteristic_id
    );
}));


const styles = StyleSheet.create({
    documentItem: {
        backgroundColor: "#fff",
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
    },
    btnPlus: {
        backgroundColor: "green",
        width: 40,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
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
        fontSize: 13,
        fontWeight: "600",
        padding: 5,
        width: '100%'
    },
    itemNum: {
        alignSelf: "center",
        fontSize: 12,
        color: "grey",
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
        backgroundColor: "#ff6b5c10",
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
        //padding: 10,
        //shadowColor: "#000",
        //shadowOpacity: 0.3,
        //shadowOffset: { width: 0, height: 2 },
        //shadowRadius: 4,
        //elevation: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    menuItem: {
        paddingVertical: 8,
        paddingRight: 3,
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#ffffffdb',
        borderRadius: 5,
        alignSelf: 'flex-end',
        height: 38,
        shadowColor: "#ffffffdb",
        //shadowOpacity: 0.3,
        //shadowOffset: { width: 0, height: 2 },
        //shadowRadius: 4,
        elevation: 5,
    },
    menuText: {
        fontSize: 16,
    },
});