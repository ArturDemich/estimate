import { deletePlant } from "@/db/db.native";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsNameDB, getPlantsNameThunk } from "@/redux/thunks";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, FlatList, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getUkrainianPart } from "../helpers";
import { PlantNameDB } from "@/redux/stateServiceTypes";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import EmptyList from "@/components/ui/EmptyList";
import { myToast } from "@/utils/toastConfig";


export default function PlantListItem() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams();
  const docId = params.docId;
  const palnts = useSelector<RootState, PlantNameDB[]>((state) => state.data.dBPlantsName);
  console.log('ModalAddPlant', params)

  const loadDBPlants = async () => {
    const data = await dispatch(getPlantsNameDB({ docId: Number(docId) }))
    console.log('PlantListItem___',)
  };

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
            await deletePlant(Number(docId), item.id)
            loadDBPlants();
          },
        }
      ]
    )
  }

  const toPlantDetails = async (product_name: string, plantDBid: number, productId: string) => {
    try {
      await dispatch(getPlantsNameThunk({ name: product_name, barcode: '' })).unwrap();
    } catch (error: any) {
      console.log("Failed to fetch plant details:", error);
      myToast({
        type: "customError",
        text1: "Не вдалося отримати деталі рослини!",
        text2: error?.message || "Помилка сервера",
        visibilityTime: 5000,
      });
    }
    router.push({
      pathname: "/plant", params: { plantName: product_name, plantId: plantDBid, docId: docId, productId: productId, docName: params?.docName || "" },
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadDBPlants()
    }, [])
  );

  return (
    <>
      <FlatList
        data={palnts}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={({ item, index }) => (
          <TouchableVibrate
            style={styles.documentItem}
            onLongPress={async (e) => handleDelete(e, item)}
            onPress={() => toPlantDetails(item.product_name, item.id, item.product_id)}
          >
            <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
              <Text style={styles.itemNum}>{palnts.length - index}.</Text>
              <Text style={styles.itemSize}>{getUkrainianPart(item.product_name)}</Text>
            </View>
          </TouchableVibrate>
        )}
        style={{ width: "100%", height: '100%', paddingBottom: 40 }}
        ListEmptyComponent={<EmptyList text="Немає доданих рослин" />}
        ListFooterComponent={<View></View>}
        ListFooterComponentStyle={{ height: 50 }}
      />

    </>
  );
}

const styles = StyleSheet.create({
  documentItem: {
    backgroundColor: "#fff",
    opacity: 0.9,
    justifyContent: "center",
    minHeight: 40,
    borderRadius: 5,
    margin: 7,
    padding: 5,
    elevation: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 7,
  },
  itemSize: {
    fontSize: 13,
    fontWeight: "600",
    padding: 5,
    width: '100%'
  },
  itemNum: {
    alignSelf: "center",
    fontSize: 12,
    color: "grey",
  },
});
