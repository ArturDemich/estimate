import { deletePlant } from "@/db/db.native";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsNameDB, getPlantsNameThunk } from "@/redux/thunks";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getUkrainianPart } from "../helpers";
import { PlantNameDB } from "@/redux/stateServiceTypes";
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import EmptyList from "@/components/ui/EmptyList";

export default function PlantListItem() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams();
  const docId = params.docId;
  
  const palnts = useSelector<RootState, PlantNameDB[]>((state) => state.data.dBPlantsName);
  console.log('ModalAddPlant', params)

  const loadDBPlants = async () => {
    const data = await dispatch(getPlantsNameDB({ docId: Number(docId) }))
    console.log('PlantListItem___', )
  };

  const toPlantDetails = async (product_name: string, plantDBid: number, productId: string) => {
    await dispatch(getPlantsNameThunk({ name: product_name, barcode: '' }));
    router.push({
      pathname: "/plant",
      params: { plantName: product_name, plantId: plantDBid, docId: docId, productId },
    });
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
      renderItem={({ item, index }) => (
          <TouchableVibrate 
            style={styles.documentItem}
            onLongPress={async (e) => {
              e.preventDefault()
              console.log("PlantListItem before delete", item);
              await deletePlant(Number(docId), item.id) 
              loadDBPlants();
            }}
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
  btnPlus: {
    backgroundColor: "green",
    width: 40,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRes: {
    backgroundColor: "orange",
    padding: 4,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    width: 70
  },
  itemQty: {
    alignSelf: "flex-end",
    fontSize: 17,
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
