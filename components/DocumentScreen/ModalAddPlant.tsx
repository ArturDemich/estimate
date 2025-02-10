import React from "react";
import {

  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import InputDropDown from "../InputDropDown";
import { Modal, Portal } from "react-native-paper";
import EvilIcons from '@expo/vector-icons/EvilIcons';

type ModalProps = {
  show: boolean;
  close: () => void;
};

export default function ModalAddPlant({ show, close }: ModalProps) {
  return (
    <Portal>
      <Modal
        visible={show}
        onDismiss={close}
        dismissable={false}
        contentContainerStyle={{ flex: 1, }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.textStr}>Назва</Text>
            <InputDropDown />
            <View style={styles.btnBlock}>
              <TouchableOpacity onPress={close} style={styles.buttonClose}>
                <EvilIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log("1")}
                style={styles.buttonModal}
              >
                <Text style={styles.modalText}>Додати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center'
  },
  textStr: {
    fontWeight: "600",
    fontSize: 13,
  },
  modalText: {
    textAlign: "center",
    color: "snow",
    fontSize: 15,
    fontWeight: "700",
  },
});
