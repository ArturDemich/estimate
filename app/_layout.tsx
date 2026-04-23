import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { useEffect } from "react";
import { initializeDB } from "@/db/db";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/utils/toastConfig";
import NewVersionModal from "@/components/NewVersionModal";
import '../global.css';
import { Platform } from "react-native";


export default function RootLayout() {
  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await initializeDB();
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Failed to prepare app:", error);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("✅ SW registered"))
          .catch((err) => console.log("❌ SW error", err));
      });
    }
  }, []);

  return (
    <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Slot />
          <Toast config={toastConfig} />
          <NewVersionModal />
        </SafeAreaProvider>
    </Provider>
  );
}