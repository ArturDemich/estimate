import DocComment from "@/components/DocComment";
import { getUkrainianPart } from "@/components/helpers";
import AddDetailsModal from "@/components/PlantScreen/AddDetailsModal";
import { LockScreen } from "@/components/PlantScreen/LockScreen";
import PlantSizeItem from "@/components/PlantScreen/PlantSizeItem";
import LabelImgShot from "@/components/Printer/LabelImgShot";
import Title from "@/components/TitleScreen";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { AppDispatch, RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, Text, Vibration, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getDocumentById } from "@/db/db";
import { setDocComment, setDocSent, setCurrentStoage } from "@/redux/dataSlice";

export default function Plant() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const docSent = useSelector<RootState, number>((state) => state.data.docSent);
  const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;
  const namePlant = Array.isArray(params.plantName) ? getUkrainianPart(params.plantName[0]) : getUkrainianPart(params.plantName);
  const plantNameFull = Array.isArray(params.plantName) ? params.plantName[0] : params.plantName;

  useEffect(() => {
    if (!docId) return;
    const loadDocumentMeta = async () => {
      const meta = await getDocumentById(Number(docId));
      if (meta) {
        dispatch(setDocComment(meta.comment ?? ""));
        dispatch(setDocSent(meta.is_sent ?? 0));
        dispatch(setCurrentStoage({ id: meta.storage_id ?? "", name: meta.storage_name ?? "" }));
      }
    };
    loadDocumentMeta();
  }, [docId, dispatch]);

  const handleBack = () => {
    Vibration.vibrate(5);
    if (Platform.OS === "web" && !router.canGoBack()) {
      router.replace("/");
    } else {
      router.back();
    }
  };

  return (
    <View style={{ position: 'relative', height: '100%' }}>
      <Stack.Screen options={{
        headerLeft: () => (
          <TouchableVibrate
            style={{ height: 45, width: 50, justifyContent: 'center', pointerEvents: 'auto' }}
            onPressOut={handleBack}
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
          plantName={plantNameFull}
        />
      <LabelImgShot />
      <LockScreen />
      <DocComment />
    </View>
  );
}

