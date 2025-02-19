import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import HeaderLogout from "@/components/HeaderLogout";
import { ActivityIndicator, Platform, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { loginThunk } from "@/redux/thunks";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";


export default function ProtectedLayout() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [checkingToken, setCheckingToken] = useState(true);
  console.log('ProtectedLayout')

  useEffect(() => {
    console.log('ProtectedLayout___useEffect')
    const checkToken = async () => {
      /* let token;
      if (Platform.OS === 'web') {
        token = await localStorage.getItem('token')
      } else {
        token = await SecureStore.getItemAsync("token");
      } */
     const token = await dispatch(loginThunk())
      console.log('ProtectedLayout__ checkToken', token)

      if (!token) {
        router.replace("/login");
      } else {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, []);

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6f61" />
      </View>
    );
  }

  return (
    <Stack >
      <Stack.Screen name="index" options={{title: "Всі документи", headerRight: () => <HeaderLogout />,}} />
      <Stack.Screen name="document" options={{ title: "Документ #", headerRight: () => <HeaderLogout />, }} />
      <Stack.Screen name="plant" options={{ title: "Рослина", headerRight: () => <HeaderLogout />, }} />
    </Stack>
  );
}
