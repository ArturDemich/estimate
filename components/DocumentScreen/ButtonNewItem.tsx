import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import ModalAddPlant from "./ModalAddPlant";

export default function ButtonNewItem() {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.containerNBTN}>
      <TouchableOpacity style={styles.buttonStep} onPress={() => setShow(true)}>
      <Feather name="plus" size={18} color="#131316" />
        <Text style={styles.textBtn}>Додати</Text>
      </TouchableOpacity>
      <ModalAddPlant show={show} close={() => setShow(!show)} />
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
    color: "#131316",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
  },
  buttonStep: {
    borderRadius: 40,
    height: 30,
    padding: 6,
    opacity: 0.95,
    elevation: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: "#959595",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    
  },
});
