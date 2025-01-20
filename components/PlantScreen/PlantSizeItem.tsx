import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PlantSizeItem() {
  return (
    <TouchableOpacity style={styles.documentItem}>
     
      <View style={{ display: "flex", flexDirection: "row", gap: 5 }}>
        <Text style={styles.itemNum}>1</Text>
        {/* <Text style={{ fontSize: 13 }}>
          Бересклет японський 'Мікрофілуc Ауреоварієгатус'
        </Text> */}
        <Text style={styles.itemSize}>
            WRB, H80-100, EXTRA багатоверхівковий
          </Text>
      </View>

      <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
        <View style={{  flexDirection: "column",  flex: 1, paddingRight: 8}}>
          {/* <Text style={styles.itemSize}>
            WRB, H80-100, EXTRA багатоверхівковий
          </Text> */}
          

          <View style={{ flexDirection: "row", justifyContent: 'space-between',}}>
            <View style={{  gap: 8, flexDirection: "row",}}>
              <TouchableOpacity style={styles.btnRes}>
                <Text>+резерв</Text>
              </TouchableOpacity>
              <Text style={[styles.itemQty, { color: "orange" }]}>20шт</Text>
            </View>

            <Text style={styles.itemQty}>2000шт</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnPlus}>
          <Text>+1</Text>
        </TouchableOpacity>
        
      </View>
    </TouchableOpacity>
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
