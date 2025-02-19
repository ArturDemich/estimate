import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import HeaderLogout from "@/components/HeaderLogout";
import { ActivityIndicator, View } from "react-native";
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
     const token = await dispatch(loginThunk())
      console.log('ProtectedLayout__ checkToken',)

      if (!token.payload || Object.keys(token.payload).length === 0 ) {
        console.log('ProtectedLayout__ checkToken_ replace', Boolean(token.payload))
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
