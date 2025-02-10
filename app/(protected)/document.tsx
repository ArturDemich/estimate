import ButtonNewItem from "@/components/DocumentScreen/ButtonNewItem";
import PlantListItem from "@/components/DocumentScreen/PlantListItem";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Document() {
  const params = useLocalSearchParams();
  
  return (
    <View>
      <Stack.Screen options={{title: params.docName && params.docName.toString(),}}/>
      <PlantListItem />
      <ButtonNewItem />
    </View>
  );
}

