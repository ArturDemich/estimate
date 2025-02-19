import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export function useAuthCheck() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component

    const checkAuth = async () => {
      try {
        let token: string | null = null;

        if (Platform.OS === "web") {
          token = localStorage.getItem("token");
        } else {
          token = await SecureStore.getItemAsync("token");
        }

        if (token && isMounted) {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, []); // 🔥 Remove `router` from dependencies to prevent re-renders

  return loading;
}
