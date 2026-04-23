import React, { useState } from "react";
import { Platform, StyleSheet, Vibration, View, Modal, TouchableWithoutFeedback, Pressable, Text } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as SecureStore from "expo-secure-store";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import SortingBtn from "@/components/SortingBtn";
import { clearDataState } from "@/redux/dataSlice";
import AppVersion from "./AppVersion";

export default function HeaderMenu() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const segments = useSegments();
    const [menuVisible, setMenuVisible] = useState(false);
    
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

    return (
        <>
            <TouchableVibrate style={styles.menuBtn} onPress={handleMenuPress}>
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
                                {/* Toggle between Images and Inventory based on current screen */}
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

                                {/* SortingBtn - only on document screen */}
                                {isDocumentScreen && (
                                    <View style={styles.menuItem}>
                                        <SortingBtn /> 
                                    </View>
                                )}

                                {/* Logout button - always visible */}
                                <TouchableVibrate style={styles.menuItem} onPress={handleLogout}>
                                    <MaterialCommunityIcons name="logout" size={24} color="black" />
                                    <Text style={styles.menuItemText}>Вихід</Text>
                                </TouchableVibrate>
                            </View>
                            <AppVersion styles={verStyle} />
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
        padding: 5,
        marginRight: 10
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
        minWidth: 150,
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
})

const verStyle = {
    position: "absolute",
    bottom: 1,
    right: 7,
    fontSize: 10,
    zIndex: 0
  }
