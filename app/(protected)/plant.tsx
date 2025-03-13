import DocComment from "@/components/DocComment";
import { getUkrainianPart } from "@/components/helpers";
import AddDetailsModal from "@/components/PlantScreen/AddDetailsModal";
import PlantSizeItem from "@/components/PlantScreen/PlantSizeItem";
import LabelImgShot from "@/components/Printer/LabelImgShot";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { Ionicons } from "@expo/vector-icons";
import { useBackHandler } from "@react-native-community/hooks";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Plant() {
  const params = useLocalSearchParams();
  const router = useRouter();
  console.log("Plant__", params);
  const namePlant = Array.isArray(params.plantName) ? getUkrainianPart(params.plantName[0]) : getUkrainianPart(params.plantName); 

  const handleBackAction = async () => {
    if (!params.docId) return;
    try {
      const plants = 'await'// fetchPlants(Number(params.docId));
      if (plants.length === 0) {
        //await deleteDocument(Number(params.docId));
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
    <SafeAreaView style={{position: 'relative', height: '100%', display: 'flex', }}>
      <Stack.Screen options={{
        headerBackVisible: false,
        headerLeft: () => (
          <TouchableVibrate style={{marginLeft: -5, height: 45, width: 50, justifyContent: 'center', pointerEvents: 'auto',}} onPressOut={() => handleBackAction().then(() => router.back())}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableVibrate>
        ),
      }} />
      <View style={{paddingLeft: 15,   paddingVertical: 5, }}><Text style={{fontSize: 16, fontWeight: "600",}}>{namePlant}</Text></View>
      <PlantSizeItem plantName={namePlant} />
      <AddDetailsModal 
        plantDBid={params.plantId && params.plantId.toString()} 
        docId={params.docId && params.docId.toString()} 
        productId={params.productId && params.productId.toString()}
        />
        <LabelImgShot />
        <DocComment />
    </SafeAreaView>
  );
}

