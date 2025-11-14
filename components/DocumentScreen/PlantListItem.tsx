import { deletePlant } from "@/db/db.native";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPhotosByProductId, getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk, setSortByEmptyThunk } from "@/redux/thunks";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getUkrainianPart } from "../helpers";
import { PlantNameDB, Storages } from "@/redux/stateServiceTypes";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import EmptyList from "@/components/ui/EmptyList";
import { myToast } from "@/utils/toastConfig";


export default function PlantListItem() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const docId = params.docId;
  const docName = Array.isArray(params.docName) ? params.docName[0] : params.docName;
  const palnts = useSelector<RootState, PlantNameDB[]>((state) => state.data.dBPlantsName);
  const sortList = useSelector<RootState, PlantNameDB[]>((state) => state.data.sortingPlantList);
  const [visiblePlants, setVisiblePlants] = useState<PlantNameDB[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 13;

  const loadDBPlants = async () => {
    await dispatch(getPlantsNameDB({ docId: Number(docId) }))
  };

  const handleLoadMore = () => {
    const sourceList = sortList.length > 0 ? sortList : palnts;
    const nextPage = page + 1;
    const nextItems = sourceList.slice(0, nextPage * itemsPerPage);
    if (nextItems.length === visiblePlants.length) return;
    setVisiblePlants(nextItems);
    setPage(nextPage);
  };

  useFocusEffect(
    useCallback(() => {
      loadDBPlants()
    }, [])
  );

  useEffect(() => {
    const sourceList = sortList.length > 0 ? sortList : palnts;
    if (sourceList.length > 0) {
      const firstChunk = sourceList.slice(0, itemsPerPage);
      setVisiblePlants(firstChunk);
    }
  }, [palnts, sortList]);

  useEffect(() => {
    if (sortList.length > 0) {
      dispatch(setSortByEmptyThunk())
    }
  }, [palnts]);

  return (
    <FlatList
      data={visiblePlants}
      keyExtractor={(item, index) => item.id.toString() + index}
      renderItem={({ item, index }) => <PlantNameItem docName={docName} item={item} loadDB={() => loadDBPlants()} docId={Number(docId)} numRow={palnts.length - index} />}
      style={{ width: "100%", height: '100%', paddingBottom: 40 }}
      ListEmptyComponent={<EmptyList text="Немає доданих рослин" />}
      ListFooterComponent={<View></View>}
      ListFooterComponentStyle={{ height: 50 }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
    />
  )
};

interface PlantNameItemProps {
  item: PlantNameDB;
  loadDB: () => void;
  docId: number;
  numRow: number;
  docName: string;
};

const PlantNameItem = React.memo(({ item, loadDB, docId, numRow, docName }: PlantNameItemProps) => {
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
    try {
      setLoding(true)
      try {
        await dispatch(fetchPhotosByProductId({ productId })).unwrap();
      } catch (photoError: any) {
        console.warn("⚠️ Failed to fetch photos:", photoError?.message || photoError);
        myToast({
          type: "customError",
          text1: "Не вдалося отримати наявні фото!",
          text2: photoError?.message || photoError,
          visibilityTime: 5000,
        });
      }
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
          <View style={[styles.colItem]}>
            {item.count_items === 0 && <Text style={styles.itemEmpty}>{'(пусто)'}</Text>}
            {item.count_items > 0 &&
              <View>
                <Text style={[styles.itemQtysTitel]}>факт:</Text>
                <Text style={[styles.itemQtys]}>{item.total_qty} </Text>
              </View>
            }
            {item.count_items > 0 &&
              <View>
                <Text style={[styles.itemQtysTitel]}>продаж:</Text>
                <Text style={[styles.itemQtys]}>{item.sale_qty} </Text>
              </View>
            }
          </View>

        </View>
      }
    </TouchableVibrate>
  )
});

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
  colItem: {
    display: "flex",
    gap: 5,
    alignItems: 'center',
    flexDirection: 'row'
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
  itemQtys: {
    alignSelf: "center",
    color: "grey",
    maxWidth: 90,
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center'
  },
  itemQtysTitel: {
    fontSize: 9,
    fontWeight: 500,
    color: "rgba(123, 123, 123, 0.9)",
    alignSelf: "center",
  },
  itemEmpty: {
    alignSelf: "center",
    fontSize: 12,
    fontWeight: 500,
    marginRight: 10,
    color: "rgba(255, 111, 97, 0.9)",
  }
});
