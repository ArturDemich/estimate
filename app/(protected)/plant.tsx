import DocComment from "@/components/DocComment";
import { getUkrainianPart } from "@/components/helpers";
import AddDetailsModal from "@/components/PlantScreen/AddDetailsModal";
import PlantSizeItem from "@/components/PlantScreen/PlantSizeItem";
import LabelImgShot from "@/components/Printer/LabelImgShot";
import Title from "@/components/TitleScreen";
import { RootState } from "@/redux/store";
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function Plant() {
  const params = useLocalSearchParams();
  const docSent = useSelector<RootState, number>((state) => state.data.docSent);
  const namePlant = Array.isArray(params.plantName) ? getUkrainianPart(params.plantName[0]) : getUkrainianPart(params.plantName); 

  return (
    <View style={{position: 'relative', height: '100%', }}>
      <Stack.Screen options={{
        headerTitle: () => <Title title={"Рослина"} adTitle={`в ${params.docName?.toString()}` || undefined} />,
      }} />
      <View style={{paddingLeft: 15, paddingVertical: 5, height: 40}}><Text style={{fontSize: 16, fontWeight: "600",}}>{namePlant}</Text></View>
      <PlantSizeItem plantName={namePlant} />
      {docSent === 0 && 
      <AddDetailsModal 
        plantDBid={params.plantId && params.plantId.toString()} 
        docId={params.docId && params.docId.toString()} 
        productId={params.productId && params.productId.toString()}
        />}
        <LabelImgShot />
        {docSent === 0 && <DocComment />}
    </View>
  );
}

