import { Text, View } from "react-native";
import DocumentList from "../components/DocumentList";
import ButtonNewDoc from "@/components/ButtonNewDoc";

export default function HomeScreen() {
  return (
    <View>
      <DocumentList />
      <ButtonNewDoc />
    </View>
  );
}
