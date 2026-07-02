import React, { useState } from "react";
import { Platform, StyleSheet, Vibration, View, Modal, TouchableWithoutFeedback, Pressable, Text } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as SecureStore from "expo-secure-store";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import SortingBtn from "@/components/SortingBtn";
import { clearDataState } from "@/redux/dataSlice";
import { PlantListNameMode } from "@/components/helpers";
import { savePlantListNameMode } from "@/redux/thunks";

export default function HeaderMenu() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const segments = useSegments();
    const [menuVisible, setMenuVisible] = useState(false);
    const plantListNameMode = useSelector((state: RootState) => state.data.plantListNameMode);
    
    const isDocumentScreen = segments[1] === "document";
    const isImagesScreen = segments[1] === "images";
    
    const handleLogout = async () => {
        Vibration.vibrate(5);
        setMenuVisible(false);
        router.replace("/login");
        await dispatch(clearDataState());
        await dispatch(logout());
        
        if (Platform.OS === 'web') {
            await localStorage.removeItem('token')
        } else {
            await SecureStore.deleteItemAsync("token");
        }
    };

    const handleMenuPress = () => {
        Vibration.vibrate(5);
        setMenuVisible(true);
    };

    const handleCloseMenu = () => {
        setMenuVisible(false);
    };

    const handleSetPlantListNameMode = (mode: PlantListNameMode) => {
        Vibration.vibrate(5);
        dispatch(savePlantListNameMode(mode));
    };

    return (
        <>
            <TouchableVibrate style={styles.menuBtn} onPressOut={handleMenuPress}>
                <MaterialCommunityIcons name="menu" size={24} color="black" />
            </TouchableVibrate>

            <Modal
                visible={menuVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={handleCloseMenu}
            >
                <TouchableWithoutFeedback onPress={handleCloseMenu}>
                    <View style={styles.modalOverlay}>
                        <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.menuContent}>
                                {isImagesScreen ? (
                                    <TouchableVibrate
                                        style={styles.menuItem}
                                        onPress={() => {
                                            handleCloseMenu();
                                            router.push("/");
                                        }}
                                    >
                                        <MaterialCommunityIcons name="clipboard-list" size={24} color="black" />
                                        <Text style={styles.menuItemText}>Інвентаризація</Text>
                                    </TouchableVibrate>
                                ) : (
                                    <TouchableVibrate
                                        style={styles.menuItem}
                                        onPress={() => {
                                            handleCloseMenu();
                                            router.push("/images");
                                        }}
                                    >
                                        <MaterialCommunityIcons name="image-multiple" size={24} color="black" />
                                        <Text style={styles.menuItemText}>Зображення</Text>
                                    </TouchableVibrate>
                                )}

                                {isDocumentScreen && (
                                    <View style={styles.menuItem}>
                                        <SortingBtn />
                                        <Text style={styles.menuItemText}>Сортування</Text>
                                    </View>
                                )}

                                <TouchableVibrate style={styles.menuItem} onPressOut={handleLogout}>
                                    <MaterialCommunityIcons name="logout" size={24} color="black" />
                                    <Text style={styles.menuItemText}>Вихід</Text>
                                </TouchableVibrate>

                                <View style={styles.nameModeSection}>
                                    <Text style={styles.nameModeTitle}>Назва в списках</Text>
                                    <View style={styles.nameModeRow}>
                                        <TouchableVibrate
                                            style={[styles.nameModeBtn, plantListNameMode === PlantListNameMode.Ukrainian && styles.nameModeBtnActive]}
                                            onPress={() => handleSetPlantListNameMode(PlantListNameMode.Ukrainian)}
                                        >
                                            <Text style={[styles.nameModeBtnText, plantListNameMode === PlantListNameMode.Ukrainian && styles.nameModeBtnTextActive]}>
                                                Укр
                                            </Text>
                                        </TouchableVibrate>
                                        <TouchableVibrate
                                            style={[styles.nameModeBtn, plantListNameMode === PlantListNameMode.Latin && styles.nameModeBtnActive]}
                                            onPress={() => handleSetPlantListNameMode(PlantListNameMode.Latin)}
                                        >
                                            <Text style={[styles.nameModeBtnText, plantListNameMode === PlantListNameMode.Latin && styles.nameModeBtnTextActive]}>
                                                Lat
                                            </Text>
                                        </TouchableVibrate>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    menuBtn: {
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.06)",
        borderRadius: 5,
        shadowColor: 'rgba(143, 143, 143, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 5
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 10,
    },
    menuContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        padding: 8,
        minWidth: 180,
        elevation: 5,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    menuContent: {
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 5,
        minHeight: 44,
    },
    menuItemWrapper: {
        paddingVertical: 0,
    },
    menuItemText: {
        fontSize: 16,
        color: 'black',
    },
    nameModeSection: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 4,
        gap: 5,
        borderTopWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    nameModeTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#888',
    },
    nameModeRow: {
        flexDirection: 'row',
        gap: 6,
        alignSelf: 'flex-start',
    },
    nameModeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        minWidth: 44,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(131, 131, 131, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    nameModeBtnActive: {
        borderColor: 'rgba(106, 159, 53, 0.95)',
        backgroundColor: 'rgba(106, 159, 53, 0.15)',
    },
    nameModeBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    nameModeBtnTextActive: {
        color: 'rgba(106, 159, 53, 0.95)',
    },
})
