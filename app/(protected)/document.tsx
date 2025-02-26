import ModalAddPlant from "@/components/DocumentScreen/ModalAddPlant";
import PlantListItem from "@/components/DocumentScreen/PlantListItem";
import { deleteDocument, fetchPlants } from "@/db/db.native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import {useBackHandler} from '@react-native-community/hooks'
import TouchableVibrate from "@/components/ui/TouchableVibrate";

export default function Document() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const handleBackAction = async () => {
    if (!params.docId) return;
    try {
      const plants = await fetchPlants(Number(params.docId));
      if (plants.length === 0) {
        await deleteDocument(Number(params.docId));
        console.log("Deleted empty document before leaving.");
      }
    } catch (error) {
      console.error("Error in back navigation check:", error);
    }
  };

  useBackHandler(() => {
    handleBackAction().then(() => router.back())
    return true; 
  });

  
  return (
    <View>
      <Stack.Screen options={{
        title: params.docName?.toString() || "Document",
        headerBackVisible: false,
        headerLeft: () => (
          <TouchableVibrate style={{marginRight: 15, height: '100%',  pointerEvents: 'auto', }} onPressOut={() => handleBackAction().then(() => router.back())}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableVibrate>
        )
      }} />
      <PlantListItem />
      <ModalAddPlant />
    </View>
  );
}

