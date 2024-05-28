import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {}, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Головна" }} />
        <Stack.Screen name="document" options={{ title: "Документ ..." }} />
      </Stack>
    </>
  );
}
