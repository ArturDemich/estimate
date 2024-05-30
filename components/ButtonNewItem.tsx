import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ModalAddItem from "./ModalAddItem";

export default function ButtonNewItem() {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.containerNBTN}>
      <TouchableOpacity style={styles.buttonStep} onPress={() => setShow(true)}>
        <Text style={styles.textBtn}>New +</Text>
      </TouchableOpacity>
      <ModalAddItem show={show} close={() => setShow(!show)} />
    </View>
  );
}

const styles = StyleSheet.create({
  containerNBTN: {
    elevation: 5,
    //shadowColor: '#d70000',
    //shadowOffset: { width: 0, height: 0 },
    //shadowOpacity: 0.9,
    // shadowRadius: 25,
    position: "absolute",
    right: 12,
    bottom: -50,
  },
  textBtn: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  buttonStep: {
    borderRadius: 3,
    backgroundColor: "blue",
    height: 40,
    padding: 5,
    opacity: 0.95,
    elevation: 5,
    shadowColor: "#d70000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
});
