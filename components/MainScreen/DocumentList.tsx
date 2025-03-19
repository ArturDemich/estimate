import { deleteDocument, fetchDocuments } from "@/db/db.native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import moment from "moment";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import EmptyList from "@/components/ui/EmptyList";
import { formatDate } from "@/components/helpers";
import { Ionicons } from "@expo/vector-icons";


interface DocumentList {
  id: number;
  storage_name: string;
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

  const handleDelete = (e: GestureResponderEvent, item: DocumentList) => {
    e.preventDefault()
    Alert.alert(
      'Увага!',
      'Бажаєте видалити документ і всі його записи?',
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          onPress: async () => {
            await deleteDocument(item.id)
            loadDocuments();
          },
        }
      ]
    )
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
        <TouchableVibrate
          style={styles.documentItem}
          onLongPress={async (e) => handleDelete(e, item)}
          onPress={() => {
            router.push({
              pathname: "/document",
              params: { docName: item.storage_name, docId: item.id, docTimeCr: item.created_at },
            });
          }}
        >
          <View style={styles.itemRow}>
            <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
              <Ionicons name="document-text-outline" size={20} color="rgb(77, 77, 77)" />
              <Text style={{ fontWeight: 500, fontSize: 16 }}>{item.storage_name}</Text>
            </View>
            <Text style={{fontSize: 12, fontWeight: 700, color: "rgb(77, 77, 77)",}}>{formatDate(item.created_at)}</Text>
          </View>
        </TouchableVibrate>
      )}
      style={{ width: "100%", height: '100%', paddingBottom: 40 }}
      ListEmptyComponent={<EmptyList text="Немає створених документів" />}
      ListFooterComponent={<View></View>}
      ListFooterComponentStyle={{ height: 50 }}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
  documentItem: {
    backgroundColor: "#fff",
    borderBottomColor: "black",
    justifyContent: "center",
    minHeight: 50,
    borderRadius: 5,
    margin: 5,
    paddingLeft: 10,
    paddingRight: 10,
    elevation: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 7,
    opacity: 0.9
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
  },
});
