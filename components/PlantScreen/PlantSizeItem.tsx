import { PlantDetails } from "@/redux/stateServiceTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { getPlantsDetailsDB } from "@/redux/thunks";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const nullId = '00000000-0000-0000-0000-000000000000';

const renderPlantDetail = (item: PlantDetails, index: number) => {

  return (
    <TouchableOpacity style={styles.documentItem}>
      <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
        <Text style={styles.itemNum}>{index + 1}.</Text>
        <Text style={styles.itemSize}>{
          item.characteristic_id === nullId || null ? 'Немає характеристики' : item.characteristic_name
        }</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
        <View style={{ flexDirection: "column", flex: 1, paddingRight: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: 'space-between', }}>
            <View style={{ gap: 4, flexDirection: "row", }}>
              <TouchableOpacity style={styles.btnRes}>
                <Text>склад:</Text>
              </TouchableOpacity>
              <Text style={[styles.itemQty, { color: "#70707B" }]}>{item.quantity}5555{item.unit_name}</Text>
            </View>

            <Text style={styles.itemQty}>2000шт</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnPlus}>
          <Text>+1</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default function PlantSizeItem() {
  //const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const palntDetails = useSelector<RootState, PlantDetails[]>((state) => state.data.dBPlantDetails);
  console.log('ModalAddPlant', params)

  const loadDBDetails = async () => {
    const plantId = params.plantId;
    const docId = params.docId
    const data = await dispatch(getPlantsDetailsDB({ palntId: Number(plantId), docId: Number(docId) }))
    console.log('PlantSizeItem___',  )
  };

  useFocusEffect(
    useCallback(() => {
      loadDBDetails()
    }, [])
  );

  return (
      <FlatList
        data={palntDetails}
        keyExtractor={(item, index) => item.characteristic_id.toString() + index}
        renderItem={({ item, index }) => renderPlantDetail(item, index)}
        style={{ width: "100%", paddingBottom: 40 }}
        ListEmptyComponent={
          <View>
            <Text>Немає доданих х-ка</Text>
          </View>
        }
        ListFooterComponent={<View></View>}
        ListFooterComponentStyle={{ height: 50 }}
      />
  );
}

const styles = StyleSheet.create({
  documentItem: {
    backgroundColor: "#fff",
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
    padding: 4,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  itemQty: {
    alignSelf: "center",
    fontSize: 14,
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
