import { deleteDocument, fetchDocuments } from "@/db/db.native";
import { AppDispatch } from "@/redux/store";
import { getStoragesThunk } from "@/redux/thunks";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import moment from "moment";


interface DocumentList {
  id: number;
  name: string;
  created_at: string
};

export default function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentList[]>([]);

  const loadDocuments = async () => {
    const data = await fetchDocuments();
    setDocuments(data)
    console.log('loadDocuments', data)
  };

  function formatDate(timestamp: string): string { 
    return moment(timestamp).format("DD.MM.YYYY - HH:mm");
  }

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [])
  );
  console.log('DocumentList', Boolean(documents))
  return (
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.documentItem}
            onLongPress={async (e) => {
              e.preventDefault()
              console.log("Document");
              await deleteDocument(item.id)
              loadDocuments();
            }}
            onPress={() => {
              router.push({
                pathname: "/document",
                params: { docName: item.name, docId: item.id },
              });
            }}
          >
            <View style={styles.itemRow}>
              <Text>{item.name}</Text>
              <Text>{formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        style={{ width: "100%", height: '100%', paddingBottom: 40}}
        ListEmptyComponent={
          <View>
            <Text>Немає створених документів</Text>
          </View>
        }
        ListFooterComponent={<View></View>}
        ListFooterComponentStyle={{height: 50}}
      />
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
