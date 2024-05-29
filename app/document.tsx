import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Document() {
  return (
    <View>
      <TouchableOpacity style={styles.documentItem}>
        <View style={styles.itemRow}>
          <Text style={styles.itemNum}>1</Text>
          <View style={styles.itemBlock}>
            <Text style={{ fontSize: 13 }}>
              Euonymus japonicus 'Microphyllus Aureovariegatus', Бересклет
              японський 'Мікрофілуc Ауреоварієгатус'
            </Text>
            <View style={styles.rowBtw}>
              <View style={styles.itemRow}>
                <TouchableOpacity style={styles.btnRes}>
                  <Text>+резерв</Text>
                </TouchableOpacity>
                <Text style={[styles.itemQty, { color: "orange" }]}>20шт</Text>
              </View>
              <Text style={styles.itemQty}>2000шт</Text>
            </View>

            <Text style={styles.itemSize}>
              WRB, H80-100, EXTRA багатоверхівковий
            </Text>
          </View>
          <TouchableOpacity style={styles.btnPlus}>
            <Text>+1</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    margin: 7,
    paddingLeft: 5,
    paddingRight: 5,
    elevation: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 7,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },
  rowBtw: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  },
  itemBlock: {
    gap: 3,
    flex: 1,
  },
  itemQty: {
    alignSelf: "flex-end",
    fontSize: 17,
  },
  itemName: {
    fontSize: 13,
  },
  itemSize: {
    fontSize: 13,
    fontWeight: "600",
    padding: 5,
  },
  itemNum: {
    alignSelf: "center",
    fontSize: 10,
    color: "grey",
  },
});
