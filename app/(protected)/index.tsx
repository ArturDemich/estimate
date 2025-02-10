import { FlatList, Text, View } from "react-native";
import DocumentList from "@/components/MainScreen/DocumentList";
import ButtonNewDoc from "@/components/MainScreen/ButtonNewDoc";
import CreateDocModal from "@/components/MainScreen/CreateDocModal";
import { useDispatch } from "react-redux";
import { getStoragesThunk } from "@/redux/thunks";
import { useEffect, useState } from "react";
import { AppDispatch } from "@/redux/store";
import {fetchDocuments, initializeDB, } from '@/db/db.native'

export default function HomeScreen() {
  const [documents, setDocuments] = useState([]);
  const dispatch = useDispatch<AppDispatch>();

  const getData = async () => {
    try {
      const data = await dispatch(getStoragesThunk()).unwrap();
      console.log("DocumentList Fetched data:", );
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again later.");
    }
  };

  const loadDocuments = () => {
    //fetchDocuments((data) => setDocuments(data));
  };

  useEffect(() => {
    getData()
    console.log('DocumentList111', );

    initializeDB();
    loadDocuments();
   
  }, [])

  return (
    <View>
      <DocumentList />
      {/* <FlatList
        data={documents}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (<DocumentList />)}
      /> */}
      <CreateDocModal />
    </View>
  );
}
