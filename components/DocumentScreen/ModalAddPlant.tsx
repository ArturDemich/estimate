import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import InputDropDown from "../InputDropDown";
import { Modal, Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useLocalSearchParams } from "expo-router";
import Feather from '@expo/vector-icons/Feather';


export default function ModalAddPlant() {
  const params = useLocalSearchParams();
  const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;
  const [show, setShow] = useState(false);
  console.log('ModalAddPlant', params)

  return (
    <>
      <View style={styles.containerNBTN}>
        <TouchableOpacity style={styles.buttonStep} onPress={() => setShow(true)}>
          <Feather name="plus" size={18} color="#131316" />
          <Text style={styles.textBtn}>Додати</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Modal
          visible={show}
          onDismiss={() => setShow(false)}
          dismissable={false}
          contentContainerStyle={{ flex: 1, }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <View style={styles.btnBlock}>
                <TouchableOpacity onPress={() => setShow(false)} style={styles.buttonClose}>
                  <EvilIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.textStr}>Назва</Text>
              </View>
              <InputDropDown docId={docId} close={() => setShow(false)} />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  containerNBTN: {
    elevation: 5,
    position: "absolute",
    right: 12,
    bottom: 15,
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
  centeredView: {
    flex: 1,
    alignItems: "center",
    top: 100
  },
  modalView: {
    width: "93%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    height: 'auto',
    display: 'flex',
  },
  btnBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonModal: {
    borderRadius: 3,
    textAlign: "center",
    backgroundColor: "#45aa45",
    width: 110,
    height: 35,
    justifyContent: "center",
  },
  buttonClose: {
    borderRadius: 8,
    height: 35,
    width: 35,
    backgroundColor: "#A0A0AB",
    borderColor: '#E4E4E7',
    borderWidth: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  textStr: {
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
    alignSelf: 'center',
    textAlign: 'center'
  },
  modalText: {
    textAlign: "center",
    color: "snow",
    fontSize: 15,
    fontWeight: "700",
  },
});
