import { ImageBackground, View } from "react-native";
import DocumentList from "@/components/MainScreen/DocumentList";
import CreateDocModal from "@/components/MainScreen/CreateDocModal";
import { useDispatch } from "react-redux";
import { getStoragesThunk } from "@/redux/thunks";
import { useEffect } from "react";
import { AppDispatch } from "@/redux/store";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  console.log('HomeScreen__', );
  const getData = async () => {
    try {
      await dispatch(getStoragesThunk()).unwrap();
      console.log("DocumentList Fetched data:", );
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again later.");
    }
  };

  
  useEffect(() => {
    getData()
    console.log('HomeScreen__useEffect', );
  }, [])

  return (
    <ImageBackground
                      source={require("../../assets/globoza.jpg")}
                      style={{flex: 1, width: "100%",
                        height: "100%",
                        position: "absolute",}}
                      resizeMode="cover"
                    >
    <View style={{position: 'relative', height: '100%', display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
      <DocumentList />
      <CreateDocModal />
    </View>
    </ImageBackground>
  );
}
