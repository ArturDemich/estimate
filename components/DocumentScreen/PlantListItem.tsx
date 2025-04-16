import { deletePlant } from "@/db/db.native";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk } from "@/redux/thunks";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getUkrainianPart } from "../helpers";
import { PlantNameDB, Storages } from "@/redux/stateServiceTypes";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import EmptyList from "@/components/ui/EmptyList";
import { myToast } from "@/utils/toastConfig";
import { UploadStatus } from "@/types/typesScreen";


export default function PlantListItem() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const docId = params.docId;
  const docName = Array.isArray(params.docName) ? params.docName[0] : params.docName;
  const docSent = Array.isArray(params.docSent) ? params.docSent[0] : params.docSent;
  const palnts = useSelector<RootState, PlantNameDB[]>((state) => state.data.dBPlantsName);

  const loadDBPlants = async () => {
    await dispatch(getPlantsNameDB({ docId: Number(docId) }))
  };

  useFocusEffect(
    useCallback(() => {
      loadDBPlants()
    }, [])
  );
 
  return (
    <FlatList
      data={palnts}
      keyExtractor={(item, index) => item.id.toString() + index}
      renderItem={({ item, index }) => <PlantNameItem docName={docName} docSent={Number(docSent)} item={item} loadDB={() => loadDBPlants()} docId={Number(docId)} numRow={palnts.length - index} />}
      style={{ width: "100%", height: '100%', paddingBottom: 40 }}
      ListEmptyComponent={<EmptyList text="Немає доданих рослин" />}
      ListFooterComponent={<View></View>}
      ListFooterComponentStyle={{ height: 50 }}
    />
  )
};

interface PlantNameItemProps {
  item: PlantNameDB;
  loadDB: () => void;
  docId: number;
  numRow: number;
  docName: string;
  docSent: number;
};

const PlantNameItem = ({ item, loadDB, docId, numRow, docName, docSent }: PlantNameItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentStorage = useSelector<RootState, Storages | null>((state) => state.data.currentStorage);
  const router = useRouter();
  const [isLoding, setLoding] = useState(false);

  const handleDelete = (e: GestureResponderEvent, item: PlantNameDB) => {
    e.preventDefault()
    Alert.alert(
      'Увага!',
      'Бажаєте видалити рослину і всі її записи?',
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          onPress: async () => {
            await deletePlant(docId, item.id)
            loadDB();
          },
        }
      ]
    )
  }

  const toPlantDetails = async (product_name: string, plantDBid: number, productId: string) => {
    if ((docSent === UploadStatus.Start || docSent === UploadStatus.Excel)) {
      try {
        setLoding(true)
        await dispatch(getPlantsNameThunk({ name: product_name, barcode: '', storageId: currentStorage?.id || '' })).unwrap().then(() => setLoding(false));
      } catch (error: any) {
        console.error("Failed to fetch plant details:", error);
        myToast({
          type: "customError",
          text1: "Не вдалося отримати деталі рослини!",
          text2: error?.message || "Помилка сервера",
          visibilityTime: 5000,
        });
        setLoding(false)
      }
    }
    await dispatch(getPlantsDetailsDB({ palntId: plantDBid, docId: docId }))
    router.push({
      pathname: "/plant", params: { plantName: product_name, plantId: plantDBid, docId: docId, productId: productId, docName: docName || "" },
    });
  };


  return (
    <TouchableVibrate
      style={styles.documentItem}
      onLongPress={async (e) => handleDelete(e, item)}
      onPress={() => toPlantDetails(item.product_name, item.id, item.product_id)}
    >
      {isLoding ?
        <ActivityIndicator size="large" color="rgba(255, 111, 97, 1)" />
        :
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.itemNum}>{numRow}.</Text>
            <Text style={styles.itemSize}>{getUkrainianPart(item.product_name)}</Text>
          </View>
          <View style={[styles.rowItem, {alignItems: 'center'}]}>
            {item.count_items === 0 && <Text style={styles.itemEmpty}>{'(пусто)'}</Text> }
            {item.count_items > 0 && <Text style={[styles.itemNum, {maxWidth: 90, fontSize: 14, fontWeight: 700, textAlign: 'center'}]}>{item.total_qty} шт</Text>}
          </View>

        </View>
      }
    </TouchableVibrate>
  )
};

const styles = StyleSheet.create({
  documentItem: {
    backgroundColor: "#fff",
    opacity: 0.9,
    justifyContent: "center",
    minHeight: 50,
    borderRadius: 5,
    margin: 7,
    padding: 5,
    elevation: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 7,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowItem: {
    display: "flex",
    flexDirection: "row",
    gap: 3
  },
  itemSize: {
    fontSize: 13,
    fontWeight: "600",
    padding: 5,
    overflow: 'hidden',
    maxWidth: 280,
  },
  itemNum: {
    alignSelf: "center",
    fontSize: 12,
    color: "grey",
  },
  itemEmpty: {
    alignSelf: "center",
    fontSize: 12,
    fontWeight: 500,
    marginRight: 10,
    color: "rgba(255, 111, 97, 0.9)",
  }
});
