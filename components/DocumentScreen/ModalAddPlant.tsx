import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import InputDropDown from "./InputDropDown";
import { Modal, Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useLocalSearchParams } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { MaterialCommunityIcons } from "@expo/vector-icons";


export default function ModalAddPlant() {
  const params = useLocalSearchParams();
  const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;
  const docName = Array.isArray(params.docName) ? params.docName[0] : params.docName;
  const [show, setShow] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  console.log('ModalAddPlant', params)

  const handleSetScanning = (val: boolean) => {
    setIsScanning(val)
  };

  return (
    <>
      <View style={styles.containerNBTN}>
        <TouchableVibrate style={styles.buttonStep} onPress={() => setShow(true)}>
          <Feather name="plus" size={14} color="green" />
          <Entypo name="tree" size={24} color="green" />
        </TouchableVibrate>
      </View>

      <Portal>
        <Modal
          visible={show}
          onDismiss={() => setShow(false)}
          contentContainerStyle={{ flex: 1, }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centeredView}
          >
            <View style={styles.modalView}>
              <View style={styles.btnBlock}>
                <TouchableVibrate onPress={() => setShow(false)} style={styles.buttonClose}>
                  <EvilIcons name="close" size={24} color="#FFFFFF" style={{ lineHeight: 24 }} />
                </TouchableVibrate>
                <Text style={styles.textStr}>Пошук</Text>
                <TouchableVibrate onPress={() => handleSetScanning(true)}>
                  <MaterialCommunityIcons name="barcode-scan" size={28} color="black" />
                </TouchableVibrate>
              </View>
              <InputDropDown docId={docId} docName={docName} close={() => setShow(false)} handleSetScanning={(val) => handleSetScanning(val)} isScanning={isScanning} />
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
  buttonStep: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 5,
    opacity: 0.95,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: '#E4E4E7',
    shadowColor: "#131316",
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
    top: 60
  },
  modalView: {
    width: "93%",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
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
    padding: 4,
    backgroundColor: "rgba(199, 199, 199, 0.99)",
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
