import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Document() {
  return (
    <View>
      <Text>Your document is here</Text>

      <TouchableOpacity style={styles.documentItem}>
        <View style={styles.itemRow}>
          <Text>1</Text>
          <View>
            <Text style={{ fontSize: 11 }}>
              Euonymus japonicus 'Microphyllus Aureovariegatus', Бересклет
              японський 'Мікрофілуc Ауреоварієгатус'
            </Text>
            <Text style={{ fontSize: 13 }}>
              WRB, H80-100, EXTRA багатоверхівковий
            </Text>
            <Text>2000шт</Text>
          </View>
          <Button title="+"></Button>
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
});
