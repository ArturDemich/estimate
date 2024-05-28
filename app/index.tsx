import { Text, View } from "react-native";
import DocumentList from "../components/DocumentList";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <View>
      <StatusBar style="dark" />
      <DocumentList />
    </View>
  );
}
