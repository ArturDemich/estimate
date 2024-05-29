import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Всі документи" }} />
        <Stack.Screen name="document" options={{ title: "Документ ..." }} />
      </Stack>
    </>
  );
}
