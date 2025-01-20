import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from 'react-redux';
import {store} from '@/redux/store';
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Всі документи" }} />
        <Stack.Screen name="document" options={{ title: "Документ №" }} />
        <Stack.Screen name="plant" options={{ title: "Рослина" }} />
      </Stack>
      </PaperProvider>
      </Provider>
  ); 
}
