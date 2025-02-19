import { View } from "react-native";
import DocumentList from "@/components/MainScreen/DocumentList";
import CreateDocModal from "@/components/MainScreen/CreateDocModal";
import { useDispatch } from "react-redux";
import { getStoragesThunk } from "@/redux/thunks";
import { useEffect } from "react";
import { AppDispatch } from "@/redux/store";
import { initializeDB, } from '@/db/db.native'

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
   // initializeDB();
  }, [])

  return (
    <View style={{position: 'relative', height: '100%', display: 'flex'}}>
      <DocumentList />
      <CreateDocModal />
    </View>
  );
}
