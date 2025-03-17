import { BackHandler, ToastAndroid, View } from "react-native";
import DocumentList from "@/components/MainScreen/DocumentList";
import CreateDocModal from "@/components/MainScreen/CreateDocModal";
import { useDispatch } from "react-redux";
import { getStoragesThunk } from "@/redux/thunks";
import { useEffect, useState } from "react";
import { AppDispatch } from "@/redux/store";
import { useBackHandler } from "@react-native-community/hooks";
import { myToast } from "@/utils/toastConfig";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  console.log('HomeScreen__',);
  
  const getData = async () => {
    let toastShown = false;
  
    try {
      await dispatch(getStoragesThunk()).unwrap();
      console.log("DocumentList Fetched data:");
    } catch (error: any) {
      console.log("Error fetching Storage:", error);
  
      if (!toastShown) {
        myToast({
          type: "customError",
          text1: "Список складів не отримано!",
          text2: error,
          visibilityTime: 5000,
        });
        toastShown = true;
      }
    }
  };

  useBackHandler(() => {
    if (backPressedOnce) {
        BackHandler.exitApp();
        return true;
    }
    setBackPressedOnce(true);
    ToastAndroid.show('Натисніть ще раз "Назад" щоб вийти', ToastAndroid.SHORT);
    setTimeout(() => setBackPressedOnce(false), 2000); 
    return true; 
});


  useEffect(() => {
    getData()
    console.log('HomeScreen__useEffect',);
  }, [])

  return (
      <View style={{ position: 'relative', height: '100%', display: 'flex', }}>
        <DocumentList />
        <CreateDocModal />
      </View>
  );
}
