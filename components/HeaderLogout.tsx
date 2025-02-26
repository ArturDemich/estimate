import React from "react";
import { Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as SecureStore from "expo-secure-store";
import TouchableVibrate from "@/components/ui/TouchableVibrate";


export default function HeaderLogout() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleLogout = async () => {
        await dispatch(logout());
        if (Platform.OS === 'web') {
            await localStorage.removeItem('token')
          } else {
            await SecureStore.deleteItemAsync("token");
          }
        router.replace("/login");
    };

    return (
        <View>
            <TouchableVibrate onPressOut={handleLogout} >
                <MaterialCommunityIcons name="logout" size={24} color="black" />
            </TouchableVibrate>
        </View>
    );
}
