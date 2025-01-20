import { Text, View } from "react-native";
import DocumentList from "../components/MainScreen/DocumentList";
import ButtonNewDoc from "@/components/MainScreen/ButtonNewDoc";
import CreateDocModal from "@/components/DocumentScreen/CreateDocModal";

export default function HomeScreen() {
  return (
    <View>
      <DocumentList />
      {/* <ButtonNewDoc /> */}
      <CreateDocModal />
    </View>
  );
}
