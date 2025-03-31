import { deleteDocument, fetchDocuments } from "@/db/db.native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import EmptyList from "@/components/ui/EmptyList";
import { formatDate } from "@/components/helpers";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { setDocComment, setDocSent } from "@/redux/dataSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { UploadStatus } from "@/types/typesScreen";


interface DocumentList {
  id: number;
  storage_name: string;
  created_at: string;
  comment: string;
  is_sent: number;
};

export default function DocumentList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentList[]>([]);

  const loadDocuments = async () => {
    const data = await fetchDocuments();
    setDocuments(data)
  };

  const toPlantListName = async (item: DocumentList) => {
    await dispatch(setDocComment(item.comment))
    await dispatch(setDocSent(item.is_sent))
    router.push({
      pathname: "/document",
      params: { docName: item.storage_name, docId: item.id, docTimeCr: item.created_at, docSent: item.is_sent },
    });
  };

  const handleDelete = (e: GestureResponderEvent, item: DocumentList) => {
    e.preventDefault()
    Alert.alert(
      'Увага!',
      'Бажаєте видалити документ і всі його записи?',
      [{
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          onPress: async () => {
            await deleteDocument(item.id)
            loadDocuments();
          },
        }])
  };

  useFocusEffect(
    
    useCallback(() => {
      dispatch(setDocSent(UploadStatus.Start))
      loadDocuments();
    }, [])
  );
  
  return (
    <FlatList
      data={documents}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableVibrate
          style={[styles.documentItem, item.is_sent === 1 && {opacity: 0.8}]}
          onLongPress={async (e) => handleDelete(e, item)}
          onPress={() => toPlantListName(item)}
        >
          <View style={styles.itemRow}>
            <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
              <Ionicons name="document-text-outline" size={20} color="rgb(77, 77, 77)" />
              <Text style={{ fontWeight: 500, fontSize: 16, width: 150 }}>{item.storage_name}</Text>
             {(item.is_sent === UploadStatus.OneC || item.is_sent === UploadStatus.All) && <MaterialIcons name="cloud-done" size={24} color="rgb(77, 77, 77)" />}
             {(item.is_sent === UploadStatus.Excel || item.is_sent === UploadStatus.All) && <MaterialCommunityIcons name="microsoft-excel" size={24} color="rgb(77, 77, 77)" />}
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
