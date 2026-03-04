import ModalAddPlant from "@/components/DocumentScreen/ModalAddPlant";
import PlantListItem from "@/components/DocumentScreen/PlantListItem";
import { deleteDocument, fetchPlants } from "@/db/db";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Vibration, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBackHandler } from '@react-native-community/hooks'
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import UpLoadBtn from "@/components/DocumentScreen/UpLoadBtn";
import DocComment from "@/components/DocComment";
import Title from "@/components/TitleScreen";
import { formatDate } from "@/components/helpers";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import HeaderMenu from "@/components/HeaderMenu";

export default function Document() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const docSent = useSelector<RootState, number>((state) => state.data.docSent);
  const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;

  const handleBackAction = async () => {
    if (!docId) return;
    try {
      const plants = await fetchPlants(Number(docId));
      if (plants.length === 0) {
        await deleteDocument(Number(docId));
      }
    } catch (error) {
      console.error("Error in back navigation check:", error);
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  useBackHandler(() => {
    handleBackAction();
    return true;
  });


  return (
    <View style={{flex: 1}}>
      <Stack.Screen options={{
        headerBackVisible: false,
        headerLeft: () => (
          <TouchableVibrate 
            style={{ marginLeft: -5, height: 45, width: 50, justifyContent: 'center', pointerEvents: 'auto', }} 
            onPressOut={() => {
              Vibration.vibrate(5);
              handleBackAction();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableVibrate>
        ),
        headerTitle: () => <Title title={params.docName?.toString() || "Document"} adTitle={`від: ${formatDate(params.docTimeCr?.toString())}` || undefined} docSent={docSent} />,
        headerRight: () => <HeaderMenu />
      }} />

      <PlantListItem />

      <ModalAddPlant />
      <UpLoadBtn />
      <DocComment />
    </View>
  );
};

