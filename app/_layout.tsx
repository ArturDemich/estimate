import { Slot, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '@/redux/store';
import { PaperProvider } from "react-native-paper";
import { useEffect } from "react";
import { Platform } from "react-native";
import { initializeDB } from "@/db/db.native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";



export default function RootLayout() {
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
          
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>

  );
}