import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import HeaderLogout from "@/components/HeaderLogout";
import { logout } from "@/redux/authSlice";


export default function ProtectedLayout() {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
  const navigationState = useRootNavigationState(); 


  useEffect(() => {
    if (navigationState?.key && !isAuthenticated) {
      router.replace("/login"); 
    }
  }, [navigationState?.key, isAuthenticated]);

  if (!navigationState?.key) return null;

  return (
    <Stack >
      <Stack.Screen name="index" options={{
          title: "Всі документи", headerRight: () => <HeaderLogout />, }} />
      <Stack.Screen name="document" options={{ title: "Документ #", headerRight: () => <HeaderLogout />,  }} />
      <Stack.Screen name="plant" options={{ title: "Рослина", headerRight: () => <HeaderLogout />, }} />
    </Stack>
  );
}
