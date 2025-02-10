import { RootState } from "@/redux/store";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export default function ButtonNewDoc() {
  const storages = useSelector((state: RootState) => state.data.digStorages)
  console.log('ButtonNewDoc',)
  return (
    <View style={styles.containerNBTN}>
      <TouchableOpacity style={styles.buttonStep}>
        <Text style={styles.textBtn}>NewDoc +</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerNBTN: {
    elevation: 5,
    //shadowColor: '#d70000',
    //shadowOffset: { width: 0, height: 0 },
    //shadowOpacity: 0.9,
    // shadowRadius: 25,
    position: "absolute",
    right: 12,
    bottom: -550,
  },
  textBtn: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  buttonStep: {
    borderRadius: 3,
    backgroundColor: "green",
    height: 40,
    padding: 5,
    opacity: 0.95,
    elevation: 5,
    shadowColor: "#d70000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
});
