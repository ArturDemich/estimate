import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { PaperProvider } from "react-native-paper";
import { useEffect } from "react";
import { Platform } from "react-native";
import { initializeDB } from "@/db/db.native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/utils/toastConfig";



export default function RootLayout() {
  console.log('RootLayout__',);
  useEffect(() => {
    if (Platform.OS !== "web") {
      initializeDB();
    }
  }, []);
  return (

    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <Slot />
            <Toast config={toastConfig} />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>

  );
}