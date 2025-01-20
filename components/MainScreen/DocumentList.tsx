import { AppDipatch } from "@/redux/store";
import { getStoragesThunk } from "@/redux/thunks";
import { Link } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";

export default function DocumentList() {
  const dispatch = useDispatch<AppDipatch>();

  const getData = async () => {
    try {
      const data = await dispatch(getStoragesThunk()).unwrap();
      console.log("DocumentList Fetched data:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again later.");
    }
  };

  useEffect(() => {
    getData()
    console.log('DocumentList111', );
   
  }, [])

  return (
    <View>
      <Link href="/document" asChild>
        <TouchableOpacity
          style={styles.documentItem}
          onPress={() => {
            console.log("Document");
          }}
        >
          <View style={styles.itemRow}>
            <Text>Дубриничі</Text>
            <Text>02.03.2024 - 15:00</Text>
          </View>
        </TouchableOpacity>
      </Link>

      <Link href="/document" asChild>
        <TouchableOpacity
          style={styles.documentItem}
          onPress={() => {
            console.log("Document");
          }}
        >
          <View style={styles.itemRow}>
            <Text>Дубриничі</Text>
            <Text>02.03.2024 - 15:00</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  documentItem: {
    backgroundColor: "#fff",
    borderBottomColor: "black",
    justifyContent: "center",
    minHeight: 40,
    borderRadius: 5,
    margin: 5,
    paddingLeft: 10,
    paddingRight: 10,
    elevation: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 7,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
