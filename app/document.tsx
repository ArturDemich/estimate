import ButtonNewItem from "@/components/DocumentScreen/ButtonNewItem";
import PlantListItem from "@/components/DocumentScreen/PlantListItem";
import { View } from "react-native";

export default function Document() {
  return (
    <View>
      <PlantListItem />
      <ButtonNewItem />
    </View>
  );
}

