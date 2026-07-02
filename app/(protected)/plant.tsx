import DocComment from "@/components/DocComment";
import { useFormatPlantName } from "@/hooks/useFormatPlantName";
import AddDetailsModal from "@/components/PlantScreen/AddDetailsModal";
import { LockScreen } from "@/components/PlantScreen/LockScreen";
import PlantSizeItem from "@/components/PlantScreen/PlantSizeItem";
import LabelImgShot from "@/components/Printer/LabelImgShot";
import Title from "@/components/TitleScreen";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text, Vibration, View } from "react-native";
import { useSelector } from "react-redux";

export default function Plant() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const docSent = useSelector<RootState, number>((state) => state.data.docSent);
  const formatPlantName = useFormatPlantName();
  const fullPlantName = Array.isArray(params.plantName) ? params.plantName[0] : params.plantName;
  const namePlant = fullPlantName ? formatPlantName(fullPlantName) : '';

  return (
    <View style={{ position: 'relative', height: '100%' }}>
      <Stack.Screen options={{
        headerLeft: () => (
          <TouchableVibrate
            style={{ marginLeft: -5, height: 45, width: 50, justifyContent: 'center', pointerEvents: 'auto', }}
            onPressOut={() => {
              Vibration.vibrate(5);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableVibrate>
        ),
        headerTitle: () => <Title title={"Рослина"} adTitle={`на ${params.docName?.toString()}` || undefined} docSent={docSent} />,
      }} />
      <View style={{ paddingLeft: 15, paddingVertical: 5, height: 40, justifyContent: 'center' }}><Text style={{ fontSize: 16, fontWeight: "600", }}>{namePlant}</Text></View>
      <PlantSizeItem plantName={namePlant} />
        <AddDetailsModal
          plantDBid={params.plantId && params.plantId.toString()}
          docId={params.docId && params.docId.toString()}
          productId={params.productId && params.productId.toString()}
        />
      <LabelImgShot />
      <LockScreen />
      <DocComment />
    </View>
  );
}

