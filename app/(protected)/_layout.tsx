import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import HeaderLogout from "@/components/HeaderLogout";
import { ActivityIndicator, ImageBackground, View } from "react-native";
import { getNewVersionThunk, loadSendViber, loginThunk } from "@/redux/thunks";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import AppVersion from "@/components/AppVersion";


export default function ProtectedLayout() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await dispatch(loginThunk())

      if (!token.payload || Object.keys(token.payload).length === 0) {
        router.replace("/login");
      } else {
        setCheckingToken(false);
      }
    };
    dispatch(getNewVersionThunk())
    dispatch(loadSendViber());
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
    <ImageBackground
      source={require("../../assets/globoza.jpg")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
      blurRadius={15}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
          contentStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.3)",
          },
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="index" options={{ title: "Всі документи", headerRight: () => <HeaderLogout />, }} />
        <Stack.Screen name="document" options={{ title: "Документ #",  }} />
        <Stack.Screen name="plant" options={{ title: "Рослина", headerRight: () => <HeaderLogout />, }} />
      </Stack>
      <AppVersion styles={verStyle} />
    </ImageBackground>
  );
}

const verStyle = {
  position: "absolute",
  bottom: 1,
  left: 40,
  fontSize: 10,
  zIndex: 0
}
