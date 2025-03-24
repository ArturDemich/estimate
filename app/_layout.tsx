import { Slot, SplashScreen } from "expo-router";
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
import NewVersionModal from "@/components/NewVersionModal";



export default function RootLayout() {
  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 2000);
      } catch (error) {
        console.error("Failed to hide splash screen:", error);
      }
    };

    prepare();
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
          <NewVersionModal />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}