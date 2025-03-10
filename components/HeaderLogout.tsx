import React from "react";
import { Platform, View } from "react-native";
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


export default function HeaderLogout() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const segments = useSegments();
    
    const handleLogout = async () => {
        await dispatch(logout());
        if (Platform.OS === 'web') {
            await localStorage.removeItem('token')
        } else {
            await SecureStore.deleteItemAsync("token");
        }
        router.replace("/login");
    };

    const isProtectedIndex = segments[0] === "(protected)" && segments.length === 1;
    const isPlantScreen = segments[1] === "plant";

    return (
        <View style={{ flexDirection: 'row', gap: 10, }}>
            {isPlantScreen && <BluetoothPrintImg />}
            {!isProtectedIndex &&
                <TouchableVibrate style={{ alignItems: 'center', width: 40 }}>
                    <Fontisto name="cloud-down" size={18} color="black" style={{ lineHeight: 18, }} />
                    <Foundation name="trees" size={12} color="black" style={{ lineHeight: 10, marginTop: -3, }} />
                </TouchableVibrate>}

            <TouchableVibrate onPressOut={handleLogout} >
                <MaterialCommunityIcons name="logout" size={24} color="black" />
            </TouchableVibrate>
        </View>
    );
}
