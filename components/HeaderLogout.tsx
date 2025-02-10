import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function HeaderLogout() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/login");
    };

    return (
        <View>
            <TouchableOpacity onPress={handleLogout} >
                <MaterialCommunityIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
}
