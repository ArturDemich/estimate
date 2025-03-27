import React from "react";
import { Platform, StyleSheet, Vibration, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as SecureStore from "expo-secure-store";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import Foundation from '@expo/vector-icons/Foundation';
import Fontisto from '@expo/vector-icons/Fontisto';
import BluetoothPrintImg from "@/components/Printer/BluetoothPrinterImg";
import { clearDataState } from "@/redux/dataSlice";


export default function HeaderLogout() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const segments = useSegments();
    
    const handleLogout = async () => {
        Vibration.vibrate(5);
        router.replace("/login");
        await dispatch(clearDataState());
        await dispatch(logout());
        
        if (Platform.OS === 'web') {
            await localStorage.removeItem('token')
        } else {
            await SecureStore.deleteItemAsync("token");
        }
        
    };

    const isProtectedIndex = segments[0] === "(protected)" && segments.length === 1;
    const isPlantScreen = segments[1] === "plant";

    return (
        <View style={{ flexDirection: 'row', gap: 15, }}>
            {isPlantScreen && <BluetoothPrintImg />}
            {/* {!isProtectedIndex &&
                <TouchableVibrate style={{ alignItems: 'center', width: 40 }}>
                    <Fontisto name="cloud-down" size={18} color="black" style={{ lineHeight: 18, }} />
                    <Foundation name="trees" size={12} color="black" style={{ lineHeight: 10, marginTop: -3, }} />
                </TouchableVibrate>} */}

            <TouchableVibrate style={styles.openBtn} onPressOut={handleLogout} >
                <MaterialCommunityIcons name="logout" size={24} color="black" />
            </TouchableVibrate>
        </View>
    );
};

const styles = StyleSheet.create({
    openBtn: {
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(31, 30, 30, 0.06)",
        borderRadius: 5,
        shadowColor: 'rgba(143, 143, 143, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 5
    },
})
