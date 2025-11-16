import { Label, PlantDetails, PlantDetailsResponse, SelectedPhoto } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { memo, useEffect, useRef, useState, } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { connect, useDispatch, useSelector } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteCharacteristic, updateCharacteristic, updateDBFreeQty, updateDBPlantComment } from "@/db/db.native";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import PressableVibrate from "@/components/ui/PressableVibrate";
import { setLabelPrint, updateLocalCharacteristic, updateLocalComment, updateLocalFreeQty } from "@/redux/dataSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { myToast } from "@/utils/toastConfig";
import { newSIZE } from "@/types/typesScreen";
import * as Clipboard from 'expo-clipboard';
import { FontAwesome6 } from "@expo/vector-icons";
import PrinterPuty from "@/components/Printer/PrinterPuty";
import AddPhoto from "@/components/PlantScreen/AddPhoto";

interface RenderPlantDetailProps {
    item: PlantDetailsResponse;
    existPlantProps: PlantDetails | null;
    reloadList: () => void;
    numRow: number;
    flatListRef?: () => void;
    plantName: string;
    docName: string;
    autoPrint: boolean;
    productId: string;
    photosUrl: SelectedPhoto[] | null;
};

const RenderPlantDetail = ({ item, productId, photosUrl, numRow, existPlantProps, reloadList, flatListRef, plantName, docName, autoPrint }: RenderPlantDetailProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const selected = existPlantProps?.characteristic_id !== newSIZE ? existPlantProps?.characteristic_id === item.characteristic_id : existPlantProps?.characteristic_name === item.characteristic_name;

    const labelState = useSelector<RootState, Label | null>((state) => state.data.labelData);
    const [printLoding, setPrintLoding] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });
    const itemRef = useRef<View>(null);
    const inputRef = useRef<TextInput>(null);
    const inputCommentRef = useRef<TextInput>(null);
    const inputFreeRef = useRef<TextInput>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingFree, setIsEditingFree] = useState(false);
    const [printQty, setPrintQty] = useState<string | number>(1);
    const [isCommentEdit, setCommentEdit] = useState(false);


    const isManual = item.characteristic_id === newSIZE;

    const handleShowMenu = (val: boolean) => {
        showMenu && printQty !== 1 && setPrintQty(1)
        setShowMenu(val)
    };

    const handleUpdCurrentQty = async (currentQty: number) => {
        if (currentQty < 0) {
            return
        }
        const success = await updateCharacteristic(item.id, currentQty);
        if (success) {
            dispatch(updateLocalCharacteristic({ id: item.id, currentQty: currentQty }));
        } else {
            console.error("Failed to update characteristic in DB.");
        }
    };

    const handleUpdFreeQty = async (freeQty: number, print: boolean) => {
        if (freeQty < 0) {
            return
        }
        const success = await updateDBFreeQty(item.id, freeQty);
        if (success) {
            dispatch(updateLocalFreeQty({ id: item.id, freeQty: freeQty }));
            print && handlePrint()
        } else {
            console.error("Failed to update characteristic in DB.");
        }
    };

    const handleChangeQty = async (currentQty: string) => {
        const parsedQty = Number(currentQty);
        if ((item.currentQty === 0 && parsedQty < item.currentQty) || Number.isNaN(parsedQty)) {
            Alert.alert(`Значення не може бути відємним ${currentQty}`);
            setIsEditing(false);
            return
        }
        dispatch(updateLocalCharacteristic({ id: item.id, currentQty: Number(currentQty) }));
    };

    const handleChangeFreeQty = async (freeQty: string) => {
        const parsedQty = Number(freeQty);
        if ((item.freeQty === 0 && parsedQty < item.freeQty) || Number.isNaN(parsedQty)) {
            Alert.alert(`Значення не може бути відємним ${freeQty}`);
            setIsEditing(false);
            return
        }
        dispatch(updateLocalFreeQty({ id: item.id, freeQty: parsedQty }));
    };

    const handleStateComment = async (value: string) => {
        dispatch(updateLocalComment({ id: item.id, value }));
    };

    const handleUpdDBComment = async (value: string) => {
        await updateDBPlantComment(item.id, value);
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(plantName + ', ' + item.characteristic_name);
        myToast({
            type: "customToast",
            text1: "Назву скопійовано!",
            visibilityTime: 5000,
        });
    };

    const handleLongPress = () => {
        if (itemRef.current) {
            itemRef.current.measureInWindow((x, y, width, height) => {
                setMenuSize({ width, height });
                setMenuPosition({ x, y });
                handleShowMenu(true);
            });
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Увага!',
            'Бажаєте видалити характеристику?',
            [
                {
                    text: 'Скасувати',
                    style: 'cancel'
                },
                {
                    text: 'Видалити',
                    onPress: async () => {
                        console.log('handleDelete Alert', item.id)
                        await deleteCharacteristic(item.id);
                        await reloadList()
                    },
                }
            ]
        )
        handleShowMenu(false);
    };

    const handlePrint = async () => {
        const isBluetoothOn = await PrinterPuty.isBluetoothEnabled();
        if (!isBluetoothOn) {
            myToast({ type: "customError", text1: `Bluetooth не включений!`, text2: 'Включіть Bluetooth в налаштуваннях телефона.', visibilityTime: 4000 })
            return;
        }
        const label: Label = {
            product_name: plantName,
            characteristic_name: item.characteristic_name,
            labelItem_id: item.characteristic_id + numRow,
            storageName: docName,
            barcode: item.barcode,
            qtyPrint: Number(printQty)
        }
        dispatch(setLabelPrint(label))
    };

    useEffect(() => {
        setPrintLoding(labelState?.labelItem_id === item.characteristic_id + numRow);
    }, [labelState]);

    useEffect(() => {
        if (isEditing) {
            flatListRef && flatListRef()
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else if (isEditingFree) {
            flatListRef && flatListRef()
            setTimeout(() => {
                inputFreeRef.current?.focus();
            }, 100);
        } else if (isCommentEdit) {
            flatListRef && flatListRef()
            setTimeout(() => {
                inputCommentRef.current?.focus();
            }, 100);
        }
    }, [isEditing, isEditingFree, isCommentEdit]);

    return (
        <PressableVibrate ref={itemRef} style={[styles.documentItem, selected && styles.selectedItem]} onLongPress={handleLongPress} >
            {selected && <View style={styles.shadowOverlay} />}
            <View style={{ flex: 1, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ display: "flex", flexDirection: "row", maxWidth: 340, }}>
                        <Text style={styles.itemNum}>{numRow}.</Text>
                        {photosUrl ?
                            <MaterialIcons style={{ marginLeft: '1%' }} name="photo" size={20} color={photosUrl.length > 0 ? 'rgb(106, 159, 53)' : "rgba(255, 111, 97, 1)"} />
                            :
                            <MaterialCommunityIcons name="image-off" size={20} color="red" />
                        }

                        <Text style={[styles.itemSize, isManual && styles.manualSize]}>{
                            item.characteristic_name === '' || null ? 'Немає характеристики' : item.characteristic_name
                        }</Text>
                    </View>
                    <TouchableVibrate style={styles.comment} onPress={() => setCommentEdit(true)}>
                        <MaterialCommunityIcons name="comment-edit" size={24} color='rgb(70, 70, 70)' />
                    </TouchableVibrate>
                </View>

                <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                    <View>
                        <View style={{ gap: 4, flexDirection: "row", }}>
                            <View style={styles.btnRes}>
                                <Text style={styles.titleQty}>склад:</Text>
                            </View>
                            <Text style={[styles.itemQty, { color: "#70707B" }]}>{item.quantity}{item.unit_name}</Text>
                        </View>
                        <View style={{ gap: 4, flexDirection: "row", alignItems: 'center' }}>
                            <View style={styles.btnRes}>
                                <Text style={styles.titleQty}>факт:</Text>
                            </View>

                            {isEditing ? (
                                <View style={{ gap: 4, flexDirection: "row", }}>
                                    <TextInput
                                        ref={inputRef}
                                        style={styles.inputQty}
                                        value={item.currentQty.toString()}
                                        onChangeText={handleChangeQty}
                                        keyboardType="numeric"
                                        selectTextOnFocus={item.currentQty === 0}
                                        onBlur={() => handleUpdCurrentQty(item.currentQty).then(() => setIsEditing(false))}
                                    />
                                </View>
                            ) : (
                                <View style={{ alignSelf: 'flex-end' }}>
                                    <PressableVibrate
                                        style={[styles.editableQty, { flexDirection: 'row' }]}
                                        onPress={() => setIsEditing(true)}
                                        onLongPress={() => handleUpdCurrentQty(item.freeQty)}
                                    >
                                        <MaterialCommunityIcons name="pen-lock" size={16} color={item.currentQty === item.freeQty ? 'rgb(106, 159, 53)' : 'rgb(87, 87, 87)'} />
                                        <Text style={[styles.itemQty, { color: item.currentQty === item.freeQty ? 'rgb(106, 159, 53)' : 'rgb(70, 70, 70)' }]}>{item.currentQty}{item.unit_name}</Text>
                                    </PressableVibrate>

                                </View>
                            )}
                        </View>
                    </View>



                    <View style={{ flexDirection: 'row', gap: 8, }}>
                        <TouchableVibrate style={styles.btnMinus} onPress={() => handleUpdFreeQty(item.freeQty - 1, false)}>
                            <Text style={styles.btnPlusText}>-1</Text>
                        </TouchableVibrate>
                        {isEditingFree ? (
                            <TextInput
                                ref={inputFreeRef}
                                style={[styles.inputQty, { height: 20, alignSelf: 'flex-end', minWidth: 48 }]}
                                value={item?.freeQty?.toString() || '0'}
                                onChangeText={handleChangeFreeQty}
                                keyboardType="numeric"
                                selectTextOnFocus={item.freeQty === 0}
                                onBlur={() => handleUpdFreeQty(item.freeQty, false).then(() => setIsEditingFree(false))}
                            />
                        ) : (
                            <View style={{ alignSelf: 'flex-end', minWidth: 47 }}>
                                <PressableVibrate
                                    style={styles.editableQty}
                                    onPress={() => setIsEditingFree(true)}
                                >
                                    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="pen-lock" size={14} color="black" />
                                        <Text style={styles.itemQty}>{item.freeQty}{item.unit_name}</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, lineHeight: 9, fontWeight: 600, color: 'rgb(180, 180, 180)', alignSelf: 'center', }}>на продаж:</Text>
                                </PressableVibrate>

                            </View>
                        )}
                        <TouchableVibrate disabled={printLoding} style={styles.btnPlus} onPress={() => handleUpdFreeQty(item.freeQty + 1, autoPrint)}>
                            {!printLoding ?
                                <Text style={styles.btnPlusText}>+1</Text>
                                :
                                <ActivityIndicator size={30} color={'white'} />}
                        </TouchableVibrate>
                    </View>

                </View>

                {isCommentEdit ?
                    <TextInput
                        ref={inputCommentRef}
                        style={styles.inputComment}
                        onChangeText={handleStateComment}
                        value={item?.plantComment}
                        multiline
                        numberOfLines={3}
                        onBlur={() => handleUpdDBComment(item.plantComment).then(() => setCommentEdit(false))}
                    /> :
                    item?.plantComment === '' ? null :
                        <View style={{ flexDirection: 'row', gap: 4, paddingLeft: 3, marginTop: 3, maxWidth: 355 }}>
                            <MaterialCommunityIcons name="comment-text-outline" size={16} color='rgb(66, 66, 66)' />
                            <Text style={styles.commentText}>{item.plantComment}</Text>
                        </View>
                }
            </View>

            {showMenu && (
                <Modal transparent animationType="fade">
                    <PressableVibrate style={styles.modalOverlay} onPress={() => handleShowMenu(false)}>
                        <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x, width: menuSize.width, height: menuSize.height }]}>
                            <View style={{ justifyContent: 'space-between' }}>
                                <TouchableVibrate style={styles.copyBtn} onPress={copyToClipboard}>
                                    <FontAwesome6 name="copy" size={26} color='rgb(66, 66, 66)' />
                                </TouchableVibrate>

                                <View style={{ alignSelf: 'flex-end' }}>
                                    <TouchableVibrate style={styles.menuItem} onPress={handleDelete}>
                                        <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
                                        <Text style={[styles.menuText, { color: '#EF4444' }]}>Видалити</Text>
                                    </TouchableVibrate>
                                </View>
                            </View>
                            {!isManual &&
                                <AddPhoto
                                    photosUrl={photosUrl}
                                    plantName={plantName}
                                    productId={productId}
                                    sizeId={item.characteristic_id}
                                    plantSize={item.characteristic_name}
                                    barcode={item.barcode}
                                />}

                            <View style={{ flexDirection: 'row', backgroundColor: '#ffffffdb', gap: 4, padding: 5, borderRadius: 5 }}>
                                <TextInput
                                    style={styles.inputPrint}
                                    value={printQty.toString()}
                                    onChangeText={setPrintQty}
                                    keyboardType="numeric"
                                />

                                <TouchableVibrate
                                    style={styles.menuItem}
                                    onPress={handlePrint}
                                    disabled={printLoding}
                                >
                                    <MaterialIcons name="print" size={24} color="black" />
                                    {!printLoding ?
                                        <Text style={styles.menuText}>Друк</Text>
                                        :
                                        <ActivityIndicator style={{ width: 35 }} size={30} color={'black'} />}
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
    autoPrint: state.data.autoPrint,
})

export default connect(mapStateToProps)(memo(RenderPlantDetail, (prevProps, nextProps) => {
    // console.log('RenderPlantDetail MEMO', prevProps.item.id, nextProps.item.id)
    return (
        prevProps.item.currentQty === nextProps.item.currentQty &&
        prevProps.item.freeQty === nextProps.item.freeQty &&
        prevProps.item.plantComment === nextProps.item.plantComment &&
        prevProps.existPlantProps?.characteristic_id === nextProps.existPlantProps?.characteristic_id &&
        prevProps.item.characteristic_id === nextProps.item.characteristic_id &&
        prevProps.autoPrint === nextProps.autoPrint &&
        prevProps.photosUrl === nextProps.photosUrl
    );
}));


const styles = StyleSheet.create({
    documentItem: {
        backgroundColor: "#fff",
        opacity: 0.9,
        justifyContent: "center",
        minHeight: 65,
        borderRadius: 5,
        margin: 7,
        padding: 5,
        elevation: 10,
        shadowColor: "black",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 7,
        flexDirection: 'row',
        gap: 8,
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
        alignSelf: 'flex-end',
    },
    btnMinus: {
        backgroundColor: 'rgba(175, 175, 175, 0.95)', //'rgba(218, 65, 27, 0.95)'
        shadowColor: 'rgba(175, 175, 175, 0.95)',
        width: 40,
        height: 30,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        alignSelf: 'flex-end'
    },
    btnPlusText: {
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 16,
        fontWeight: 600,
    },
    btnRes: {
        paddingHorizontal: 4,
        paddingBottom: 4,
    },
    titleQty: {
        fontWeight: 500,
        color: "rgb(112, 112, 112)",
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
        fontSize: 13,
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
    inputComment: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 8,
        fontSize: 14,
        minHeight: 30,
        width: '100%',
        paddingVertical: 0,
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
        alignItems: 'center',
        gap: 4,
        minHeight: 30,
    },
    manualSize: {
        color: "rgba(255, 111, 97, 1)"
    },
    comment: {
        paddingHorizontal: 3,
        paddingTop: 1,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.06)",
        borderRadius: 5,
        shadowColor: 'rgba(143, 143, 143, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    commentText: {
        fontSize: 13,
        lineHeight: 16,
        fontWeight: 600,
        color: 'rgb(66, 66, 66)'
    },
    inputContainer: {
        position: "relative",
        width: "100%",
        marginTop: 10,
        marginBottom: 5,
    },
    clearButton: {
        position: "absolute",
        right: 5,
        top: 10,
        backgroundColor: "#A0A0AB",
        borderRadius: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    },
    copyBtn: {
        padding: 3,
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.11)",
        borderRadius: 5,
        shadowColor: 'rgba(0, 0, 0, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 35,
    }
});