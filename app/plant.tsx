import ButtonNewItem from "@/components/DocumentScreen/ButtonNewItem";
import PlantSizeItem from "@/components/PlantScreen/PlantSizeItem";
import { View } from "react-native";

export default function Plant() {
  return (
    <View>
      <PlantSizeItem />
      <ButtonNewItem />
    </View>
  );
}

