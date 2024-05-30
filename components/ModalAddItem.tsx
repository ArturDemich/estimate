import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ModalAddItem({ show, close }: any) {
  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={show}
        onRequestClose={() => close()}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={styles.textStr}
              allowFontScaling={true}
              maxFontSizeMultiplier={1}
            >
              Назва
            </Text>
            <TextInput style={styles.input} />
            <Text style={{ fontSize: 17 }}>Х-ка</Text>
            <TextInput style={styles.input} />
            <Text style={styles.textStyle}>К-сть</Text>
            <TextInput style={styles.input} />
            <View style={styles.btnBlock}>
              <TouchableOpacity
                onPress={() => close()}
                style={styles.buttonClose}
              >
                <Text
                  style={styles.modalText}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1}
                >
                  Х
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log("1")}
                style={styles.buttonModal}
              >
                <Text
                  style={styles.modalText}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1}
                >
                  Створити
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00002329",
  },
  modalView: {
    width: 300,
    flexDirection: "column",
    margin: 1,
    backgroundColor: "white",
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: "15%",
    maxHeight: "70%",
  },

  btnBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    // flex: 1,
    width: "100%",
    marginTop: 10,
  },

  buttonModal: {
    borderRadius: 3,
    textAlign: "center",
    backgroundColor: "#45aa45",
    width: 110,
    alignSelf: "flex-end",
    height: 35,
    elevation: 3,
    justifyContent: "center",
  },

  buttonClose: {
    borderRadius: 3,
    height: 35,
    elevation: 3,
    width: 40,
    alignSelf: "flex-end",
    backgroundColor: "#999999e6",
    justifyContent: "center",
  },
  textStyle: {
    fontWeight: "500",
    fontSize: 18,
    color: "#555555",
    //marginBottom: 40,
    paddingLeft: 5,
    paddingRight: 5,
  },
  textStr: {
    fontWeight: "600",
    fontSize: 21,
  },
  modalText: {
    textAlign: "center",
    alignSelf: "center",
    color: "snow",
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    width: 200,
    height: 40,
    padding: 3,
  },
});
