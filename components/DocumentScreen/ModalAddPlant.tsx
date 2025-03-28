import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import InputDropDown from "./InputDropDown";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useLocalSearchParams, useRouter } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import TouchableVibrate from "@/components/ui/TouchableVibrate";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useBackHandler } from "@react-native-community/hooks";


export default function ModalAddPlant() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;
  const docName = Array.isArray(params.docName) ? params.docName[0] : params.docName;
  const [show, setShow] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleSetScanning = (val: boolean) => {
    setIsScanning(val)
  };
  console.log('ModalAddPlant', show)

  const handleBackAction = async () => {
      if (show) {
        setShow(false)
      } else {
        router.back()
      }
    };
  
    useBackHandler(() => {
      handleBackAction()
      return true;
    });

  return (
    <>
      <View style={styles.containerNBTN}>
        <TouchableVibrate style={styles.buttonStep} onPress={() => {
          console.log('ModalAddPlant show', show)
          setShow(true)
        }}>
          <Feather name="plus" size={20} color='rgba(106, 159, 53, 0.95)' />
          <Entypo name="tree" size={22} color='rgba(106, 159, 53, 0.95)' />
        </TouchableVibrate>
      </View>

      {show &&
      <View style={styles.modal}>
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
              <TouchableVibrate style={styles.barcodeBtn} onPress={() => handleSetScanning(true)}>
                <MaterialCommunityIcons name="barcode-scan" size={28} color="black" />
              </TouchableVibrate>
            </View>
            <InputDropDown docId={docId} docName={docName} close={() => setShow(false)} handleSetScanning={(val) => handleSetScanning(val)} isScanning={isScanning} />

          </View>
        </KeyboardAvoidingView>
      </View>}
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
  modal: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",

  },
  modalView: {
    width: "93%",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    top: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 50,
    maxHeight: '100%',
    display: 'flex',
  },
  btnBlock: {
    flexDirection: "row",
    width: "100%",
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
  barcodeBtn: {
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(31, 30, 30, 0.06)",
    borderRadius: 5,
    shadowColor: 'rgba(143, 143, 143, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 3,
    alignSelf: 'center',
},
});
